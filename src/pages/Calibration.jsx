import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFaceDetection } from '../hooks/useFaceDetection.js'
import { useCalibration }   from '../context/CalibrationContext.jsx'
import GestureHUD from '../components/GestureHUD.jsx'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
}

const CIRCUMFERENCE = 2 * Math.PI * 88 // r=88, viewBox 200x200

export default function Calibration() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const { landmarks, isLoading, isTracking } = useFaceDetection({ videoRef })

  const {
    phase,
    baselines,
    isCalibrated,
    captureProgress,
    captureCountdown,
    verifyStep,
    verifyResults,
    verifyProgress,
    VERIFY_TESTS,
    startCapture,
    addFrame,
    addVerifyFrame,
    markVerifyPassed,
    skipVerifyStep,
    reset,
  } = useCalibration()

  const [skipVisible, setSkipVisible] = useState(false)
  const skipTimerRef = useRef(null)

  // Feed frames during capture
  useEffect(() => {
    if (phase !== 'capturing' || !landmarks?.length) return
    addFrame(landmarks)
  }, [landmarks, phase, addFrame])

  // Feed frames during verification
  useEffect(() => {
    if (phase !== 'verifying' || !landmarks?.length) return
    const { detected } = addVerifyFrame(landmarks)
    if (detected) markVerifyPassed()
  }, [landmarks, phase, addVerifyFrame, markVerifyPassed])

  // Skip timer — resets each time verifyStep changes
  useEffect(() => {
    if (phase !== 'verifying') {
      setSkipVisible(false)
      clearTimeout(skipTimerRef.current)
      return
    }
    setSkipVisible(false)
    clearTimeout(skipTimerRef.current)
    skipTimerRef.current = setTimeout(() => setSkipVisible(true), 5000)
    return () => clearTimeout(skipTimerRef.current)
  }, [phase, verifyStep])

  return (
    <motion.div
      className="page-wrapper min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        padding:       '28px 24px 80px',
      }}
    >
      {/* ── Nav bar ──────────────────────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#4B5563', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          }}
        >
          \u2190 Back
        </button>
        <span style={{
          flex: 1, textAlign: 'center',
          fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 800,
          color: '#F8FAFC', letterSpacing: '-0.01em',
        }}>
          Calibration
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* ── Webcam feed (always rendered) ────────────────────────────────── */}
      <div
        style={{
          position:     'relative',
          width:        '100%',
          maxWidth:     500,
          aspectRatio:  '4/3',
          borderRadius: 18,
          overflow:     'hidden',
          border: isTracking
            ? '1.5px solid rgba(6,182,212,0.5)'
            : '1.5px solid rgba(255,255,255,0.08)',
          background:   '#0A0A0F',
          boxShadow: isTracking
            ? '0 0 32px rgba(6,182,212,0.12), 0 8px 40px rgba(0,0,0,0.6)'
            : '0 8px 40px rgba(0,0,0,0.6)',
          transition:   'border-color 0.4s, box-shadow 0.4s',
          marginBottom: 24,
          flexShrink:   0,
        }}
      >
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block',
            transform: 'scaleX(-1)',
          }}
        />

        {/* GestureHUD overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <GestureHUD landmarks={landmarks} />
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              style={{
                position: 'absolute', inset: 0, background: '#0A0A0F',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <motion.div
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: '2px solid rgba(124,58,237,0.2)',
                  borderTop: '2px solid #7C3AED',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />
              <span style={{ color: '#4B5563', fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em' }}>
                Loading model...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown ring (capturing) */}
        <AnimatePresence>
          {phase === 'capturing' && (
            <motion.div
              key="countdown-ring"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg
                viewBox="0 0 200 200"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <circle cx="100" cy="100" r="88"
                  fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="4" />
                <circle cx="100" cy="100" r="88"
                  fill="none" stroke="#7C3AED" strokeWidth="4"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - captureProgress)}
                  strokeLinecap="round"
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '100px 100px',
                    transition: 'stroke-dashoffset 0.12s linear',
                  }}
                />
              </svg>
              <AnimatePresence mode="wait">
                <motion.span
                  key={captureCountdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  exit={{    scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize:   80,
                    fontWeight: 800,
                    color:      '#A78BFA',
                    lineHeight: 1,
                    textShadow: '0 0 32px rgba(124,58,237,0.7)',
                    position:   'relative',
                    zIndex:     1,
                  }}
                >
                  {captureCountdown}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Green flash on step pass */}
        <AnimatePresence>
          {phase === 'verifying' && verifyResults.length > 0 && (
            <motion.div
              key={`flash-${verifyResults.length}`}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(34,197,94,0.22)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* No-face warning */}
        {!isLoading && !isTracking && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(10,10,15,0.9)', borderRadius: 8, padding: '5px 14px',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>
            <span style={{ color: '#F59E0B', fontSize: 11, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              No face detected \u2014 move closer
            </span>
          </div>
        )}
      </div>

      {/* ── Phase content ─────────────────────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 500 }}>
        <AnimatePresence mode="wait">

          {/* IDLE */}
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color: '#F8FAFC', marginBottom: 10 }}>
                Set Up Your Gestures
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#94A3B8', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 24px' }}>
                Look straight at the camera with a relaxed expression. We&apos;ll capture your neutral
                baseline in 3 seconds, then guide you through 4 quick gestures.
              </p>

              {isCalibrated && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 10, marginBottom: 20,
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                }}>
                  <span style={{ fontSize: 14 }}>&#x2713;</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#22C55E' }}>
                    Saved calibration found \u2014
                  </span>
                  <button
                    onClick={() => {
                      const tutorialDone = localStorage.getItem('nodex_tutorial_done') === 'true'
                      navigate(tutorialDone ? '/play' : '/tutorial')
                    }}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: '#22C55E', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                      textDecoration: 'underline', padding: 0,
                    }}
                  >
                    continue \u2192
                  </button>
                </div>
              )}

              <motion.button
                onClick={startCapture}
                disabled={isLoading || !isTracking}
                whileHover={isTracking && !isLoading ? { scale: 1.03, boxShadow: '0 0 32px rgba(124,58,237,0.5)' } : {}}
                whileTap={isTracking  && !isLoading ? { scale: 0.97 } : {}}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 48px', borderRadius: 9999, border: 'none',
                  background: isLoading || !isTracking ? '#1A1A2E' : 'var(--accent-purple)',
                  color:      isLoading || !isTracking ? '#374151' : '#F8FAFC',
                  fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700,
                  cursor:     isLoading || !isTracking ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  boxShadow:  isLoading || !isTracking ? 'none' : '0 0 24px rgba(124,58,237,0.3)',
                }}
              >
                {isLoading ? 'Loading camera...' : !isTracking ? 'Waiting for face...' : 'Start Calibration'}
              </motion.button>
            </motion.div>
          )}

          {/* CAPTURING */}
          {phase === 'capturing' && (
            <motion.div
              key="capturing"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>
                Hold still \u2014 capturing neutral position
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#94A3B8', marginBottom: 18 }}>
                Look straight at the camera with a relaxed, neutral expression
              </p>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}
                  animate={{ width: `${captureProgress * 100}%` }}
                  transition={{ duration: 0.12 }}
                />
              </div>
            </motion.div>
          )}

          {/* VERIFYING */}
          {phase === 'verifying' && (
            <motion.div
              key={`verify-${verifyStep}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Step pills */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {VERIFY_TESTS.map((test, i) => {
                  const done    = i < verifyStep
                  const current = i === verifyStep
                  const passed  = verifyResults[i]
                  return (
                    <div
                      key={test.name}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 8,
                        background: done
                          ? (passed ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)')
                          : current ? 'rgba(124,58,237,0.15)' : 'transparent',
                        border: done
                          ? (passed ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)')
                          : current ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.04)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <motion.span
                        style={{ fontSize: 13, lineHeight: 1, minWidth: 14, textAlign: 'center' }}
                        initial={done ? { scale: 0 } : false}
                        animate={done ? { scale: 1 } : {}}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        {done ? (passed ? '&#x2713;' : '\u2013') : test.icon}
                      </motion.span>
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                        color: done ? (passed ? '#22C55E' : '#374151') : current ? '#A78BFA' : '#374151',
                      }}>
                        {test.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {verifyStep < VERIFY_TESTS.length && (
                <>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800,
                    color: '#F8FAFC', textAlign: 'center', marginBottom: 20, letterSpacing: '-0.01em',
                  }}>
                    {VERIFY_TESTS[verifyStep]?.label}
                  </p>

                  {/* Detection progress */}
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 8, overflow: 'hidden' }}>
                    <motion.div
                      style={{
                        height: '100%', borderRadius: 4,
                        background: verifyProgress >= 1 ? '#22C55E' : '#06B6D4',
                      }}
                      animate={{ width: `${verifyProgress * 100}%` }}
                      transition={{ duration: 0.06 }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#374151' }}>Neutral</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#374151' }}>Trigger point</span>
                  </div>

                  <AnimatePresence>
                    {skipVisible && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ textAlign: 'center' }}
                      >
                        <button
                          onClick={skipVerifyStep}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8, padding: '8px 22px',
                            color: '#4B5563',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          Skip this gesture \u2192
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* DONE */}
          {phase === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 180, damping: 20 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.08 }}
                style={{
                  width: 76, height: 76, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)',
                  border: '2px solid #22C55E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 34, margin: '0 auto 22px',
                  boxShadow: '0 0 36px rgba(34,197,94,0.28)',
                }}
              >
                &#x2713;
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.01em' }}
              >
                Calibration Complete
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#94A3B8', marginBottom: 28 }}
              >
                Your gestures are now personalized to your face.
              </motion.p>

              {baselines && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.36 }}
                  style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 8, marginBottom: 28,
                    padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(26,26,46,0.5)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'center',
                  }}
                >
                  {[
                    { label: 'Yaw',   value: baselines.yaw.toFixed(1)   + '\u00b0' },
                    { label: 'Pitch', value: baselines.pitch.toFixed(1) + '\u00b0' },
                    { label: 'Roll',  value: baselines.roll.toFixed(1)  + '\u00b0' },
                    { label: 'EAR',   value: baselines.ear.toFixed(3) },
                    { label: 'Mouth', value: baselines.mouth.toFixed(3) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#F8FAFC', fontWeight: 700 }}>{value}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#374151', marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
              >
                <motion.button
                  onClick={() => {
                    const tutorialDone = localStorage.getItem('nodex_tutorial_done') === 'true'
                    navigate(tutorialDone ? '/play' : '/tutorial')
                  }}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(124,58,237,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 52px', borderRadius: 9999, border: 'none',
                    background: 'var(--accent-purple)', color: '#F8FAFC',
                    fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 0 28px rgba(124,58,237,0.35)',
                  }}
                >
                  Start Using Nodex \u2192
                </motion.button>
                <button
                  onClick={reset}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#374151', fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13, textDecoration: 'underline',
                  }}
                >
                  Recalibrate
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}
