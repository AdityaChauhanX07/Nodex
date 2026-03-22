import { motion } from 'framer-motion'

// Key face landmark positions (normalized 0-1, mapped to SVG coords)
const LANDMARKS = [
  // Forehead
  { id: 'forehead', x: 120, y: 30 },
  // Eyes
  { id: 'l-eye-outer', x: 80, y: 80 },
  { id: 'l-eye-inner', x: 100, y: 78 },
  { id: 'l-eye-top', x: 90, y: 72 },
  { id: 'l-eye-bot', x: 90, y: 88 },
  { id: 'r-eye-outer', x: 160, y: 80 },
  { id: 'r-eye-inner', x: 140, y: 78 },
  { id: 'r-eye-top', x: 150, y: 72 },
  { id: 'r-eye-bot', x: 150, y: 88 },
  // Nose
  { id: 'nose-tip', x: 120, y: 115 },
  { id: 'nose-l', x: 105, y: 122 },
  { id: 'nose-r', x: 135, y: 122 },
  // Mouth
  { id: 'mouth-l', x: 95, y: 148 },
  { id: 'mouth-r', x: 145, y: 148 },
  { id: 'mouth-top', x: 120, y: 140 },
  { id: 'mouth-bot', x: 120, y: 160 },
  // Jaw / chin
  { id: 'jaw-l', x: 60, y: 140 },
  { id: 'jaw-r', x: 180, y: 140 },
  { id: 'chin', x: 120, y: 190 },
  // Cheek dots
  { id: 'cheek-l', x: 68, y: 110 },
  { id: 'cheek-r', x: 172, y: 110 },
  // Brow
  { id: 'brow-l', x: 82, y: 62 },
  { id: 'brow-r', x: 158, y: 62 },
]

const meshLines = [
  // Face outline
  'M60,140 Q70,60 120,30 Q170,60 180,140 Q165,185 120,195 Q75,185 60,140',
  // Eye outlines
  'M80,80 Q90,72 100,78 Q90,88 80,80',
  'M160,80 Q150,72 140,78 Q150,88 160,80',
  // Nose bridge
  'M120,70 L120,115',
  // Nose wings
  'M105,122 Q120,115 135,122',
  // Mouth
  'M95,148 Q120,158 145,148 Q120,142 95,148',
  // Eyebrow lines
  'M75,58 Q90,54 105,60',
  'M135,60 Q150,54 165,58',
  // Inner mesh lines
  'M90,80 L105,122',
  'M150,80 L135,122',
  'M105,122 L95,148',
  'M135,122 L145,148',
  'M60,140 L95,148',
  'M180,140 L145,148',
  'M120,195 L95,148',
  'M120,195 L145,148',
]

export default function FaceMeshSVG() {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Outer glow ring */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 12px rgba(124,58,237,0.4))' }}
      >
        {/* Mesh lines */}
        {meshLines.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="rgba(124,58,237,0.4)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: i * 0.08, ease: 'easeInOut' }}
          />
        ))}

        {/* Landmark dots */}
        {LANDMARKS.map((lm, i) => (
          <motion.circle
            key={lm.id}
            cx={lm.x}
            cy={lm.y}
            r={2}
            fill={i % 3 === 0 ? '#06B6D4' : '#A78BFA'}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              delay: 0.8 + i * 0.05,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Scanning line — animate y via transform, not SVG presentation attrs */}
        <motion.rect
          x="30"
          width="180"
          height="1"
          fill="rgba(6,182,212,0.6)"
          animate={{ y: [20, 200, 20] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Corner brackets */}
      {[
        { top: 0, left: 0, rotate: 0 },
        { top: 0, right: 0, rotate: 90 },
        { bottom: 0, right: 0, rotate: 180 },
        { bottom: 0, left: 0, rotate: 270 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderTop: '2px solid #06B6D4',
            borderLeft: '2px solid #06B6D4',
            transform: `rotate(${pos.rotate}deg)`,
            ...pos,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </div>
  )
}
