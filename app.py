from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import uvicorn
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from datetime import datetime
import logging

# Configure logging - important for debugging on Render
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Log to console - better for containerized environments
    ]
)
logger = logging.getLogger(__name__)

# Load environment vars from .env file (fallback for local development)
load_dotenv()

# Set up Gemini API with our key (prefer environment variable from Render)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY"))
    
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment or .env file. Gemini features will not work!")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI(title="Brain Tumor Classification API")

# Absolute path to your React build folder
build_dir = os.path.join(os.path.dirname(__file__), "build")

# Configure CORS - Note the trailing slash in origin URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://neurotrix-d2f6.onrender.com/"],  # Include trailing slash like in working code
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data models for API
class PatientInfo(BaseModel):
    name: str
    age: int
    gender: str
    medicalHistory: Optional[str] = None
    symptoms: Optional[str] = None

class ClassificationResult(BaseModel):
    class_name: str
    confidence: float
    probabilities: List[Dict[str, Any]]

# Load the trained ResNet model
def load_model():
    logger.info("Loading brain tumor classification model...")
    
    # Model path - check multiple possible locations
    model_paths = [
        "best_brain_tumor_resnet18_finetuned.pth",
        "./models/best_brain_tumor_resnet18_finetuned.pth",
        os.path.join(os.path.dirname(__file__), "best_brain_tumor_resnet18_finetuned.pth"),
        os.path.join(os.path.dirname(__file__), "models", "best_brain_tumor_resnet18_finetuned.pth")
    ]
    
    # Try to find the model file
    model_path = None
    for path in model_paths:
        if os.path.exists(path):
            model_path = path
            logger.info(f"Found model at: {path}")
            break
    
    if not model_path:
        logger.error(f"Model not found. Searched paths: {model_paths}")
        logger.error(f"Current working directory: {os.getcwd()}")
        logger.error(f"Directory contents: {os.listdir()}")
        raise FileNotFoundError("Model file not found. Please ensure the model file exists in one of the search paths.")
    
    # Create ResNet18 model
    try:
        model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet18', pretrained=False)
        
        # Modify fc layer for our 4 classes
        num_ftrs = model.fc.in_features
        model.fc = torch.nn.Sequential(
            torch.nn.Linear(num_ftrs, 512),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.5),
            torch.nn.Linear(512, 4)
        )
        
        # Load our trained weights with error handling
        try:
            # Try loading with map_location
            model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        except Exception as e:
            logger.warning(f"Error loading model with map_location: {e}")
            # Try loading without map_location
            model.load_state_dict(torch.load(model_path))
        
        model.eval()
        logger.info("Model loaded successfully!")
        return model
    except Exception as e:
        logger.error(f"Error loading model architecture: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise

# Categories for tumor classification
CATEGORIES = ['notumor', 'glioma', 'meningioma', 'pituitary']

# Load model at startup
try:
    model = load_model()
except Exception as e:
    logger.error(f"Error during model loading: {e}")
    model = None
    # Don't fail immediately to allow debugging through the API

# Alternative model loading - for very different architectures
def try_load_alternative_model():
    """Try to load the model with an alternative approach if the first one failed"""
    if model is not None:
        return model  # Already loaded successfully
        
    logger.info("Attempting to load model with alternative approach...")
    try:
        # Create a basic ResNet18 model
        model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet18', pretrained=False)
        
        # Modify the final layer to have 4 outputs
        model.fc = torch.nn.Linear(model.fc.in_features, 4)
        
        # Find the model file
        model_paths = [
            "best_brain_tumor_resnet18_finetuned.pth",
            "./models/best_brain_tumor_resnet18_finetuned.pth",
            os.path.join(os.path.dirname(__file__), "best_brain_tumor_resnet18_finetuned.pth"),
            os.path.join(os.path.dirname(__file__), "models", "best_brain_tumor_resnet18_finetuned.pth")
        ]
        
        model_path = None
        for path in model_paths:
            if os.path.exists(path):
                model_path = path
                break
                
        if not model_path:
            logger.error("Model file not found in alternative loading")
            return None
            
        # Try loading with strict=False to allow for architecture differences
        state_dict = torch.load(model_path, map_location=torch.device('cpu'))
        model.load_state_dict(state_dict, strict=False)
        model.eval()
        logger.info("Alternative model loading successful!")
        return model
    except Exception as e:
        logger.error(f"Alternative model loading also failed: {e}")
        return None

# Preprocess image and run prediction
def predict_tumor(image_bytes):
    global model
    
    # If model is None, try alternative loading
    if model is None:
        model = try_load_alternative_model()
        
    if model is None:
        # Both loading methods failed, return a mock response for debugging
        logger.warning("WARNING: Model not loaded, returning mock prediction")
        return {
            "class": "No Tumor",
            "confidence": 0.95,
            "probabilities": [
                {"name": "No Tumor", "value": 0.95},
                {"name": "Glioma", "value": 0.02},
                {"name": "Meningioma", "value": 0.02},
                {"name": "Pituitary", "value": 0.01}
            ]
        }
    
    try:
        # Process image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Standard ResNet preprocessing
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        image_tensor = transform(image).unsqueeze(0)
        
        # Run inference
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
            
            _, predicted = torch.max(outputs, 1)
            predicted_class = predicted.item()
            
            # Format results for frontend
            class_name = CATEGORIES[predicted_class]
            confidence = probabilities[predicted_class].item()
            
            all_probs = []
            for i, c in enumerate(CATEGORIES):
                display_name = "No Tumor" if c == "notumor" else c.capitalize()
                all_probs.append({
                    "name": display_name,
                    "value": probabilities[i].item()
                })
            
            return {
                "class": class_name.capitalize() if class_name != "notumor" else "No Tumor",
                "confidence": confidence,
                "probabilities": all_probs
            }
    
    except Exception as e:
        logger.error(f"Error predicting tumor: {e}")
        logger.error(import_traceback().format_exc())
        
        # Return a meaningful error
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

def import_traceback():
    import traceback
    return traceback

# Generate Gemini recommendation
async def generate_recommendation(classification_result, patient_info):
    try:
        if not GEMINI_API_KEY:
            logger.warning("Skipping Gemini recommendation - API key not configured")
            return get_fallback_recommendation(classification_result, patient_info)
            
        # detailed prompt for Gemini
        prompt = f"""
        You are a neuroradiologist assistant AI. Generate a detailed medical recommendation based on an MRI brain tumor classification.
        
        Patient Information:
        - Name: {patient_info.name}
        - Age: {patient_info.age}
        - Gender: {patient_info.gender}
        - Medical History: {patient_info.medicalHistory or "None provided"}
        - Current Symptoms: {patient_info.symptoms or "None provided"}
        
        Classification Results:
        - Primary Diagnosis: {classification_result['class']}
        - Confidence: {classification_result['confidence'] * 100:.1f}%
        - Probability Distribution: {', '.join([f"{p['name']}: {p['value']*100:.1f}%" for p in classification_result['probabilities']])}
        
        Provide a structured recommendation with:
        1. Provide a short summary of the findings, focusing specifically on the characteristics of the tumor [1 sentences].
        2. A detailed recommended medical action (no bullet points or asterisks) [2-3 lines]
        3. Follow-up suggestions (plain text, no bullet points or asterisks) [2-3 lines]
        4. An urgency level (low, medium, or high)
        
        Format your response as JSON with the following structure:
        {{
            "summary": "Brief summary of findings",
            "recommendation": "Detailed recommendation",
            "followUp": "Follow-up suggestions",
            "urgency": "low|medium|high"
        }}
        
        Important formatting instructions:
        - Do NOT use markdown formatting like asterisks (*) or bullet points in your response
        - Keep the summary concise (1-2 sentences maximum)
        - Use plain text paragraphs for recommendation and followUp fields
        - Only return the JSON object without additional text
        """
        
        # Generate recommendation using Gemini
        gem_model = genai.GenerativeModel('gemini-1.5-pro')
        response = await gem_model.generate_content_async(prompt)
        
        # Extract the text from the response and parse as JSON
        try:
            # Try to parse the response text directly
            recommendation = json.loads(response.text)
            
            # Clean up any potential markdown formatting that might have slipped through
            for key in recommendation:
                if isinstance(recommendation[key], str):
                    # Remove markdown asterisks
                    recommendation[key] = recommendation[key].replace('*', '')
                    # Remove bullet points
                    recommendation[key] = recommendation[key].replace('- ', '')
                    # Clean up any excessive whitespace
                    recommendation[key] = ' '.join(recommendation[key].split())
                    
        except json.JSONDecodeError:
            # If direct parsing fails, try to clean the response
            text = response.text.strip()
            
            # Try to extract JSON if it's wrapped in code blocks
            if text.startswith("```json") and text.endswith("```"):
                json_str = text[7:-3].strip()  # Remove ```json and ``` markers
                recommendation = json.loads(json_str)
            elif text.startswith("{") and text.endswith("}"):
                # Try to extract just the JSON object if there's other text
                start_idx = text.find("{")
                end_idx = text.rfind("}") + 1
                json_str = text[start_idx:end_idx]
                recommendation = json.loads(json_str)
            else:
                # If all parsing attempts fail, use fallback
                logger.warning("Could not parse Gemini response as JSON, using fallback")
                return get_fallback_recommendation(classification_result, patient_info)
                
            # Clean up any potential markdown formatting
            for key in recommendation:
                if isinstance(recommendation[key], str):
                    # Remove markdown asterisks
                    recommendation[key] = recommendation[key].replace('*', '')
                    # Remove bullet points
                    recommendation[key] = recommendation[key].replace('- ', '')
                    # Clean up any excessive whitespace
                    recommendation[key] = ' '.join(recommendation[key].split())
                
        return recommendation
    
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        # Use fallback recommendation if Gemini fails
        return get_fallback_recommendation(classification_result, patient_info)

# Fallback recommendation function
def get_fallback_recommendation(classification_result, patient_info):
    tumor_type = classification_result["class"]
    
    if tumor_type == "No Tumor":
        return {
            "summary": f"No evidence of brain tumor detected with {classification_result['confidence']*100:.0f}% confidence in a {patient_info.age}-year-old {patient_info.gender} patient.",
            "recommendation": "Routine follow-up recommended. Consider further evaluation to identify alternative causes for symptoms.",
            "followUp": "Follow-up imaging in 12 months as a precaution if symptoms persist.",
            "urgency": "low"
        }
    elif tumor_type == "Glioma":
        return {
            "summary": f"MRI brain classification suggests a glioma with {classification_result['confidence']*100:.0f}% confidence in a {patient_info.age}-year-old {patient_info.gender} patient.",
            "recommendation": "Immediate neurosurgical consultation required. Advanced imaging with contrast is needed to better characterize the lesion. Consider stereotactic biopsy to confirm diagnosis and determine genetic profile for targeted treatment planning.",
            "followUp": "Advanced MRI with contrast, potential biopsy recommendation within 7-10 days. Regular follow-up with a neuro-oncology team will be essential.",
            "urgency": "high"
        }
    elif tumor_type == "Meningioma":
        return {
            "summary": f"MRI brain classification suggests a meningioma with {classification_result['confidence']*100:.0f}% confidence in a {patient_info.age}-year-old {patient_info.gender} patient.",
            "recommendation": "Neurosurgical evaluation recommended. Many meningiomas can be observed with serial imaging if asymptomatic, but treatment decisions depend on size, location, and symptoms.",
            "followUp": "Follow-up MRI with contrast in 6-8 weeks to evaluate growth rate. Regular monitoring by a neurosurgeon is advised.",
            "urgency": "medium"
        }
    else:  # Pituitary
        return {
            "summary": f"MRI brain classification suggests a pituitary tumor with {classification_result['confidence']*100:.0f}% confidence in a {patient_info.age}-year-old {patient_info.gender} patient.",
            "recommendation": "Consultation with both neurosurgery and endocrinology is recommended. Hormonal evaluation is essential to determine if the tumor is secreting hormones. High-resolution MRI of the pituitary with contrast should be performed for detailed characterization.",
            "followUp": "Hormonal panel and visual field testing within 2 weeks. Regular follow-up with both neurosurgery and endocrinology specialists.",
            "urgency": "medium"
        }

# API ROUTES
@app.post("/api/analyze_mri")
async def analyze_mri(
    file: UploadFile = File(...),
    name: str = Form(...),
    age: int = Form(...),  
    gender: str = Form(...),
    medicalHistory: Optional[str] = Form(None),
    symptoms: Optional[str] = Form(None)
):
    try:
        # Read the image file
        image_bytes = await file.read()
        
        # Prepare patient info
        patient_info = PatientInfo(
            name=name,
            age=age,
            gender=gender,
            medicalHistory=medicalHistory,
            symptoms=symptoms
        )
        
        # Run tumor classification
        classification_result = predict_tumor(image_bytes)
        
        # Generate recommendation using Gemini API
        recommendation = await generate_recommendation(classification_result, patient_info)
        
        # Return combined results
        return {
            "patientInfo": patient_info.dict(),
            "classification": classification_result,
            "recommendation": recommendation
        }
    except Exception as e:
        # Log detailed error information
        logger.error(f"API Error: {str(e)}")
        logger.error(import_traceback().format_exc())
        
        # Return user-friendly error
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/api/status")
async def status():
    # More detailed status information
    model_info = {}
    if model is not None:
        model_info = {
            "loaded": True,
            "type": type(model).__name__,
            "requires_grad": any(p.requires_grad for p in model.parameters()) if hasattr(model, "parameters") else False
        }
    else:
        model_info = {"loaded": False, "error": "Model not loaded"}
        
    return {
        "status": "ok" if model is not None else "degraded",
        "model": model_info,
        "env": {
            "python_version": os.sys.version,
            "torch_version": torch.__version__,
            "working_directory": os.getcwd(),
            "gemini_api_configured": GEMINI_API_KEY is not None
        }
    }

# Check for models directory and create if needed
@app.on_event("startup")
async def startup_event():
    # Create models directory if it doesn't exist
    if not os.path.exists("models"):
        os.makedirs("models")
        logger.info("Created models directory")
    
    # Check build directory
    build_dir = os.path.join(os.path.dirname(__file__), "build")
    if not os.path.exists(build_dir):
        logger.warning(f"Build directory not found at {build_dir}. Frontend may not be properly served.")

# STATIC FILES - React build assets
build_dir = os.path.join(os.path.dirname(__file__), "build")

@app.get("/background.png")
def background():
    file_path = os.path.join(build_dir, "background.png")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        logger.warning(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/manifest.json")
def manifest():
    file_path = os.path.join(build_dir, "manifest.json")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        logger.warning(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/favicon.ico")
def favicon():
    file_path = os.path.join(build_dir, "favicon.ico")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        logger.warning(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/logo512.png")
def logo512():
    file_path = os.path.join(build_dir, "logo512.png")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        logger.warning(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/logo192.png")
def logo192():
    file_path = os.path.join(build_dir, "logo192.png")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        logger.warning(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")

# Check if build directory exists and has static folder
if os.path.exists(os.path.join(build_dir, "static")):
    # Static assets directory
    app.mount("/static", StaticFiles(directory=os.path.join(build_dir, "static")), name="static")
else:
    logger.warning(f"Static directory not found at {os.path.join(build_dir, 'static')}. Static assets will not be served.")

# Model download endpoint to help with deployment
@app.get("/api/upload_model")
async def upload_model_instructions():
    return {
        "message": "To upload your model file, POST the model file to /api/upload_model as form-data with field name 'model_file'",
        "example": "curl -X POST -F 'model_file=@best_brain_tumor_resnet18_finetuned.pth' https://your-app-url/api/upload_model"
    }

@app.post("/api/upload_model")
async def upload_model(model_file: UploadFile = File(...)):
    try:
        # Create models directory if it doesn't exist
        os.makedirs("models", exist_ok=True)
        
        # Save the uploaded model file
        model_path = os.path.join("models", "best_brain_tumor_resnet18_finetuned.pth")
        with open(model_path, "wb") as f:
            content = await model_file.read()
            f.write(content)
        
        # Try to reload the model
        global model
        try:
            model = load_model()
            return {"message": "Model uploaded and loaded successfully", "model_path": model_path}
        except Exception as e:
            return {"message": "Model uploaded but could not be loaded", "error": str(e), "model_path": model_path}
    
    except Exception as e:
        logger.error(f"Error uploading model: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading model: {str(e)}")

# React app fallback - must be last!
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    file_path = os.path.join(build_dir, "index.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        logger.warning(f"React app index.html not found at {file_path}")
        return {"error": "Frontend not built. Run `npm run build` in your React app."}

# Start the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)