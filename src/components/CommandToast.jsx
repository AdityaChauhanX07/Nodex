import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COMMANDS } from '../constants/commands.js'

const COMMAND_DISPLAY = {
  [COMMANDS.PLAY]:     { label: 'Play',        color: '#22C55E' },
  [COMMANDS.PAUSE]:    { label: 'Pause',        color: '#F59E0B' },
  [COMMANDS.VOL_UP]:   { label: 'Volume Up',    color: '#06B6D4' },
  [COMMANDS.VOL_DOWN]: { label: 'Volume Down',  color: '#06B6D4' },
  [COMMANDS.NEXT]:     { label: 'Next',          color: '#A78BFA' },
  [COMMANDS.MUTE]:     { label: 'Mute',          color: '#EF4444' },
  [COMMANDS.REWIND]:   { label: 'Rewind 10s',    color: '#A78BFA' },
  [COMMANDS.SKIP]:     { label: 'Skip 10s',      color: '#A78BFA' },
}

export default function CommandToast({ command, commandTime }) {
  const [visible,  setVisible]  = useState(false)
  const [display,  setDisplay]  = useState(null)

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
          initial={{ opacity: 0, scale: 0.8,  y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.92,  y: -6 }}
          transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            position:             'fixed',
            top:                  '38%',
            left:                 '50%',
            transform:            'translateX(-50%)',
            background:           'rgba(10,10,15,0.75)',
            backdropFilter:       'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border:               `1px solid ${display.color}38`,
            borderRadius:         12,
            padding:              '14px 28px',
            display:              'flex',
            alignItems:           'center',
            gap:                  10,
            zIndex:               100,
            pointerEvents:        'none',
            boxShadow:            `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${display.color}12`,
          }}
        >
          {/* Colored dot accent */}
          <span style={{
            display:      'inline-block',
            width:        8,
            height:       8,
            borderRadius: '50%',
            background:   display.color,
            flexShrink:   0,
            boxShadow:    `0 0 8px ${display.color}`,
          }} />
          <span style={{
            fontFamily:    'Outfit, sans-serif',
            fontWeight:    600,
            fontSize:      15,
            color:         display.color,
            letterSpacing: '0.01em',
          }}>
            {display.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
