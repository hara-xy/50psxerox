import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import PrintService from './components/PrintService'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/print" element={<PrintService />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App