import { useSimStore } from "../state/useSimStore";

export function LayerLegend() {
  const time = useSimStore((state) => state.cinematicTime);
  if (time < 72 || time >= 84) return null;

  return (
    <div className="layer-legend" aria-label="Physical grid and settlement legend">
      <span><i data-layer="grid" />grid = electricity <b>(blue)</b></span>
      <span><i data-layer="value" />citEther = value <b>(gold)</b></span>
    </div>
  );
}
