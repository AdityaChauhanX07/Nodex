import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { GestureProvider } from './context/GestureContext.jsx'
import { CalibrationProvider } from './context/CalibrationContext.jsx'
import Landing from './pages/Landing.jsx'
import Calibration from './pages/Calibration.jsx'
import Tutorial from './pages/Tutorial.jsx'
import Player from './pages/Player.jsx'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/calibrate" element={<Calibration />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/play" element={<Player />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CalibrationProvider>
        <GestureProvider>
          <AnimatedRoutes />
        </GestureProvider>
      </CalibrationProvider>
    </BrowserRouter>
  )
}
