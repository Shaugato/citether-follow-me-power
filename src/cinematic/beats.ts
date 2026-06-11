import type { EnergyPathId } from "../energy/paths";
import type { LocationId } from "../scenario/types";

export type CinematicEventId =
  | "title"
  | "solar_surplus"
  | "energy_trapped"
  | "outside_needs"
  | "system_mismatch"
  | "settlement_ignites"
  | "account_detaches"
  | "power_mum"
  | "diesel_off"
  | "coast_charge"
  | "hospital_support"
  | "six_destinations"
  | "pod_cooperative"
  | "sankey_fees"
  | "finale";

export type MetricKey =
  | "title"
  | "surplus"
  | "fit"
  | "outsideCost"
  | "contrast"
  | "credits"
  | "account"
  | "mum"
  | "tradie"
  | "ev"
  | "hospital"
  | "destinations"
  | "podFee"
  | "economics"
  | "final";

export interface OverlayCue {
  eyebrow: string;
  metricKey: MetricKey;
  explanationTitle: string;
  explanation: string;
  ledgerMode: "hidden" | "home" | "event" | "economics";
  showImpact?: boolean;
  showEndCard?: boolean;
}

export interface CameraKeyframe {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  transition: "glide" | "cut";
}

export interface Beat {
  id: number;
  start: number;
  duration: number;
  eventId: CinematicEventId;
  focusNodeId?: LocationId;
  settlementEventIds: string[];
  caption: string;
  camera: CameraKeyframe;
  cameraCuts?: Array<{ offset: number; camera: CameraKeyframe }>;
  activePaths: EnergyPathId[];
  overlay: OverlayCue;
}

const camera = (position: CameraKeyframe["position"], target: CameraKeyframe["target"], transition: CameraKeyframe["transition"] = "glide"): CameraKeyframe => ({
  position,
  target,
  transition,
});

export const STORY_DURATION = 195;
export const FINAL_HOLD_DURATION = 5;
export const CINEMATIC_DURATION = STORY_DURATION + FINAL_HOLD_DURATION;
export const OPENING_CAMERA = camera([-31, 12, 3], [-18, 2, -7]);

