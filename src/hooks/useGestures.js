import { useState, useEffect, useRef } from 'react'
import {
  computeYaw, computePitch, computeRoll, computeEAR, computeMouthRatio,
} from '../utils/gestureLogic.js'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'
import { GESTURES } from '../constants/gestures.js'
import { COMMANDS } from '../constants/commands.js'
import {
  DEFAULT_GESTURE_MAP,
  DEFAULT_COOLDOWN_MS,
  EYE_CLOSE_MIN_MS,
} from '../constants/defaults.js'
import { Cooldown } from '../utils/cooldown.js'

/**
 * useGestures — the gesture detection brain.
 *
 * Consumes raw landmarks each frame, applies calibration offsets, runs
 * threshold + hysteresis logic, handles eye-close timing, manages per-gesture
 * cooldowns, and emits commands.
 *
 * Returns:
 *   currentGesture   — active gesture name  (GESTURES.NONE when idle)
 *   currentCommand   — command that fired   (COMMANDS.NONE ~800 ms after firing)
 *   confidence       — 0-1 float, how far past the threshold
 *   metrics          — { yaw, pitch, roll, ear, mouth } raw values
 *   lastCommand      — most recent non-NONE command (persists)
 *   lastCommandTime  — Date.now() timestamp of lastCommand
 */
