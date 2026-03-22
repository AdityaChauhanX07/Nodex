import { motion, AnimatePresence } from 'framer-motion'

/**
 * Camera — fixed PiP webcam window (bottom-right, 240x180 px).
 * Props:
 *   videoRef   — React ref on <video>. MediaPipe Camera calls getUserMedia here.
 *   isLoading  — spinner while WASM model loads
 *   isTracking — teal glow when face detected
 *   error      — Error object for denied camera
 *   children   — overlays rendered on top of video (e.g. GestureHUD)
 */
export default function Camera({ videoRef, isLoading, isTracking, error, children }) {
  return (
    <div
      style={{
        position:     'fixed',
        bottom:       24,
        right:        24,
        width:        240,
        height:       180,
        borderRadius: 12,
        overflow:     'hidden',
        background:   '#0A0A0F',
        border: isTracking
          ? '1.5px solid #06B6D4'
          : '1.5px solid rgba(6,182,212,0.25)',
        boxShadow: isTracking
          ? '0 0 18px rgba(6,182,212,0.35), 0 0 40px rgba(6,182,212,0.1)'
          : '0 4px 24px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
        zIndex:     50,
      }}
    >
      {/* Webcam feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width:     '100%',
          height:    '100%',
          objectFit: 'cover',
          display:   'block',
          transform: 'scaleX(-1)',
        }}
      />

      {/* Overlay children — GestureHUD canvas goes here */}
      {children}

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && !error && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            style={{
              position:       'absolute',
              inset:          0,
              background:     '#0A0A0F',
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            8,
            }}
          >
            <Spinner />
            <span style={{ color: '#4B5563', fontSize: 10, letterSpacing: '0.05em' }}>
              Loading model...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      {error && (
        <div
          style={{
            position:       'absolute',
            inset:          0,
            background:     'rgba(10,10,15,0.95)',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            6,
            padding:        12,
          }}
        >
          <span style={{ fontSize: 22 }}>📷</span>
          <span style={{ color: '#EF4444', fontSize: 10, textAlign: 'center', lineHeight: 1.4 }}>
            {error?.name === 'NotAllowedError' ? 'Camera access denied' : 'Camera unavailable'}
          </span>
        </div>
      )}

      {/* Live tracking indicator dot */}
      {isTracking && !isLoading && (
        <div
          style={{
            position:     'absolute',
            top:          8,
            right:        8,
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   '#06B6D4',
            boxShadow:    '0 0 6px #06B6D4',
          }}
        />
      )}

      {/* Corner bracket decoration */}
      {CORNERS.map((c, i) => (
        <div
          key={i}
          style={{
            position:   'absolute',
            width:      10,
            height:     10,
            borderTop:  '1.5px solid rgba(6,182,212,0.5)',
            borderLeft: '1.5px solid rgba(6,182,212,0.5)',
            transform:  `rotate(${c.rotate}deg)`,
            ...c.pos,
          }}
        />
      ))}
    </div>
  )
}

const CORNERS = [
  { pos: { top: 6, left: 6 },     rotate: 0   },
  { pos: { top: 6, right: 6 },    rotate: 90  },
  { pos: { bottom: 6, right: 6 }, rotate: 180 },
  { pos: { bottom: 6, left: 6 },  rotate: 270 },
]

function Spinner() {
  return (
    <motion.div
      style={{
        width:        22,
        height:       22,
        border:       '2px solid rgba(6,182,212,0.15)',
        borderTop:    '2px solid #06B6D4',
        borderRadius: '50%',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
    />
  )
}
