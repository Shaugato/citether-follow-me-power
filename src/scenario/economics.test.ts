import { describe, expect, it } from "vitest";
import {
  benefitVsFiT,
  carbonAvoided,
  citetherMargin,
  feedInAlternative,
  grossValue,
  netValue,
  networkFee,
  surplusKwh,
} from "./economics";

describe("economics", () => {
  it("calculates surplus from generation after home self-use", () => {
    expect(surplusKwh(19.5, 7.1)).toBeCloseTo(12.4);
  });

  it("calculates the weak feed-in alternative", () => {
    expect(feedInAlternative(12.4, 0.03)).toBeCloseTo(0.372);
  });

  it("calculates gross, fee, margin, net, and benefit consistently", () => {
    const gross = grossValue(2, 0.34);
    const fee = networkFee(2, 0.08);
    const margin = citetherMargin(gross, fee, 0.1);
    const net = netValue(gross, fee, margin);
    const fit = feedInAlternative(2, 0.03);

    expect(gross).toBeCloseTo(0.68);
    expect(fee).toBeCloseTo(0.16);
    expect(margin).toBeCloseTo(0.052);
    expect(net).toBeCloseTo(0.468);
    expect(benefitVsFiT(net, fit)).toBeCloseTo(0.408);
  });

  it("supports reduced local-loop network fees", () => {
    expect(networkFee(3.2, 0.08, 0.4)).toBeCloseTo(0.1024);
  });

  it("calculates avoided diesel carbon against grid supply", () => {
    expect(carbonAvoided(2.8, 0.82, 0.12)).toBeCloseTo(1.96);
  });
});
