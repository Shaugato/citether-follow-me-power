import { useSimStore } from "../state/useSimStore";

export function CaptionStrip() {
  const caption = useSimStore((state) => state.caption);
  const activeBeat = useSimStore((state) => state.activeBeat);
  const captionsHidden = useSimStore((state) => state.captionsHidden);
  if (captionsHidden) return null;
  return <div className="caption-strip" key={activeBeat}>{caption}</div>;
}
