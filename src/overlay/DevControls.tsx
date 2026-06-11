export function DevControls() {
  return (
    <div className="dev-controls" aria-label="Playback controls">
      <span><kbd>Space</kbd> play / pause</span>
      <span><kbd>R</kbd> restart</span>
      <span><kbd>H</kbd> clean recording</span>
    </div>
  );
}
