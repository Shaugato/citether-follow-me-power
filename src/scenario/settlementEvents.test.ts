import { describe, expect, it } from "vitest";
import { citetherScenario } from "./citetherScenario";
import {
  daySettlementTotals,
  homeSettlementEvents,
  homeSettlementTotals,
  scenarioSurplusKwh,
  settlementEvents,
} from "./settlementEvents";

describe("settlement event consistency", () => {
  it("builds a time-ordered deterministic event list", () => {
    const timestamps = settlementEvents.map((event) => event.t);
    expect(timestamps).toEqual([...timestamps].sort());
    expect(settlementEvents.map((event) => event.id)).toEqual([
      "mum_bill_offset",
      "tradie_diesel_avoided",
      "coast_fast_charge",
      "hospital_grid_support",
      "food_bank_donation",
      "business_local_sale",
      "grid_fallback_sale",
      "pod_local_loop",
    ]);
  });

  it("allocates the authored home surplus exactly once", () => {
    expect(scenarioSurplusKwh).toBeCloseTo(12.4);
    expect(homeSettlementTotals.kwh).toBeCloseTo(scenarioSurplusKwh);
    expect(homeSettlementEvents.every((event) => event.fromLocationId === "home")).toBe(true);
  });

  it("beats the feed-in alternative for every shown event", () => {
    settlementEvents.forEach((event) => {
      expect(event.benefitVsFiT, event.id).toBeGreaterThan(0);
      expect(event.netValue, event.id).toBeGreaterThan(event.feedInAlternative);
    });
  });

  it("reconciles home settlement totals", () => {
    expect(homeSettlementTotals.grossValue).toBeCloseTo(6.63);
    expect(homeSettlementTotals.networkFee).toBeCloseTo(0.8184);
    expect(homeSettlementTotals.citetherMargin).toBeCloseTo(0.58116);
    expect(homeSettlementTotals.netValue).toBeCloseTo(5.23044);
    expect(homeSettlementTotals.feedInAlternative).toBeCloseTo(0.372);
    expect(homeSettlementTotals.benefitVsFiT).toBeCloseTo(4.85844);
    expect(homeSettlementTotals.netValue).toBeGreaterThan(homeSettlementTotals.feedInAlternative * 10);
  });

  it("reconciles full-day settlement totals", () => {
    expect(daySettlementTotals.kwh).toBeCloseTo(64.4);
    expect(daySettlementTotals.grossValue).toBeCloseTo(69.03);
    expect(daySettlementTotals.networkFee).toBeCloseTo(4.9784);
    expect(daySettlementTotals.citetherMargin).toBeCloseTo(6.40516);
    expect(daySettlementTotals.netValue).toBeCloseTo(57.64644);
    expect(daySettlementTotals.feedInAlternative).toBeCloseTo(1.932);
    expect(daySettlementTotals.benefitVsFiT).toBeCloseTo(55.71444);
    expect(daySettlementTotals.carbonAvoidedKg).toBeCloseTo(1.96);
  });

  it("keeps the quoted fast-charge and local-loop inputs in the scenario", () => {
    const pod = citetherScenario.destinations.find((destination) => destination.id === "pod_sell");
    expect(citetherScenario.prices.fastChargerRate).toBeCloseTo(0.78);
    expect(pod?.networkFeeMultiplier).toBeCloseTo(0.4);
  });
});
