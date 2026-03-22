// MediaPipe Face Mesh landmark index constants
// Naming uses USER's perspective (right/left as the person sees themselves).

// ─── Face silhouette ──────────────────────────────────────────────────────────
export const NOSE_TIP         = 1
export const LEFT_FACE_SIDE   = 234   // user's left cheek edge
export const RIGHT_FACE_SIDE  = 454   // user's right cheek edge
export const FOREHEAD         = 10
export const CHIN             = 152
export const NOSE_BRIDGE      = 6

// ─── Right eye (user's right eye — camera's left side) ────────────────────────
export const RIGHT_EYE_UPPER  = 159
export const RIGHT_EYE_LOWER  = 145
export const RIGHT_EYE_INNER  = 133
export const RIGHT_EYE_OUTER  = 33

// ─── Left eye (user's left eye — camera's right side) ─────────────────────────
export const LEFT_EYE_UPPER   = 386
export const LEFT_EYE_LOWER   = 374
export const LEFT_EYE_INNER   = 362
export const LEFT_EYE_OUTER   = 263

// ─── Mouth ────────────────────────────────────────────────────────────────────
export const UPPER_LIP        = 13
export const LOWER_LIP        = 14
export const MOUTH_LEFT       = 61
export const MOUTH_RIGHT      = 291

// Legacy aliases — gestureLogic.js still imports these names
export const L_EYE_UPPER_LID  = RIGHT_EYE_UPPER
export const L_EYE_LOWER_LID  = RIGHT_EYE_LOWER
export const L_EYE_INNER      = RIGHT_EYE_INNER
export const L_EYE_OUTER      = RIGHT_EYE_OUTER
export const R_EYE_UPPER_LID  = LEFT_EYE_UPPER
export const R_EYE_LOWER_LID  = LEFT_EYE_LOWER
export const R_EYE_INNER      = LEFT_EYE_INNER
export const R_EYE_OUTER      = LEFT_EYE_OUTER
export const MOUTH_UPPER_LIP  = UPPER_LIP
export const MOUTH_LOWER_LIP  = LOWER_LIP

// ─── Eyebrows ─────────────────────────────────────────────────────────────────
export const R_EYEBROW_INNER  = 55
export const R_EYEBROW_OUTER  = 46
export const L_EYEBROW_INNER  = 285
export const L_EYEBROW_OUTER  = 276

// ─── Cheeks ───────────────────────────────────────────────────────────────────
export const L_CHEEK          = LEFT_FACE_SIDE
export const R_CHEEK          = RIGHT_FACE_SIDE

// ─── Index sets for HUD wireframe drawing ─────────────────────────────────────
export const FACE_OUTLINE_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454,
  323, 361, 288, 397, 365, 379, 378, 400, 377,
  152,
  148, 176, 149, 150, 136, 172, 58, 132, 93, 234,
  127, 162, 21, 54, 103, 67, 109, 10,
]

export const RIGHT_EYEBROW_INDICES = [55, 107, 66, 105, 63, 70, 46]
export const LEFT_EYEBROW_INDICES  = [285, 336, 296, 334, 293, 300, 276]
export const RIGHT_EYE_LOOP        = [33, 160, 158, 133, 153, 144, 33]
export const LEFT_EYE_LOOP         = [362, 385, 387, 263, 373, 380, 362]

// Key dots rendered as teal circles on the HUD
export const KEY_DOT_INDICES = [
  RIGHT_EYE_UPPER, RIGHT_EYE_LOWER, RIGHT_EYE_INNER, RIGHT_EYE_OUTER,
  LEFT_EYE_UPPER,  LEFT_EYE_LOWER,  LEFT_EYE_INNER,  LEFT_EYE_OUTER,
  NOSE_TIP, NOSE_BRIDGE,
  LEFT_FACE_SIDE, RIGHT_FACE_SIDE,
  UPPER_LIP, LOWER_LIP, MOUTH_LEFT, MOUTH_RIGHT,
  FOREHEAD, CHIN,
  R_EYEBROW_INNER, R_EYEBROW_OUTER,
  L_EYEBROW_INNER, L_EYEBROW_OUTER,
]
