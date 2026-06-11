import { formatMoney } from "../lib/formatters";
import { homeSettlementEvents, homeSettlementTotals } from "../scenario/settlementEvents";
import { useSimStore } from "../state/useSimStore";

const destinationGroups = [
  { label: "Use", eventIds: ["tradie_diesel_avoided", "coast_fast_charge"], tone: "use" },
  { label: "Share", eventIds: ["mum_bill_offset"], tone: "share" },
  { label: "Donate", eventIds: ["food_bank_donation"], tone: "donate" },
  { label: "Business", eventIds: ["business_local_sale"], tone: "business" },
  { label: "Pod", eventIds: ["pod_local_loop"], tone: "pod" },
  { label: "Grid", eventIds: ["grid_fallback_sale"], tone: "grid" },
] as const;

export function EconomicsSankey() {
  const activeBeat = useSimStore((state) => state.activeBeat);
  if (activeBeat !== 13) return null;

  const maxDestinationNet = Math.max(...destinationGroups.map((group) => groupNet(group.eventIds)));
  const fitRatio = homeSettlementTotals.feedInAlternative / homeSettlementTotals.netValue;

  return (
    <section className="economics-sankey" aria-label="Household rooftop settlement Sankey">
      <header>
        <span>Household rooftop surplus · illustrative day</span>
        <strong>Gross → fees → household net</strong>
      </header>

      <div className="sankey-flow">
        <FlowNode tone="solar" label="Solar surplus" value={`${homeSettlementTotals.kwh.toFixed(1)} kWh`} />
        <FlowArrow label="routed" />
        <FlowNode tone="credit" label="Gross value" value={formatMoney(homeSettlementTotals.grossValue)} />
        <div className="sankey-skim">
          <span>Network fee <b>−{formatMoney(homeSettlementTotals.networkFee)}</b></span>
          <span>citEther margin <b>−{formatMoney(homeSettlementTotals.citetherMargin)}</b></span>
        </div>
        <FlowArrow label="net continues" />
        <FlowNode tone="net" label="Household net" value={formatMoney(homeSettlementTotals.netValue)} />
      </div>

      <div className="sankey-destinations" aria-label="Six destination branches">
        {destinationGroups.map((group) => {
          const value = groupNet(group.eventIds);
          return (
            <article key={group.label} data-tone={group.tone}>
              <i style={{ width: `${Math.max((value / maxDestinationNet) * 100, 14)}%` }} />
              <span>{group.label}</span>
              <strong>{formatMoney(value)}</strong>
            </article>
          );
        })}
      </div>

      <div className="fit-comparison" aria-label="Feed-in tariff versus citEther net">
        <article>
          <span>FiT alternative</span>
          <i className="fit-bar" style={{ height: `${Math.max(fitRatio * 100, 7)}%` }} />
          <strong>{formatMoney(homeSettlementTotals.feedInAlternative)}</strong>
        </article>
        <article>
          <span>citEther net</span>
          <i className="net-bar" />
          <strong>{formatMoney(homeSettlementTotals.netValue)}</strong>
        </article>
        <b>{(homeSettlementTotals.netValue / homeSettlementTotals.feedInAlternative).toFixed(1)}× household value</b>
      </div>
    </section>
  );
}

function groupNet(eventIds: readonly string[]) {
  return homeSettlementEvents
    .filter((event) => eventIds.includes(event.id))
    .reduce((total, event) => total + event.netValue, 0);
}

function FlowNode({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <article className="sankey-node" data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function FlowArrow({ label }: { label: string }) {
  return <div className="sankey-arrow"><i /><span>{label}</span></div>;
}
