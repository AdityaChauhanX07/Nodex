export const DEFAULT_THRESHOLDS = {
  yaw: 12,        // degrees equivalent (normalized units)
  pitch: 10,
  roll: 8,
  earClose: 0.015, // eye aspect ratio below this = eyes closed
  mouthOpen: 0.04, // mouth ratio above this = mouth open

  // Hysteresis: gesture must exceed threshold by this much to activate,
  // and must drop below (threshold - hysteresis) to reset
  hysteresis: 2,
}

export const SENSITIVITY_PRESETS = {
  low: {
    yaw: 18,
    pitch: 15,
    roll: 12,
    earClose: 0.012,
    mouthOpen: 0.055,
    hysteresis: 3,
  },
  medium: DEFAULT_THRESHOLDS,
  high: {
    yaw: 8,
    pitch: 7,
    roll: 5,
    earClose: 0.018,
    mouthOpen: 0.03,
    hysteresis: 1.5,
  },
}
