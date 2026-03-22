import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useFaceDetection } from '../hooks/useFaceDetection.js'
import { useCalibration } from '../context/CalibrationContext.jsx'
import GestureHUD from '../components/GestureHUD.jsx'
import {
  computeYaw,
  computePitch,
  computeEAR,
  computeMouthRatio,
} from '../utils/gestureLogic.js'
import { DEFAULT_THRESHOLDS as T } from '../utils/thresholds.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const TUTORIAL_KEY                = 'nodex_tutorial_done'
const EYE_HOLD_MS                 = 500
const PRACTICE_TIMEOUT            = 5000
const TUTORIAL_THRESHOLD_MULTIPLIER = 0.7  // 30% easier than normal gameplay

// Tutorial-specific thresholds — lower angle/ratio thresholds = smaller movements required.
// earClose is intentionally RAISED (higher = easier, eyes don't need to close as fully).
const TT = {
  yaw:       T.yaw       * TUTORIAL_THRESHOLD_MULTIPLIER,  // 12 → 8.4°
  pitch:     T.pitch     * TUTORIAL_THRESHOLD_MULTIPLIER,  // 10 → 7°
  earClose:  T.earClose  * (1 / TUTORIAL_THRESHOLD_MULTIPLIER), // 0.18 → 0.257
  mouthOpen: T.mouthOpen * TUTORIAL_THRESHOLD_MULTIPLIER,  // 0.25 → 0.175
}

// ─── Gesture step definitions ─────────────────────────────────────────────────
const GESTURE_STEPS = [
  {
    id:          'head-left',
    name:        'Head Left',
    command:     'Pause ⏸',
    icon:        '←',
    color:       '#A78BFA',
    instruction: 'Turn your head to the LEFT',
    description: 'Rotate your head left — like saying "no" to one side. Hold until the bar fills.',
    success:     "That's Pause! ⏸",
    getProgress: (lm, bl) => {
      const yaw = computeYaw(lm) - (bl?.yaw ?? 0)
      return Math.min(1, Math.max(0, -yaw) / TT.yaw)
    },
    isDetected: (lm, bl) => (computeYaw(lm) - (bl?.yaw ?? 0)) < -TT.yaw,
  },
  {
    id:          'head-right',
    name:        'Head Right',
    command:     'Play ▶',
    icon:        '→',
    color:       '#22C55E',
    instruction: 'Turn your head to the RIGHT',
    description: 'Rotate your head right. Same motion, opposite direction.',
    success:     "That's Play! ▶",
    getProgress: (lm, bl) => {
      const yaw = computeYaw(lm) - (bl?.yaw ?? 0)
      return Math.min(1, Math.max(0,  yaw) / TT.yaw)
    },
    isDetected: (lm, bl) => (computeYaw(lm) - (bl?.yaw ?? 0)) > TT.yaw,
  },
  {
    id:          'head-up',
    name:        'Head Up',
    command:     'Volume Up 🔊',
    icon:        '↑',
    color:       '#06B6D4',
    instruction: 'Tilt your head UP — look at the ceiling',
    description: 'Raise your chin upward. Slow and deliberate works best.',
    success:     'Volume Up! 🔊',
    getProgress: (lm, bl) => {
      const pitch = computePitch(lm) - (bl?.pitch ?? 0)
      return Math.min(1, Math.max(0,  pitch) / TT.pitch)
    },
    isDetected: (lm, bl) => (computePitch(lm) - (bl?.pitch ?? 0)) > TT.pitch,
  },
  {
    id:          'head-down',
    name:        'Head Down',
    command:     'Volume Down 🔉',
    icon:        '↓',
    color:       '#F59E0B',
    instruction: 'Tilt your head DOWN — look at the floor',
    description: 'Drop your chin toward your chest.',
    success:     'Volume Down! 🔉',
    getProgress: (lm, bl) => {
      const pitch = computePitch(lm) - (bl?.pitch ?? 0)
      return Math.min(1, Math.max(0, -pitch) / TT.pitch)
    },
    isDetected: (lm, bl) => (computePitch(lm) - (bl?.pitch ?? 0)) < -TT.pitch,
  },
  {
    id:          'mouth-open',
    name:        'Mouth Open',
    command:     'Mute 🔇',
    icon:        '○',
    color:       '#EF4444',
    instruction: 'Open your MOUTH wide',
    description: 'Open wider than a normal yawn. The threshold was calibrated to your face.',
    success:     "That's Mute! 🔇",
    getProgress: (lm, bl) => {
      const mouth = computeMouthRatio(lm) - (bl?.mouth ?? 0)
      return Math.min(1, Math.max(0, mouth) / TT.mouthOpen)
    },
    isDetected: (lm, bl) => (computeMouthRatio(lm) - (bl?.mouth ?? 0)) > TT.mouthOpen,
  },
  {
    id:          'eyes-closed',
    name:        'Eyes Closed',
    command:     'Next Track ⏭',
    icon:        '●',
    color:       '#7C3AED',
    instruction: 'Close your EYES for about 1 second',
    description: 'Close both eyes deliberately — hold them shut, do not blink. Regular blinks are filtered out.',
    success:     'Next Track! ⏭',
    // progress for eyes-closed is driven externally via holdRef
    getProgress: () => 0,
    isDetected:  (lm) => computeEAR(lm) < T.earClose,
  },
]

