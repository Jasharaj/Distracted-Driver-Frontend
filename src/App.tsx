import React, { useState, useEffect, useCallback } from 'react'
import * as tf from '@tensorflow/tfjs'
import { useDropzone } from 'react-dropzone'
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
  confidence: number
  classIndex: number
}

function App() {
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // For now, create a simple demo model
        // In production, you would load your trained model
        console.log('Creating demo model...')
        
        // Create a simple CNN model for demonstration
        const demoModel = tf.sequential({
          layers: [
            tf.layers.conv2d({
              inputShape: [64, 64, 3],
              filters: 32,
              kernelSize: 3,
              activation: 'relu'
            }),
            tf.layers.maxPooling2d({ poolSize: 2 }),
            tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
            tf.layers.maxPooling2d({ poolSize: 2 }),
            tf.layers.flatten(),
            tf.layers.dense({ units: 128, activation: 'relu' }),
            tf.layers.dense({ units: 10, activation: 'softmax' })
          ]
        })
        
        setModel(demoModel)
        console.log('Demo model loaded successfully')
      } catch (err) {
        console.error('Error loading model:', err)
        setError('Failed to load the ML model. Using demo predictions.')
      } finally {
        setLoading(false)
      }
    }

    loadModel()
  }, [])

  // Handle image upload and prediction
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Display uploaded image
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    
    // Make prediction
    await makePrediction(file)
  }, [model])

  const makePrediction = async (file: File) => {
    if (!model && !error) {
      setError('Model not loaded yet')
      return
    }

    setPredicting(true)
    setError(null)

    try {
      // Create image element
      const img = new Image()
      img.src = URL.createObjectURL(file)
      
      await new Promise((resolve) => {
        img.onload = resolve
      })

      // Preprocess image
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([64, 64])
        .expandDims(0)
        .div(255.0)

      let predictionTensor: tf.Tensor

      if (model) {
        // Use actual model prediction
        predictionTensor = model.predict(tensor) as tf.Tensor
      } else {
        // Generate demo predictions with realistic confidence scores
        const demoScores = generateDemoPredictions()
        predictionTensor = tf.tensor2d([demoScores])
      }

      const predictions = await predictionTensor.data()
      
      // Process predictions
      const results: PredictionResult[] = Array.from(predictions)
        .map((confidence, index) => ({
          class: CLASSES[index],
          confidence: confidence * 100,
          classIndex: index
        }))
        .sort((a, b) => b.confidence - a.confidence)

      setPredictions(results)

      // Cleanup tensors
      tensor.dispose()
      predictionTensor.dispose()

    } catch (err) {
      console.error('Prediction error:', err)
      setError('Failed to make prediction. Please try again.')
    } finally {
      setPredicting(false)
    }
  }

  // Generate realistic demo predictions
  const generateDemoPredictions = (): number[] => {
    const scores = new Array(10).fill(0).map(() => Math.random() * 0.3)
    
    // Make one class have higher confidence
    const topClass = Math.floor(Math.random() * 10)
    scores[topClass] = 0.4 + Math.random() * 0.4
    
    // Normalize to sum to 1 (softmax-like)
    const sum = scores.reduce((a, b) => a + b, 0)
    return scores.map(score => score / sum)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  })

  const getSafetyLevel = (topPrediction: PredictionResult) => {
    if (topPrediction.classIndex === 0) {
      return { level: 'SAFE', color: '#22c55e', message: 'Driver appears to be driving safely' }
    } else if (topPrediction.confidence > 70) {
      return { level: 'HIGH RISK', color: '#ef4444', message: 'Potentially dangerous distracted driving detected' }
    } else {
      return { level: 'MODERATE RISK', color: '#f59e0b', message: 'Some distraction detected' }
    }
  }

  return (
    <div className="App">
      <header className="header">
        <h1>🚗 Distracted Driver Detection</h1>
        <p>AI-powered driver behavior analysis using computer vision</p>
      </header>

      <main className="main">
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading AI model...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="upload-section">
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <div className="dropzone-content">
                    <div className="upload-icon">📸</div>
                    <p>Drag & drop a driver image here, or click to select</p>
                    <small>Supports JPG, PNG, GIF formats</small>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="error">
                <p>⚠️ {error}</p>
              </div>
            )}

            {uploadedImage && (
              <div className="results-section">
                <div className="image-container">
                  <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                </div>

                {predicting && (
                  <div className="predicting">
                    <div className="spinner"></div>
                    <p>Analyzing driver behavior...</p>
                  </div>
                )}

                {predictions.length > 0 && !predicting && (
                  <div className="predictions">
                    <div className="safety-alert">
                      {(() => {
                        const safety = getSafetyLevel(predictions[0])
                        return (
                          <div className="safety-badge" style={{ backgroundColor: safety.color }}>
                            <strong>{safety.level}</strong>
                            <p>{safety.message}</p>
                          </div>
                        )
                      })()}
                    </div>

                    <h3>Detection Results</h3>
                    <div className="predictions-list">
                      {predictions.slice(0, 5).map((pred, index) => (
                        <div key={index} className={`prediction-item ${index === 0 ? 'top-prediction' : ''}`}>
                          <div className="prediction-label">
                            <span className="class-name">{pred.class}</span>
                            <span className="confidence">{pred.confidence.toFixed(1)}%</span>
                          </div>
                          <div className="confidence-bar">
                            <div 
                              className="confidence-fill"
                              style={{ 
                                width: `${pred.confidence}%`,
                                backgroundColor: index === 0 ? '#3b82f6' : '#94a3b8'
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>
          Powered by TensorFlow.js • 
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"> View Source</a>
        </p>
      </footer>
    </div>
  )
}

export default App
