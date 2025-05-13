import { useState, useEffect, memo, Suspense } from 'react';
import { Upload, CheckCircle, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './index.css';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './ThemeContext';

const PatientInfoForm = memo(({ patientInfo, setPatientInfo, onSubmit, isDarkMode }) => (
  <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 sm:p-8 max-w-3xl mx-auto transition-colors duration-300`}>
    <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-6`}>Patient Information</h2>
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Full Name</label>
          <input
            type="text"
            required
            className={`w-full px-3 sm:px-4 py-2 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            value={patientInfo.name}
            onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Age</label>
          <input
            type="number"
            required
            min="1"
            max="120"
            className={`w-full px-3 sm:px-4 py-2 border ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            value={patientInfo.age}
            onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Gender</label>
        <div className="flex flex-wrap space-x-4">
          <label className="flex items-center mb-2">
            <input
              type="radio"
              className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} focus:ring-blue-500 border-gray-300`}
              checked={patientInfo.gender === 'Male'}
              onChange={() => setPatientInfo({...patientInfo, gender: 'Male'})}
            />
            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Male</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} focus:ring-blue-500 border-gray-300`}
              checked={patientInfo.gender === 'Female'}
              onChange={() => setPatientInfo({...patientInfo, gender: 'Female'})}
            />
            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Female</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} focus:ring-blue-500 border-gray-300`}
              checked={patientInfo.gender === 'other'}
              onChange={() => setPatientInfo({...patientInfo, gender: 'other'})}
            />
            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Other</span>
          </label>
        </div>
      </div>
      
      <div>
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Relevant Medical History</label>
        <textarea
          className={`w-full px-3 sm:px-4 py-2 border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          rows="3"
          placeholder="Relevant conditions, previous diagnoses, family history..."
          value={patientInfo.medicalHistory}
          onChange={(e) => setPatientInfo({...patientInfo, medicalHistory: e.target.value})}
        ></textarea>
      </div>
      
      <div>
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Current Symptoms</label>
        <textarea
          className={`w-full px-3 sm:px-4 py-2 border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          rows="3"
          placeholder="Headaches, vision changes, balance problems..."
          value={patientInfo.symptoms}
          onChange={(e) => setPatientInfo({...patientInfo, symptoms: e.target.value})}
        ></textarea>
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          className={`w-full ${
            isDarkMode 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors shadow-md`}
        >
          Continue to MRI Upload
        </button>
      </div>
    </form>
  </div>
));

const ImageUploadComponent = memo(({ navigateToStep, handleImageUpload, imagePreview, isLoading, isDarkMode }) => (
  <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sm:p-8 max-w-3xl mx-auto transition-colors duration-300`}>
    <div className="flex items-center mb-6">
      <button 
        onClick={() => navigateToStep(1)} 
        className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} flex items-center`}
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Patient Info
      </button>
    </div>
    
    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 sm:p-6 rounded-xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Upload Brain MRI Scan</h3>
      <div className={`border-2 border-dashed ${
        isDarkMode ? 'border-gray-500 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'
      } rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors`}>
        <input
          type="file"
          onChange={handleImageUpload}
          className="hidden"
          id="file-upload"
          accept="image/*"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-4 sm:py-6">
            <svg className={`w-12 sm:w-16 h-12 sm:h-16 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className={`mt-4 text-sm sm:text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Drag and drop your MRI scan here</p>
            <p className={`mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Or click to browse files</p>
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>PNG, JPG, GIF up to 10MB</p>
          </div>
        </label>
      </div>

      {imagePreview && !isLoading && (
        <div className="mt-6">
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Preview</h3>
          <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
            <img 
              src={imagePreview} 
              alt="MRI Scan Preview" 
              className="w-full object-contain max-h-64 sm:max-h-80"
            />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 flex flex-col items-center">
          <div className={`animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'} mb-4`}></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Processing your MRI scan...</p>
        </div>
      )}
    </div>
  </div>
));

