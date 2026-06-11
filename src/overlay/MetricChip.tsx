import { citetherScenario } from "../scenario/citetherScenario";
import { homeSettlementTotals, scenarioSurplusKwh, settlementEvents } from "../scenario/settlementEvents";
import { formatKg, formatKwh, formatMoney } from "../lib/formatters";
import { useSimStore } from "../state/useSimStore";

const eventById = new Map(settlementEvents.map((event) => [event.id, event]));

export function MetricChip() {
  const metricKey = useSimStore((state) => state.beat.overlay.metricKey);
  const metric = getMetric(metricKey);
  return (
    <div className="metric-chip" aria-label="Beat metric">
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      {metric.detail && <b>{metric.detail}</b>}
    </div>
  );
}

function getMetric(key: string) {
  const mum = eventById.get("mum_bill_offset")!;
  const tradie = eventById.get("tradie_diesel_avoided")!;
  const coast = eventById.get("coast_fast_charge")!;
  const hospital = eventById.get("hospital_grid_support")!;
  const pod = citetherScenario.destinations.find((destination) => destination.id === "pod_sell")!;
  const ratio = homeSettlementTotals.netValue / homeSettlementTotals.feedInAlternative;

  switch (key) {
    case "surplus": return { label: "Surplus after home use", value: formatKwh(scenarioSurplusKwh), detail: "battery full" };
    case "fit": return { label: "Only old-system option", value: `${formatMoney(citetherScenario.prices.feedInTariff)}/kWh`, detail: `${formatMoney(homeSettlementTotals.feedInAlternative)} total` };
    case "outsideCost": return { label: "Fast-charge price elsewhere", value: `${formatMoney(citetherScenario.prices.fastChargerRate)}/kWh`, detail: "while rooftop value earns almost nothing" };
    case "contrast": return { label: "The value gap", value: `${formatMoney(citetherScenario.prices.feedInTariff)} ↔ ${formatMoney(citetherScenario.prices.fastChargerRate)}`, detail: "export vs pay elsewhere" };
    case "credits": return { label: "Settlement credits minted", value: formatKwh(scenarioSurplusKwh), detail: "from rooftop surplus" };
    case "account": return { label: "Energy account available", value: formatKwh(scenarioSurplusKwh), detail: "not tied to the meter" };
    case "mum": return { label: "Mum's bill offset", value: `${formatMoney(mum.netValue)} net`, detail: `vs ${formatMoney(mum.feedInAlternative)} FiT` };
    case "tradie": return { label: "Diesel displaced", value: formatKg(tradie.carbonAvoidedKg ?? 0), detail: `${formatMoney(tradie.netValue)} net value` };
    case "ev": return { label: "Fast-charge effective price", value: `${formatMoney(citetherScenario.prices.fastChargerRate - coast.netValue / coast.kwh)}/kWh`, detail: `from ${formatMoney(citetherScenario.prices.fastChargerRate)}/kWh` };
    case "hospital": return { label: "Separate hospital V2G earning", value: formatMoney(hospital.netValue), detail: "not household rooftop benefit" };
    case "destinations": return { label: "Authorised choices", value: "6 destinations", detail: "use · share · donate · sell" };
    case "podFee": return { label: "Local-loop network fee", value: `−${Math.round((1 - pod.networkFeeMultiplier) * 100)}%`, detail: "same-feeder multiplier" };
    case "economics": return { label: "Household rooftop surplus", value: `${formatMoney(homeSettlementTotals.netValue)} net`, detail: `vs ${formatMoney(homeSettlementTotals.feedInAlternative)} FiT · ${ratio.toFixed(1)}×` };
    case "final": return { label: "Follow Me Power", value: "value follows account", detail: "electricity still follows the grid" };
    default: return { label: "Follow Me Power", value: "One home", detail: "one address-locked problem" };
  }
}
