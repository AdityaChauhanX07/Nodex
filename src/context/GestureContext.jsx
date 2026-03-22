import { createContext, useContext, useState } from 'react'

const GestureContext = createContext(null)

export function GestureProvider({ children }) {
  const [currentGesture, setCurrentGesture] = useState(null)
  const [confidence, setConfidence] = useState({})
  const [command, setCommand] = useState(null)
  const [latency, setLatency] = useState(null)

  const value = {
    currentGesture,
    setCurrentGesture,
    confidence,
    setConfidence,
    command,
    setCommand,
    latency,
    setLatency,
  }

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>
}

export function useGesture() {
  const ctx = useContext(GestureContext)
  if (!ctx) throw new Error('useGesture must be used inside GestureProvider')
  return ctx
}
