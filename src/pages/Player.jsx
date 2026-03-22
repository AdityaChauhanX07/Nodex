import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFaceDetection }   from '../hooks/useFaceDetection.js'
import { useGestures }        from '../hooks/useGestures.js'
import { useGesture }         from '../context/GestureContext.jsx'
import { useCalibration }     from '../context/CalibrationContext.jsx'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'
import { COMMANDS }     from '../constants/commands.js'
import { GESTURES }     from '../constants/gestures.js'
import Camera           from '../components/Camera.jsx'
import GestureHUD       from '../components/GestureHUD.jsx'
import YouTubePlayer    from '../components/YouTubePlayer.jsx'
import CommandToast     from '../components/CommandToast.jsx'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.2  } },
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
  const { calibrationData, isCalibrated, reset } = useCalibration()

  const {
    currentGesture,
    currentCommand,
    confidence,
    metrics,
    lastCommand,
    lastCommandTime,
  } = useGestures({ landmarks, gestureMap, calibration: calibrationData })

  // ── FPS counter ─────────────────────────────────────────────────────────────
  const frameCountRef = useRef(0)
  const [fps, setFps]  = useState(0)
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

  // ── Gesture flash ────────────────────────────────────────────────────────────
  const [gestureFlash, setGestureFlash] = useState(false)
  useEffect(() => {
    if (!lastCommandTime) return
    setGestureFlash(true)
    const id = setTimeout(() => setGestureFlash(false), 800)
    return () => clearTimeout(id)
  }, [lastCommandTime])

  // ── Debug panel — collapsed by default ──────────────────────────────────────
  const [debugOpen, setDebugOpen] = useState(false)

  const { yaw = 0, pitch = 0, roll = 0, ear = 0, mouth = 0 } = metrics ?? {}

  return (
    <motion.div
      className="page-wrapper min-h-screen flex flex-col"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header style={{
        position:             'sticky',
        top:                  0,
        zIndex:               60,
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'space-between',
        padding:              '12px 24px',
        borderBottom:         '1px solid rgba(255,255,255,0.06)',
        background:           'rgba(10,10,15,0.8)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20,
            color: '#F8FAFC', letterSpacing: '-0.01em',
          }}>
            Nodex
          </span>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--accent-purple)', marginBottom: 6, flexShrink: 0,
          }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Chip mono color={fps > 20 ? '#22C55E' : fps > 10 ? '#F59E0B' : '#4B5563'}>
            {fps} fps
          </Chip>

          <Chip
            color={gestureFlash ? '#22C55E' : currentGesture !== GESTURES.NONE ? '#A78BFA' : '#374151'}
            bg={gestureFlash ? 'rgba(34,197,94,0.12)' : currentGesture !== GESTURES.NONE ? 'rgba(167,139,250,0.1)' : 'transparent'}
            border={gestureFlash ? 'rgba(34,197,94,0.35)' : currentGesture !== GESTURES.NONE ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.06)'}
          >
            {currentGesture !== GESTURES.NONE ? (GESTURE_LABELS[currentGesture] ?? currentGesture) : 'No gesture'}
          </Chip>

          <Chip
            color={isTracking ? '#06B6D4' : '#374151'}
            bg={isTracking ? 'rgba(6,182,212,0.1)' : 'transparent'}
            border={isTracking ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.06)'}
          >
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: isTracking ? '#06B6D4' : '#374151',
              marginRight: 6, flexShrink: 0,
              boxShadow: isTracking ? '0 0 5px #06B6D4' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }} />
            {isTracking ? 'Tracking' : 'No face'}
          </Chip>
        </div>
        <button
          onClick={() => { reset(); navigate('/calibrate') }}
          style={{
            padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#A78BFA',
            fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Recalibrate
        </button>
      </header>

      {/* ── CALIBRATION BANNER ───────────────────────────────────────────── */}
      {!isCalibrated && (
        <div style={{
          padding: '8px 24px', background: 'rgba(124,58,237,0.07)',
          borderBottom: '1px solid rgba(124,58,237,0.12)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            display: 'inline-block', width: 5, height: 5,
            borderRadius: '50%', background: '#7C3AED', flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#A78BFA' }}>
            Gestures work better when calibrated to your face.
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
      <div style={{ flex: 1, padding: '32px 24px 120px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          {/* Command glow ring on gesture fire */}
          <AnimatePresence>
            {gestureFlash && (
              <motion.div
                key={lastCommandTime}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', inset: -3, borderRadius: 15,
                  pointerEvents: 'none', zIndex: 1,
                  boxShadow: '0 0 0 1px rgba(124,58,237,0.45), 0 0 40px rgba(124,58,237,0.18)',
                }}
              />
            )}
          </AnimatePresence>
          <YouTubePlayer command={currentCommand} commandTime={lastCommandTime} />
        </div>
      </div>

      {/* ── DEBUG PANEL ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {debugOpen ? (
          <motion.div
            key="debug-open"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', bottom: 24, left: 24, width: 208,
              borderRadius: 12, background: 'rgba(12,12,20,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              padding: '10px 13px 12px', zIndex: 50,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <button
                onClick={() => navigate('/calibrate')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: isCalibrated ? '#374151' : '#7C3AED',
                  fontSize: 10, fontFamily: 'DM Sans, sans-serif', padding: 0, lineHeight: 1,
                }}
              >
                {isCalibrated ? 'recalibrate' : '\u25cf recalibrate'}
              </button>
              <button
                onClick={() => setDebugOpen(false)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#4B5563', fontSize: 16, lineHeight: 1,
                  padding: '0 2px', display: 'flex', alignItems: 'center',
                }}
              >
                ×
              </button>
            </div>

            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', marginBottom: 5 }}>
              Metrics
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <MetricRow label="Yaw"   value={yaw.toFixed(1)   + '\u00b0'} color={metricColor(yaw,   T.yaw   * 0.7, T.yaw)} />
              <MetricRow label="Pitch" value={pitch.toFixed(1) + '\u00b0'} color={metricColor(pitch, T.pitch * 0.7, T.pitch)} />
              <MetricRow label="Roll"  value={roll.toFixed(1)  + '\u00b0'} color={metricColor(roll,  T.roll  * 0.7, T.roll)} />
              <MetricRow label="EAR"   value={ear.toFixed(3)}              color={metricColor(ear,   0.22, T.earClose, true)} />
              <MetricRow label="Mouth" value={mouth.toFixed(3)}            color={metricColor(mouth, T.mouthOpen * 0.7, T.mouthOpen)} />
              <MetricRow label="Conf"  value={(confidence * 100).toFixed(0) + '%'}
                color={confidence > 0.7 ? '#22C55E' : confidence > 0.4 ? '#F59E0B' : '#374151'} />
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 2, paddingTop: 4 }}>
                <MetricRow label="Track" value={isTracking ? 'YES' : 'NO'} color={isTracking ? '#22C55E' : '#374151'} />
              </div>
            </div>

            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: '#374151', textTransform: 'uppercase', marginTop: 10, marginBottom: 5 }}>
              Log
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {commandLog.length === 0 ? (
                <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#1F2937', fontSize: 10 }}>
                  No commands yet
                </span>
              ) : commandLog.map((entry, i) => (
                <div
                  key={entry.time}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: Math.max(0.2, 1 - i * 0.09) }}
                >
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 600, color: i === 0 ? '#A78BFA' : '#4B5563' }}>
                    {entry.command}
                  </span>
                  <span style={{ fontFamily: 'monospace', color: '#1F2937', fontSize: 9 }}>
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
            title="Debug panel"
            style={{
              position: 'fixed', bottom: 24, left: 24,
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(12,12,20,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 50,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="16" height="2" rx="1" fill="#4B5563"/>
              <rect y="5" width="10" height="2" rx="1" fill="#4B5563"/>
              <rect y="10" width="13" height="2" rx="1" fill="#4B5563"/>
            </svg>
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function Chip({ children, color, bg, border, mono }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: 8,
      fontSize: 11, fontWeight: 600,
      fontFamily: mono ? 'monospace' : 'DM Sans, sans-serif',
      color:      color  ?? '#94A3B8',
      background: bg     ?? 'rgba(255,255,255,0.04)',
      border:     `1px solid ${border ?? 'rgba(255,255,255,0.06)'}`,
      whiteSpace: 'nowrap',
      transition: 'color 0.15s ease, background 0.15s ease, border-color 0.15s ease',
    }}>
      {children}
    </span>
  )
}

function MetricRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#374151', fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
      <span style={{ color, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}
