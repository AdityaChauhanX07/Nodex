import { useState } from 'react'
import { motion } from 'framer-motion'
import ModeSelector from '../components/ModeSelector.jsx'
import YouTubePlayer from '../components/YouTubePlayer.jsx'
import SpotifyPlayer from '../components/SpotifyPlayer.jsx'
import SlideViewer from '../components/SlideViewer.jsx'
import GestureHUD from '../components/GestureHUD.jsx'
import CommandToast from '../components/CommandToast.jsx'
import ConfidencePanel from '../components/ConfidencePanel.jsx'
import LatencyCounter from '../components/LatencyCounter.jsx'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

export default function Player() {
  const [mode, setMode] = useState('youtube') // youtube | spotify | slides
  const [showConfidence, setShowConfidence] = useState(false)

  return (
    <motion.div
      className="page-wrapper min-h-screen flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#12121A' }}
      >
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#A78BFA' }}>
          Nodex
        </h1>
        <div className="flex items-center gap-4">
          <LatencyCounter />
          <button
            onClick={() => setShowConfidence(s => !s)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: showConfidence ? 'rgba(124,58,237,0.3)' : '#1A1A2E',
              color: '#94A3B8',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {showConfidence ? 'Hide' : 'Show'} Confidence
          </button>
        </div>
      </header>

      {/* Mode Selector */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <ModeSelector mode={mode} onChange={setMode} />
      </div>

      {/* Main content */}
      <div className="flex-1 relative p-6">
        {mode === 'youtube' && <YouTubePlayer />}
        {mode === 'spotify' && <SpotifyPlayer />}
        {mode === 'slides' && <SlideViewer />}
      </div>

      {/* Overlays */}
      <GestureHUD />
      <CommandToast />
      {showConfidence && <ConfidencePanel />}
    </motion.div>
  )
}
