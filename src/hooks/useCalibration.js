import { useState, useCallback } from 'react'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'

const STORAGE_KEY = 'nodex_calibration'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useCalibration() {
  const [calibrationData, _setCalibrationData] = useState(() => loadFromStorage())

  const setCalibrationData = useCallback(data => {
    _setCalibrationData(data)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('[useCalibration] storage error:', err)
    }
  }, [])

  const clearCalibration = useCallback(() => {
    _setCalibrationData(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const isCalibrated = calibrationData !== null
  const thresholds = calibrationData?.thresholds ?? DEFAULT_THRESHOLDS

  return { calibrationData, setCalibrationData, clearCalibration, isCalibrated, thresholds }
}
