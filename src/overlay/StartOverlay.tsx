import { useSimStore } from "../state/useSimStore";
import { narrationControls } from "../narration/useNarration";

/**
 * Gesture gate. Shown on load until the run starts. The narration button plays
 * audio AND starts the run inside one user-gesture handler (browser autoplay rule);
 * the silent button runs the timeline exactly as before. Hidden once started, and
 * by `H` for recording.
 */
export function StartOverlay() {
  const started = useSimStore((state) => state.started);
  const audioLoadState = useSimStore((state) => state.audioLoadState);
  if (started) return null;

  const audioUnavailable = audioLoadState === "error";

  return (
    <div className="start-overlay" role="dialog" aria-label="Start cinematic">
      <div className="start-overlay-card">
        <span className="start-overlay-brand">citEther</span>
        <h1>Follow Me Power</h1>
        <p>A 3-minute cinematic. Sound brings it to life — start with narration.</p>
        <div className="start-overlay-actions">
          <button
            type="button"
            className="start-primary"
            onClick={() => narrationControls.startWithNarration()}
          >
            ▶ Start cinematic with narration
          </button>
          <button
            type="button"
            className="start-secondary"
            onClick={() => narrationControls.startSilent()}
          >
            Start silent
          </button>
        </div>
        <small>
          {audioUnavailable
            ? "Narration audio not found — the cinematic will play with captions only."
            : "Space pause/resume · R restart · H clean recording frame"}
        </small>
      </div>
    </div>
  );
}
