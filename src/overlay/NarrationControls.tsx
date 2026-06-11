import { useSimStore } from "../state/useSimStore";
import { narrationControls } from "../narration/useNarration";

const LOAD_LABEL: Record<string, string> = {
  idle: "—",
  loading: "loading…",
  ready: "ready",
  error: "no audio · captions only",
};

/**
 * Post-start narration controls: VO on/off, mute, volume, and load status.
 * Lives outside `.overlay-system` so it can receive pointer events, and is hidden
 * by `H` (its parent block in `App` is gated on `!uiHidden`).
 */
export function NarrationControls() {
  const started = useSimStore((state) => state.started);
  const narrationEnabled = useSimStore((state) => state.narrationEnabled);
  const muted = useSimStore((state) => state.muted);
  const volume = useSimStore((state) => state.volume);
  const audioLoadState = useSimStore((state) => state.audioLoadState);
  if (!started) return null;

  const audioAvailable = audioLoadState !== "error";

  return (
    <div className="narration-controls" aria-label="Narration controls">
      <button
        type="button"
        className="narration-toggle"
        data-on={narrationEnabled && audioAvailable}
        disabled={!audioAvailable}
        onClick={() => narrationControls.setNarrationEnabled(!narrationEnabled)}
      >
        {narrationEnabled && audioAvailable ? "Voiceover: On" : "Voiceover: Off"}
      </button>

      <button
        type="button"
        className="narration-mute"
        disabled={!narrationEnabled || !audioAvailable}
        onClick={() => narrationControls.setMuted(!muted)}
      >
        {muted ? "🔇 Muted" : "🔊 Sound"}
      </button>

      <label className="narration-volume">
        <span>Vol</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          disabled={!narrationEnabled || !audioAvailable}
          onChange={(event) => narrationControls.setVolume(Number(event.target.value))}
        />
      </label>

      <span className="narration-status" data-state={audioLoadState}>
        {LOAD_LABEL[audioLoadState] ?? audioLoadState}
      </span>
    </div>
  );
}
