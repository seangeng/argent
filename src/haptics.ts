/**
 * Tiny haptics for metal presses — `navigator.vibrate` where available
 * (Android Chrome; iOS Safari ignores it). On by default, like Glacé.
 */

let enabled = true;

/** Globally enable/disable Argent haptics. */
export function setHaptics(on: boolean) {
  enabled = on;
}

export function vibrate(pattern: number | number[]) {
  if (!enabled || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // some browsers throw on vibrate without user activation — fine to ignore
  }
}

/** The stamped-press click. */
export const PRESS_PATTERN = 8;
