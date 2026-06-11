import { citetherScenario } from "../scenario/citetherScenario";
import { homeSettlementTotals, scenarioSurplusKwh } from "../scenario/settlementEvents";
import { formatKwh, formatMoney } from "../lib/formatters";
import { useSimStore } from "../state/useSimStore";

export function LedgerPanel() {
  const beat = useSimStore((state) => state.beat);
  const activeEvent = useSimStore((state) => state.activeEvent);
  const completedEvents = useSimStore((state) => state.completedEvents);
  if (beat.overlay.ledgerMode === "hidden") return null;

  const household = citetherScenario.households[0];
  if (activeEvent && activeEvent.fromLocationId !== "home") {
    return (
      <section className="hud-panel ledger-panel v2g-ledger" aria-label="Separate V2G service ledger">
        <PanelHeading eyebrow="Separate service ledger" title="Nurse EV → hospital support" />
        <LedgerRow label="Source" value="Nurse's EV" tone="credit" />
        <LedgerRow label="Grid-support service" value={formatKwh(activeEvent.kwh)} strong />
        <LedgerRow label="Gross service value" value={formatMoney(activeEvent.grossValue)} />
        <LedgerRow label="Network fee" value={formatMoney(activeEvent.networkFee)} tone="fee" />
        <LedgerRow label="citEther margin" value={formatMoney(activeEvent.citetherMargin)} />
        <LedgerRow label="V2G earning" value={formatMoney(activeEvent.netValue)} tone="credit" strong />
        <p className="ledger-separation">Kept separate from household rooftop-surplus benefit.</p>
      </section>
    );
  }

  const completedHomeKwh = completedEvents
    .filter((event) => event.fromLocationId === "home")
    .reduce((total, event) => total + event.kwh, 0);
  const credits = beat.id < 5 ? 0 : Math.max(scenarioSurplusKwh - completedHomeKwh, 0);
  const eventMode = beat.overlay.ledgerMode === "event" && activeEvent;
  const destination = eventMode
    ? citetherScenario.locations.find((location) => location.id === activeEvent.toLocationId)?.name ?? "Authorised destination"
    : beat.overlay.ledgerMode === "economics"
      ? "Household rooftop day"
      : beat.id < 5 ? "Not yet authorised" : "Energy account authorised";
  const fee = eventMode ? activeEvent.networkFee : beat.overlay.ledgerMode === "economics" ? homeSettlementTotals.networkFee : 0;
  const net = eventMode ? activeEvent.netValue : beat.overlay.ledgerMode === "economics" ? homeSettlementTotals.netValue : 0;

  return (
    <section className="hud-panel ledger-panel" aria-label="Settlement ledger">
      <PanelHeading eyebrow="Live household ledger" title="Solar → portable value" />
      <LedgerRow label="Solar generated" value={formatKwh(household.solarGeneratedKwh)} tone="solar" />
      <LedgerRow label="Home used" value={formatKwh(household.homeSelfUseKwh)} />
      <LedgerRow label="Surplus" value={formatKwh(scenarioSurplusKwh)} tone="solar" strong />
      <LedgerRow label="Feed-in alternative" value={formatMoney(homeSettlementTotals.feedInAlternative)} tone="old" />
      <LedgerRow label="citEther credits" value={formatKwh(credits)} tone="credit" />
      <LedgerRow label="Destination" value={destination} />
      <LedgerRow label="Network fee" value={formatMoney(fee)} tone="fee" />
      <LedgerRow label="Net value" value={formatMoney(net)} tone="credit" strong />
    </section>
  );
}

function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="panel-heading">
      <span>{eyebrow}</span>
      <strong>{title}</strong>
    </header>
  );
}

function LedgerRow({ label, value, tone, strong = false }: {
  label: string;
  value: string;
  tone?: "solar" | "old" | "credit" | "fee";
  strong?: boolean;
}) {
  return (
    <div className={`ledger-row${strong ? " is-strong" : ""}`} data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
