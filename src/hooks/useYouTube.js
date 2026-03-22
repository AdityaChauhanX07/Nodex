import { useEffect, useRef, useState } from 'react'

let ytAPILoaded = false
let ytAPICallbacks = []

function loadYouTubeAPI() {
  if (ytAPILoaded) return
  ytAPILoaded = true
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
  window.onYouTubeIframeAPIReady = () => {
    ytAPICallbacks.forEach(cb => cb())
    ytAPICallbacks = []
  }
}

function whenYTReady(cb) {
  if (window.YT && window.YT.Player) {
    cb()
    return
  }
  ytAPICallbacks.push(cb)
  loadYouTubeAPI()
}

export function useYouTube(containerId) {
  const player = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    whenYTReady(() => {
      if (player.current) return
      player.current = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        playerVars: { autoplay: 0, controls: 1 },
        events: {
          onReady: () => setIsReady(true),
        },
      })
    })
    return () => {
      player.current?.destroy?.()
      player.current = null
    }
  }, [containerId])

  const loadVideo = videoId => {
    player.current?.loadVideoById?.(videoId)
  }

  const play = () => player.current?.playVideo?.()
  const pause = () => player.current?.pauseVideo?.()
  const mute = () => player.current?.mute?.()
  const unmute = () => player.current?.unMute?.()
  const volumeUp = () => {
    const v = player.current?.getVolume?.() ?? 50
    player.current?.setVolume?.(Math.min(100, v + 10))
  }
  const volumeDown = () => {
    const v = player.current?.getVolume?.() ?? 50
    player.current?.setVolume?.(Math.max(0, v - 10))
  }
  const skipForward = (sec = 10) => {
    const t = player.current?.getCurrentTime?.() ?? 0
    player.current?.seekTo?.(t + sec, true)
  }
  const skipBack = (sec = 10) => {
    const t = player.current?.getCurrentTime?.() ?? 0
    player.current?.seekTo?.(Math.max(0, t - sec), true)
  }

  return { player, isReady, loadVideo, play, pause, mute, unmute, volumeUp, volumeDown, skipForward, skipBack }
}
