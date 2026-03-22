import { useEffect, useRef, useState } from 'react'
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
    player, isReady, loadPlaylist,
    play, pause, volumeUp, volumeDown, skipForward, skipBack,
  } = useYouTube('yt-player')

  const [inputVal,     setInputVal]     = useState('')
  const [videoLoaded,  setVideoLoaded]  = useState(false)
  const [queue,        setQueue]        = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const queueRef = useRef([])
  const indexRef = useRef(0)
  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { indexRef.current = currentIndex }, [currentIndex])

  // Dispatch gesture commands only after a video is actually loaded
  useEffect(() => {
    if (!isReady || !videoLoaded || !command || command === COMMANDS.NONE) return
    switch (command) {
      case COMMANDS.PLAY: {
        const state = player.current?.getPlayerState?.()
        state === 1 ? pause() : play()
        break
      }
      case COMMANDS.PREV: {
        const q = queueRef.current
        if (q.length > 1) {
          const prev = (indexRef.current - 1 + q.length) % q.length
          indexRef.current = prev
          setCurrentIndex(prev)
          loadPlaylist(q, prev)
        } else {
          skipBack(10)
        }
        break
      }
      case COMMANDS.NEXT: {
        const q = queueRef.current
        if (q.length > 1) {
          const next = (indexRef.current + 1) % q.length
          indexRef.current = next
          setCurrentIndex(next)
          loadPlaylist(q, next)
        }
        break
      }
      case COMMANDS.REWIND:
        skipBack(10)
        break
      case COMMANDS.SKIP:
        skipForward(10)
        break
      case COMMANDS.VOL_UP:    volumeUp();   break
      case COMMANDS.VOL_DOWN:  volumeDown(); break
      case COMMANDS.MUTE:
        player.current?.isMuted?.() ? player.current.unMute?.() : player.current?.mute?.()
        break
      default: break
    }
  }, [commandTime]) // commandTime changes on every fire — intentional

  const handlePlayNow = () => {
    const id = extractVideoId(inputVal.trim())
    if (!id) return
    const newQueue = [id]
    setQueue(newQueue)
    setInputVal('')
    setVideoLoaded(true)
    loadPlaylist(newQueue, 0)
    setCurrentIndex(0)
  }

  const handleAddToQueue = () => {
    const id = extractVideoId(inputVal.trim())
    if (!id) return
    const newQueue = [...queue, id]
    setQueue(newQueue)
    setInputVal('')
    if (!videoLoaded) {
      setVideoLoaded(true)
      loadPlaylist(newQueue, 0)
      setCurrentIndex(0)
    }
  }

  const goToQueueIndex = (clickedIndex) => {
    indexRef.current = clickedIndex
    setCurrentIndex(clickedIndex)
    loadPlaylist(queue, clickedIndex)
  }

  const removeFromQueue = (i) => {
    const newQueue = queue.filter((_, j) => j !== i)
    setQueue(newQueue)
    if (newQueue.length === 0) {
      setVideoLoaded(false)
      setCurrentIndex(0)
      indexRef.current = 0
      return
    }
    let newIdx = currentIndex
    if (i < currentIndex) newIdx = currentIndex - 1
    else if (i === currentIndex) newIdx = Math.min(currentIndex, newQueue.length - 1)
    setCurrentIndex(newIdx)
    indexRef.current = newIdx
    loadPlaylist(newQueue, newIdx)
  }

  const inputStyleCompact = {
    flex: 1, padding: '8px 14px', borderRadius: 8, outline: 'none',
    background: 'var(--bg-elevated)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: '#F8FAFC', fontSize: 13,
    fontFamily: 'DM Sans, sans-serif',
  }
  const inputStyleLarge = {
    flex: 1, padding: '10px 16px', borderRadius: 8, outline: 'none',
    background: 'var(--bg-elevated)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: '#F8FAFC', fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
  }
  const btnStyleCompact = {
    padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'var(--accent-purple)', color: '#F8FAFC',
    fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
    flexShrink: 0,
  }
  const btnStyleLarge = {
    padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'var(--accent-purple)', color: '#F8FAFC',
    fontSize: 13, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
    flexShrink: 0,
  }

  const urlBar = (compact) => (
    <div style={{ display: 'flex', gap: 8, marginBottom: compact ? 12 : 0, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handlePlayNow()}
        placeholder="Paste YouTube URL..."
        style={compact ? inputStyleCompact : inputStyleLarge}
      />
      <button type="button" onClick={handlePlayNow} style={compact ? btnStyleCompact : btnStyleLarge}>
        Play Now
      </button>
      <button type="button" onClick={handleAddToQueue} style={compact ? btnStyleCompact : btnStyleLarge}>
        Add to Queue
      </button>
    </div>
  )

  return (
    <div>
      {videoLoaded && urlBar(true)}

      <div style={{
        position:     'relative',
        width:        '100%',
        aspectRatio:  '16/9',
        borderRadius: 12,
        overflow:     'hidden',
        background:   'var(--bg-surface)',
        border:       '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          position:      'absolute',
          inset:         0,
          opacity:       videoLoaded ? 1 : 0,
          pointerEvents: videoLoaded ? 'auto' : 'none',
        }}>
          <div id="yt-player" style={{ width: '100%', height: '100%' }} />
        </div>

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520 }}>
              {urlBar(false)}
            </div>
          </div>
        )}
      </div>

      {queue.length > 1 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {queue.map((vidId, i) => (
            <div
              key={`${vidId}-${i}`}
              role="button"
              tabIndex={0}
              onClick={() => goToQueueIndex(i)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && goToQueueIndex(i)}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            12,
                padding:        8,
                borderRadius:   8,
                cursor:         'pointer',
                border:         i === currentIndex ? '2px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.08)',
                background:     'var(--bg-elevated)',
              }}
            >
              <span style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)', minWidth: 24,
              }}>
                {i + 1}
              </span>
              <img
                alt=""
                src={`https://img.youtube.com/vi/${vidId}/mqdefault.jpg`}
                style={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
              />
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', wordBreak: 'break-all' }}>
                {vidId}
              </span>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeFromQueue(i) }}
                aria-label="Remove from queue"
                style={{
                  border: 'none', background: 'rgba(255,255,255,0.08)', color: '#F8FAFC',
                  width: 32, height: 32, borderRadius: 6, cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
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
