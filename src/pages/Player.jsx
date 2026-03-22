import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useFaceDetection } from '../hooks/useFaceDetection.js'
import { useGestures }      from '../hooks/useGestures.js'
import { useGesture }       from '../context/GestureContext.jsx'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'
import { COMMANDS }  from '../constants/commands.js'
import { GESTURES }  from '../constants/gestures.js'
import Camera        from '../components/Camera.jsx'
import GestureHUD    from '../components/GestureHUD.jsx'
import ModeSelector  from '../components/ModeSelector.jsx'
import YouTubePlayer from '../components/YouTubePlayer.jsx'
import SpotifyPlayer from '../components/SpotifyPlayer.jsx'
import SlideViewer   from '../components/SlideViewer.jsx'
import CommandToast  from '../components/CommandToast.jsx'

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

const GESTURE_LABELS = {
  [GESTURES.HEAD_LEFT]:   'Head Left',
  [GESTURES.HEAD_RIGHT]:  'Head Right',
  [GESTURES.HEAD_UP]:     'Head Up',
  [GESTURES.HEAD_DOWN]:   'Head Down',
  [GESTURES.EYES_CLOSED]: 'Eyes Closed',
  [GESTURES.MOUTH_OPEN]:  'Mouth Open',
  [GESTURES.TILT_LEFT]:   'Tilt Left',
  [GESTURES.TILT_RIGHT]:  'Tilt Right',
  [GESTURES.NONE]:        'None',
}

export default function Player() {
  const videoRef = useRef(null)
  const { landmarks, isLoading, isTracking, error } = useFaceDetection({ videoRef })

  const { gestureMap } = useGesture()

  const {
    currentGesture,
    currentCommand,
    confidence,
    metrics,
    lastCommand,
    lastCommandTime,
  } = useGestures({ landmarks, gestureMap })

  const [mode, setMode] = useState('youtube')

  // FPS counter
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

  // Command log (last 10, newest first)
  const [commandLog, setCommandLog] = useState([])
  useEffect(() => {
    if (!lastCommandTime || lastCommand === COMMANDS.NONE) return
    const entry = { command: lastCommand, time: lastCommandTime }
    setCommandLog(prev => [entry, ...prev].slice(0, 10))
  }, [lastCommandTime])

  // Gesture flash (green highlight for 800ms on command fire)
  const [gestureFlash, setGestureFlash] = useState(false)
  useEffect(() => {
    if (!lastCommandTime) return
    setGestureFlash(true)
    const id = setTimeout(() => setGestureFlash(false), 800)
    return () => clearTimeout(id)
  }, [lastCommandTime])

  const { yaw = 0, pitch = 0, roll = 0, ear = 0, mouth = 0 } = metrics ?? {}

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
          {/* FPS chip */}
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

          {/* Active gesture indicator */}
          <span
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{
              background: gestureFlash
                ? 'rgba(34,197,94,0.2)'
                : currentGesture !== GESTURES.NONE
                ? 'rgba(167,139,250,0.15)'
                : '#1A1A2E',
              color: gestureFlash
                ? '#22C55E'
                : currentGesture !== GESTURES.NONE
                ? '#A78BFA'
                : '#4B5563',
              border: gestureFlash
                ? '1px solid rgba(34,197,94,0.4)'
                : currentGesture !== GESTURES.NONE
                ? '1px solid rgba(167,139,250,0.3)'
                : '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.15s ease',
              minWidth: 80,
              textAlign: 'center',
            }}
          >
            {currentGesture !== GESTURES.NONE
              ? (GESTURE_LABELS[currentGesture] ?? currentGesture)
              : 'No gesture'}
          </span>

          {/* Tracking chip */}
          <span
            className="text-xs px-2.5 py-1 rounded-lg"
            style={{
              background: isTracking ? 'rgba(6,182,212,0.15)' : '#1A1A2E',
              color:      isTracking ? '#06B6D4' : '#4B5563',
              border:     isTracking
                ? '1px solid rgba(6,182,212,0.3)'
                : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {isTracking ? '\u25cf Tracking' : '\u25cb No face'}
          </span>
        </div>
      </header>

      <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <ModeSelector mode={mode} onChange={setMode} />
      </div>

      <div className="flex-1 relative p-6 pb-32">
        {mode === 'youtube' && (
          <YouTubePlayer command={currentCommand} commandTime={lastCommandTime} />
        )}
        {mode === 'spotify' && <SpotifyPlayer />}
        {mode === 'slides'  && <SlideViewer />}
      </div>

      {/* Debug panel — bottom-left */}
      <div
        style={{
          position:       'fixed',
          bottom:         24,
          left:           24,
          width:          220,
          borderRadius:   10,
          background:     'rgba(26,26,46,0.92)',
          border:         '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          padding:        '10px 14px',
          zIndex:         50,
        }}
      >
        {/* Face Metrics */}
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
          <MetricRow label="EAR"   value={ear.toFixed(3)}   color={metricColor(ear,   0.22, T.earClose, true)} />
          <MetricRow label="Mouth" value={mouth.toFixed(3)} color={metricColor(mouth, T.mouthOpen * 0.7, T.mouthOpen)} />
          <MetricRow label="Conf"  value={(confidence * 100).toFixed(0) + '%'}
            color={confidence > 0.7 ? '#22C55E' : confidence > 0.4 ? '#F59E0B' : '#4B5563'} />
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4, paddingTop: 6 }}>
            <MetricRow label="Track" value={isTracking ? 'YES' : 'NO'} color={isTracking ? '#22C55E' : '#4B5563'} />
          </div>
        </div>

        {/* Command Log */}
        <p
          className="text-xs font-semibold mt-4 mb-2"
          style={{ color: '#64748B', letterSpacing: '0.08em', fontFamily: 'Outfit, sans-serif' }}
        >
          COMMAND LOG
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'monospace' }}>
          {commandLog.length === 0 ? (
            <span style={{ color: '#374151', fontSize: 11 }}>no commands yet</span>
          ) : (
            commandLog.map((entry, i) => (
              <div
                key={entry.time}
                style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                  opacity:        1 - i * 0.08,
                }}
              >
                <span style={{ color: i === 0 ? '#A78BFA' : '#94A3B8', fontSize: 11 }}>
                  {entry.command}
                </span>
                <span style={{ color: '#374151', fontSize: 10 }}>
                  {new Date(entry.time).toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <Camera videoRef={videoRef} isLoading={isLoading} isTracking={isTracking} error={error}>
        <GestureHUD landmarks={landmarks} />
      </Camera>

      <CommandToast command={currentCommand} commandTime={lastCommandTime} />
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