export const beats: Beat[] = [
  {
    id: 0, start: 0, duration: 10, eventId: "title", focusNodeId: "home",
    settlementEventIds: [], caption: "citEther — Follow Me Power.",
    camera: camera([-29, 10, 1], [-18, 2.2, -7]), activePaths: [],
    overlay: {
      eyebrow: "One home · one problem", metricKey: "title", ledgerMode: "hidden",
      explanationTitle: "The old system",
      explanation: "Solar value is tied to the meter at one address. Start with one home and its unused rooftop power.",
    },
  },
  {
    id: 1, start: 10, duration: 16, eventId: "solar_surplus", focusNodeId: "home",
    settlementEventIds: [], caption: "A home makes more power than it can use.",
    camera: camera([-27, 8, -1], [-18, 2.8, -7]), activePaths: [],
    overlay: {
      eyebrow: "Rooftop generation", metricKey: "surplus", ledgerMode: "home",
      explanationTitle: "Why is there surplus?",
      explanation: "The roof generates more than the home uses. The battery is full, leaving rooftop value with nowhere useful to go.",
    },
  },
  {
    id: 2, start: 26, duration: 16, eventId: "energy_trapped", focusNodeId: "home",
    settlementEventIds: [], caption: "Today its only option is export — for almost nothing.",
    camera: camera([-26, 7, -2], [-18, 3.8, -7]), activePaths: [],
    overlay: {
      eyebrow: "Address-locked value", metricKey: "fit", ledgerMode: "home",
      explanationTitle: "Why is this wasteful?",
      explanation: "The surplus can only leave through the home meter at the weak feed-in tariff. Its value remains trapped at this address.",
    },
  },
  {
    id: 3, start: 42, duration: 16, eventId: "outside_needs", focusNodeId: "job_site",
    settlementEventIds: [], caption: "Meanwhile the same person pays full price everywhere else.",
    camera: camera([15, 25, 30], [0, 1.8, 1]), activePaths: [],
    overlay: {
      eyebrow: "Needs elsewhere", metricKey: "outsideCost", ledgerMode: "home",
      explanationTitle: "The same account pays again",
      explanation: "Mum's flat, the job site, coast charger and hospital all need energy while the home's surplus earns almost nothing.",
    },
  },
  {
    id: 4, start: 58, duration: 12, eventId: "system_mismatch", focusNodeId: "ev_coast",
    settlementEventIds: [], caption: "Worth almost nothing here. Expensive there.",
    camera: camera([22, 18, 27], [1, 2, 1]), activePaths: [],
    overlay: {
      eyebrow: "The contradiction", metricKey: "contrast", ledgerMode: "home",
      explanationTitle: "Why change the system?",
      explanation: "Export is valued at $0.03/kWh while the same person can pay $0.78/kWh to charge elsewhere.",
    },
  },
  {
    id: 5, start: 70, duration: 16, eventId: "settlement_ignites", focusNodeId: "home",
    settlementEventIds: [], caption: "citEther settles the value. The grid still carries the power.",
    camera: camera([24, 27, 34], [0, 4.5, 1]), activePaths: [],
    overlay: {
      eyebrow: "Settlement activates", metricKey: "credits", ledgerMode: "home",
      explanationTitle: "What changes?",
      explanation: "The grid continues supplying physical electricity. citEther converts the rooftop surplus into settlement credits tied to the energy account.",
    },
  },
  {
    id: 6, start: 86, duration: 10, eventId: "account_detaches", focusNodeId: "home",
    settlementEventIds: [], caption: "Your energy account follows you — not your meter.",
    camera: camera([-4, 14, 12], [-12, 5.8, -3]), activePaths: [],
    overlay: {
      eyebrow: "Follow Me Power", metricKey: "account", ledgerMode: "home",
      explanationTitle: "What follows you?",
      explanation: "The account identity separates from the address. Authorised destinations can now receive the value, while the grid supplies their electricity.",
    },
  },
  {
    id: 7, start: 96, duration: 14, eventId: "power_mum", focusNodeId: "mums_flat",
    settlementEventIds: ["mum_bill_offset"], caption: "Offset Mum's bill from your roof — the grid powers her flat, citEther moves the value.",
    camera: camera([-4, 11, 9], [-13, 3.2, -2]), activePaths: ["mum"],
    overlay: {
      eyebrow: "Share with family", metricKey: "mum", ledgerMode: "event",
      explanationTitle: "Why this decision?",
      explanation: "A surplus-solar credit from Home settles against Mum's unit bill. The grid supplies her electricity; citEther transfers the value.",
    },
  },
  {
    id: 8, start: 110, duration: 12, eventId: "diesel_off", focusNodeId: "job_site",
    settlementEventIds: ["tradie_diesel_avoided"], caption: "Run the site on home solar — not diesel.",
    camera: camera([8, 9, -2], [-3, 1.5, -12]), activePaths: ["job"],
    overlay: {
      eyebrow: "Use where it matters", metricKey: "tradie", ledgerMode: "event",
      explanationTitle: "Why this decision?",
      explanation: "Home credits offset costly job-site consumption first, replacing diesel use and avoiding its higher emissions.",
    },
  },
  {
    id: 9, start: 122, duration: 12, eventId: "coast_charge", focusNodeId: "ev_coast",
    settlementEventIds: ["coast_fast_charge"], caption: "Charge at the coast — paid by this morning's roof.",
    camera: camera([29, 9, 22], [20, 1.2, 14]), activePaths: ["coast"],
    overlay: {
      eyebrow: "Your account travels", metricKey: "ev", ledgerMode: "event",
      explanationTitle: "Why this decision?",
      explanation: "The charger receives grid electricity. citEther settles rooftop credits against the high fast-charge price.",
    },
  },
  {
    id: 10, start: 134, duration: 16, eventId: "hospital_support", focusNodeId: "hospital",
    settlementEventIds: ["hospital_grid_support"], caption: "Her car supports a strained hospital node — and earns while she works.",
    camera: camera([24, 11, 3], [13, 2.5, -9]), activePaths: [],
    overlay: {
      eyebrow: "Separate V2G service", metricKey: "hospital", ledgerMode: "event",
      explanationTitle: "Why this decision?",
      explanation: "This is separate from household rooftop surplus: the nurse's EV supports a constrained hospital node and earns a grid-service payment.",
    },
  },
  {
    id: 11, start: 150, duration: 12, eventId: "six_destinations", focusNodeId: "home",
    settlementEventIds: ["food_bank_donation", "business_local_sale", "grid_fallback_sale"],
    caption: "Use it. Share it. Donate it. Sell it. Always better than zero.",
    camera: camera([26, 27, 34], [-3, 2.5, 1]), activePaths: ["mum", "job", "charity", "business", "pod", "grid"],
    overlay: {
      eyebrow: "Authorised destinations", metricKey: "destinations", ledgerMode: "event",
      explanationTitle: "Why these destinations?",
      explanation: "The account applies an ordered rule: use, share, donate and sell locally before the dim wholesale fallback.",
    },
  },
  {
    id: 12, start: 162, duration: 10, eventId: "pod_cooperative", focusNodeId: "pod",
    settlementEventIds: ["pod_local_loop"], caption: "Share locally first — the value stays in your street, and network fees shrink.",
    camera: camera([2, 11, 20], [-10, 1.2, 10]), activePaths: ["pod"],
    overlay: {
      eyebrow: "Same feeder · local loop", metricKey: "podFee", ledgerMode: "event",
      explanationTitle: "Why settle locally?",
      explanation: "The Pod keeps value in the street. Its same-feeder route uses a 60% lower network-fee multiplier.",
    },
  },
  {
    id: 13, start: 172, duration: 12, eventId: "sankey_fees",
    settlementEventIds: [], caption: "Even after network fees and our margin — it beats a zero feed-in tariff.",
    camera: camera([1, 42, 4], [0, 0, 1]), activePaths: ["mum", "job", "charity", "business", "pod", "grid"],
    overlay: {
      eyebrow: "Household rooftop economics", metricKey: "economics", ledgerMode: "economics", showImpact: true,
      explanationTitle: "Does the household benefit?",
      explanation: "Yes. The rooftop-surplus result is shown on its own: gross value less network fees and citEther margin, compared with the weak FiT alternative.",
    },
  },
  {
    id: 14, start: 184, duration: 11, eventId: "finale",
    settlementEventIds: [], caption: "Your energy is no longer trapped at your address. citEther — your energy follows you.",
    camera: camera([35, 31, 43], [0, 3, 1]), activePaths: ["mum", "job", "coast", "hospital", "pod", "charity", "business", "grid"],
    overlay: {
      eyebrow: "The living network", metricKey: "final", ledgerMode: "economics", showImpact: true, showEndCard: true,
      explanationTitle: "Two distinct value streams",
      explanation: "Household rooftop surplus creates portable credits. Separately, the nurse's EV earns for hospital grid support. They are never combined into one household-benefit headline.",
    },
  },
];

export function getBeatAt(time: number) {
  for (let index = beats.length - 1; index >= 0; index -= 1) {
    if (time >= beats[index].start) return beats[index];
  }
  return beats[0];
}
