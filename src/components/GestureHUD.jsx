import { motion } from 'framer-motion'
import { useGesture } from '../context/GestureContext.jsx'

export default function GestureHUD() {
  const { currentGesture } = useGesture()

  return (
    <div
      className="fixed bottom-6 left-6 rounded-xl overflow-hidden"
      style={{
        width: 160,
        height: 120,
        background: '#0A0A0F',
        border: '1px solid rgba(6,182,212,0.4)',
        zIndex: 50,
      }}
    >
      {/* Camera placeholder */}
      <div className="w-full h-full flex items-center justify-center relative" style={{ background: '#0D0D15' }}>
        <span className="text-xs" style={{ color: '#4B5563' }}>Camera Feed</span>

        {/* Corner brackets */}
        {[
          { top: 4, left: 4, rotate: 0 },
          { top: 4, right: 4, rotate: 90 },
          { bottom: 4, right: 4, rotate: 180 },
          { bottom: 4, left: 4, rotate: 270 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderTop: '1.5px solid #06B6D4',
              borderLeft: '1.5px solid #06B6D4',
              transform: `rotate(${pos.rotate}deg)`,
              ...pos,
            }}
          />
        ))}

        {/* Gesture label */}
        {currentGesture && (
          <motion.div
            className="absolute bottom-1 left-0 right-0 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ background: 'rgba(124,58,237,0.8)', color: '#fff', fontSize: '10px' }}
            >
              {currentGesture}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
