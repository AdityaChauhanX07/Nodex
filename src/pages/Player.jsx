import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFaceDetection } from '../hooks/useFaceDetection.js'
import {
  computeYaw,
  computePitch,
  computeRoll,
  computeEAR,
  computeMouthRatio,
} from '../utils/gestureLogic.js'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'
import Camera from '../components/Camera.jsx'
import GestureHUD from '../components/GestureHUD.jsx'
import ModeSelector from '../components/ModeSelector.jsx'
import YouTubePlayer from '../components/YouTubePlayer.jsx'
import SpotifyPlayer from '../components/SpotifyPlayer.jsx'
import SlideViewer from '../components/SlideViewer.jsx'
import CommandToast from '../components/CommandToast.jsx'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
}

const T = DEFAULT_THRESHOLDS

function metricColor(value, warnAt, triggerAt, invert = false) {
  const abs = Math.abs(value)
  if (invert) {
    if (value <= triggerAt) return '#EF4444'
    if (value <= warnAt)    return '#F59E0B'
    return '#22C55E'
  }
  if (abs >= triggerAt) return '#EF4444'
  if (abs >= warnAt)    return '#F59E0B'
  return '#22C55E'
}

export default function Player() {
  const videoRef = useRef(null)
  const { landmarks, isLoading, isTracking, error } = useFaceDetection({ videoRef })
  const [mode, setMode] = useState('youtube')

  const yaw   = landmarks ? computeYaw(landmarks)        : 0
  const pitch = landmarks ? computePitch(landmarks)      : 0
  const roll  = landmarks ? computeRoll(landmarks)       : 0
  const ear   = landmarks ? computeEAR(landmarks)        : 0
  const mouth = landmarks ? computeMouthRatio(landmarks) : 0

  const frameCountRef = useRef(0)
  const [fps, setFps] = useState(0)

  useEffect(() => {
    if (landmarks) frameCountRef.current++
  }, [landmarks])

  useEffect(() => {
    const id = setInterval(() => {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      className="page-wrapper min-h-screen flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#12121A' }}
      >
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#A78BFA' }}
        >
          Nodex
        </h1>
        <div className="flex items-center gap-3">
          <span
            className="text-xs px-2.5 py-1 rounded-lg font-mono"
            style={{
              background: '#1A1A2E',
              color: fps > 20 ? '#22C55E' : fps > 10 ? '#F59E0B' : '#94A3B8',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {fps}&nbsp;fps
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{
              background: isTracking ? 'rgba(6,182,212,0.15)' : '#1A1A2E',
              color:      isTracking ? '#06B6D4' : '#4B5563',
              border:     isTracking ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {isTracking ? '● Tracking' : '○ No face'}
          </span>
        </div>
      </header>

      <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <ModeSelector mode={mode} onChange={setMode} />
      </div>

      <div className="flex-1 relative p-6 pb-32">
        {mode === 'youtube' && <YouTubePlayer />}
        {mode === 'spotify' && <SpotifyPlayer />}
        {mode === 'slides'  && <SlideViewer />}
      </div>

      <div
        style={{
          position:       'fixed',
          bottom:         24,
          left:           24,
          width:          210,
          borderRadius:   10,
          background:     'rgba(26,26,46,0.92)',
          border:         '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          padding:        '10px 14px',
          zIndex:         50,
        }}
      >
        <p
          className="text-xs font-semibold mb-2"
          style={{ color: '#64748B', letterSpacing: '0.08em', fontFamily: 'Outfit, sans-serif' }}
        >
          FACE METRICS
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'monospace' }}>
          <MetricRow label="Yaw"   value={yaw.toFixed(1) + '\u00b0'}   color={metricColor(yaw,   T.yaw   * 0.7, T.yaw)} />
          <MetricRow label="Pitch" value={pitch.toFixed(1) + '\u00b0'} color={metricColor(pitch, T.pitch * 0.7, T.pitch)} />
          <MetricRow label="Roll"  value={roll.toFixed(1) + '\u00b0'}  color={metricColor(roll,  T.roll  * 0.7, T.roll)} />
          <MetricRow label="EAR"   value={ear.toFixed(3)}   color={metricColor(ear,   0.2, T.earClose, true)} />
          <MetricRow label="Mouth" value={mouth.toFixed(3)} color={metricColor(mouth, T.mouthOpen * 0.7, T.mouthOpen)} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4, paddingTop: 6 }}>
            <MetricRow label="Track" value={isTracking ? 'YES' : 'NO'} color={isTracking ? '#22C55E' : '#4B5563'} />
          </div>
        </div>
      </div>

      <Camera videoRef={videoRef} isLoading={isLoading} isTracking={isTracking} error={error}>
        <GestureHUD landmarks={landmarks} />
      </Camera>

      <CommandToast />
    </motion.div>
  )
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#64748B', fontSize: 11 }}>{label}</span>
      <span style={{ color, fontSize: 11, fontWeight: 600 }}>{value}</span>
    </div>
  )
}
