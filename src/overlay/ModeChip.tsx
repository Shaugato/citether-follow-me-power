import { useSimStore } from "../state/useSimStore";

export function ModeChip() {
  const mode = useSimStore((state) => state.mode);
  return (
    <div className="mode-chip" data-mode={mode}>
      <span>{mode === "old" ? "Old system" : "citEther settlement"}</span>
      <b>{mode === "old" ? "value tied to address" : "value follows account"}</b>
    </div>
  );
}
