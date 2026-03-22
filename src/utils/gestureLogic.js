import {
  NOSE_TIP,
  LEFT_FACE_SIDE,
  RIGHT_FACE_SIDE,
  FOREHEAD,
  CHIN,
  RIGHT_EYE_UPPER,
  RIGHT_EYE_LOWER,
  RIGHT_EYE_INNER,
  RIGHT_EYE_OUTER,
  LEFT_EYE_UPPER,
  LEFT_EYE_LOWER,
  LEFT_EYE_INNER,
  LEFT_EYE_OUTER,
  UPPER_LIP,
  LOWER_LIP,
  MOUTH_LEFT,
  MOUTH_RIGHT,
} from './landmarks.js'

/** 3-D Euclidean distance between two landmark points. */
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

/**
 * computeYaw — horizontal head rotation in degrees.
 * Positive = turned right, negative = turned left.
 * Uses the ratio of nose position between the two cheek edges.
 */
export function computeYaw(landmarks) {
  if (!landmarks?.length) return 0
  const nose  = landmarks[NOSE_TIP]
  const left  = landmarks[LEFT_FACE_SIDE]
  const right = landmarks[RIGHT_FACE_SIDE]
  if (!nose || !left || !right) return 0

  const midX      = (left.x + right.x) / 2
  const halfWidth = Math.abs(right.x - left.x) / 2
  if (halfWidth === 0) return 0

  // Map ratio (-1…+1) to ±45°
  return ((nose.x - midX) / halfWidth) * 45
}

/**
 * computePitch — vertical head tilt in degrees.
 * Positive = looking up, negative = looking down.
 */
export function computePitch(landmarks) {
  if (!landmarks?.length) return 0
  const nose     = landmarks[NOSE_TIP]
  const forehead = landmarks[FOREHEAD]
  const chin     = landmarks[CHIN]
  if (!nose || !forehead || !chin) return 0

  const midY       = (forehead.y + chin.y) / 2
  const halfHeight = Math.abs(chin.y - forehead.y) / 2
  if (halfHeight === 0) return 0

  // y increases downward; nose above midpoint → positive pitch
  return ((midY - nose.y) / halfHeight) * 40
}

/**
 * computeRoll — head tilt (ear-to-shoulder) in degrees.
 * Positive = tilted right, negative = tilted left.
 * Uses atan2 for a true angular value.
 */
export function computeRoll(landmarks) {
  if (!landmarks?.length) return 0
  const left  = landmarks[LEFT_FACE_SIDE]
  const right = landmarks[RIGHT_FACE_SIDE]
  if (!left || !right) return 0

  const dx = right.x - left.x
  const dy = right.y - left.y
  return Math.atan2(dy, dx) * (180 / Math.PI)
}

/**
 * computeEAR — Eye Aspect Ratio, average of both eyes.
 * Formula: vertical_opening / horizontal_width (per eye).
 * Typical range: ~0.25–0.35 open, <0.18 closed.
 */
export function computeEAR(landmarks) {
  if (!landmarks?.length) return 0.3

  const rUpper = landmarks[RIGHT_EYE_UPPER]
  const rLower = landmarks[RIGHT_EYE_LOWER]
  const rInner = landmarks[RIGHT_EYE_INNER]
  const rOuter = landmarks[RIGHT_EYE_OUTER]

  const lUpper = landmarks[LEFT_EYE_UPPER]
  const lLower = landmarks[LEFT_EYE_LOWER]
  const lInner = landmarks[LEFT_EYE_INNER]
  const lOuter = landmarks[LEFT_EYE_OUTER]

  if (!rUpper || !rLower || !rInner || !rOuter ||
      !lUpper || !lLower || !lInner || !lOuter) return 0.3

  const rHoriz = dist(rInner, rOuter)
  const lHoriz = dist(lInner, lOuter)
  if (rHoriz === 0 || lHoriz === 0) return 0.3

  const rEAR = dist(rUpper, rLower) / rHoriz
  const lEAR = dist(lUpper, lLower) / lHoriz

  return (rEAR + lEAR) / 2
}

/**
 * computeMouthRatio — vertical opening / horizontal width.
 * ~0.0 closed, ~0.3+ wide open.
 */
export function computeMouthRatio(landmarks) {
  if (!landmarks?.length) return 0

  const upper = landmarks[UPPER_LIP]
  const lower = landmarks[LOWER_LIP]
  const left  = landmarks[MOUTH_LEFT]
  const right = landmarks[MOUTH_RIGHT]

  if (!upper || !lower || !left || !right) return 0

  const width = dist(left, right)
  if (width === 0) return 0

  return dist(upper, lower) / width
}
