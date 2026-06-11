import { cinematicControls } from "../cinematic/useCinematic";

/**
 * rAF bridge — when narration is ON, the audio element is the master clock.
 *
 * Each animation frame we read the audio position and push it into the GSAP
 * timeline via `cinematicControls.seek(audioTime)`. The timeline itself is held
 * paused (the controller pauses it before starting the bridge), so there is only
 * one clock: the audio. This locks visuals to audio with zero drift — exactly what
 * a screen recording needs over a 3+ minute take.
 *
 * Note: this module imports `cinematicControls` lazily (only used inside the rAF
 * callback), which keeps the narration <-> cinematic singleton cycle safe.
 */

let rafId: number | null = null;
let getTimeRef: (() => number) | null = null;

/** Start (or re-point) the bridge. `getTime` returns the audio currentTime in seconds. */
export function startNarrationSync(getTime: () => number): void {
  getTimeRef = getTime;
  if (rafId !== null) return;
  const tick = () => {
    if (getTimeRef) cinematicControls.seek(getTimeRef());
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

/** Stop the bridge; visuals freeze at the last synced position. */
export function stopNarrationSync(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  getTimeRef = null;
}

export function isNarrationSyncing(): boolean {
  return rafId !== null;
}
