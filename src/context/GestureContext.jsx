import { createContext, useContext, useState } from 'react'
import { GESTURES } from '../constants/gestures.js'
import { COMMANDS } from '../constants/commands.js'
import { DEFAULT_GESTURE_MAP } from '../constants/defaults.js'

const GestureContext = createContext(null)

export function GestureProvider({ children }) {
  const [currentGesture,  setCurrentGesture]  = useState(GESTURES.NONE)
  const [currentCommand,  setCurrentCommand]  = useState(COMMANDS.NONE)
  const [lastCommand,     setLastCommand]     = useState(COMMANDS.NONE)
  const [lastCommandTime, setLastCommandTime] = useState(null)
  const [confidence,      setConfidence]      = useState(0)
  const [metrics,         setMetrics]         = useState({ yaw: 0, pitch: 0, roll: 0, ear: 0, mouth: 0 })
  const [gestureMap,      setGestureMap]      = useState(DEFAULT_GESTURE_MAP)

  const value = {
    currentGesture,  setCurrentGesture,
    currentCommand,  setCurrentCommand,
    lastCommand,     setLastCommand,
    lastCommandTime, setLastCommandTime,
    confidence,      setConfidence,
    metrics,         setMetrics,
    gestureMap,      setGestureMap,
  }

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>
}

export function useGesture() {
  const ctx = useContext(GestureContext)
  if (!ctx) throw new Error('useGesture must be used inside GestureProvider')
  return ctx
}
