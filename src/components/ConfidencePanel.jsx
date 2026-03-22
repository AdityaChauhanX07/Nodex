import { motion } from 'framer-motion'
import { useGesture } from '../context/GestureContext.jsx'

const axes = [
  { key: 'yaw', label: 'Yaw (L/R)', color: '#A78BFA' },
  { key: 'pitch', label: 'Pitch (U/D)', color: '#06B6D4' },
  { key: 'roll', label: 'Roll (Tilt)', color: '#F59E0B' },
  { key: 'ear', label: 'EAR (Blink)', color: '#22C55E' },
  { key: 'mouth', label: 'Mouth', color: '#EF4444' },
]

export default function ConfidencePanel() {
  const { confidence } = useGesture()

  return (
    <div
      className="fixed bottom-6 right-6 rounded-xl p-4"
      style={{
        width: 220,
        background: 'rgba(18,18,26,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: '#94A3B8', fontFamily: 'Outfit, sans-serif' }}>
        Gesture Confidence
      </p>
      <div className="space-y-3">
        {axes.map(axis => {
          const val = confidence?.[axis.key] ?? 0
          const pct = Math.min(100, Math.abs(val) * 2)
          return (
            <div key={axis.key}>
              <div className="flex justify-between text-xs mb-1" style={{ color: '#64748B' }}>
                <span>{axis.label}</span>
                <span style={{ color: axis.color }}>
                  {typeof val === 'number' ? val.toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: '#1A1A2E' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: axis.color }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
