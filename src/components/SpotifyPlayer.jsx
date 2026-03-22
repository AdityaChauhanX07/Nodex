import { motion } from 'framer-motion'
import { useSpotify } from '../hooks/useSpotify.js'

export default function SpotifyPlayer() {
  const { isConnected, currentTrack, connect } = useSpotify()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
          style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}
        >
          ♫
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
          Connect Spotify
        </h2>
        <p className="text-center mb-8 max-w-sm" style={{ color: '#94A3B8' }}>
          Requires a Spotify Premium account and a registered Spotify app client ID.
        </p>
        <button
          onClick={connect}
          className="px-8 py-3 rounded-xl font-semibold text-white"
          style={{ background: '#22C55E' }}
        >
          Connect Spotify
        </button>
        <p className="mt-4 text-xs" style={{ color: '#4B5563' }}>
          Spotify Web Playback SDK integration — placeholder
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div
        className="w-48 h-48 rounded-2xl flex items-center justify-center"
        style={{ background: '#12121A', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <span className="text-7xl">♫</span>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#F8FAFC' }}>
          {currentTrack?.name ?? 'No track playing'}
        </h2>
        <p style={{ color: '#94A3B8' }}>{currentTrack?.artist ?? '—'}</p>
      </div>
    </div>
  )
}
