import { GESTURES } from './gestures.js'
import { COMMANDS } from './commands.js'

// Gesture → command mapping (user-remappable)
export const DEFAULT_GESTURE_MAP = {
  [GESTURES.HEAD_LEFT]:   COMMANDS.PAUSE,
  [GESTURES.HEAD_RIGHT]:  COMMANDS.PLAY,
  [GESTURES.HEAD_UP]:     COMMANDS.VOL_UP,
  [GESTURES.HEAD_DOWN]:   COMMANDS.VOL_DOWN,
  [GESTURES.EYES_CLOSED]: COMMANDS.NEXT,
  [GESTURES.MOUTH_OPEN]:  COMMANDS.MUTE,
  [GESTURES.TILT_LEFT]:   COMMANDS.REWIND,
  [GESTURES.TILT_RIGHT]:  COMMANDS.SKIP,
}

// Cooldown between repeated firings of the same gesture (ms)
export const DEFAULT_COOLDOWN_MS = 1500

// Eyes must stay closed at least this long to count (filters blinks)
export const EYE_CLOSE_MIN_MS = 500

// Blinks shorter than this are always ignored (even as "short closes")
export const BLINK_IGNORE_MS = 300

export const DEFAULT_COOLDOWNS = {
  [GESTURES.HEAD_UP]:     1500,
  [GESTURES.HEAD_DOWN]:   1500,
  [GESTURES.HEAD_LEFT]:   1500,
  [GESTURES.HEAD_RIGHT]:  1500,
  [GESTURES.EYES_CLOSED]: 1200,
  [GESTURES.MOUTH_OPEN]:  1200,
  [GESTURES.TILT_LEFT]:   1500,
  [GESTURES.TILT_RIGHT]:  1500,
}

export const SENSITIVITY_LABELS = {
  low:    'Low (Less sensitive)',
  medium: 'Medium (Default)',
  high:   'High (More sensitive)',
}
