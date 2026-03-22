import { useState } from 'react'

/**
 * useSpotify — placeholder for Spotify Web Playback SDK integration.
 * Requires a Spotify Premium account and a registered app client ID.
 */
export function useSpotify({ clientId = '' } = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPaused, setIsPaused] = useState(true)

  const connect = () => {
    console.warn('[useSpotify] Spotify integration requires a client ID and Premium account.')
    alert(
      'Spotify integration requires a Spotify Premium account and a registered Client ID.\n\nSee README for setup instructions.'
    )
  }

  const play = () => { console.log('[useSpotify] play') }
  const pause = () => { console.log('[useSpotify] pause') }
  const next = () => { console.log('[useSpotify] next') }
  const prev = () => { console.log('[useSpotify] prev') }
  const setVolume = vol => { console.log('[useSpotify] setVolume', vol) }

  return { isConnected, currentTrack, isPaused, connect, play, pause, next, prev, setVolume }
}
