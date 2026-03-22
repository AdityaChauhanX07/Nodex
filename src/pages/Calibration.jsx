import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCalibration } from '../context/CalibrationContext.jsx'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

const STEPS = [
  { id: 'neutral', label: 'Hold Neutral Position', duration: 3, icon: '😐' },
  { id: 'nod-up', label: 'Nod Head Up', duration: 2, icon: '↑' },
  { id: 'nod-down', label: 'Nod Head Down', duration: 2, icon: '↓' },
  { id: 'turn-left', label: 'Turn Head Left', duration: 2, icon: '←' },
  { id: 'turn-right', label: 'Turn Head Right', duration: 2, icon: '→' },
  { id: 'blink', label: 'Close Both Eyes', duration: 2, icon: '●' },
  { id: 'mouth', label: 'Open Mouth Wide', duration: 2, icon: '○' },
]

export default function Calibration() {
  const navigate = useNavigate()
  const { setCalibrationData } = useCalibration()
  const [step, setStep] = useState(0)
  const [countdown, setCountdown] = useState(STEPS[0].duration)
  const [completed, setCompleted] = useState([])
  const [status, setStatus] = useState('idle') // idle | running | done
  const timerRef = useRef(null)

  const startCalibration = () => {
    setStatus('running')
    setStep(0)
    setCountdown(STEPS[0].duration)
    setCompleted([])
  }

  useEffect(() => {
    if (status !== 'running') return
    if (countdown <= 0) {
      setCompleted(prev => [...prev, STEPS[step].id])
      if (step + 1 < STEPS.length) {
        const nextStep = step + 1
        setStep(nextStep)
        setCountdown(STEPS[nextStep].duration)
      } else {
        setStatus('done')
        // Save placeholder calibration data
        setCalibrationData({
          baseline: { yaw: 0, pitch: 0, roll: 0, ear: 0.25, mouthRatio: 0.02 },
          thresholds: { yaw: 15, pitch: 12, roll: 10, earClose: 0.18, mouthOpen: 0.08 },
          calibratedAt: Date.now(),
        })
      }
      return
    }
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [status, countdown, step, setCalibrationData])

  return (
    <motion.div
      className="page-wrapper min-h-screen flex flex-col items-center justify-center px-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-lg w-full">
        <motion.h1
          className="text-4xl font-bold text-center mb-2"
          style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Calibration
        </motion.h1>
        <p className="text-center mb-10" style={{ color: '#94A3B8' }}>
          We&apos;ll capture your neutral position and gesture range.
        </p>

        {status === 'idle' && (
          <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center text-6xl"
              style={{ background: '#12121A', border: '2px solid rgba(124,58,237,0.4)' }}
            >
              😐
            </div>
            <p className="mb-8" style={{ color: '#94A3B8' }}>
              Sit comfortably in front of your camera. Make sure your face is well-lit and centered.
            </p>
            <button
              onClick={startCalibration}
              className="px-8 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
            >
              Start Calibration
            </button>
          </motion.div>
        )}

        {status === 'running' && (
          <motion.div
            className="text-center"
            key={step}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl relative"
              style={{ background: '#12121A', border: '2px solid #7C3AED' }}
            >
              {STEPS[step].icon}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(124,58,237,0.2)" strokeWidth="4" />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (countdown / STEPS[step].duration)}`}
                  strokeLinecap="round"
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
              {STEPS[step].label}
            </h2>
            <p className="text-5xl font-bold mb-6" style={{ color: '#A78BFA' }}>{countdown}</p>
            <div className="flex justify-center gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: completed.includes(s.id) ? '#22C55E' : i === step ? '#7C3AED' : '#1A1A2E',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {status === 'done' && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'rgba(34,197,94,0.2)', border: '2px solid #22C55E' }}
            >
              ✓
            </div>
            <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
              Calibration Complete!
            </h2>
            <p className="mb-8" style={{ color: '#94A3B8' }}>
              Your gesture thresholds have been saved. Ready to learn the gestures.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/tutorial')}
                className="px-6 py-3 rounded-xl font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
              >
                View Tutorial
              </button>
              <button
                onClick={() => navigate('/play')}
                className="px-6 py-3 rounded-xl font-semibold"
                style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
              >
                Skip to App
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
