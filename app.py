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

# Load environment vars from .env file
load_dotenv()

# Set up Gemini API with our key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI(title="Brain Tumor Classification API")

# Fix CORS - no trailing slash in origin URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://neurotrix-d2f6.onrender.com"],
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
    model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet18', pretrained=True)
    
    # Modify fc layer for our 4 classes
    num_ftrs = model.fc.in_features
    model.fc = torch.nn.Sequential(
        torch.nn.Linear(num_ftrs, 512),
        torch.nn.ReLU(),
        torch.nn.Dropout(0.5),
        torch.nn.Linear(512, 4)
    )
    
    # Load our trained weights
    model.load_state_dict(torch.load("best_brain_tumor_resnet18_finetuned.pth", 
                                     map_location=torch.device('cpu')))
    model.eval()
    return model

# Load model at startup
try:
    model = load_model()
    print("Model loaded successfully!")
    CATEGORIES = ['notumor', 'glioma', 'meningioma', 'pituitary']
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Preprocess image and run prediction
def predict_tumor(image_bytes):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
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
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Step 10: Function to generate Gemini recommendation
async def generate_recommendation(classification_result, patient_info):
    try:
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
        gem_model = genai.GenerativeModel('gemini-2.0-flash')
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
                # If all parsing attempts fail, raise an exception
                raise ValueError("Could not parse Gemini response as JSON")
                
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
        print(f"Gemini API error: {e}")
        # Fallback recommendation if Gemini fails
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

@app.get("/api/status")
async def status():
    return {"status": "ok", "model_loaded": model is not None}

# STATIC FILES - React build assets
build_dir = os.path.join(os.path.dirname(__file__), "build")

@app.get("/background.png")
def background():
    return FileResponse(os.path.join(build_dir, "background.png"))

@app.get("/manifest.json")
def manifest():
    return FileResponse(os.path.join(build_dir, "manifest.json"))

@app.get("/favicon.ico")
def favicon():
    return FileResponse(os.path.join(build_dir, "favicon.ico"))

@app.get("/logo512.png")
def logo512():
    return FileResponse(os.path.join(build_dir, "logo512.png"))

@app.get("/logo192.png")
def logo192():
    return FileResponse(os.path.join(build_dir, "logo192.png"))

# Static assets directory
app.mount("/static", StaticFiles(directory="build/static"), name="static")

# React app fallback - must be last!
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    file_path = os.path.join("build", "index.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        return {"error": "Frontend not built. Run `npm run build` in your React app."}

# Start the server
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)