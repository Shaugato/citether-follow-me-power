import { useSimStore } from "../state/useSimStore";

export function ExplanationCard() {
  const overlay = useSimStore((state) => state.beat.overlay);
  return (
    <section className="hud-panel explanation-card" aria-label="Why this decision">
      <header className="panel-heading">
        <span>{overlay.eyebrow}</span>
        <strong>{overlay.explanationTitle}</strong>
      </header>
      <p>{overlay.explanation}</p>
      <div className="accuracy-rule">
        <b>The grid supplies the electricity.</b>
        <span>citEther settles the value.</span>
      </div>
    </section>
  );
}
