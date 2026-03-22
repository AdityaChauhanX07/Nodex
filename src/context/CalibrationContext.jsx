import { createContext, useContext } from 'react'
import { useCalibrationState } from '../hooks/useCalibration.js'

const CalibrationContext = createContext(null)

export function CalibrationProvider({ children }) {
  const calibration = useCalibrationState()
  return (
    <CalibrationContext.Provider value={calibration}>
      {children}
    </CalibrationContext.Provider>
  )
}

export function useCalibration() {
  const ctx = useContext(CalibrationContext)
  if (!ctx) throw new Error('useCalibration must be used inside CalibrationProvider')
  return ctx
}
