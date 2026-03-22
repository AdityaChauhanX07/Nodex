import { useRef, useState } from 'react'
import { useYouTube } from '../hooks/useYouTube.js'

export default function YouTubePlayer() {
  const { player, isReady, loadVideo } = useYouTube('yt-player')
  const [inputVal, setInputVal] = useState('')

  const handleLoad = () => {
    const id = extractVideoId(inputVal.trim())
    if (id) loadVideo(id)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* URL input */}
      <div className="flex gap-3 w-full max-w-xl">
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Paste YouTube URL or video ID…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
          onKeyDown={e => e.key === 'Enter' && handleLoad()}
        />
        <button
          onClick={handleLoad}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#EF4444' }}
        >
          Load
        </button>
      </div>

      {/* Player container */}
      <div
        id="yt-player"
        className="rounded-xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 640,
          aspectRatio: '16/9',
          background: '#12121A',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />

      {!isReady && (
        <p className="text-xs" style={{ color: '#4B5563' }}>YouTube player initializing…</p>
      )}

      {/* Manual controls */}
      {isReady && (
        <div className="flex gap-3">
          {[
            {
              label: '⏮',
              action: () => {
                const t = player.current?.getCurrentTime?.() ?? 0
                player.current?.seekTo?.(Math.max(0, t - 10), true)
              },
            },
            {
              label: '⏸ / ▶',
              action: () => {
                const s = player.current?.getPlayerState?.()
                s === 1 ? player.current?.pauseVideo?.() : player.current?.playVideo?.()
              },
            },
            { label: '⏭', action: () => player.current?.nextVideo?.() },
            {
              label: '🔇',
              action: () => {
                player.current?.isMuted?.() ? player.current?.unMute?.() : player.current?.mute?.()
              },
            },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function extractVideoId(input) {
  if (!input) return null
  const urlMatch = input.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (urlMatch) return urlMatch[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input
  return null
}
