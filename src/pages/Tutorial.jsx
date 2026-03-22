import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

const steps = [
  {
    title: 'Head Nod Up',
    command: 'Volume Up',
    icon: '↑',
    color: '#22C55E',
    description: 'Tilt your head upward past the threshold to increase volume.',
    tips: ['Keep motion smooth and deliberate', 'Hold for ~500ms', 'Return to neutral after each gesture'],
  },
  {
    title: 'Head Nod Down',
    command: 'Volume Down',
    icon: '↓',
    color: '#06B6D4',
    description: 'Tilt your head downward to decrease volume.',
    tips: ['Chin toward chest', 'Slow motion works best', 'Neutral resets the gesture state'],
  },
  {
    title: 'Turn Left',
    command: 'Previous Track',
    icon: '←',
    color: '#A78BFA',
    description: 'Rotate your head to the left to go to the previous track.',
    tips: ['Natural rotation — like shaking your head', 'Holds trigger once per action', 'Return to center before repeating'],
  },
  {
    title: 'Turn Right',
    command: 'Next Track / Skip',
    icon: '→',
    color: '#F59E0B',
    description: 'Rotate head right to skip forward.',
    tips: ['Same motion as Turn Left but opposite direction', 'Works in Slides mode too (next slide)'],
  },
  {
    title: 'Close Both Eyes',
    command: 'Play / Pause',
    icon: '●',
    color: '#EF4444',
    description: 'Close both eyes deliberately (not a blink) to toggle playback.',
    tips: ['Hold closed for ~600ms', 'Regular blinking is filtered out', 'Works across all media modes'],
  },
  {
    title: 'Open Mouth',
    command: 'Mute / Unmute',
    icon: '○',
    color: '#7C3AED',
    description: 'Open your mouth wide to toggle mute.',
    tips: ['Open wider than a normal yawn', 'Threshold calibrated during setup', 'Cool-down prevents accidental repeats'],
  },
]

export default function Tutorial() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  const step = steps[current]
  const isLast = current === steps.length - 1

  return (
    <motion.div
      className="page-wrapper min-h-screen flex flex-col px-6 py-12"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-xl mx-auto w-full flex flex-col flex-1">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
            Tutorial
          </h1>
          <span className="text-sm" style={{ color: '#94A3B8' }}>
            {current + 1} / {steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-10" style={{ background: '#1A1A2E' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#7C3AED' }}
            animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {/* Gesture illustration */}
            <div
              className="rounded-2xl flex items-center justify-center mb-8"
              style={{ height: 200, background: '#12121A', border: `1px solid ${step.color}30` }}
            >
              <motion.div
                className="text-8xl"
                style={{ color: step.color }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {step.icon}
              </motion.div>
            </div>

            <div className="flex items-start gap-4 mb-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
                {step.title}
              </h2>
              <span
                className="mt-1 px-3 py-0.5 rounded-full text-sm font-medium"
                style={{ background: `${step.color}20`, color: step.color }}
              >
                {step.command}
              </span>
            </div>

            <p className="mb-6" style={{ color: '#94A3B8', lineHeight: 1.7 }}>
              {step.description}
            </p>

            <ul className="space-y-2">
              {step.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#64748B' }}>
                  <span style={{ color: step.color, flexShrink: 0 }}>✦</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-10">
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{
              background: '#12121A',
              border: '1px solid rgba(255,255,255,0.1)',
              color: current === 0 ? '#4B5563' : '#F8FAFC',
            }}
          >
            ← Back
          </button>
          {isLast ? (
            <button
              onClick={() => navigate('/play')}
              className="flex-1 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
            >
              Open App →
            </button>
          ) : (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="flex-1 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