const ResultsComponent = memo(({ 
  navigateToStep, 
  patientInfo, 
  selectedImage, 
  prediction, 
  isGeminiLoading, 
  geminiRecommendation,
  handleExportResults,
  handleNewScan,
  isDarkMode
}) => (
  <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 sm:p-8 max-w-5xl mx-auto transition-colors duration-300`}>
    <div className="flex items-center mb-6">
      <button 
        onClick={() => navigateToStep(2)} 
        className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} flex items-center`}
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Upload
      </button>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Left column - Patient & Image */}
      <div className="space-y-4 sm:space-y-6">
        {/* Patient summary card */}
        <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'} rounded-xl border p-4 sm:p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-4`}>Patient Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} font-medium`}>Name</p>
              <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{patientInfo.name}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} font-medium`}>Age</p>
              <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{patientInfo.age}</p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} font-medium`}>Gender</p>
              <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{patientInfo.gender}</p>
            </div>
          </div>
        </div>
        
        {/* MRI image card */}
        <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>MRI Scan</h3>
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
      <div className="space-y-4 sm:space-y-6">
        {/* Classification results */}
        <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Classification Results</h3>
          
          <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'} p-4 rounded-lg border mb-5`}>
            <div className="flex flex-wrap items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} font-medium`}>Primary Diagnosis</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>{prediction.class}</p>
              </div>
              <div className={`py-1 sm:py-2 px-3 sm:px-4 ${
                isDarkMode ? 'bg-blue-800/50 text-blue-300' : 'bg-blue-100 text-blue-800'
              } rounded-full text-xs sm:text-sm font-medium`}>
                {(prediction.confidence * 100).toFixed(1)}% Confidence
              </div>
            </div>
          </div>

          <div>
            <h4 className={`text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Probability Distribution</h4>
            <div className="space-y-4">
              {prediction.probabilities.map((prob, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{prob.name}</span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{(prob.value * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                    <div 
                      className="h-2 rounded-full" 
                      style={{
                        width: `${prob.value * 100}%`,
                        backgroundColor: isDarkMode ?
                          (index === 0 ? '#34D399' : 
                          index === 1 ? '#60A5FA' : 
                          index === 2 ? '#FBBF24' : '#F87171') :
                          (index === 0 ? '#10B981' : 
                          index === 1 ? '#3B82F6' : 
                          index === 2 ? '#F59E0B' : '#EF4444')
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Model Recommendations */}
        <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-xl border p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Recommendation</h3>
            <span className={`${
              isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
            } text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center`}>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
              </svg>
              Insight
            </span>
          </div>
          
          {isGeminiLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${isDarkMode ? 'border-purple-400' : 'border-purple-500'}`}></div>
            </div>
          ) : geminiRecommendation ? (
            <div className="space-y-4">
              {/* Summary with urgency badge */}
              <div className="flex items-start">
                <div className={`flex-1 p-3 sm:p-4 rounded-lg ${
                  geminiRecommendation.urgency === 'high' ? (isDarkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200') :
                  geminiRecommendation.urgency === 'medium' ? (isDarkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200') :
                  (isDarkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200')
                } border`}>
                  <div className="flex flex-wrap justify-between items-start">
                    <p className={`font-medium text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{geminiRecommendation.summary}</p>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ml-2 mt-1 sm:mt-0 ${
                      geminiRecommendation.urgency === 'high' ? (isDarkMode ? 'bg-red-800/70 text-red-200' : 'bg-red-200 text-red-800') :
                      geminiRecommendation.urgency === 'medium' ? (isDarkMode ? 'bg-yellow-800/70 text-yellow-200' : 'bg-yellow-200 text-yellow-800') :
                      (isDarkMode ? 'bg-green-800/70 text-green-200' : 'bg-green-200 text-green-800')
                    }`}>
                      {geminiRecommendation.urgency} urgency
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Treatment recommendation */}
              <div>
                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Recommended Action</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{geminiRecommendation.recommendation}</p>
              </div>
              
              {/* Follow-up recommendation */}
              <div>
                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Follow-up</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{geminiRecommendation.followUp}</p>
              </div>
              
              {/* Disclaimer */}
              <div className={`mt-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} italic border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} pt-3`}>
                This recommendation is generated by a trained model and should be reviewed by a qualified healthcare professional before making clinical decisions.
              </div>
            </div>
          ) : (
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} py-8`}>
              Recommendation pending classification results.
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Model information */}
    <div className={`mt-6 sm:mt-8 ${isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl border p-4 sm:p-6`}>
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>Model Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 sm:p-4 border`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}>Model Architecture</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>Fine-tuned ResNet-18 with custom classifier</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 sm:p-4 border`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}>Performance Metrics</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>Accuracy: 99.69% | Precision: 98.7% | Recall: 99.2%</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 sm:p-4 border`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}>Training Data</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>3,000 brain MRI scans across 4 classes</p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-3 sm:p-4 border`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}>Classification Classes</h4>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs sm:text-sm`}>No Tumor, Glioma, Meningioma, Pituitary</p>
        </div>
      </div>
    </div>
    
    {/* Export buttons */}
    <div className="mt-6 flex flex-wrap justify-center sm:justify-end gap-3">
      <button 
        onClick={handleExportResults}
        className={`${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        } py-2 px-4 rounded-lg flex items-center text-sm`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Export Results
      </button>
      <button 
        onClick={handleNewScan}
        className={`${
          isDarkMode 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white py-2 px-4 rounded-lg flex items-center text-sm`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
        New Scan
      </button>
    </div>
  </div>
));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
  </div>
);

