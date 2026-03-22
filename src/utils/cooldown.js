/**
 * Cooldown — prevents gesture from firing too frequently.
 */
export class Cooldown {
  constructor(ms = 1500) {
    this.ms = ms
    this.lastFired = 0
  }

  canFire() {
    return Date.now() - this.lastFired >= this.ms
  }

  fire() {
    this.lastFired = Date.now()
  }

  reset() {
    this.lastFired = 0
  }

  setDuration(ms) {
    this.ms = ms
  }
}