// ─── Animation variants ────────────────────────────────────────────────────────
const slideIn = {
  initial:  { opacity: 0, x: 60 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, x: -60, transition: { duration: 0.22 } },
}

const fadeUp = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:     { opacity: 0, y: -20, transition: { duration: 0.25 } },
}

// ─── Step indicator dots ──────────────────────────────────────────────────────
function StepDots({ total, current, completed }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => {
        const isDone    = completed.includes(i)
        const isCurrent = i === current
        return (
          <motion.div
            key={i}
            animate={{
              width:      isCurrent ? 24 : 10,
              background: isDone ? '#22C55E' : isCurrent ? '#7C3AED' : 'rgba(255,255,255,0.12)',
              boxShadow:  isCurrent ? '0 0 12px rgba(124,58,237,0.6)' : 'none',
            }}
            transition={{ duration: 0.3 }}
            style={{
              height:       10,
              borderRadius: 5,
              flexShrink:   0,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              fontSize:     7,
              color:        '#fff',
            }}
          >
            {isDone && <span>✓</span>}
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Webcam panel (shared between steps) ──────────────────────────────────────
function WebcamPanel({ videoRef, landmarks, isLoading, isTracking }) {
  return (
    <div
      style={{
        position:     'relative',
        width:        '100%',
        aspectRatio:  '4/3',
        borderRadius: 16,
        overflow:     'hidden',
        border: isTracking
          ? '1.5px solid rgba(6,182,212,0.45)'
          : '1.5px solid rgba(255,255,255,0.07)',
        background:   '#0A0A0F',
        boxShadow: isTracking
          ? '0 0 28px rgba(6,182,212,0.1), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        transition:   'border-color 0.4s, box-shadow 0.4s',
      }}
    >
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }}
      />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <GestureHUD landmarks={landmarks} />
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6 } }}
            style={{
              position: 'absolute', inset: 0, background: '#0A0A0F',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <motion.div
              style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '2px solid rgba(124,58,237,0.2)',
                borderTop: '2px solid #7C3AED',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            />
            <span style={{ color: '#4B5563', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>
              Loading model...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No face */}
      {!isLoading && !isTracking && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(10,10,15,0.9)', borderRadius: 8, padding: '5px 14px',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ color: '#F59E0B', fontSize: 11, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
            No face detected — move closer
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function GestureProgressBar({ progress, success, color }) {
  const fill = success ? '#22C55E' : color
  return (
    <div
      style={{
        height: 6, borderRadius: 3,
        background: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
        marginTop: 10,
      }}
    >
      <motion.div
        style={{ height: '100%', borderRadius: 3, background: fill, transformOrigin: 'left' }}
        animate={{ width: `${Math.round(progress * 100)}%` }}
        transition={{ duration: 0.07 }}
      />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Tutorial() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const { landmarks, isLoading, isTracking } = useFaceDetection({ videoRef })
  const { baselines } = useCalibration()

  // step 0=welcome, 1-6=gestures (index into GESTURE_STEPS: step-1), 7=practice, 8=complete
  const [step,             setStep]             = useState(0)
  const [detected,         setDetected]         = useState(false)
  const [progress,         setProgress]         = useState(0)
  const [completedSteps,   setCompletedSteps]   = useState([])
  const [successFlash,     setSuccessFlash]      = useState(false)

  // Practice round state
  const [practiceQueue,    setPracticeQueue]    = useState([])
  const [practiceIdx,      setPracticeIdx]      = useState(0)
  const [practiceResults,  setPracticeResults]  = useState([])
  const [practiceTimer,    setPracticeTimer]    = useState(PRACTICE_TIMEOUT)
  const [practiceMissed,   setPracticeMissed]   = useState(false)
  const [practiceDetected, setPracticeDetected] = useState(false)

  // Eye-hold tracking for step 6
  const eyeHoldStart = useRef(null)
  const advanceTimer = useRef(null)
  const practiceTimerRef = useRef(null)
  const practiceTimerStart = useRef(null)

  // Total wizard steps: welcome(0) + 6 gestures(1-6) + practice(7) + complete(8) = 9 dots
  const TOTAL_DOTS = 9

  // Defined before the effect so the closure always captures the current version.
  const handleDetected = useCallback(() => {
    setDetected(true)
    setProgress(1)
    setSuccessFlash(true)
    clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      setSuccessFlash(false)
      setCompletedSteps(prev => [...prev, step])
      advanceStep(step)
    }, 1000)
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Gesture detection per frame ──────────────────────────────────────────────
  useEffect(() => {
    if (!landmarks?.length || detected) return
    const gestureStep = step >= 1 && step <= 6 ? step - 1 : null
    if (gestureStep === null) return

    const gs  = GESTURE_STEPS[gestureStep]
    const bl  = baselines
    const ear = computeEAR(landmarks)

    if (gs.id === 'eyes-closed') {
      // Approach feedback: show how far EAR has dropped from baseline toward threshold.
      // Once fully closed (below TT.earClose), switch to hold-timer progress.
      const baseEar   = bl?.ear ?? 0.30
      const dropRange = Math.max(0.01, baseEar - TT.earClose)

      if (ear < TT.earClose) {
        // Eyes are closed — run hold timer
        if (!eyeHoldStart.current) eyeHoldStart.current = Date.now()
        const held = Date.now() - eyeHoldStart.current
        const p = Math.min(1, held / EYE_HOLD_MS)
        setProgress(p)
        console.log('[Tutorial] eyes-closed | EAR:', ear.toFixed(3), '| held:', held, 'ms | progress:', p.toFixed(2))
        if (held >= EYE_HOLD_MS) handleDetected()
      } else {
        // Eyes approaching closed — show how far they've dropped
        eyeHoldStart.current = null
        const dropped = baseEar - ear
        const p = Math.min(0.95, Math.max(0, dropped / dropRange))
        setProgress(p)
      }
    } else {
      const rawYaw   = computeYaw(landmarks)
      const rawPitch = computePitch(landmarks)
      const rawMouth = computeMouthRatio(landmarks)
      const adjYaw   = rawYaw   - (bl?.yaw   ?? 0)
      const adjPitch = rawPitch - (bl?.pitch  ?? 0)
      const adjMouth = rawMouth - (bl?.mouth  ?? 0)

      console.log('[Tutorial] step', step, gs.id,
        '| yaw:', adjYaw.toFixed(1), '/ ±', TT.yaw,
        '| pitch:', adjPitch.toFixed(1), '/ ±', TT.pitch,
        '| mouth:', adjMouth.toFixed(3), '/', TT.mouthOpen,
        '| ear:', ear.toFixed(3))

      const p = gs.getProgress(landmarks, bl)
      setProgress(p)
      if (gs.isDetected(landmarks, bl)) handleDetected()
    }
  }, [landmarks, step, detected, baselines, handleDetected]) // eslint-disable-line react-hooks/exhaustive-deps

  function advanceStep(from) {
    eyeHoldStart.current = null
    setDetected(false)
    setProgress(0)
    if (from < 6) {
      setStep(from + 1)
    } else {
      // After step 6, go to practice
      initPractice()
      setStep(7)
    }
  }

  // ── Practice round ────────────────────────────────────────────────────────────
  function initPractice() {
    const indices = [0, 1, 2, 3, 4, 5]
    // shuffle 5 of 6
    const shuffled = [...indices].sort(() => Math.random() - 0.5).slice(0, 5)
    setPracticeQueue(shuffled)
    setPracticeIdx(0)
    setPracticeResults([])
    setPracticeTimer(PRACTICE_TIMEOUT)
    setPracticeMissed(false)
    setPracticeDetected(false)
    practiceTimerStart.current = Date.now()
  }

  // Practice timer countdown
  useEffect(() => {
    if (step !== 7 || practiceDetected || practiceMissed) return
    if (practiceIdx >= practiceQueue.length) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - (practiceTimerStart.current ?? Date.now())
      const remaining = Math.max(0, PRACTICE_TIMEOUT - elapsed)
      setPracticeTimer(remaining)
      if (remaining <= 0) {
        setPracticeMissed(true)
        setPracticeResults(prev => [...prev, false])
        clearInterval(interval)
        setTimeout(() => advancePractice(false), 700)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [step, practiceIdx, practiceDetected, practiceMissed, practiceQueue]) // eslint-disable-line react-hooks/exhaustive-deps

  // Practice gesture detection
  useEffect(() => {
    if (step !== 7 || !landmarks?.length || practiceDetected || practiceMissed) return
    if (practiceIdx >= practiceQueue.length) return

    const gs = GESTURE_STEPS[practiceQueue[practiceIdx]]
    const bl = baselines

    if (gs.id === 'eyes-closed') {
      const earBelow = computeEAR(landmarks) < TT.earClose
      if (earBelow) {
        if (!eyeHoldStart.current) eyeHoldStart.current = Date.now()
        if (Date.now() - eyeHoldStart.current >= EYE_HOLD_MS) {
          handlePracticeHit()
        }
      } else {
        eyeHoldStart.current = null
      }
    } else {
      if (gs.isDetected(landmarks, bl)) handlePracticeHit()
    }
  }, [landmarks, step, practiceIdx, practiceDetected, practiceMissed, practiceQueue, baselines]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePracticeHit() {
    eyeHoldStart.current = null
    setPracticeDetected(true)
    setPracticeResults(prev => [...prev, true])
    clearTimeout(practiceTimerRef.current)
    practiceTimerRef.current = setTimeout(() => advancePractice(true), 700)
  }

  function advancePractice(hit) {
    const nextIdx = practiceIdx + 1
    eyeHoldStart.current = null
    setPracticeDetected(false)
    setPracticeMissed(false)
    setPracticeTimer(PRACTICE_TIMEOUT)
    practiceTimerStart.current = Date.now()

    if (nextIdx >= practiceQueue.length) {
      // Done with practice
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, 7])
        setStep(8)
        completeTutorial()
      }, 500)
    } else {
      setPracticeIdx(nextIdx)
    }
  }

  function completeTutorial() {
    try { localStorage.setItem(TUTORIAL_KEY, 'true') } catch {}
  }

  function skipTutorial() {
    completeTutorial()
    navigate('/play')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(advanceTimer.current)
      clearTimeout(practiceTimerRef.current)
      eyeHoldStart.current = null
    }
  }, [])

  // ── Render helpers ─────────────────────────────────────────────────────────────
  const currentGestureStep = step >= 1 && step <= 6 ? GESTURE_STEPS[step - 1] : null
  const practiceGesture    = step === 7 && practiceQueue.length > 0 ? GESTURE_STEPS[practiceQueue[practiceIdx]] : null
  const practiceScore      = practiceResults.filter(Boolean).length

  return (
    <div
      className="page-wrapper"
      style={{
        minHeight:     '100vh',
        display:       'flex',
        flexDirection: 'column',
        padding:       '28px 24px 60px',
        position:      'relative',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, maxWidth: 960, width: '100%', margin: '0 auto 24px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#4B5563', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          }}
        >
          ← Back
        </button>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 800, color: '#F8FAFC' }}>
          Nodex Tutorial
        </span>
        <button
          onClick={skipTutorial}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#374151', fontSize: 12, fontFamily: 'DM Sans, sans-serif',
            textDecoration: 'underline', padding: 0,
          }}
        >
          Skip tutorial
        </button>
      </div>

      {/* ── Step dots ─────────────────────────────────────────────────────────── */}
      <StepDots total={TOTAL_DOTS} current={step} completed={completedSteps} />

      {/* ── Main content area ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 960, width: '100%', margin: '0 auto' }}>
        <AnimatePresence mode="wait">

          {/* STEP 0: Welcome ─────────────────────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="welcome" {...fadeUp}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}
            >
              <h1 style={{
                fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(36px, 5vw, 52px)',
                fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 0,
              }}>
                Learn the Gestures
              </h1>
              <p style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 17, lineHeight: 1.65,
                color: '#94A3B8', maxWidth: 460,
              }}>
                We'll walk you through each gesture one at a time. Follow the prompts and try each movement.
              </p>

              {/* Webcam preview */}
              <div style={{ width: '100%', maxWidth: 400 }}>
                <WebcamPanel
                  videoRef={videoRef}
                  landmarks={landmarks}
                  isLoading={isLoading}
                  isTracking={isTracking}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <motion.button
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(124,58,237,0.55)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '15px 52px', borderRadius: 9999, border: 'none',
                    background: 'var(--accent-purple)', color: '#F8FAFC',
                    fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700,
                    cursor: 'pointer', boxShadow: '0 0 28px rgba(124,58,237,0.35)',
                  }}
                >
                  Let's Go →
                </motion.button>
                <button
                  onClick={skipTutorial}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#374151', fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                    textDecoration: 'underline',
                  }}
                >
                  I already know the gestures → Skip
                </button>
              </div>
            </motion.div>
          )}

          {/* STEPS 1-6: Gesture training ──────────────────────────────────────── */}
          {step >= 1 && step <= 6 && currentGestureStep && (
            <motion.div key={`gesture-${step}`} {...slideIn}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 40,
                alignItems: 'start',
              }}
            >
              {/* Left: instruction */}
              <div style={{ minWidth: 0 }}>
                {/* Step badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '4px 14px', borderRadius: 9999, marginBottom: 20,
                  background: `${currentGestureStep.color}18`,
                  border: `1px solid ${currentGestureStep.color}40`,
                }}>
                  <span style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, letterSpacing: '0.1em', color: currentGestureStep.color, textTransform: 'uppercase' }}>
                    Gesture {step} of 6
                  </span>
                </div>

                {/* Animated icon */}
                <motion.div
                  animate={{ scale: detected ? [1, 1.3, 1] : [1, 1.08, 1] }}
                  transition={{ duration: detected ? 0.4 : 2.5, repeat: detected ? 0 : Infinity, ease: 'easeInOut' }}
                  style={{
                    fontSize: 72, lineHeight: 1,
                    color: detected ? '#22C55E' : currentGestureStep.color,
                    marginBottom: 20,
                    transition: 'color 0.3s',
                    textShadow: `0 0 48px ${detected ? 'rgba(34,197,94,0.5)' : currentGestureStep.color + '40'}`,
                  }}
                >
                  {detected ? '✓' : currentGestureStep.icon}
                </motion.div>

                {/* Instruction text */}
                <AnimatePresence mode="wait">
                  {!detected ? (
                    <motion.div key="instruction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(22px, 3vw, 30px)',
                        fontWeight: 800, color: '#F8FAFC',
                        letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 12,
                      }}>
                        {currentGestureStep.instruction}
                      </h2>
                      <p style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: 15,
                        color: '#94A3B8', lineHeight: 1.7, maxWidth: 400,
                      }}>
                        {currentGestureStep.description}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <h2 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(22px, 3vw, 30px)',
                        fontWeight: 800, color: '#22C55E',
                        letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 8,
                      }}>
                        {currentGestureStep.success}
                      </h2>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#4ADE80' }}>
                        Nice! Advancing to next gesture...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Command badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  marginTop: 20, padding: '6px 16px', borderRadius: 9999,
                  background: `${currentGestureStep.color}15`,
                  border: `1px solid ${currentGestureStep.color}30`,
                }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: currentGestureStep.color, fontWeight: 600 }}>
                    → {currentGestureStep.command}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {detected ? 'Detected!' : 'Gesture Progress'}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151' }}>
                      {Math.round(progress * 100)}%
                    </span>
                  </div>
                  <GestureProgressBar progress={progress} success={detected} color={currentGestureStep.color} />
                </div>

                {/* Success flash overlay on progress bar */}
                <AnimatePresence>
                  {successFlash && (
                    <motion.div
                      initial={{ opacity: 0.8 }} animate={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{
                        position: 'fixed', inset: 0, pointerEvents: 'none',
                        background: 'rgba(34,197,94,0.08)',
                        zIndex: 0,
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Right: webcam */}
              <div style={{ width: 280, flexShrink: 0 }}>
                <WebcamPanel
                  videoRef={videoRef}
                  landmarks={landmarks}
                  isLoading={isLoading}
                  isTracking={isTracking}
                />
                <p style={{
                  marginTop: 10, textAlign: 'center',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                  color: '#374151', letterSpacing: '0.05em',
                }}>
                  {isTracking ? '● Face tracked' : '○ Waiting for face...'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 7: Practice round ───────────────────────────────────────────── */}
          {step === 7 && (
            <motion.div key="practice" {...fadeUp}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Quick Practice!
                </h2>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#94A3B8' }}>
                  Perform each gesture when prompted. You have 5 seconds each.
                </p>
              </div>

              {/* Score */}
              <div style={{ display: 'flex', gap: 6 }}>
                {practiceQueue.map((_, i) => {
                  const result = practiceResults[i]
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0.4 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: result === true ? 'rgba(34,197,94,0.2)' : result === false ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                        border: result === true ? '1px solid #22C55E' : result === false ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14,
                      }}
                    >
                      {result === true ? '✓' : result === false ? '~' : i === practiceIdx ? '·' : ''}
                    </motion.div>
                  )
                })}
              </div>

              {/* Current prompt */}
              {practiceIdx < practiceQueue.length && practiceGesture && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`prompt-${practiceIdx}`}
                    initial={{ opacity: 0, y: -20, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } }}
                    exit={{ opacity: 0, y: 20 }}
                    style={{
                      textAlign: 'center', padding: '28px 40px', borderRadius: 20,
                      background: practiceDetected
                        ? 'rgba(34,197,94,0.1)'
                        : practiceMissed
                        ? 'rgba(245,158,11,0.08)'
                        : `${practiceGesture.color}0D`,
                      border: practiceDetected
                        ? '1px solid rgba(34,197,94,0.4)'
                        : practiceMissed
                        ? '1px solid rgba(245,158,11,0.3)'
                        : `1px solid ${practiceGesture.color}30`,
                      minWidth: 280,
                    }}
                  >
                    <div style={{ fontSize: 52, marginBottom: 12, color: practiceDetected ? '#22C55E' : practiceMissed ? '#F59E0B' : practiceGesture.color }}>
                      {practiceDetected ? '✓' : practiceMissed ? '~' : practiceGesture.icon}
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color: practiceDetected ? '#22C55E' : practiceMissed ? '#F59E0B' : '#F8FAFC', marginBottom: 4 }}>
                      {practiceDetected ? 'Nice!' : practiceMissed ? 'Missed' : practiceGesture.name}
                    </div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#94A3B8' }}>
                      {practiceDetected ? practiceGesture.command : practiceMissed ? 'Moving on...' : practiceGesture.instruction}
                    </div>

                    {/* Timer bar */}
                    {!practiceDetected && !practiceMissed && (
                      <div style={{ marginTop: 16, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', borderRadius: 2, background: practiceGesture.color }}
                          animate={{ width: `${(practiceTimer / PRACTICE_TIMEOUT) * 100}%` }}
                          transition={{ duration: 0.05 }}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Webcam */}
              <div style={{ width: '100%', maxWidth: 340 }}>
                <WebcamPanel
                  videoRef={videoRef}
                  landmarks={landmarks}
                  isLoading={isLoading}
                  isTracking={isTracking}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 8: Complete ─────────────────────────────────────────────────── */}
          {step === 8 && (
            <motion.div key="complete" {...fadeUp}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 28 }}
            >
              {/* Celebration icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)',
                  border: '2px solid #22C55E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, boxShadow: '0 0 48px rgba(34,197,94,0.3)',
                }}
              >
                🎉
              </motion.div>

              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 10 }}>
                  You're Ready!
                </h2>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: '#94A3B8' }}>
                  Practice score: <strong style={{ color: '#F8FAFC' }}>{practiceScore}/{practiceQueue.length}</strong>
                  {practiceScore === practiceQueue.length && ' — Perfect! 🌟'}
                </p>
              </div>

              {/* Gesture summary grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 10, width: '100%', maxWidth: 600, textAlign: 'left',
              }}>
                {GESTURE_STEPS.map((gs, i) => (
                  <motion.div
                    key={gs.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 + 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 12,
                      background: `${gs.color}0D`,
                      border: `1px solid ${gs.color}25`,
                    }}
                  >
                    <span style={{ fontSize: 22, color: gs.color, flexShrink: 0 }}>{gs.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>
                        {gs.name}
                      </div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#64748B' }}>
                        {gs.command}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={() => navigate('/play')}
                whileHover={{ scale: 1.04, boxShadow: '0 0 44px rgba(124,58,237,0.6)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 56px', borderRadius: 9999, border: 'none',
                  background: 'var(--accent-purple)', color: '#F8FAFC',
                  fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 0 32px rgba(124,58,237,0.4)',
                }}
              >
                Start Controlling Media →
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
