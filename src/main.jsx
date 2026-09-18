import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// BrowserRouter ki jagah HashRouter import karein
import { HashRouter, Routes, Route } from 'react-router-dom' 
import './index.css'

import App from './App.jsx'
import TvScreen from './TvScreen.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Yahan HashRouter lagayein */}
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tv" element={<TvScreen />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)