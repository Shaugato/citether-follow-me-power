import { formatMoney } from "../lib/formatters";
import { homeSettlementTotals, settlementEvents } from "../scenario/settlementEvents";
import { useSimStore } from "../state/useSimStore";

export function ImpactSummary() {
  const show = useSimStore((state) => state.beat.overlay.showImpact);
  if (!show) return null;
  const hospital = settlementEvents.find((event) => event.id === "hospital_grid_support")!;

  return (
    <section className="impact-summary" aria-label="Separate value headlines">
      <article>
        <span>Household rooftop surplus</span>
        <strong>{formatMoney(homeSettlementTotals.netValue)} net</strong>
        <b>vs {formatMoney(homeSettlementTotals.feedInAlternative)} FiT · {(homeSettlementTotals.netValue / homeSettlementTotals.feedInAlternative).toFixed(1)}×</b>
      </article>
      <article className="v2g-headline">
        <span>Separate hospital V2G service</span>
        <strong>{formatMoney(hospital.netValue)} earned</strong>
        <b>Nurse's EV · not household rooftop benefit</b>
      </article>
    </section>
  );
}
