import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const PrintService = () => {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileName, setFileName] = useState('-')
  const [fileSize, setFileSize] = useState('0 KB')
  const [copies, setCopies] = useState('1')
  const [color, setColor] = useState('Black & White')
  const [paperSize, setPaperSize] = useState('A4')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadProgress, setShowUploadProgress] = useState(false)
  const [orderProgress, setOrderProgress] = useState(0)
  const [showOrderProgress, setShowOrderProgress] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0]
      setUploadedFile(file)
      
      // Show upload progress
      setShowUploadProgress(true)
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        
        if (progress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setShowUploadProgress(false)
            setUploadProgress(0)
          }, 500)
        }
      }, 100)
      
      // Update file info
      setFileName(file.name)
      setFileSize((file.size / 1024).toFixed(0) + ' KB')
    }
  }

  const handlePaperSizeChange = (size) => {
    setPaperSize(size)
  }

  const handleProceedToCheckout = () => {
    if (!uploadedFile) {
      alert('Please upload a document first!')
      return
    }
    setShowModal(true)
  }

  const handleCancelCheckout = () => {
    setShowModal(false)
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    if (!userName.trim() || !userEmail.trim()) {
      alert('Please fill in all fields')
      return
    }

    if (!uploadedFile) {
      alert('Please upload a document first!')
      return
    }

    // Show progress bar
    setShowOrderProgress(true)
    
    // Simulate order processing
    const progressStages = [
      { percent: 20, text: 'Preparing order...' },
      { percent: 40, text: 'Processing details...' },
      { percent: 60, text: 'Creating order...' },
      { percent: 80, text: 'Finalizing...' },
      { percent: 100, text: 'Complete!' }
    ]
    
    try {
      // Simulate progress
      for (let i = 0; i < progressStages.length; i++) {
        const { percent } = progressStages[i]
        setOrderProgress(percent)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      // Simulate success
      alert('Your order has been submitted successfully! We will contact you shortly.')
      setShowModal(false)
      
      // Reset form
      setUserName('')
      setUserEmail('')
      setFileName('-')
      setFileSize('0 KB')
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error:', error)
      alert('There was an error submitting your order. Please try again.')
    } finally {
      // Reset progress
      setTimeout(() => {
        setShowOrderProgress(false)
        setOrderProgress(0)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500 w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <h1 className="text-2xl font-bold">50<span className="text-blue-500">psxerox</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-blue-500 font-medium hover:underline">Back to Main Site</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Professional Xerox Printing</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              High-quality Xerox printing services with fast turnaround. Affordable rates and reliable delivery.
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload Area */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Upload Your Documents</h2>
                <div className="mb-6">
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center p-4 hover:border-blue-500 transition-colors">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-500 mb-1">Drag & drop files here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                    <p className="text-xs text-gray-400 mt-2">Supports PDF, DOC, JPG, PNG</p>
                  </div>
                </div>

                {/* Upload Progress Bar */}
                {showUploadProgress && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Uploading...</span>
                      <span className="text-sm font-medium text-blue-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Print Options</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Copies</label>
                      <select 
                        value={copies}
                        onChange={(e) => setCopies(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                      >
                        <option>1</option>
                        <option>2</option>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Color</label>
                      <select 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                      >
                        <option>Black & White</option>
                        <option>Color</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Paper Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['A4', 'A3', 'Letter'].map((size) => (
                      <button
                        key={size}
                        className={`p-3 border-2 rounded-lg text-center transition ${
                          paperSize === size
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                        onClick={() => handlePaperSizeChange(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal for collecting user information */}
                {showModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                      <h3 className="text-xl font-semibold mb-4">Complete Your Order</h3>
                      <form onSubmit={handleSubmitOrder} className="space-y-4">
                        <div>
                          <label className="block text-gray-700 mb-1">Name</label>
                          <input 
                            type="text" 
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required 
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">Email</label>
                          <input 
                            type="email" 
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            required 
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        {/* Order Progress Bar */}
                        {showOrderProgress && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {orderProgress < 100 ? 'Processing...' : 'Complete!'}
                              </span>
                              <span className="text-sm font-medium text-green-500">{orderProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-500 h-2.5 rounded-full transition-all duration-300" 
                                style={{ width: `${orderProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-3 pt-2">
                          <button 
                            type="submit" 
                            disabled={showOrderProgress}
                            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
                          >
                            {showOrderProgress ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              'Confirm Order'
                            )}
                          </button>
                          <button 
                            type="button" 
                            onClick={handleCancelCheckout}
                            disabled={showOrderProgress}
                            className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-400 transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Proceed to Checkout
                </button>
              </div>

              {/* Preview Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Print Preview</h2>
                <div className="bg-gray-100 rounded-xl p-6 h-full">
                  <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="font-medium">Document Preview</h3>
                    </div>
                    <div className="border border-gray-200 rounded min-h-60 flex items-center justify-center text-gray-500 p-4">
                      {!uploadedFile ? (
                        <p>No document selected</p>
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-3">
                            {uploadedFile.type.includes('pdf') ? '📄' : 
                             uploadedFile.type.includes('image') ? '🖼️' : '📝'}
                          </div>
                          <p className="text-sm text-gray-500">Document ready to print</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      <p><span className="font-medium">File:</span> <span>{fileName}</span></p>
                      <p><span className="font-medium">Size:</span> <span>{fileSize}</span></p>
                      <p><span className="font-medium">Copies:</span> <span>{copies}</span></p>
                      <p><span className="font-medium">Color:</span> <span>{color}</span></p>
                      <p><span className="font-medium">Paper Size:</span> <span>{paperSize}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrintService