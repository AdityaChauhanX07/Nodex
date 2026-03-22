import { useEffect, useRef } from 'react'
import { computeYaw, computePitch, computeRoll, computeEAR, computeMouthRatio } from '../utils/gestureLogic.js'
import { GESTURES } from '../constants/gestures.js'
import { DEFAULT_THRESHOLDS } from '../utils/thresholds.js'
import { Cooldown } from '../utils/cooldown.js'

const cooldowns = {
  [GESTURES.HEAD_LEFT]: new Cooldown(1500),
  [GESTURES.HEAD_RIGHT]: new Cooldown(1500),
  [GESTURES.HEAD_UP]: new Cooldown(1500),
  [GESTURES.HEAD_DOWN]: new Cooldown(1500),
  [GESTURES.EYES_CLOSED]: new Cooldown(1200),
  [GESTURES.MOUTH_OPEN]: new Cooldown(1200),
  [GESTURES.TILT_LEFT]: new Cooldown(1500),
  [GESTURES.TILT_RIGHT]: new Cooldown(1500),
}

/**
 * GestureEngine: processes landmarks and fires gesture callbacks.
 * This is a pure logic component with no rendered output.
 */
export default function GestureEngine({ landmarks, calibration, onGesture }) {
  const thresholds = calibration?.thresholds ?? DEFAULT_THRESHOLDS

  useEffect(() => {
    if (!landmarks || !landmarks.length) return

    const yaw = computeYaw(landmarks)
    const pitch = computePitch(landmarks)
    const roll = computeRoll(landmarks)
    const ear = computeEAR(landmarks)
    const mouth = computeMouthRatio(landmarks)

    const detected = []

    if (yaw < -thresholds.yaw) detected.push(GESTURES.HEAD_LEFT)
    else if (yaw > thresholds.yaw) detected.push(GESTURES.HEAD_RIGHT)

    if (pitch > thresholds.pitch) detected.push(GESTURES.HEAD_UP)
    else if (pitch < -thresholds.pitch) detected.push(GESTURES.HEAD_DOWN)

    if (roll < -thresholds.roll) detected.push(GESTURES.TILT_LEFT)
    else if (roll > thresholds.roll) detected.push(GESTURES.TILT_RIGHT)

    if (ear < thresholds.earClose) detected.push(GESTURES.EYES_CLOSED)
    if (mouth > thresholds.mouthOpen) detected.push(GESTURES.MOUTH_OPEN)

    for (const gesture of detected) {
      if (cooldowns[gesture]?.canFire()) {
        cooldowns[gesture].fire()
        onGesture?.(gesture, { yaw, pitch, roll, ear, mouth })
      }
    }
  }, [landmarks, thresholds, onGesture])

  return null
}
