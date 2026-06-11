import { useSimStore } from "../state/useSimStore";

export function EventLog() {
  const events = useSimStore((state) => state.completedEvents);
  if (events.length === 0) return null;

  return (
    <section className="hud-panel event-log" aria-label="Settlement event log">
      <header className="panel-heading">
        <span>Settlement event log</span>
        <strong>Account activity</strong>
      </header>
      <div className="event-log-rows">
        {events.slice(-4).map((event) => (
          <div className="event-row" key={event.id}>
            <time>{event.t}</time>
            <span>{event.label}</span>
            <b>settled ✓</b>
          </div>
        ))}
      </div>
    </section>
  );
}
