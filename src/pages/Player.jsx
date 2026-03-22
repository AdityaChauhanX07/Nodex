import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFaceDetection }   from '../hooks/useFaceDetection.js'
import { useGestures }        from '../hooks/useGestures.js'
import { useGesture }         from '../context/GestureContext.jsx'
import { useCalibration }     from '../context/CalibrationContext.jsx'
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
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
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
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const { landmarks, isLoading, isTracking, error } = useFaceDetection({ videoRef })

  const { gestureMap }                    = useGesture()
  const { calibrationData, isCalibrated } = useCalibration()

  const {
    currentGesture,
    currentCommand,
    confidence,
    metrics,
    lastCommand,
    lastCommandTime,
  } = useGestures({ landmarks, gestureMap, calibration: calibrationData })

  const [mode, setMode] = useState('youtube')

  // ── FPS counter ─────────────────────────────────────────────────────────────
  const frameCountRef = useRef(0)
  const [fps, setFps] = useState(0)
  useEffect(() => { if (landmarks) frameCountRef.current++ }, [landmarks])
  useEffect(() => {
    const id = setInterval(() => {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // ── Command log ──────────────────────────────────────────────────────────────
  const [commandLog, setCommandLog] = useState([])
  useEffect(() => {
    if (!lastCommandTime || lastCommand === COMMANDS.NONE) return
    setCommandLog(prev => [{ command: lastCommand, time: lastCommandTime }, ...prev].slice(0, 10))
  }, [lastCommandTime])

  // ── Gesture flash (green highlight for 800ms) ────────────────────────────────
  const [gestureFlash, setGestureFlash] = useState(false)
  useEffect(() => {
    if (!lastCommandTime) return
    setGestureFlash(true)
    const id = setTimeout(() => setGestureFlash(false), 800)
    return () => clearTimeout(id)
  }, [lastCommandTime])

  // ── Debug panel open/close ───────────────────────────────────────────────────
  const [debugOpen, setDebugOpen] = useState(true)

  const { yaw = 0, pitch = 0, roll = 0, ear = 0, mouth = 0 } = metrics ?? {}

  return (
    <motion.div
      className="page-wrapper min-h-screen flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ── STICKY HEADER ────────────────────────────────────────────────── */}
      <header
        style={{
          position:           'sticky',
          top:                0,
          zIndex:             60,
          display:            'flex',
          alignItems:         'center',
          justifyContent:     'space-between',
          padding:            '0 24px',
          height:             56,
          borderBottom:       '1px solid rgba(255,255,255,0.06)',
          background:         'rgba(10,10,15,0.82)',
          backdropFilter:     'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
            Nodex
          </span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-purple)', marginBottom: 6, flexShrink: 0 }} />
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* FPS */}
          <Chip mono color={fps > 20 ? '#22C55E' : fps > 10 ? '#F59E0B' : '#4B5563'}>
            {fps} fps
          </Chip>

          {/* Gesture indicator */}
          <Chip
            color={gestureFlash ? '#22C55E' : currentGesture !== GESTURES.NONE ? '#A78BFA' : '#374151'}
            bg={gestureFlash ? 'rgba(34,197,94,0.12)' : currentGesture !== GESTURES.NONE ? 'rgba(167,139,250,0.1)' : 'transparent'}
            border={gestureFlash ? 'rgba(34,197,94,0.35)' : currentGesture !== GESTURES.NONE ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.06)'}
            style={{ minWidth: 90, textAlign: 'center', transition: 'all 0.15s ease' }}
          >
            {currentGesture !== GESTURES.NONE ? (GESTURE_LABELS[currentGesture] ?? currentGesture) : 'No gesture'}
          </Chip>

          {/* Tracking */}
          <Chip
            color={isTracking ? '#06B6D4' : '#374151'}
            bg={isTracking ? 'rgba(6,182,212,0.1)' : 'transparent'}
            border={isTracking ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.06)'}
          >
            {isTracking ? '\u25cf Tracking' : '\u25cb No face'}
          </Chip>
        </div>
      </header>

      {/* ── MODE SELECTOR ────────────────────────────────────────────────── */}
      <div
        style={{
          padding:      '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background:   'rgba(10,10,15,0.6)',
        }}
      >
        <ModeSelector mode={mode} onChange={setMode} />
      </div>

      {/* ── CALIBRATION BANNER (shown when not calibrated) ───────────────── */}
      {!isCalibrated && (
        <div style={{
          padding:      '8px 24px',
          background:   'rgba(124,58,237,0.07)',
          borderBottom: '1px solid rgba(124,58,237,0.12)',
          display:      'flex',
          alignItems:   'center',
          gap:          6,
        }}>
          <span style={{ fontSize: 12, color: '#7C3AED' }}>&#9670;</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#A78BFA' }}>
            Tip: gestures work better when calibrated to your face.
          </span>
          <button
            onClick={() => navigate('/calibrate')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#A78BFA', fontSize: 12, fontFamily: 'DM Sans, sans-serif',
              textDecoration: 'underline', padding: 0, marginLeft: 2,
            }}
          >
            Calibrate now
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '24px 24px 160px' }}>
        {mode === 'youtube' && (
          <div style={{ position: 'relative' }}>
            {/* Command glow ring — briefly illuminates on gesture fire */}
            <AnimatePresence>
              {gestureFlash && (
                <motion.div
                  key={lastCommandTime}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position:     'absolute',
                    inset:        -3,
                    borderRadius: 16,
                    pointerEvents:'none',
                    zIndex:       1,
                    boxShadow:    '0 0 0 1px rgba(124,58,237,0.5), 0 0 40px rgba(124,58,237,0.2)',
                  }}
                />
              )}
            </AnimatePresence>
            <div style={{
              position:     'relative',
              borderRadius: 14,
              overflow:     'hidden',
              border:       '1px solid rgba(255,255,255,0.07)',
            }}>
              <YouTubePlayer command={currentCommand} commandTime={lastCommandTime} />
            </div>
          </div>
        )}
        {mode === 'spotify' && <SpotifyPlayer />}
        {mode === 'slides'  && <SlideViewer />}
      </div>

      {/* ── DEBUG PANEL — bottom-left ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {debugOpen ? (
          <motion.div
            key="debug-open"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position:       'fixed',
              bottom:         24,
              left:           24,
              width:          216,
              borderRadius:   12,
              background:     'rgba(12,12,20,0.94)',
              border:         '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              padding:        '10px 14px 12px',
              zIndex:         50,
              boxShadow:      '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase' }}>
                Debug
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => navigate('/calibrate')}
                  title="Recalibrate"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: isCalibrated ? '#374151' : '#7C3AED',
                    fontSize: 11, fontFamily: 'DM Sans, sans-serif',
                    padding: 0, lineHeight: 1,
                  }}
                >
                  {isCalibrated ? 'recal' : '\u25cf recal'}
                </button>
                <button
                  onClick={() => setDebugOpen(false)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#374151', fontSize: 14, lineHeight: 1, padding: '0 2px',
                    display: 'flex', alignItems: 'center',
                  }}
                  title="Collapse"
                >
                  &#x2212;
                </button>
              </div>
            </div>

            {/* Face Metrics */}
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#4B5563', textTransform: 'uppercase', marginBottom: 6 }}>
              Face Metrics
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace' }}>
              <MetricRow label="Yaw"   value={yaw.toFixed(1) + '\u00b0'}   color={metricColor(yaw,   T.yaw   * 0.7, T.yaw)} />
              <MetricRow label="Pitch" value={pitch.toFixed(1) + '\u00b0'} color={metricColor(pitch, T.pitch * 0.7, T.pitch)} />
              <MetricRow label="Roll"  value={roll.toFixed(1) + '\u00b0'}  color={metricColor(roll,  T.roll  * 0.7, T.roll)} />
              <MetricRow label="EAR"   value={ear.toFixed(3)}   color={metricColor(ear,   0.22, T.earClose, true)} />
              <MetricRow label="Mouth" value={mouth.toFixed(3)} color={metricColor(mouth, T.mouthOpen * 0.7, T.mouthOpen)} />
              <MetricRow label="Conf"  value={(confidence * 100).toFixed(0) + '%'}
                color={confidence > 0.7 ? '#22C55E' : confidence > 0.4 ? '#F59E0B' : '#374151'} />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 3, paddingTop: 5 }}>
                <MetricRow label="Track" value={isTracking ? 'YES' : 'NO'} color={isTracking ? '#22C55E' : '#374151'} />
              </div>
            </div>

            {/* Command Log */}
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#4B5563', textTransform: 'uppercase', marginTop: 12, marginBottom: 6 }}>
              Command Log
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {commandLog.length === 0 ? (
                <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#1F2937', fontSize: 11 }}>
                  No commands yet
                </span>
              ) : commandLog.map((entry, i) => (
                <div
                  key={entry.time}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    opacity: Math.max(0.25, 1 - i * 0.09),
                  }}
                >
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, fontWeight: 600, color: i === 0 ? '#A78BFA' : '#64748B' }}>
                    {entry.command}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: '#1F2937', fontSize: 10 }}>
                    {new Date(entry.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="debug-collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1  }}
            exit={{    opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => setDebugOpen(true)}
            title="Open debug panel"
            style={{
              position:       'fixed',
              bottom:         24,
              left:           24,
              width:          38,
              height:         38,
              borderRadius:   10,
              background:     'rgba(12,12,20,0.9)',
              border:         '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              cursor:         'pointer',
              fontSize:       17,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              zIndex:         50,
              boxShadow:      '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            &#x1F4CA;
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── CAMERA PiP ───────────────────────────────────────────────────── */}
      <Camera videoRef={videoRef} isLoading={isLoading} isTracking={isTracking} error={error}>
        <GestureHUD landmarks={landmarks} />
      </Camera>

      {/* ── COMMAND TOAST ────────────────────────────────────────────────── */}
      <CommandToast command={currentCommand} commandTime={lastCommandTime} />
    </motion.div>
  )
}

// ─── sub-components ───────────────────────────────────────────────────────────
function Chip({ children, color, bg, border, mono, style: extraStyle }) {
  return (
    <span style={{
      display:    'inline-flex',
      alignItems: 'center',
      padding:    '4px 10px',
      borderRadius: 8,
      fontSize:   11,
      fontWeight: 600,
      fontFamily: mono ? 'monospace' : 'DM Sans, sans-serif',
      color:      color ?? '#94A3B8',
      background: bg ?? 'rgba(255,255,255,0.04)',
      border:     `1px solid ${border ?? 'rgba(255,255,255,0.06)'}`,
      whiteSpace: 'nowrap',
      ...extraStyle,
    }}>
      {children}
    </span>
  )
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#4B5563', fontSize: 11 }}>{label}</span>
      <span style={{ color, fontSize: 11, fontWeight: 700 }}>{value}</span>
    </div>
  )
}