export function useGestures({
  landmarks,
  calibration = null,
  gestureMap  = DEFAULT_GESTURE_MAP,
  thresholds  = DEFAULT_THRESHOLDS,
} = {}) {
  const [currentGesture,  setCurrentGesture]  = useState(GESTURES.NONE)
  const [currentCommand,  setCurrentCommand]  = useState(COMMANDS.NONE)
  const [confidence,      setConfidence]      = useState(0)
  const [metrics,         setMetrics]         = useState({ yaw: 0, pitch: 0, roll: 0, ear: 0, mouth: 0 })
  const [lastCommand,     setLastCommand]     = useState(COMMANDS.NONE)
  const [lastCommandTime, setLastCommandTime] = useState(null)

  // Mutable refs — never trigger re-renders on their own
  const cooldownsRef     = useRef(null)
  const activeGestureRef = useRef(GESTURES.NONE) // sustained head/mouth gesture
  const eyeCloseStartRef = useRef(null)           // when EAR first fell below threshold
  const eyeCloseFiredRef = useRef(false)          // prevents double-firing per close
  const commandTimerRef  = useRef(null)

  // Initialise one Cooldown instance per gesture (once)
  if (!cooldownsRef.current) {
    cooldownsRef.current = Object.fromEntries(
      Object.values(GESTURES).map(g => [g, new Cooldown(DEFAULT_COOLDOWN_MS)])
    )
  }

  // Keep latest prop values accessible inside the effect without adding them
  // as deps (avoids infinite loops when callers pass inline objects)
  const thresholdsRef  = useRef(thresholds)
  const gestureMapRef  = useRef(gestureMap)
  const calibrationRef = useRef(calibration)
  thresholdsRef.current  = thresholds
  gestureMapRef.current  = gestureMap
  calibrationRef.current = calibration

  useEffect(() => {
    if (!landmarks?.length) return

    const T   = thresholdsRef.current
    const H   = T.hysteresis ?? 2
    const cal = calibrationRef.current
    const map = gestureMapRef.current

    // 1. Compute raw metrics
    let yaw   = computeYaw(landmarks)
    let pitch = computePitch(landmarks)
    let roll  = computeRoll(landmarks)
    const ear   = computeEAR(landmarks)
    const mouth = computeMouthRatio(landmarks)

    // 2. Apply calibration baseline offsets
    if (cal?.baseline) {
      yaw   -= cal.baseline.yaw   ?? 0
      pitch -= cal.baseline.pitch ?? 0
      roll  -= cal.baseline.roll  ?? 0
    }

    setMetrics({ yaw, pitch, roll, ear, mouth })

    // Helper: emit a command, start the 800 ms display timer
    const fireCommand = (gesture) => {
      const cmd = map[gesture] ?? COMMANDS.NONE
      if (cmd === COMMANDS.NONE) return
      cooldownsRef.current[gesture].fire()
      setCurrentCommand(cmd)
      setLastCommand(cmd)
      setLastCommandTime(Date.now())
      clearTimeout(commandTimerRef.current)
      commandTimerRef.current = setTimeout(
        () => setCurrentCommand(COMMANDS.NONE),
        800
      )
    }

    // 3. Eye-close timing (filters normal blinks < EYE_CLOSE_MIN_MS)
    const eyesClosed = ear < T.earClose
    if (eyesClosed) {
      if (eyeCloseStartRef.current === null) {
        eyeCloseStartRef.current = Date.now()
        eyeCloseFiredRef.current = false
      } else {
        const closedMs = Date.now() - eyeCloseStartRef.current
        if (closedMs >= EYE_CLOSE_MIN_MS && !eyeCloseFiredRef.current) {
          if (cooldownsRef.current[GESTURES.EYES_CLOSED].canFire()) {
            eyeCloseFiredRef.current = true
            fireCommand(GESTURES.EYES_CLOSED)
          }
        }
      }
    } else {
      if (eyeCloseStartRef.current !== null) {
        eyeCloseStartRef.current = null
        eyeCloseFiredRef.current = false
        if (activeGestureRef.current === GESTURES.EYES_CLOSED) {
          activeGestureRef.current = GESTURES.NONE
        }
      }
    }

    // 4. Head / mouth gestures with hysteresis
    const active = activeGestureRef.current

    // Should the active gesture deactivate? (value must drop below threshold - H)
    if (active !== GESTURES.NONE && active !== GESTURES.EYES_CLOSED) {
      const deactivate = (() => {
        switch (active) {
          case GESTURES.HEAD_LEFT:  return yaw   >= -(T.yaw   - H)
          case GESTURES.HEAD_RIGHT: return yaw   <=  (T.yaw   - H)
          case GESTURES.HEAD_UP:    return pitch <=  (T.pitch - H)
          case GESTURES.HEAD_DOWN:  return pitch >= -(T.pitch - H)
          case GESTURES.TILT_LEFT:  return roll  >= -(T.roll  - H)
          case GESTURES.TILT_RIGHT: return roll  <=  (T.roll  - H)
          case GESTURES.MOUTH_OPEN: return mouth <=  T.mouthOpen * 0.8
          default: return true
        }
      })()
      if (deactivate) activeGestureRef.current = GESTURES.NONE
    }

    // Detect a new gesture (only when nothing is active)
    if (activeGestureRef.current === GESTURES.NONE) {
      let detected = GESTURES.NONE
      if      (yaw   < -T.yaw)       detected = GESTURES.HEAD_LEFT
      else if (yaw   >  T.yaw)       detected = GESTURES.HEAD_RIGHT
      else if (pitch >  T.pitch)     detected = GESTURES.HEAD_UP
      else if (pitch < -T.pitch)     detected = GESTURES.HEAD_DOWN
      else if (roll  < -T.roll)      detected = GESTURES.TILT_LEFT
      else if (roll  >  T.roll)      detected = GESTURES.TILT_RIGHT
      else if (mouth >  T.mouthOpen) detected = GESTURES.MOUTH_OPEN

      if (detected !== GESTURES.NONE) {
        activeGestureRef.current = detected
        if (cooldownsRef.current[detected].canFire()) {
          fireCommand(detected)
        }
      }
    }

    // 5. Publish gesture display state
    const displayGesture =
      eyesClosed                                  ? GESTURES.EYES_CLOSED :
      activeGestureRef.current !== GESTURES.NONE  ? activeGestureRef.current :
      GESTURES.NONE

    setCurrentGesture(displayGesture)

    // 6. Confidence: 0-1, how far past threshold
    let conf = 0
    switch (activeGestureRef.current) {
      case GESTURES.HEAD_LEFT:
      case GESTURES.HEAD_RIGHT:
        conf = (Math.abs(yaw)   - T.yaw)   / T.yaw;   break
      case GESTURES.HEAD_UP:
      case GESTURES.HEAD_DOWN:
        conf = (Math.abs(pitch) - T.pitch) / T.pitch;  break
      case GESTURES.TILT_LEFT:
      case GESTURES.TILT_RIGHT:
        conf = (Math.abs(roll)  - T.roll)  / T.roll;   break
      case GESTURES.MOUTH_OPEN:
        conf = (mouth - T.mouthOpen) / T.mouthOpen;    break
    }
    if (eyesClosed && eyeCloseStartRef.current) {
      conf = (Date.now() - eyeCloseStartRef.current) / EYE_CLOSE_MIN_MS
    }
    setConfidence(Math.min(1, Math.max(0, conf)))

  }, [landmarks])

  return { currentGesture, currentCommand, confidence, metrics, lastCommand, lastCommandTime }
}
