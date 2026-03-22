import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COMMANDS } from '../constants/commands.js'

const COMMAND_DISPLAY = {
  [COMMANDS.PLAY]:     { icon: '▶',  label: 'Playing',     color: '#22C55E' },
  [COMMANDS.PAUSE]:    { icon: '⏸',  label: 'Paused',      color: '#F59E0B' },
  [COMMANDS.VOL_UP]:   { icon: '🔊', label: 'Volume Up',   color: '#06B6D4' },
  [COMMANDS.VOL_DOWN]: { icon: '🔉', label: 'Volume Down', color: '#06B6D4' },
  [COMMANDS.NEXT]:     { icon: '⏭',  label: 'Next',        color: '#A78BFA' },
  [COMMANDS.MUTE]:     { icon: '🔇', label: 'Muted',       color: '#EF4444' },
  [COMMANDS.REWIND]:   { icon: '⏪', label: 'Rewind 10s',  color: '#A78BFA' },
  [COMMANDS.SKIP]:     { icon: '⏩', label: 'Skip 10s',    color: '#A78BFA' },
}

export default function CommandToast({ command, commandTime }) {
  const [visible, setVisible] = useState(false)
  const [display, setDisplay] = useState(null)

  useEffect(() => {
    if (!command || command === COMMANDS.NONE || !commandTime) return
    const info = COMMAND_DISPLAY[command]
    if (!info) return
    setDisplay(info)
    setVisible(true)
    const id = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(id)
  }, [commandTime])

  return (
    <AnimatePresence>
      {visible && display && (
        <motion.div
          initial={{ opacity: 0, scale: 0.72, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.88,  y: -8 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            position:           'fixed',
            top:                '38%',
            left:               '50%',
            transform:          'translateX(-50%)',
            background:         'rgba(10,10,15,0.9)',
            backdropFilter:     'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border:             `1px solid ${display.color}55`,
            borderRadius:       20,
            padding:            '22px 48px',
            display:            'flex',
            flexDirection:      'column',
            alignItems:         'center',
            gap:                10,
            zIndex:             100,
            pointerEvents:      'none',
            boxShadow:          `0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px ${display.color}15, inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          <span style={{ fontSize: 46, lineHeight: 1 }}>{display.icon}</span>
          <span style={{
            color:         display.color,
            fontSize:      15,
            fontFamily:    'Outfit, sans-serif',
            fontWeight:    700,
            letterSpacing: '0.025em',
          }}>
            {display.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
