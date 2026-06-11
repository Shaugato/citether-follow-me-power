import type { SettlementEvent, SettlementTotals } from "./types";

export function surplusKwh(solarGeneratedKwh: number, homeSelfUseKwh: number) {
  return solarGeneratedKwh - homeSelfUseKwh;
}

export function feedInAlternative(kwh: number, feedInTariff: number) {
  return kwh * feedInTariff;
}

export function grossValue(kwh: number, destinationRetailPrice: number) {
  return kwh * destinationRetailPrice;
}

export function networkFee(kwh: number, networkFeePerKwh: number, multiplier = 1) {
  return kwh * networkFeePerKwh * multiplier;
}

export function citetherMargin(gross: number, fee: number, marginPct: number) {
  return Math.max(gross - fee, 0) * marginPct;
}

export function netValue(gross: number, fee: number, margin: number) {
  return gross - fee - margin;
}

export function benefitVsFiT(net: number, feedIn: number) {
  return net - feedIn;
}

export function carbonAvoided(kwh: number, dieselKgPerKwh: number, gridKgPerKwh: number) {
  return kwh * (dieselKgPerKwh - gridKgPerKwh);
}

export function sumSettlementEvents(events: SettlementEvent[]): SettlementTotals {
  return events.reduce<SettlementTotals>((totals, event) => ({
    kwh: totals.kwh + event.kwh,
    grossValue: totals.grossValue + event.grossValue,
    networkFee: totals.networkFee + event.networkFee,
    citetherMargin: totals.citetherMargin + event.citetherMargin,
    netValue: totals.netValue + event.netValue,
    feedInAlternative: totals.feedInAlternative + event.feedInAlternative,
    benefitVsFiT: totals.benefitVsFiT + event.benefitVsFiT,
    carbonAvoidedKg: totals.carbonAvoidedKg + (event.carbonAvoidedKg ?? 0),
  }), {
    kwh: 0,
    grossValue: 0,
    networkFee: 0,
    citetherMargin: 0,
    netValue: 0,
    feedInAlternative: 0,
    benefitVsFiT: 0,
    carbonAvoidedKg: 0,
  });
}
