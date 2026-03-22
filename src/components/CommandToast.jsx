import { AnimatePresence, motion } from 'framer-motion'
import { COMMANDS } from '../constants/commands.js'

const TOAST_CONFIG = {
  [COMMANDS.PLAY]:     { icon: '▶',  label: 'Playing',     color: '#22C55E' },
  [COMMANDS.PAUSE]:    { icon: '⏸',  label: 'Paused',      color: '#F59E0B' },
  [COMMANDS.VOL_UP]:   { icon: '🔊', label: 'Volume Up',   color: '#06B6D4' },
  [COMMANDS.VOL_DOWN]: { icon: '🔉', label: 'Volume Down', color: '#06B6D4' },
  [COMMANDS.NEXT]:     { icon: '⏭',  label: 'Next',        color: '#A78BFA' },
  [COMMANDS.REWIND]:   { icon: '⏪',  label: 'Rewind 10s',  color: '#A78BFA' },
  [COMMANDS.MUTE]:     { icon: '🔇', label: 'Muted',       color: '#EF4444' },
  [COMMANDS.SKIP]:     { icon: '⏩',  label: 'Skip 10s',    color: '#A78BFA' },
}

/**
 * CommandToast — large center-screen confirmation overlay.
 * Props:
 *   command     — current command string (COMMANDS.NONE when idle)
 *   commandTime — timestamp of command (used as AnimatePresence key so the
 *                 same command re-animates when fired twice)
 */
export default function CommandToast({ command, commandTime }) {
  const cfg = TOAST_CONFIG[command]

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        pointerEvents:  'none',
        zIndex:         100,
      }}
    >
      <AnimatePresence mode="wait">
        {cfg && (
          <motion.div
            key={commandTime ?? command}
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            12,
              padding:        '28px 40px',
              borderRadius:   20,
              background:     'rgba(10,10,15,0.85)',
              border:         `1px solid ${cfg.color}40`,
              backdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1,   y: 0,
              transition: { duration: 0.18, ease: [0.34, 1.56, 0.64, 1] } }}
            exit={{    opacity: 0, scale: 1.1, y: -6,
              transition: { duration: 0.22, ease: 'easeIn' } }}
          >
            {/* Icon circle */}
            <div
              style={{
                width:          72,
                height:         72,
                borderRadius:   '50%',
                background:     `${cfg.color}18`,
                border:         `2px solid ${cfg.color}80`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       34,
                lineHeight:     1,
              }}
            >
              {cfg.icon}
            </div>

            {/* Label */}
            <span
              style={{
                color:       cfg.color,
                fontSize:    17,
                fontWeight:  700,
                fontFamily:  'Outfit, sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              {cfg.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
