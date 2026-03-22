import { useState, useEffect, useRef, useCallback } from 'react'
import {
  computeYaw,
  computePitch,
  computeRoll,
  computeEAR,
  computeMouthRatio,
} from '../utils/gestureLogic.js'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'

const STORAGE_KEY         = 'nodex_calibration'
const CAPTURE_DURATION_MS = 3000

export const VERIFY_TESTS = [
  { name: 'head-left',  label: 'Turn your head LEFT',  icon: '←' },
  { name: 'head-right', label: 'Turn your head RIGHT', icon: '→' },
  { name: 'head-up',    label: 'Look UP',              icon: '↑' },
  { name: 'mouth-open', label: 'Open your MOUTH wide', icon: '○' },
]

/**
 * useCalibrationState — all calibration logic.
 * Consumed by CalibrationContext to make state globally available.
 */
export function useCalibrationState() {
  const [phase,             setPhase]             = useState('idle')
  const [calibrationData,   setCalibrationData]   = useState(null)
  const [capturedBaselines, setCapturedBaselines] = useState(null)
  const [isCalibrated,      setIsCalibrated]      = useState(false)
  const [captureProgress,   setCaptureProgress]   = useState(0)
  const [captureCountdown,  setCaptureCountdown]  = useState(3)
  const [verifyStep,        setVerifyStep]        = useState(0)
  const [verifyResults,     setVerifyResults]     = useState([])
  const [verifyProgress,    setVerifyProgress]    = useState(0)

  // Refs — safe to read inside callbacks without stale closure issues
  const phaseRef         = useRef('idle')
  const baselinesRef     = useRef(null)
  const verifyStepRef    = useRef(0)
  const verifyFiredRef   = useRef(false)
  const framesRef        = useRef([])
  const captureStartRef  = useRef(null)

  // ── Load from localStorage on mount ────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (!data?.baseline) return
      baselinesRef.current = data.baseline
      phaseRef.current     = 'done'
      setCalibrationData(data)
      setIsCalibrated(true)
      setPhase('done')
    } catch {}
  }, [])

  // ── Capture phase ───────────────────────────────────────────────────────────
  const startCapture = useCallback(() => {
    framesRef.current       = []
    captureStartRef.current = Date.now()
    phaseRef.current        = 'capturing'
    setCaptureProgress(0)
    setCaptureCountdown(3)
    setCapturedBaselines(null)
    setVerifyStep(0)
    setVerifyResults([])
    setVerifyProgress(0)
    setPhase('capturing')
  }, [])

  // Called each frame while phase === 'capturing'
  const addFrame = useCallback((landmarks) => {
    if (phaseRef.current !== 'capturing') return
    if (!landmarks?.length) return

    const yaw   = computeYaw(landmarks)
    const pitch = computePitch(landmarks)
    const roll  = computeRoll(landmarks)
    const ear   = computeEAR(landmarks)
    const mouth = computeMouthRatio(landmarks)
    framesRef.current.push({ yaw, pitch, roll, ear, mouth })

    const elapsed   = Date.now() - captureStartRef.current
    const progress  = Math.min(1, elapsed / CAPTURE_DURATION_MS)
    const countdown = elapsed < 1000 ? 3 : elapsed < 2000 ? 2 : 1

    setCaptureProgress(progress)
    setCaptureCountdown(countdown)

    if (elapsed >= CAPTURE_DURATION_MS) {
      phaseRef.current = 'transitioning' // prevent re-entry before state update
      _completeCapture()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function _completeCapture() {
    const frames = framesRef.current
    if (frames.length < 5) {
      phaseRef.current = 'capturing'
      return
    }
    const avg = (key) => frames.reduce((s, f) => s + f[key], 0) / frames.length
    const bl  = {
      yaw:   avg('yaw'),
      pitch: avg('pitch'),
      roll:  avg('roll'),
      ear:   avg('ear'),
      mouth: avg('mouth'),
    }
    baselinesRef.current   = bl
    verifyStepRef.current  = 0
    verifyFiredRef.current = false
    phaseRef.current       = 'verifying'
    setCapturedBaselines(bl)
    setVerifyStep(0)
    setVerifyResults([])
    setVerifyProgress(0)
    setPhase('verifying')
  }

  // ── Verify phase ────────────────────────────────────────────────────────────
  // Called each frame while phase === 'verifying'. Returns { detected, progress }.
  const addVerifyFrame = useCallback((landmarks) => {
    if (phaseRef.current !== 'verifying') return { detected: false, progress: 0 }
    const bl = baselinesRef.current
    if (!bl || !landmarks?.length) return { detected: false, progress: 0 }

    const stepIdx = verifyStepRef.current
    if (stepIdx >= VERIFY_TESTS.length) return { detected: false, progress: 0 }

    const T    = DEFAULT_THRESHOLDS
    const test = VERIFY_TESTS[stepIdx]
    const yaw   = computeYaw(landmarks)        - bl.yaw
    const pitch = computePitch(landmarks)      - bl.pitch
    const mouth = computeMouthRatio(landmarks) - bl.mouth

    let detected = false
    let progress = 0

    switch (test.name) {
      case 'head-left':
        progress = Math.min(1, Math.max(0, -yaw)   / T.yaw)
        detected = yaw < -T.yaw
        break
      case 'head-right':
        progress = Math.min(1, Math.max(0,  yaw)   / T.yaw)
        detected = yaw > T.yaw
        break
      case 'head-up':
        progress = Math.min(1, Math.max(0,  pitch) / T.pitch)
        detected = pitch > T.pitch
        break
      case 'mouth-open':
        progress = Math.min(1, Math.max(0,  mouth) / T.mouthOpen)
        detected = mouth > T.mouthOpen
        break
      default:
        break
    }

    setVerifyProgress(progress)
    return { detected, progress }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const markVerifyPassed = useCallback(() => {
    if (verifyFiredRef.current) return
    verifyFiredRef.current = true
    setVerifyResults(prev => [...prev, true])

    setTimeout(() => {
      const next = verifyStepRef.current + 1
      verifyStepRef.current  = next
      verifyFiredRef.current = false
      setVerifyProgress(0)
      setVerifyStep(next)
      if (next >= VERIFY_TESTS.length) _finalize()
    }, 600)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const skipVerifyStep = useCallback(() => {
    if (verifyFiredRef.current) return
    verifyFiredRef.current = true
    setVerifyResults(prev => [...prev, false])
    const next = verifyStepRef.current + 1
    verifyStepRef.current  = next
    verifyFiredRef.current = false
    setVerifyProgress(0)
    setVerifyStep(next)
    if (next >= VERIFY_TESTS.length) _finalize()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function _finalize() {
    const bl = baselinesRef.current
    if (!bl) return
    const data = {
      baseline:     bl,
      thresholds:   DEFAULT_THRESHOLDS,
      calibratedAt: Date.now(),
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
    phaseRef.current = 'done'
    setCalibrationData(data)
    setIsCalibrated(true)
    setPhase('done')
  }

  const reset = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    baselinesRef.current    = null
    phaseRef.current        = 'idle'
    verifyStepRef.current   = 0
    verifyFiredRef.current  = false
    framesRef.current       = []
    captureStartRef.current = null
    setCalibrationData(null)
    setCapturedBaselines(null)
    setIsCalibrated(false)
    setPhase('idle')
    setVerifyStep(0)
    setVerifyResults([])
    setCaptureProgress(0)
    setCaptureCountdown(3)
    setVerifyProgress(0)
  }, [])

  // Expose whichever baselines are currently available
  const baselines = calibrationData?.baseline ?? capturedBaselines

  return {
    phase,
    baselines,
    calibrationData,
    isCalibrated,
    captureProgress,
    captureCountdown,
    verifyStep,
    verifyResults,
    verifyProgress,
    VERIFY_TESTS,
    startCapture,
    addFrame,
    addVerifyFrame,
    markVerifyPassed,
    skipVerifyStep,
    reset,
  }
}
