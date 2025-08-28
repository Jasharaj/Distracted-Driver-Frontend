import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { apiService } from './services/api'
import './App.css'

// Driver behavior classes
const CLASSES = [
  'c0: Safe driving',
  'c1: Texting - right hand',
  'c2: Talking on phone - right',
  'c3: Texting - left hand', 
  'c4: Talking on phone - left',
  'c5: Operating the radio',
  'c6: Drinking',
  'c7: Reaching behind',
  'c8: Hair and makeup',
  'c9: Talking to passenger'
]

interface PredictionResult {
  class: string
  class_name: string
  confidence: number
}

// Disclaimer component
const ModelDisclaimer = () => (
  <div className="disclaimer-banner" style={{
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
    fontSize: '14px',
    color: '#856404'
  }}>
    <strong>⚠️ Demo Model Limitations</strong>
    <p style={{ margin: '8px 0 0 0' }}>
      This is a demonstration model trained on limited sample data. 
      For production use, the model would need training on the full 
      State Farm dataset (22,424 images) for accurate predictions.
      Current predictions are for demonstration purposes only.
    </p>
  </div>
);

function App() {
  const [apiConnected, setApiConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [mainPrediction, setMainPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check API connection on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const isConnected = await apiService.checkConnection()
        setApiConnected(isConnected)
        
        if (isConnected) {
          const healthResponse = await apiService.healthCheck()
          if (healthResponse.error) {
            setError(`API Error: ${healthResponse.error}`)
            setApiConnected(false)
          }
        } else {
          setError('Cannot connect to API. Please ensure the backend is running.')
        }
        
      } catch (err) {
        setError('Failed to connect to API')
        setApiConnected(false)
      } finally {
        setLoading(false)
      }
    }

    checkApi()
  }, [])

  // Predict image using API
  const predictImage = useCallback(async (file: File) => {
    if (!apiConnected) {
      setError('API not connected')
      return
    }

    try {
      setPredicting(true)
      setError(null)
      
      const response = await apiService.predictImage(file)
      
      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        setMainPrediction(response.data.prediction)
        setPredictions(response.data.top_predictions)
      }
      
    } catch (err) {
      setError('Prediction failed')
    } finally {
      setPredicting(false)
    }
  }, [apiConnected])

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Make prediction
      predictImage(file)
    }
  }, [predictImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const getSafetyInfo = (prediction: PredictionResult) => {
    const confidence = prediction.confidence
    const isDistracted = !prediction.class_name.toLowerCase().includes('safe')
    
    if (isDistracted && confidence > 0.7) {
      return {
        level: 'HIGH RISK',
        message: 'Driver appears to be distracted. Immediate attention required.',
        color: '#ef4444'
      }
    } else if (isDistracted && confidence > 0.4) {
      return {
        level: 'MODERATE RISK',
        message: 'Possible distracted driving detected.',
        color: '#f59e0b'
      }
    } else {
      return {
        level: 'LOW RISK',
        message: 'Driver appears to be focused on driving.',
        color: '#10b981'
      }
    }
  }

  const resetPrediction = () => {
    setUploadedImage(null)
    setPredictions([])
    setMainPrediction(null)
    setError(null)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Connecting to API...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚗 Distracted Driver Detection</h1>
        <p>Upload an image to detect driver behavior and safety risks</p>
        <div className={`api-status ${apiConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator"></span>
          API {apiConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main className="app-main">
        <ModelDisclaimer />
        
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} className="close-btn">×</button>
          </div>
        )}

        {!uploadedImage ? (
          <div className="upload-section">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${!apiConnected ? 'disabled' : ''}`}>
              <input {...getInputProps()} disabled={!apiConnected} />
              <div className="dropzone-content">
                <div className="upload-icon">📷</div>
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <>
                    <p><strong>Click to upload</strong> or drag and drop</p>
                    <p className="upload-hint">Support: JPG, PNG, BMP (max 10MB)</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="class-info">
              <h3>Detection Classes</h3>
              <div className="classes-grid">
                {CLASSES.map((cls, index) => (
                  <div key={index} className="class-item">
                    {cls}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="image-container">
              <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
              <button onClick={resetPrediction} className="reset-btn">
                Upload New Image
              </button>
            </div>

            {predicting ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Analyzing driver behavior...</p>
              </div>
            ) : (
              predictions.length > 0 && mainPrediction && (
                <div className="prediction-results">
                  <div className="main-prediction">
                    <h2>Primary Detection</h2>
                    <div className="prediction-card">
                      <div className="prediction-header">
                        <span className="class-code">{mainPrediction.class}</span>
                        <span className="confidence-score">
                          {(mainPrediction.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <h3 className="class-name">{mainPrediction.class_name}</h3>
                    </div>

                    {(() => {
                      const safety = getSafetyInfo(mainPrediction)
                      return (
                        <div className="safety-badge" style={{ backgroundColor: safety.color }}>
                          <strong>{safety.level}</strong>
                          <p>{safety.message}</p>
                        </div>
                      )
                    })()}
                  </div>

                  <h3>All Detection Results</h3>
                  <div className="predictions-list">
                    {predictions.map((pred, index) => (
                      <div key={index} className={`prediction-item ${index === 0 ? 'top-prediction' : ''}`}>
                        <div className="prediction-label">
                          <span className="class-code">{pred.class}</span>
                          <span className="class-name">{pred.class_name}</span>
                          <span className="confidence">{(pred.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill"
                            style={{ 
                              width: `${pred.confidence * 100}%`,
                              backgroundColor: index === 0 ? '#3b82f6' : '#94a3b8'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by ResNet-50 Deep Learning Model</p>
        <p>⚠️ For demonstration purposes only</p>
      </footer>
    </div>
  )
}

export default App
