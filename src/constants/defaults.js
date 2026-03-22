import { GESTURES } from './gestures.js'
import { COMMANDS } from './commands.js'

// Gesture → command mapping (user-remappable)
export const DEFAULT_GESTURE_MAP = {
  [GESTURES.HEAD_LEFT]:   COMMANDS.PREV,     // previous video in queue
  [GESTURES.HEAD_RIGHT]:  COMMANDS.NEXT,     // next video in queue
  [GESTURES.HEAD_UP]:     COMMANDS.VOL_UP,
  [GESTURES.HEAD_DOWN]:   COMMANDS.VOL_DOWN,
  [GESTURES.TILT_LEFT]:   COMMANDS.REWIND,   // rewind -10s
  [GESTURES.TILT_RIGHT]:  COMMANDS.SKIP,     // skip +10s
  [GESTURES.MOUTH_OPEN]:  COMMANDS.PLAY,     // play/pause toggle
  [GESTURES.EYES_CLOSED]: COMMANDS.MUTE,     // mute/unmute
}

// Cooldown between repeated firings of the same gesture (ms)
export const DEFAULT_COOLDOWN_MS = 2000

// Eyes must stay closed at least this long to count (filters blinks)
export const EYE_CLOSE_MIN_MS = 800

// Blinks shorter than this are always ignored (even as "short closes")
export const BLINK_IGNORE_MS = 300

export const DEFAULT_COOLDOWNS = {
  [GESTURES.HEAD_UP]:     1200,
  [GESTURES.HEAD_DOWN]:   1200,
  [GESTURES.HEAD_LEFT]:   2000,
  [GESTURES.HEAD_RIGHT]:  2000,
  [GESTURES.EYES_CLOSED]: 2000,
  [GESTURES.MOUTH_OPEN]:  2000,
  [GESTURES.TILT_LEFT]:   2000,
  [GESTURES.TILT_RIGHT]:  2000,
}

export const SENSITIVITY_LABELS = {
  low:    'Low (Less sensitive)',
  medium: 'Medium (Default)',
  high:   'High (More sensitive)',
}
