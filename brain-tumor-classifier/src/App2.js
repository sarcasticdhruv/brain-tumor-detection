import { useState, useEffect, memo } from 'react';
import { Upload, CheckCircle, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './index.css';

// Patient Info Form Component - memoized to prevent unnecessary re-renders
const PatientInfoForm = memo(({ patientInfo, setPatientInfo, onSubmit }) => (
  <div className="w-full bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Information</h2>
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={patientInfo.name}
            onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            required
            min="1"
            max="120"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={patientInfo.age}
            onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              checked={patientInfo.gender === 'Male'}
              onChange={() => setPatientInfo({...patientInfo, gender: 'Male'})}
            />
            <span className="ml-2 text-sm text-gray-700">Male</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              checked={patientInfo.gender === 'Female'}
              onChange={() => setPatientInfo({...patientInfo, gender: 'Female'})}
            />
            <span className="ml-2 text-sm text-gray-700">Female</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              checked={patientInfo.gender === 'other'}
              onChange={() => setPatientInfo({...patientInfo, gender: 'other'})}
            />
            <span className="ml-2 text-sm text-gray-700">Other</span>
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Medical History</label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="Relevant conditions, previous diagnoses, family history..."
          value={patientInfo.medicalHistory}
          onChange={(e) => setPatientInfo({...patientInfo, medicalHistory: e.target.value})}
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Symptoms</label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          placeholder="Headaches, vision changes, balance problems..."
          value={patientInfo.symptoms}
          onChange={(e) => setPatientInfo({...patientInfo, symptoms: e.target.value})}
        ></textarea>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md"
        >
          Continue to MRI Upload
        </button>
      </div>
    </form>
  </div>
));

// Image Upload Component
const ImageUploadComponent = memo(({ navigateToStep, handleImageUpload, imagePreview, isLoading }) => (
  <div className="w-full bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
    <div className="flex items-center mb-6">
      <button 
        onClick={() => navigateToStep(1)} 
        className="text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Patient Info
      </button>
      {/* <h2 className="text-2xl font-bold text-gray-800 ml-4">MRI Upload</h2> */}
    </div>
    
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Upload Brain MRI Scan</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors">
        <input
          type="file"
          onChange={handleImageUpload}
          className="hidden"
          id="file-upload"
          accept="image/*"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-6">
            <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="mt-4 text-base font-medium text-gray-700">Drag and drop your MRI scan here</p>
            <p className="mt-2 text-sm text-gray-500">Or click to browse files</p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
          </div>
        </label>
      </div>

      {imagePreview && !isLoading && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Preview</h3>
          <div className="rounded-xl overflow-hidden bg-white border shadow-sm">
            <img 
              src={imagePreview} 
              alt="MRI Scan Preview" 
              className="w-full object-contain max-h-80"
            />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Processing your MRI scan...</p>
        </div>
      )}
    </div>
  </div>
));

