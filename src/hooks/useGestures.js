import { useState, useEffect, useRef } from 'react'
import { computeYaw, computePitch, computeRoll, computeEAR, computeMouthRatio } from '../utils/gestureLogic.js'
import { GESTURES } from '../constants/gestures.js'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'
import { Cooldown } from '../utils/cooldown.js'
import { DEFAULT_GESTURE_MAP } from '../constants/defaults.js'

const makeCooldowns = () =>
  Object.fromEntries(Object.values(GESTURES).map(g => [g, new Cooldown(1500)]))

export function useGestures({ landmarks, calibration, gestureMap } = {}) {
  const [currentGesture, setCurrentGesture] = useState(null)
  const [confidence, setConfidence] = useState({})
  const [command, setCommand] = useState(null)
  const [latency, setLatency] = useState(null)
  const cooldownsRef = useRef(makeCooldowns())
  const commandTimerRef = useRef(null)

  const thresholds = calibration?.thresholds ?? DEFAULT_THRESHOLDS
  const mapping = gestureMap ?? DEFAULT_GESTURE_MAP

  useEffect(() => {
    if (!landmarks || !landmarks.length) return
    const t0 = performance.now()

    const yaw = computeYaw(landmarks)
    const pitch = computePitch(landmarks)
    const roll = computeRoll(landmarks)
    const ear = computeEAR(landmarks)
    const mouth = computeMouthRatio(landmarks)

    setConfidence({ yaw, pitch, roll, ear, mouth })

    let detected = null

    if (yaw < -thresholds.yaw) detected = GESTURES.HEAD_LEFT
    else if (yaw > thresholds.yaw) detected = GESTURES.HEAD_RIGHT
    else if (pitch > thresholds.pitch) detected = GESTURES.HEAD_UP
    else if (pitch < -thresholds.pitch) detected = GESTURES.HEAD_DOWN
    else if (roll < -thresholds.roll) detected = GESTURES.TILT_LEFT
    else if (roll > thresholds.roll) detected = GESTURES.TILT_RIGHT
    else if (ear < thresholds.earClose) detected = GESTURES.EYES_CLOSED
    else if (mouth > thresholds.mouthOpen) detected = GESTURES.MOUTH_OPEN

    if (detected && cooldownsRef.current[detected]?.canFire()) {
      cooldownsRef.current[detected].fire()
      setCurrentGesture(detected)
      const cmd = mapping[detected] ?? null
      setCommand(cmd)
      setLatency(Math.round(performance.now() - t0))

      // Clear after 1.2s
      clearTimeout(commandTimerRef.current)
      commandTimerRef.current = setTimeout(() => {
        setCurrentGesture(null)
        setCommand(null)
      }, 1200)
    }
  }, [landmarks, thresholds, mapping])

  return { currentGesture, confidence, command, latency }
}
