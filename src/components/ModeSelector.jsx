import { motion } from 'framer-motion'

const modes = [
  { id: 'youtube', label: 'YouTube', icon: '▶' },
  { id: 'spotify', label: 'Spotify', icon: '♫' },
  { id: 'slides',  label: 'Slides',  icon: '⬛' },
]

export default function ModeSelector({ mode, onChange }) {
  return (
    <div
      style={{
        display:      'inline-flex',
        background:   '#0A0A0F',
        border:       '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding:      4,
        gap:          2,
      }}
    >
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          style={{
            position:   'relative',
            display:    'flex',
            alignItems: 'center',
            gap:        6,
            padding:    '7px 22px',
            borderRadius: 8,
            border:     'none',
            background: 'transparent',
            cursor:     'pointer',
            fontFamily: 'Outfit, sans-serif',
            fontSize:   13,
            fontWeight: 600,
            color:      mode === m.id ? '#F8FAFC' : '#4B5563',
            transition: 'color 0.2s ease',
            zIndex:     1,
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {mode === m.id && (
            <motion.div
              layoutId="tab-bg"
              style={{
                position:     'absolute',
                inset:        0,
                borderRadius: 8,
                background:   'var(--accent-purple)',
                zIndex:       -1,
              }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
            />
          )}
          <span style={{ fontSize: 11 }}>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  )
}
