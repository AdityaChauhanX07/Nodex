import { useEffect, useRef, useState } from 'react'

let ytAPIReady = false
let ytAPICallbacks = []

function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    ytAPIReady = true
    return
  }
  if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
  window.onYouTubeIframeAPIReady = () => {
    ytAPIReady = true
    ytAPICallbacks.forEach(cb => cb())
    ytAPICallbacks = []
  }
}

loadYouTubeAPI()

export function useYouTube(containerId) {
  const player = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const initPlayer = () => {
      if (cancelled) return

      // Make sure the DOM element exists
      const el = document.getElementById(containerId)
      if (!el) {
        // Element not in DOM yet, retry on next tick
        setTimeout(initPlayer, 50)
        return
      }

      // Destroy any existing player
      if (player.current) {
        try { player.current.destroy() } catch (_) {}
        player.current = null
      }

      player.current = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (!cancelled) {
              // Force iframe to fill parent container
              const iframe = event.target.getIframe()
              if (iframe) {
                iframe.style.width = '100%'
                iframe.style.height = '100%'
                iframe.style.position = 'absolute'
                iframe.style.inset = '0'
              }
              console.log('[YT] player is ready, iframe:', iframe)
              setIsReady(true)
            }
          },
          onError: (e) => console.error('[YT] player error:', e.data),
        },
      })
    }

    if (ytAPIReady) {
      initPlayer()
    } else {
      ytAPICallbacks.push(initPlayer)
    }

    return () => {
      cancelled = true
      setIsReady(false)
      try { player.current?.destroy?.() } catch (_) {}
      player.current = null
    }
  }, [containerId])

  const loadVideo = (videoId) => {
    console.log('[YT] loadVideo called, isReady:', !!player.current, videoId)
    if (!player.current) return
    try {
      player.current.loadVideoById(videoId)
    } catch (e) {
      console.error('[YT] loadVideoById error:', e)
      setTimeout(() => {
        player.current?.loadVideoById?.(videoId)
      }, 500)
    }
  }

  const loadPlaylist = (videoIds, startIndex = 0) => {
    if (!player.current) return
    try {
      player.current.loadPlaylist({
        playlist: videoIds,
        index: startIndex,
        startSeconds: 0,
      })
    } catch (e) {
      console.error('[YT] loadPlaylist error:', e)
    }
  }

  const play        = () => player.current?.playVideo?.()
  const pause       = () => player.current?.pauseVideo?.()
  const mute        = () => player.current?.mute?.()
  const unmute      = () => player.current?.unMute?.()
  const volumeUp    = () => {
    const v = player.current?.getVolume?.() ?? 50
    player.current?.setVolume?.(Math.min(100, v + 10))
  }
  const volumeDown  = () => {
    const v = player.current?.getVolume?.() ?? 50
    player.current?.setVolume?.(Math.max(0, v - 10))
  }
  const skipForward = (sec = 10) => {
    const t = player.current?.getCurrentTime?.() ?? 0
    player.current?.seekTo?.(t + sec, true)
  }
  const skipBack    = (sec = 10) => {
    const t = player.current?.getCurrentTime?.() ?? 0
    player.current?.seekTo?.(Math.max(0, t - sec), true)
  }

  return { player, isReady, loadVideo, loadPlaylist, play, pause, mute, unmute,
           volumeUp, volumeDown, skipForward, skipBack }
}