// Main component
export default function EnhancedBrainTumorClassifier() {
  const { isDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // report id on component mount
  useEffect(() => {
    const generateReportId = () => {
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `MRI-${randomStr}-${timestamp.toString().slice(-6)}`;
    };
    
    setReportId(generateReportId());
  }, []);

  // mobile fix
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const handleImageLazyLoad = () => {
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        img.src = img.dataset.src;
      });
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
      document.body.appendChild(script);
    }
  };

  useEffect(() => {
    handleImageLazyLoad();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const isMobile = window.innerWidth < 768;
        const MAX_WIDTH = isMobile ? 800 : 1200;
        const MAX_FILE_SIZE = 500 * 1024; // 500KB target for mobile
        
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.floor(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        //dynamic compression quality based on file size
        let quality = 0.8;
        const initialDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        if (isMobile && initialDataUrl.length > MAX_FILE_SIZE * 1.5) {
          quality = 0.6;
        }
        
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        setImagePreview(dataUrl);
        setSelectedImage(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  
    // abort controller forcleanup
    setIsLoading(true);
    const controller = new AbortController();
    const signal = controller.signal;
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', patientInfo.name);
    formData.append('age', patientInfo.age);
    formData.append('gender', patientInfo.gender);
    formData.append('medicalHistory', patientInfo.medicalHistory);
    formData.append('symptoms', patientInfo.symptoms);
  
    fetch('https://neurotrix-d2f6.onrender.com/api/analyze_mri', {
      method: 'POST',
      body: formData,
      signal: signal,
    })
    .then(response => response.json())
    .then(data => {
      setPrediction(data.classification);
      setGeminiRecommendation(data.recommendation);
      setIsLoading(false);
      setIsGeminiLoading(false);
    })
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        setIsLoading(false);
        alert("Error processing the image. Please try again.");
      }
    });

    // cleanupfunction -- cancel request if component unmounts
    return () => controller.abort();
  };

  const handleNewScan = () => {
    // Generate a new report ID
    const generateReportId = () => {
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `MRI-${randomStr}-${timestamp.toString().slice(-6)}`;
    };
    
    // reset patient info
    setPatientInfo({
      name: '',
      age: '',
      gender: 'Male',
      medicalHistory: '',
      symptoms: ''
    });
    
    // reset all image and prediction related states
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setIsLoading(false);
    setGeminiRecommendation(null);
    setIsGeminiLoading(false);
    
    // generate new report ID
    setReportId(generateReportId());
    
    // return to step 1 (Patient Info)
    setCurrentStep(1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleExportResults = () => {
    if (!prediction || !patientInfo.name) {
      alert("Cannot export results. Complete analysis first.");
      return;
    }

    // pdf document create
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // modern header with accent bar
    doc.setFillColor(0, 51, 102); // Dark blue for institutional branding
    doc.rect(0, 0, pageWidth, 10, 'F'); // Top accent bar
    
    // logo and header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("NEUROTRIX", pageWidth / 2, 20, { align: "center" });
    
    // subtitle with document type
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text("BRAIN MRI ANALYSIS REPORT", pageWidth / 2, 28, { align: "center" });
    
    // report ID and date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report ID: ${reportId}`, 15, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 35, { align: "right" });
   
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 38, pageWidth - 15, 38);

    // PATIENT SUMMARY CARD
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
    
    // Medical history section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, pageWidth - 30, 7, 'F');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("MEDICAL HISTORY", 20, yPos + 5);
    
    // line belwo section hrader
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(15, yPos + 7, pageWidth - 15, yPos + 7);
    
    // Medical history
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
    
    // Symptoms section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, pageWidth - 30, 7, 'F');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("PRESENTING SYMPTOMS", 20, yPos + 5);
    
    // line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(15, yPos + 7, pageWidth - 15, yPos + 7);
    
    // Symptoms content
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

    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(15, yPos - 5, pageWidth - 15, yPos - 5);
    
    // ANALYSIS RESULTS SECTION
    doc.setFillColor(0, 51, 102);
    doc.rect(15, yPos, pageWidth - 30, 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("ANALYSIS RESULTS", pageWidth / 2, yPos + 5.5, { align: "center" });
    yPos += 12;
    
    // Classification results
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(15, yPos, pageWidth - 30, 20, 1, 1, 'F');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("PRIMARY DIAGNOSIS:", 20, yPos + 8);
    
    // diagnosis
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(prediction.class, 75, yPos + 8);
    
    // confidence level visual indic
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("CONFIDENCE:", 120, yPos + 8);
    
    const confidence = (prediction.confidence * 100).toFixed(1); 
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`${confidence}%`, 155, yPos + 8);
    
    // mini confi bar
    const barWidth = 20;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(155 + doc.getTextWidth(`${confidence}%`) + 3, yPos + 5, barWidth, 3, 0.5, 0.5, 'FD');
    
    doc.setFillColor(0, 102, 204);
    doc.roundedRect(155 + doc.getTextWidth(`${confidence}%`) + 3, yPos + 5, barWidth * (prediction.confidence), 3, 0.5, 0.5, 'F');
    
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
    const summary = geminiRecommendation?.summary || 
      `MRI suggests a ${prediction.class} with ${confidence}% confidence.`;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(summary, 60, yPos + 8);
    
    // Urgency indicator
    if (geminiRecommendation?.urgency) {
      // Set urgency color
      let urgencyColor;
      if (geminiRecommendation.urgency === 'high') {
        urgencyColor = [255, 87, 87]; // Red
      } else if (geminiRecommendation.urgency === 'medium') {
        urgencyColor = [255, 193, 7]; // Amber
      } else {
        urgencyColor = [75, 192, 192]; // Green
      }
      
      doc.setFillColor(urgencyColor[0], urgencyColor[1], urgencyColor[2]);
      doc.roundedRect(20, yPos + 14, 60, 6, 1, 1, 'F');
      
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`URGENCY: ${geminiRecommendation.urgency.toUpperCase()}`, 50, yPos + 18, { align: "center" });
    }
    
    // Recommendation content
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text("RECOMMENDED ACTION:", 20, yPos + 28);
    
    // Recommendation text
    const recommendation = geminiRecommendation?.recommendation || 
      "Please consult with a medical professional for detailed recommendations based on these findings.";
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    const splitRecommendation = doc.splitTextToSize(recommendation, pageWidth - 40);
    doc.text(splitRecommendation, 20, yPos + 36);
    
    // Footer
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
    
    // Saving PDF with patient name and report ID
    const fileName = `${patientInfo.name.replace(/\s+/g, '_')}_MRI_Report_${reportId}.pdf`;
      doc.save(fileName);
  };
    
  const handlePatientInfoSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  // Handle navigation between steps
  const navigateToStep = (step) => {
    if (step < currentStep) { // only allows going back not skipping ahead
      setCurrentStep(step);
    }
  };

  useEffect(() => {
    if (prediction) {
      setCurrentStep(3);
    }
  }, [prediction]);

  return (
    <div
      className={`min-h-screen py-4 sm:py-6 px-3 sm:px-4 transition-colors duration-300 ${
        isDarkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bgstatic bg-cover bg-center'
      }`}
      style={{
        ...(!isDarkMode ? {
          backgroundImage: "url('background-light.png')",
          backgroundAttachment: "fixed",
          backgroundPosition: "top center",
          backgroundSize: "cover",
          minHeight: "calc(var(--vh, 1vh) * 100)"
        } : {
          backgroundImage: "url('background-dark.png')",
          backgroundAttachment: "fixed",
          backgroundPosition: "top center",
          backgroundSize: "cover",
          minHeight: "calc(var(--vh, 1vh) * 100)"
        }),
        overscrollBehavior: "none" // Prevent pull-to-refresh on mobile
      }}
    >
      {/*theme Toggle */}
      <header className="max-w-5xl mx-auto mb-4 sm:mb-6">
        <div className="flex justify-between items-center">
          <div className="lg:hidden">
            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md focus:outline-none focus:ring-2 ${
                isDarkMode ? 'text-gray-200 focus:ring-blue-600' : 'text-gray-700 focus:ring-blue-500'
              }`}
            >
              {/* Hamburger icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* ttheme toggle always visible */}
          <ThemeToggle />
        </div>
        
        {/* Logo and Title */}
        <h1 className={`text-3xl xs:text-4xl sm:text-6xl font-orbitron font-bold ${
          isDarkMode ? 'text-blue-400' : 'text-gray-900'
        } text-center mb-1 sm:mb-2 orbitron-font pt-3 sm:pt-10 transition-all`}>
          Neurotrix
        </h1>

        {/* Divider with gradient */}
        <div className={`w-16 sm:w-20 h-1 ${
          isDarkMode 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-400' 
          : 'bg-gradient-to-r from-blue-400 to-indigo-500'
        } rounded-full my-2 sm:my-3 mx-auto transition-all`}></div>
        
        <p className={`${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        } text-center max-w-2xl mx-auto text-xs sm:text-sm md:text-base transition-all`}>
          Advanced neural network-based classification system for brain tumor MRI scans with recommendations.
        </p>
      </header>
      
      {/* mobile menu - slides in from left */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className={`fixed inset-y-0 left-0 w-64 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg transform transition-transform duration-300 ease-in-out`}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* mobile navigation steps */}
              <nav className="space-y-4">
                <button
                  onClick={() => {
                    navigateToStep(1);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg ${
                    currentStep === 1 
                      ? (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800') 
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  1. Patient Information
                </button>
                
                <button
                  onClick={() => {
                    if (currentStep >= 2) navigateToStep(2);
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={currentStep < 2}
                  className={`w-full text-left p-3 rounded-lg ${
                    currentStep < 2 
                      ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'
                      : currentStep === 2 
                        ? (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800') 
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  2. MRI Upload
                </button>
                
                <button
                  onClick={() => {
                    if (currentStep >= 3) navigateToStep(3);
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={currentStep < 3}
                  className={`w-full text-left p-3 rounded-lg ${
                    currentStep < 3 
                      ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'
                      : (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800')
                  }`}
                >
                  3. Results & Analysis
                </button>
              </nav>
              
              {/* quick action buttons */}
              {currentStep === 3 && prediction && (
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => {
                      handleExportResults();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2 px-4 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    } rounded-lg flex justify-center items-center text-sm transition-colors`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Export Results
                  </button>
                  
                  <button
                    onClick={() => {
                      handleNewScan();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full py-2 px-4 ${
                      isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white rounded-lg flex justify-center items-center text-sm transition-colors`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    New Scan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/*step indic*/}
      <div className="max-w-5xl mx-auto mb-5 sm:mb-6 px-2">
        <div className="flex items-center justify-center">
          <div className={`relative ${
            isDarkMode ? 'bg-gray-800 shadow-lg border-gray-700' : 'bg-white shadow-md border-blue-100'
          } border rounded-full p-1 w-full max-w-md flex items-center`}>
            <div 
              className="absolute h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ 
                width: '33.33%', 
                left: currentStep === 1 ? '0%' : currentStep === 2 ? '33.33%' : '66.66%'
              }}
            ></div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between w-full z-10">
              <button 
                onClick={() => currentStep > 1 && navigateToStep(1)}
                disabled={currentStep === 1}
                className="flex-1 flex items-center justify-center py-2 px-1 sm:px-2 transition-colors duration-300 focus:outline-none"
              >
                <User size={16} className={`mr-1 sm:mr-2 ${currentStep === 1 ? 'text-white' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-xs sm:text-sm font-medium ${currentStep === 1 ? 'text-white' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Patient</span>
              </button>
              <button 
                onClick={() => currentStep > 2 && navigateToStep(2)}
                disabled={currentStep < 2}
                className="flex-1 flex items-center justify-center py-2 px-1 sm:px-2 transition-colors duration-300 focus:outline-none"
              >
                <Upload size={16} className={`mr-1 sm:mr-2 ${currentStep === 2 ? 'text-white' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-xs sm:text-sm font-medium ${currentStep === 2 ? 'text-white' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Upload</span>
              </button>
              <button 
                disabled={true}
                className="flex-1 flex items-center justify-center py-2 px-1 sm:px-2 transition-colors duration-300 focus:outline-none"
              >
                <CheckCircle size={16} className={`mr-1 sm:mr-2 ${currentStep === 3 ? 'text-white' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-xs sm:text-sm font-medium ${currentStep === 3 ? 'text-white' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Results</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        {currentStep === 1 && (
          <PatientInfoForm 
            patientInfo={patientInfo} 
            setPatientInfo={setPatientInfo} 
            onSubmit={handlePatientInfoSubmit}
            isDarkMode={isDarkMode}
          />
        )}
        
        {currentStep === 2 && (
          <ImageUploadComponent 
            navigateToStep={navigateToStep} 
            handleImageUpload={handleImageUpload} 
            imagePreview={imagePreview} 
            isLoading={isLoading}
            isDarkMode={isDarkMode}
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
            isDarkMode={isDarkMode}
          />
        )}
      </Suspense>
      
      {/* Footer */}
      <footer className={`mt-8 sm:mt-12 pb-4 text-center text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>© 2025 Brain Tumor Classification System. For research purposes only.</p>
        <p className="mt-1">Not intended for clinical use without professional medical supervision.</p>
      </footer>
    </div>
  );
}