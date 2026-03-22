import { useEffect, useState } from 'react'
import { useYouTube } from '../hooks/useYouTube.js'
import { COMMANDS } from '../constants/commands.js'

/**
 * YouTubePlayer
 *
 * Props:
 *   command     — current COMMANDS.* value from useGestures
 *   commandTime — timestamp; changes on every fire so the effect re-runs
 *
 * Gesture commands are only dispatched once a video has been loaded.
 * Before that, the #yt-player div stays in the DOM (the YT API needs it)
 * but is hidden behind a placeholder so no "An error occurred" frame shows.
 */
export default function YouTubePlayer({ command, commandTime }) {
  const {
    player, isReady, loadVideo,
    play, pause, volumeUp, volumeDown, skipForward, skipBack,
  } = useYouTube('yt-player')

  const [inputVal,    setInputVal]    = useState('')
  const [videoLoaded, setVideoLoaded] = useState(false)

  // Dispatch gesture commands only after a video is actually loaded
  useEffect(() => {
    if (!isReady || !videoLoaded || !command || command === COMMANDS.NONE) return
    switch (command) {
      case COMMANDS.PLAY:      play();       break
      case COMMANDS.PAUSE:     pause();      break
      case COMMANDS.VOL_UP:    volumeUp();   break
      case COMMANDS.VOL_DOWN:  volumeDown(); break
      case COMMANDS.MUTE:
        player.current?.isMuted?.() ? player.current.unMute?.() : player.current?.mute?.()
        break
      case COMMANDS.NEXT: {
        const dur = player.current?.getDuration?.() ?? 0
        if (dur > 0) player.current?.seekTo?.(dur * 0.8, true)
        break
      }
      case COMMANDS.REWIND: skipBack(10);    break
      case COMMANDS.SKIP:   skipForward(10); break
      default: break
    }
  }, [commandTime]) // commandTime changes on every fire — intentional

  const handleLoad = () => {
    const id = extractVideoId(inputVal.trim())
    if (!id) return
    loadVideo(id)
    setVideoLoaded(true)
  }

  return (
    <div>
      {/* Compact URL bar — visible above the player once a video is loaded */}
      {videoLoaded && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="Paste YouTube URL..."
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 8, outline: 'none',
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#F8FAFC', fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
          <button
            onClick={handleLoad}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'var(--accent-purple)', color: '#F8FAFC',
              fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Load
          </button>
        </div>
      )}

      {/* 16:9 player area */}
      <div style={{
        position:     'relative',
        width:        '100%',
        aspectRatio:  '16/9',
        borderRadius: 12,
        overflow:     'hidden',
        background:   'var(--bg-surface)',
        border:       '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* YouTube iframe target — always in DOM so the API can attach */}
        <div
          id="yt-player"
          style={{
            position:      'absolute',
            inset:         0,
            opacity:       videoLoaded ? 1 : 0,
            pointerEvents: videoLoaded ? 'auto' : 'none',
          }}
        />

        {/* Placeholder — shown before any URL is loaded */}
        {!videoLoaded && (
          <div style={{
            position:       'absolute',
            inset:          0,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            24,
            padding:        24,
          }}>
            {/* Play icon */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="31" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"/>
              <path d="M26 21l20 11-20 11V21z" fill="rgba(255,255,255,0.14)"/>
            </svg>

            <p style={{
              margin: 0, textAlign: 'center',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14,
              color: 'var(--text-secondary)',
            }}>
              Enter a YouTube URL to start watching
            </p>

            {/* URL input centered in placeholder */}
            <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 420 }}>
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLoad()}
                placeholder="Paste YouTube URL..."
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 8, outline: 'none',
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#F8FAFC', fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              />
              <button
                onClick={handleLoad}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'var(--accent-purple)', color: '#F8FAFC',
                  fontSize: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Load
              </button>
            </div>
          </div>
        )}
      </div>
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
