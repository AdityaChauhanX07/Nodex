import {
  NOSE_TIP,
  LEFT_FACE_SIDE,
  RIGHT_FACE_SIDE,
  FOREHEAD,
  CHIN,
  L_EYE_UPPER_LID,
  L_EYE_LOWER_LID,
  R_EYE_UPPER_LID,
  R_EYE_LOWER_LID,
  MOUTH_UPPER_LIP,
  MOUTH_LOWER_LIP,
} from './landmarks.js'

/**
 * Compute yaw (horizontal head rotation).
 * Positive = head turned right, negative = left.
 * Uses nose tip relative to the midpoint of both face sides.
 */
export function computeYaw(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0
  const nose = landmarks[NOSE_TIP]
  const left = landmarks[LEFT_FACE_SIDE]
  const right = landmarks[RIGHT_FACE_SIDE]
  if (!nose || !left || !right) return 0

  const midX = (left.x + right.x) / 2
  const faceWidth = Math.abs(right.x - left.x)
  if (faceWidth === 0) return 0
  return ((nose.x - midX) / faceWidth) * 100
}

/**
 * Compute pitch (vertical head tilt).
 * Positive = head up, negative = head down.
 */
export function computePitch(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0
  const nose = landmarks[NOSE_TIP]
  const forehead = landmarks[FOREHEAD]
  const chin = landmarks[CHIN]
  if (!nose || !forehead || !chin) return 0

  const faceHeight = Math.abs(chin.y - forehead.y)
  if (faceHeight === 0) return 0
  const midY = (forehead.y + chin.y) / 2
  return ((midY - nose.y) / faceHeight) * 100
}

/**
 * Compute roll (head tilt / ear-to-shoulder).
 * Positive = tilted right, negative = left.
 */
export function computeRoll(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0
  const left = landmarks[LEFT_FACE_SIDE]
  const right = landmarks[RIGHT_FACE_SIDE]
  if (!left || !right) return 0
  const dy = right.y - left.y
  const dx = right.x - left.x
  if (dx === 0) return 0
  return (dy / dx) * 100
}

/**
 * Compute Eye Aspect Ratio (EAR) — average of both eyes.
 * Lower values indicate closed eyes.
 */
export function computeEAR(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0.3

  const lUpper = landmarks[L_EYE_UPPER_LID]
  const lLower = landmarks[L_EYE_LOWER_LID]
  const rUpper = landmarks[R_EYE_UPPER_LID]
  const rLower = landmarks[R_EYE_LOWER_LID]

  if (!lUpper || !lLower || !rUpper || !rLower) return 0.3

  const lEAR = Math.abs(lUpper.y - lLower.y)
  const rEAR = Math.abs(rUpper.y - rLower.y)
  return (lEAR + rEAR) / 2
}

/**
 * Compute mouth openness ratio.
 * Higher values indicate open mouth.
 */
export function computeMouthRatio(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0

  const upper = landmarks[MOUTH_UPPER_LIP]
  const lower = landmarks[MOUTH_LOWER_LIP]

  if (!upper || !lower) return 0
  return Math.abs(lower.y - upper.y)
}
