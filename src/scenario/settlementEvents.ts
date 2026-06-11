import { citetherScenario } from "./citetherScenario";
import {
  benefitVsFiT,
  carbonAvoided,
  citetherMargin,
  feedInAlternative,
  grossValue,
  netValue,
  networkFee,
  sumSettlementEvents,
  surplusKwh,
} from "./economics";
import type { Scenario, ScenarioDefinition, SettlementEvent } from "./types";

export function buildSettlementEvents(scenario: ScenarioDefinition): SettlementEvent[] {
  const destinations = new Map(scenario.destinations.map((destination) => [destination.id, destination]));

  return scenario.settlementEventSeeds
    .map((seed) => {
      const destination = destinations.get(seed.destinationId);
      if (!destination) throw new Error(`Unknown destination: ${seed.destinationId}`);

      const retailPrice = scenario.prices.retailByLocation[seed.toLocationId];
      const gross = grossValue(seed.kwh, retailPrice);
      const fee = networkFee(seed.kwh, scenario.networkFeePerKwh, destination.networkFeeMultiplier);
      const margin = citetherMargin(gross, fee, scenario.citetherMarginPct);
      const net = netValue(gross, fee, margin);
      const fit = feedInAlternative(seed.kwh, scenario.prices.feedInTariff);
      const benefit = benefitVsFiT(net, fit);
      const avoided = seed.carbonMode === "dieselAvoided"
        ? carbonAvoided(seed.kwh, scenario.carbon.dieselKgPerKwh, scenario.carbon.gridKgPerKwh)
        : undefined;

      return {
        ...seed,
        grossValue: gross,
        networkFee: fee,
        citetherMargin: margin,
        netValue: net,
        feedInAlternative: fit,
        benefitVsFiT: benefit,
        carbonAvoidedKg: avoided,
        label: `${seed.labelTemplate} · ${formatKwh(seed.kwh)} · ${formatMoney(net)} net`,
      };
    })
    .sort((left, right) => left.t.localeCompare(right.t));
}

export const settlementEvents = buildSettlementEvents(citetherScenario);

export const scenario: Scenario = {
  ...citetherScenario,
  settlementEvents,
};

export const homeSettlementEvents = settlementEvents.filter((event) => event.fromLocationId === "home");

export const homeSettlementTotals = sumSettlementEvents(homeSettlementEvents);

export const daySettlementTotals = sumSettlementEvents(settlementEvents);

export const scenarioSurplusKwh = surplusKwh(
  citetherScenario.households[0].solarGeneratedKwh,
  citetherScenario.households[0].homeSelfUseKwh,
);

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatKwh(value: number) {
  return `${value.toFixed(1)} kWh`;
}
