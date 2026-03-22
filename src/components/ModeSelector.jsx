import { motion } from 'framer-motion'

const modes = [
  { id: 'youtube', label: 'YouTube', icon: '▶', color: '#EF4444' },
  { id: 'spotify', label: 'Spotify', icon: '♫', color: '#22C55E' },
  { id: 'slides', label: 'Slides', icon: '⬜', color: '#06B6D4' },
]

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className="flex gap-2">
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: mode === m.id ? `${m.color}20` : 'transparent',
            border: mode === m.id ? `1px solid ${m.color}60` : '1px solid rgba(255,255,255,0.06)',
            color: mode === m.id ? m.color : '#64748B',
          }}
        >
          <span>{m.icon}</span>
          <span style={{ fontFamily: 'Outfit, sans-serif' }}>{m.label}</span>
          {mode === m.id && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ background: `${m.color}08` }}
              layoutId="mode-indicator"
            />
          )}
        </button>
      ))}
    </div>
  )
}
