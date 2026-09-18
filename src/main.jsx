import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Aapke dono components import ho rahe hain
import App from './App.jsx'
import TvScreen from './TvScreen.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Mobile/Admin Controller */}
        <Route path="/" element={<App />} />
        
        {/* Public TV Screen */}
        <Route path="/tv" element={<TvScreen />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)