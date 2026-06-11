import { useSimStore } from "../state/useSimStore";

export function EndCard() {
  const time = useSimStore((state) => state.cinematicTime);
  if (time < 195) return null;
  return (
    <section className="end-card" aria-label="citEther end card">
      <span>#citEther</span>
      <p className="end-card-thesis">Your energy is no longer trapped at your address.</p>
      <h1>citEther — your energy follows you.</h1>
      <p>The grid supplies the electricity. citEther settles the value.</p>
      <strong>One suburb · 100 homes · 3 months</strong>
      <b>Illustrative figures.</b>
    </section>
  );
}
