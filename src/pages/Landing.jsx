import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import FaceMeshSVG from '../components/FaceMeshSVG.jsx'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

const features = [
  {
    icon: '▶',
    title: 'YouTube Control',
    desc: 'Play, pause, skip, and adjust volume with head nods and eye blinks.',
    color: '#EF4444',
  },
  {
    icon: '♫',
    title: 'Spotify Playback',
    desc: 'Control your music queue hands-free. Next track, volume, and more.',
    color: '#22C55E',
  },
  {
    icon: '⬜',
    title: 'Presentations',
    desc: 'Navigate PDF slides with subtle head gestures. Perfect for demos.',
    color: '#06B6D4',
  },
]

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
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Animated face mesh illustration */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <FaceMeshSVG />
          </motion.div>

          {/* Badge */}
          <motion.div
            className="mb-6 px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#A78BFA' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            ✦ Powered by MediaPipe Face Mesh
          </motion.div>

          {/* Main tagline */}
          <motion.h1
            className="text-6xl md:text-8xl font-extrabold leading-tight mb-6 text-glow-purple"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Your Face Is{' '}
            <span style={{ color: '#A78BFA' }}>the Remote</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl mb-10"
            style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            No hands. No keyboard. No mouse.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={() => navigate('/calibrate')}
            className="relative px-10 py-4 text-lg font-semibold rounded-xl text-white overflow-hidden glow-purple"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              fontFamily: 'Outfit, sans-serif',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(124,58,237,0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
            <span className="ml-2">→</span>
          </motion.button>

          {/* Scroll hint */}
          <motion.p
            className="mt-8 text-sm"
            style={{ color: '#4B5563' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Scroll to see features ↓
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Control Everything
          </motion.h2>
          <motion.p
            className="text-center mb-16"
            style={{ color: '#94A3B8' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            One gesture system. Three platforms.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="rounded-2xl p-8"
                style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ borderColor: `${f.color}60`, boxShadow: `0 0 30px ${f.color}20` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: `${f.color}20`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
                  {f.title}
                </h3>
                <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gesture map teaser */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold mb-8"
            style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Intuitive Gestures
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { gesture: 'Nod Up', command: 'Volume Up', icon: '↑' },
              { gesture: 'Nod Down', command: 'Volume Down', icon: '↓' },
              { gesture: 'Turn Left', command: 'Previous', icon: '←' },
              { gesture: 'Turn Right', command: 'Next / Skip', icon: '→' },
              { gesture: 'Both Eyes Closed', command: 'Play / Pause', icon: '●' },
              { gesture: 'Mouth Open', command: 'Mute', icon: '○' },
              { gesture: 'Tilt Left', command: 'Rewind 10s', icon: '↺' },
              { gesture: 'Tilt Right', command: 'Skip 10s', icon: '↻' },
            ].map((item, i) => (
              <motion.div
                key={item.gesture}
                className="rounded-xl p-4 text-center"
                style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="text-2xl mb-2" style={{ color: '#A78BFA' }}>{item.icon}</div>
                <div className="text-xs font-semibold mb-1" style={{ color: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>{item.gesture}</div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>{item.command}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#4B5563', fontSize: '0.875rem' }}>
        <p>Nodex — Built with MediaPipe &amp; React. Runs entirely in your browser.</p>
      </footer>
    </motion.div>
  )
}
