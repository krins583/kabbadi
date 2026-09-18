import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom' // HashRouter hata diya
import './index.css'

import App from './App.jsx'
import TvScreen from './TvScreen.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tv" element={<TvScreen />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)