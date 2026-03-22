import { AnimatePresence, motion } from 'framer-motion'
import { useGesture } from '../context/GestureContext.jsx'
import { COMMANDS } from '../constants/commands.js'

const COMMAND_ICONS = {
  [COMMANDS.PLAY]: '▶',
  [COMMANDS.PAUSE]: '⏸',
  [COMMANDS.VOL_UP]: '🔊+',
  [COMMANDS.VOL_DOWN]: '🔉−',
  [COMMANDS.NEXT]: '⏭',
  [COMMANDS.REWIND]: '⏮',
  [COMMANDS.MUTE]: '🔇',
  [COMMANDS.SKIP]: '⏩',
}

const COMMAND_COLORS = {
  [COMMANDS.PLAY]: '#22C55E',
  [COMMANDS.PAUSE]: '#F59E0B',
  [COMMANDS.VOL_UP]: '#06B6D4',
  [COMMANDS.VOL_DOWN]: '#06B6D4',
  [COMMANDS.NEXT]: '#A78BFA',
  [COMMANDS.REWIND]: '#A78BFA',
  [COMMANDS.MUTE]: '#EF4444',
  [COMMANDS.SKIP]: '#A78BFA',
}

export default function CommandToast() {
  const { command } = useGesture()

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center"
      style={{ zIndex: 100 }}
    >
      <AnimatePresence>
        {command && (
          <motion.div
            key={command + Date.now()}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: `${COMMAND_COLORS[command] ?? '#7C3AED'}20`,
                border: `2px solid ${COMMAND_COLORS[command] ?? '#7C3AED'}`,
                backdropFilter: 'blur(12px)',
              }}
            >
              {COMMAND_ICONS[command] ?? '✦'}
            </div>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.7)',
                color: COMMAND_COLORS[command] ?? '#A78BFA',
                backdropFilter: 'blur(8px)',
              }}
            >
              {command}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