// Results Component
const ResultsComponent = memo(({ 
  navigateToStep, 
  patientInfo, 
  selectedImage, 
  prediction, 
  isGeminiLoading, 
  geminiRecommendation,
  handleExportResults,
  handleNewScan
}) => (
  <div className="w-full bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
    <div className="flex items-center mb-6">
      <button 
        onClick={() => navigateToStep(2)} 
        className="text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Upload
      </button>
      {/* <h2 className="text-2xl font-bold text-gray-800 ml-4">Diagnostic Results</h2> */}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column - Patient & Image */}
      <div className="space-y-6">
        {/* Patient summary card */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Patient Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700 font-medium">Name</p>
              <p className="text-gray-900">{patientInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Age</p>
              <p className="text-gray-900">{patientInfo.age}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Gender</p>
              <p className="text-gray-900">{patientInfo.gender}</p>
            </div>
          </div>
        </div>
        
        {/* MRI image card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">MRI Scan</h3>
          <div className="rounded-xl overflow-hidden bg-black">
            <img 
              src={selectedImage} 
              alt="Processed MRI Scan" 
              className="w-full object-contain"
            />
          </div>
        </div>
      </div>
      
      {/* Right column - Results & Recommendations */}
      <div className="space-y-6">
        {/* Classification results */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Classification Results</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Primary Diagnosis</p>
                <p className="text-2xl font-bold text-blue-900">{prediction.class}</p>
              </div>
              <div className="py-2 px-4 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {(prediction.confidence * 100).toFixed(1)}% Confidence
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-700 mb-3">Probability Distribution</h4>
            <div className="space-y-4">
              {prediction.probabilities.map((prob, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{prob.name}</span>
                    <span className="text-gray-600">{(prob.value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{
                        width: `${prob.value * 100}%`,
                        backgroundColor: index === 0 ? '#10B981' : 
                                        index === 1 ? '#3B82F6' : 
                                        index === 2 ? '#F59E0B' : '#EF4444'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Model Recommendations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recommendation</h3>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
              </svg>
              Insight
            </span>
          </div>
          
          {isGeminiLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : geminiRecommendation ? (
            <div className="space-y-4">
              {/* Summary with urgency badge */}
              <div className="flex items-start">
                <div className={`flex-1 p-4 rounded-lg ${
                  geminiRecommendation.urgency === 'high' ? 'bg-red-50 border border-red-200' :
                  geminiRecommendation.urgency === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{geminiRecommendation.summary}</p>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ml-2 ${
                      geminiRecommendation.urgency === 'high' ? 'bg-red-200 text-red-800' :
                      geminiRecommendation.urgency === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {geminiRecommendation.urgency} urgency
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Treatment recommendation */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Recommended Action</h4>
                <p className="text-gray-600">{geminiRecommendation.recommendation}</p>
              </div>
              
              {/* Follow-up recommendation */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Follow-up</h4>
                <p className="text-gray-600">{geminiRecommendation.followUp}</p>
              </div>
              
              {/* Disclaimer */}
              <div className="mt-4 text-xs text-gray-500 italic border-t pt-3">
                This recommendation is generated by a trained model and should be reviewed by a qualified healthcare professional before making clinical decisions.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Recommendation pending classification results.
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Model information */}
    <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Model Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Model Architecture</h4>
          <p className="text-gray-600">Fine-tuned ResNet-18 with custom classifier</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
          <p className="text-gray-600">Accuracy: 99.69% | Precision: 98.7% | Recall: 99.2%</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Training Data</h4>
          <p className="text-gray-600">3,000 brain MRI scans across 4 classes</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Classification Classes</h4>
          <p className="text-gray-600">No Tumor, Glioma, Meningioma, Pituitary</p>
        </div>
      </div>
    </div>
    
    {/* Export buttons */}
    <div className="mt-6 flex justify-end">
      <button 
        onClick={handleExportResults}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg mr-3 flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Export Results
      </button>
      <button 
        onClick={handleNewScan}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        New Scan
      </button>
    </div>
  </div>
));

// Main component
export default function EnhancedBrainTumorClassifier() {
  // State management
  const [currentStep, setCurrentStep] = useState(1); // 1: Patient Info, 2: Upload, 3: Results
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: 'Male',
    medicalHistory: '',
    symptoms: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [geminiRecommendation, setGeminiRecommendation] = useState(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [reportId, setReportId] = useState(null);

  // Generate a unique report ID on component mount
  useEffect(() => {
    const generateReportId = () => {
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `MRI-${randomStr}-${timestamp.toString().slice(-6)}`;
    };
    
    setReportId(generateReportId());
  }, []);

  // Handle image upload and API call
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  
    // Process the file
    setIsLoading(true);
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', patientInfo.name);
    formData.append('age', patientInfo.age);
    formData.append('gender', patientInfo.gender);
    formData.append('medicalHistory', patientInfo.medicalHistory);
    formData.append('symptoms', patientInfo.symptoms);
  
    fetch('http://localhost:8000/api/analyze_mri', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      setPrediction(data.classification);
      setGeminiRecommendation(data.recommendation);
      setIsLoading(false);
      setIsGeminiLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setIsLoading(false);
      alert("Error processing the image. Please try again.");
    });
  };
  const handleNewScan = () => {
    // Generate a new report ID
    const generateReportId = () => {
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `MRI-${randomStr}-${timestamp.toString().slice(-6)}`;
    };
    
    // Reset patient info (optionally keep some fields if desired)
    setPatientInfo({
      name: '',
      age: '',
      gender: 'Male',
      medicalHistory: '',
      symptoms: ''
    });
    
    // Reset all image and prediction related states
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setIsLoading(false);
    setGeminiRecommendation(null);
    setIsGeminiLoading(false);
    
    // Generate new report ID
    setReportId(generateReportId());
    
    // Return to step 1 (Patient Info)
    setCurrentStep(1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Adds smooth scrolling animation
    });
  };
// Simplified Patient Information section with added clinical analysis
const handleExportResults = () => {
  if (!prediction || !patientInfo.name) {
    alert("Cannot export results. Complete analysis first.");
    return;
  }

  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add a modern header with accent bar
  doc.setFillColor(0, 51, 102); // Dark blue for institutional branding
  doc.rect(0, 0, pageWidth, 10, 'F'); // Top accent bar
  
  // Add hospital/institution logo and header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("NEUROTRIX", pageWidth / 2, 20, { align: "center" });
  
  // Modern subtitle with document type
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text("BRAIN MRI ANALYSIS REPORT", pageWidth / 2, 28, { align: "center" });
  
  // Add report ID and date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: ${reportId}`, 15, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 35, { align: "right" });
 
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 38, pageWidth - 15, 38);
  // PATIENT SUMMARY CARD - simplified version
  // Create a header for the patient card
  doc.setFillColor(0, 51, 102);
  doc.rect(15, 55, pageWidth - 30, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("PATIENT SUMMARY", pageWidth / 2, 60.5, { align: "center" });
  
  // Patient summary card body
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, 63, pageWidth - 30, 25, 1, 1, 'F');
  
  // Patient information in clean layout
  // First row
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("NAME:", 25, 71);
  doc.text("ID:", 120, 71);
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(patientInfo.name, 55, 71);
  doc.text(patientInfo.patientId || "MRN-" + reportId.substring(4, 10), 130, 71);
  
  // Second row
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("AGE:", 25, 80);
  doc.text("GENDER:", 120, 80);
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(patientInfo.age.toString(), 55, 80);
  doc.text(patientInfo.gender, 145, 80);
  
  // CLINICAL DETAILS SECTION
  let yPos = 96;
  
  // Medical history section with modern styling
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("MEDICAL HISTORY", 20, yPos + 5);
  
  // Draw thin line below section header
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(15, yPos + 7, pageWidth - 15, yPos + 7);
  
  // Medical history content in clean container
  const medHistHeight = patientInfo.medicalHistory ? 
    Math.max(15, doc.splitTextToSize(patientInfo.medicalHistory, pageWidth - 40).length * 5) : 15;
  
  doc.setFillColor(252, 252, 252);
  doc.rect(15, yPos + 7, pageWidth - 30, medHistHeight, 'F');
  
  // Medical history content
  doc.setFont(undefined, 'normal');
  doc.setTextColor(60, 60, 60);
  if (patientInfo.medicalHistory) {
    const splitHistory = doc.splitTextToSize(patientInfo.medicalHistory, pageWidth - 40);
    doc.text(splitHistory, 20, yPos + 14);
    yPos = yPos + 14 + (splitHistory.length * 5) + 3;
  } else {
    doc.text("No significant medical history recorded.", 20, yPos + 14);
    yPos = yPos + 22;
  }
  
  // Symptoms section with modern styling
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("PRESENTING SYMPTOMS", 20, yPos + 5);
  
  // Draw thin line below section header
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(15, yPos + 7, pageWidth - 15, yPos + 7);
  
  // Symptoms content in clean container
  const symptomsHeight = patientInfo.symptoms ? 
    Math.max(15, doc.splitTextToSize(patientInfo.symptoms, pageWidth - 40).length * 5) : 15;
  
  doc.setFillColor(252, 252, 252);
  doc.rect(15, yPos + 7, pageWidth - 30, symptomsHeight, 'F');
  
  // Symptoms content
  doc.setFont(undefined, 'normal');
  doc.setTextColor(60, 60, 60);
  if (patientInfo.symptoms) {
    const splitSymptoms = doc.splitTextToSize(patientInfo.symptoms, pageWidth - 40);
    doc.text(splitSymptoms, 20, yPos + 14);
    yPos = yPos + 14 + (splitSymptoms.length * 5) + 10;
  } else {
    doc.text("No symptoms recorded.", 20, yPos + 14);
    yPos = yPos + 22;
  }
  
  // Add a separator line between patient info and results
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(0.5);
  doc.line(15, yPos - 5, pageWidth - 15, yPos - 5);
  
  // ANALYSIS RESULTS SECTION - modern design
  doc.setFillColor(0, 51, 102);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("ANALYSIS RESULTS", pageWidth / 2, yPos + 5.5, { align: "center" });
  yPos += 12;
  
  // Classification results in a clean, modern layout
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, yPos, pageWidth - 30, 20, 1, 1, 'F');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("PRIMARY DIAGNOSIS:", 20, yPos + 8);
  
  // Make diagnosis stand out
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Pituitary Tumor", 75, yPos + 8);
  
  // Show confidence level with visual indicator
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("CONFIDENCE:", 120, yPos + 8);
  
  const confidence = 92.5; // Example confidence
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${confidence}%`, 155, yPos + 8);
  
  // Add mini confidence bar
  const barWidth = 20;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(155 + doc.getTextWidth(`${confidence}%`) + 3, yPos + 5, barWidth, 3, 0.5, 0.5, 'FD');
  
  doc.setFillColor(0, 102, 204);
  doc.roundedRect(155 + doc.getTextWidth(`${confidence}%`) + 3, yPos + 5, barWidth * (confidence/100), 3, 0.5, 0.5, 'F');
  
  yPos += 24;
  
  // CLINICAL RECOMMENDATIONS SECTION
  doc.setFillColor(0, 51, 102);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text("CLINICAL RECOMMENDATION", pageWidth / 2, yPos + 5.5, { align: "center" });
  yPos += 12;
  
  // Summary box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(15, yPos, pageWidth - 30, 60, 1, 1, 'F');
  
  // Summary label
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("SUMMARY:", 20, yPos + 8);
  
  // Summary content
  const summary = "MRI suggests a pituitary tumor with high confidence.";
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(summary, 60, yPos + 8);
  
  // Urgency indicator
  // Set urgency color (medium = amber/orange)
  doc.setFillColor(255, 193, 7);
  doc.roundedRect(20, yPos + 14, 60, 6, 1, 1, 'F');
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text("URGENCY: MEDIUM", 50, yPos + 18, { align: "center" });
  
  // Recommendation content
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text("RECOMMENDED ACTION:", 20, yPos + 28);
  
  // Recommendation text
  const recommendation = "A repeat MRI may be needed in 6-12 months to monitor tumor growth, depending on size and hormonal activity. Regular follow-up with endocrinology and neurosurgery is essential for long-term management given Dhruv's history of diabetes.";
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  const splitRecommendation = doc.splitTextToSize(recommendation, pageWidth - 40);
  doc.text(splitRecommendation, 20, yPos + 36);
  
  // Footer with institutional info
  doc.setDrawColor(200, 200, 200);
  doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text("NeuroTrix", pageWidth / 2, pageHeight - 20, { align: "center" });
  doc.text("www.neurotrix.netlify.app/", pageWidth / 2, pageHeight - 15, { align: "center" });
  
  // Disclaimer and page number
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
  const disclaimer = "DISCLAIMER: This report contains Model-assisted analysis and should be reviewed by a qualified healthcare professional.";
    doc.text(disclaimer, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Page 1 of 1`, pageWidth - 20, pageHeight - 5);
  
  // Save PDF with patient name and report ID
  const fileName = `${patientInfo.name.replace(/\s+/g, '_')}_MRI_Report_${reportId}.pdf`;
    doc.save(fileName);
    };
    
    const handlePatientInfoSubmit = (e) => {
      e.preventDefault();
      setCurrentStep(2); // Move to image upload step
    };
  
    // Step 6: Handle navigation between steps
    const navigateToStep = (step) => {
      if (step < currentStep) { // Only allow going back, not skipping ahead
        setCurrentStep(step);
      }
    };
  
    // Step 10: Effect to automatically move to results step after prediction
    useEffect(() => {
      if (prediction) {
        setCurrentStep(3);
      }
    }, [prediction]);
  
    // Step 11: Main rendering based on current step
    return (
      <div
        className="bgstatic min-h-screen bg-cover bg-center py-12 px-4"
        style={{
          backgroundImage: "url('background.png')",
          backgroundAttachment: "fixed",
          backgroundPosition: "top center",
          backgroundSize: "120% auto",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh"
        }}
        // className="min-h-screen py-12 px-4"
      >
      {/* <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4"> */}
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8">
        {/* Logo */}
        {/* <div className="flex items-center justify-center mb-3 relative">
          <div className="absolute -z-10 w-16 h-16 bg-blue-400/10 rounded-full blur-lg"></div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-md">
            <Brain size={26} className="text-white" />
          </div>
        </div> */}
        
        <h1 className="text-6xl font-orbitron font-bold text-gray-900 text-center mb-2 orbitron-font pt-10">
          Neurotrix
        </h1>

        
        {/* Divider with gradient */}
        <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full my-3 mx-auto"></div>
        
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Advanced neural network-based classification system for brain tumor MRI scans with recommendations.
        </p>
      </header>
      
      {/* Step Indicator with Smooth Transition */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-center">
          {/* Navigation Container with Position Relative for Absolute Positioning of Blue Background */}
          <div className="relative bg-white shadow-md border border-blue-100 rounded-full p-1 w-full max-w-md flex items-center">
            {/* Animated Blue Background that Moves Smoothly */}
            <div 
              className="absolute h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ 
                width: '33.33%', 
                left: currentStep === 1 ? '0%' : currentStep === 2 ? '33.33%' : '66.66%',
                transform: currentStep === 1 ? 'translateX(0)' : undefined
              }}
            ></div>
            
            {/* Navigation Items - These stay in place while background moves */}
            <div className="flex items-center justify-between w-full z-10">
              <div className="flex-1 flex items-center justify-center py-2 px-3 transition-colors duration-300">
                <User size={18} className={`mr-2 ${currentStep === 1 ? 'text-white' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${currentStep === 1 ? 'text-white' : 'text-blue-600'}`}>Patient Info</span>
              </div>
              <div className="flex-1 flex items-center justify-center py-2 px-3 transition-colors duration-300">
                <Upload size={18} className={`mr-2 ${currentStep === 2 ? 'text-white' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${currentStep === 2 ? 'text-white' : 'text-blue-600'}`}>MRI Upload</span>
              </div>

              <div className="flex-1 flex items-center justify-center py-2 px-3 transition-colors duration-300">
                <CheckCircle size={18} className={`mr-2 ${currentStep === 3 ? 'text-white' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${currentStep === 3 ? 'text-white' : 'text-blue-600'}`}>Results</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Bottom Accent Bar */}
        {/* <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-400"></div> */}
        
        {/* Main Content based on current step */}
        {currentStep === 1 && (
          <PatientInfoForm 
            patientInfo={patientInfo} 
            setPatientInfo={setPatientInfo} 
            onSubmit={handlePatientInfoSubmit} 
          />
        )}
        
        {currentStep === 2 && (
          <ImageUploadComponent 
            navigateToStep={navigateToStep} 
            handleImageUpload={handleImageUpload} 
            imagePreview={imagePreview} 
            isLoading={isLoading} 
          />
        )}
        
        {currentStep === 3 && prediction && (
          <ResultsComponent 
            navigateToStep={navigateToStep} 
            patientInfo={patientInfo} 
            selectedImage={selectedImage} 
            prediction={prediction} 
            isGeminiLoading={isGeminiLoading} 
            geminiRecommendation={geminiRecommendation} 
            handleExportResults={handleExportResults}
            handleNewScan={handleNewScan}
          />
        )}
        
        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 Brain Tumor Classification System. For research purposes only.</p>
          <p className="mt-1">Not intended for clinical use without professional medical supervision.</p>
        </footer>
      </div>
    );
  }