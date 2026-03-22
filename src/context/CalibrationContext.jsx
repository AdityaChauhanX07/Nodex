import { createContext, useContext, useState, useCallback } from 'react'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'

const CalibrationContext = createContext(null)

const STORAGE_KEY = 'nodex_calibration'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function CalibrationProvider({ children }) {
  const [calibrationData, _setCalibrationData] = useState(() => loadStored())

  const setCalibrationData = useCallback(data => {
    _setCalibrationData(data)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [])

  const clearCalibration = useCallback(() => {
    _setCalibrationData(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = {
    calibrationData,
    setCalibrationData,
    clearCalibration,
    isCalibrated: calibrationData !== null,
    thresholds: calibrationData?.thresholds ?? DEFAULT_THRESHOLDS,
  }

  return <CalibrationContext.Provider value={value}>{children}</CalibrationContext.Provider>
}

export function useCalibration() {
  const ctx = useContext(CalibrationContext)
  if (!ctx) throw new Error('useCalibration must be used inside CalibrationProvider')
  return ctx
}
