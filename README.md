# Brain Tumor Detection

An advanced machine learning application for accurate detection and classification of brain tumors from MRI scans.

![Brain Tumor Detection System](https://placehold.co/600x400?text=Brain+Tumor+Detection)

## Overview

This project combines state-of-the-art deep learning techniques with a modern web interface to assist medical professionals in the early detection of brain tumors. Leveraging a fine-tuned ResNet-18 model, our system delivers high-accuracy tumor classification while maintaining an intuitive user experience.

## Key Features

- **Intelligent Analysis**: Deep learning-powered detection of brain tumors from MRI scans
- **Multi-Class Classification**: Identification of tumor type with confidence scores
- **Interactive Dashboard**: Clean, responsive UI for easy navigation and results visualization
- **Clinical Reporting**: Generate comprehensive PDF reports for medical documentation
- **Accessibility**: Dark/light mode support and responsive design for all devices

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: TailwindCSS with custom theme integration
- **Components**: Headless UI for accessible interactive elements
- **Visualization**: Chart.js for results representation
- **Reporting**: jsPDF for clinical documentation

### Backend
- **API**: FastAPI for high-performance Python backend
- **ML Framework**: PyTorch with CUDA acceleration support
- **Model**: Fine-tuned ResNet-18 architecture
- **Image Processing**: OpenCV and PIL for preprocessing
- **Data Handling**: Pandas and NumPy for efficient data management

## Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- GPU support recommended for inference (CUDA compatible)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/sarcasticdhruv/brain-tumor-detection.git
   cd brain-tumor-detection
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```bash
   cd brain-tumor-classifier
   npm install
   ```

4. Start the backend server (set up APIs):
   ```bash
   cd..
   uvicorn app:app --reload
   ```

5. In a new terminal, start the frontend:
   ```bash
   cd brain-tumor-classifier
   npm start
   ```

6. Access the application at http://localhost:3000

7. If you want to RUN by using just one command, and adjust by doing some Manual changes in app.py and app.js
    ```bash
    cd brain-tumor-classifier
    npm run build
    cd ..
    uvicorn app:app --host 0.0.0.0 --port 3000

## Usage

1. Upload a T1-weighted MRI scan through the interface
2. Review the preprocessing steps applied to the image
3. Examine the detection results with confidence metrics
4. Generate and download a clinical report if desired

## Model Performance

| Metric | Value |
|--------|-------|
| Accuracy | 97.3% |
| Sensitivity | 96.8% |
| Specificity | 98.1% |
| F1 Score | 0.965 |

Evaluated on a dataset of 3,000 MRI scans across multiple institutions.

## Contributing

We welcome contributions to enhance the system's capabilities:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset) for training data
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [PyTorch](https://pytorch.org/) for the machine learning framework
