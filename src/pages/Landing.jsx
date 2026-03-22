import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import FaceMeshSVG from '../components/FaceMeshSVG.jsx'

// ─── animation helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
})

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
}

// ─── data ─────────────────────────────────────────────────────────────────────
const features = [
  {
    icon:  '▶',
    title: 'YouTube Control',
    desc:  'Play, pause, skip, and adjust volume with head nods and eye blinks.',
    color: '#EF4444',
  },
  {
    icon:  '♫',
    title: 'Spotify Playback',
    desc:  'Control your music queue hands-free — next track, volume, and more.',
    color: '#22C55E',
  },
  {
    icon:  '⬛',
    title: 'Presentations',
    desc:  'Navigate PDF slides with subtle head gestures. Perfect for live demos.',
    color: '#06B6D4',
  },
]

const gestures = [
  { icon: '↑', gesture: 'Nod Up',        command: 'Volume Up'   },
  { icon: '↓', gesture: 'Nod Down',      command: 'Volume Down' },
  { icon: '←', gesture: 'Turn Left',     command: 'Pause'       },
  { icon: '→', gesture: 'Turn Right',    command: 'Play'        },
  { icon: '●', gesture: 'Eyes Closed',   command: 'Next Track'  },
  { icon: '○', gesture: 'Mouth Open',    command: 'Mute'        },
  { icon: '↺', gesture: 'Tilt Left',     command: 'Rewind 10s'  },
  { icon: '↻', gesture: 'Tilt Right',    command: 'Skip 10s'    },
]

// ─── component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()

  return (
    <motion.div
      className="page-wrapper"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 24px' }}
      >
        {/* Dot-grid background */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(rgba(124,58,237,0.25) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Atmospheric FaceMesh — huge, faded, slowly rotating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.09, rotate: 360 }}
          transition={{
            opacity: { duration: 2.5, ease: 'easeOut' },
            rotate:  { duration: 80, repeat: Infinity, ease: 'linear' },
          }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            x: '-50%', y: '-50%',
            pointerEvents: 'none',
            transformOrigin: 'center center',
          }}
        >
          <div style={{ transform: 'scale(3.2)', transformOrigin: 'center' }}>
            <FaceMeshSVG />
          </div>
        </motion.div>

        {/* Hero content */}
        <div
          style={{
            position: 'relative', zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            maxWidth: 680,
          }}
        >
          {/* Eyebrow */}
          <motion.p
            {...fadeUp(0.1)}
            style={{
              marginBottom: 24,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Hands-Free Media Control
          </motion.p>

          {/* Main headline */}
          <motion.h1
            {...fadeUp(0.22)}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(48px, 8vw, 76px)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 28,
            }}
          >
            Your{' '}
            <span
              style={{
                background: 'linear-gradient(120deg, #c4b5fd 0%, #f8fafc 60%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Face
            </span>
            {' '}Is the Remote
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.34)}
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 18,
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              maxWidth: 500,
              marginBottom: 44,
            }}
          >
            Control YouTube, Spotify, and presentations with facial gestures.
            No hands. No keyboard. No mouse.
          </motion.p>

          {/* CTA */}
          <motion.div {...fadeUp(0.46)}>
            <motion.button
              onClick={() => navigate('/play')}
              whileHover={{ scale: 1.04, boxShadow: '0 0 48px rgba(124,58,237,0.55)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          8,
                padding:      '16px 52px',
                borderRadius: 9999,
                border:       'none',
                background:   'var(--accent-purple)',
                color:        '#F8FAFC',
                fontFamily:   'Outfit, sans-serif',
                fontSize:     16,
                fontWeight:   700,
                cursor:       'pointer',
                letterSpacing:'0.01em',
                boxShadow:    '0 0 32px rgba(124,58,237,0.35)',
                transition:   'box-shadow 0.2s ease',
              }}
            >
              Get Started
              <span style={{ fontSize: 18 }}>→</span>
            </motion.button>

            <p style={{ marginTop: 16, fontSize: 13, color: '#374151', fontFamily: 'DM Sans, sans-serif' }}>
              No download required. Works entirely in your browser.
            </p>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          style={{
            position: 'absolute', bottom: 36,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ color: '#374151', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, #374151, transparent)' }}
          />
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            What You Can Control
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{
              textAlign: 'center',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(32px, 4vw, 44px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 64,
            }}
          >
            One System. Three Platforms.
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{
                  y: -4,
                  borderColor: `${f.color}70`,
                  boxShadow: `0 8px 40px ${f.color}18`,
                  transition: { duration: 0.2 },
                }}
                style={{
                  borderRadius: 18,
                  padding:      '36px 32px',
                  background:   'var(--bg-surface)',
                  border:       '1px solid rgba(255,255,255,0.06)',
                  cursor:       'default',
                  transition:   'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  background: `${f.color}18`,
                  color: f.color,
                  marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 10,
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: 'var(--text-secondary)',
                }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GESTURE REFERENCE STRIP ──────────────────────────────────────── */}
      <section
        style={{
          padding: '72px 24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Gesture Reference
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{
              textAlign: 'center',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(26px, 3vw, 36px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 48,
            }}
          >
            Intuitive by Design
          </motion.h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            {gestures.map((g, i) => (
              <motion.div
                key={g.gesture}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 12,
                  background: 'rgba(26,26,46,0.4)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span style={{
                  flexShrink: 0,
                  width: 32, height: 32,
                  borderRadius: 8,
                  background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                  color: '#A78BFA',
                  fontFamily: 'monospace',
                }}>
                  {g.icon}
                </span>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600, color: '#F8FAFC', marginBottom: 2 }}>
                    {g.gesture}
                  </div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {g.command}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#374151' }}>
          Built for Rhodes College Hackathon 2026
        </p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#1F2937' }}>
          Powered by MediaPipe &nbsp;&middot;&nbsp; Runs entirely in your browser
        </p>
      </footer>
    </motion.div>
  )
}
