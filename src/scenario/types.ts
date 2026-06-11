export type LocationId =
  | "home"
  | "mums_flat"
  | "job_site"
  | "ev_coast"
  | "hospital"
  | "pod"
  | "charity"
  | "business"
  | "grid";

export type AssetId =
  | "home_solar"
  | "home_battery"
  | "home_meter"
  | "job_generator"
  | "coast_ev"
  | "coast_charger"
  | "nurse_ev"
  | "pod_battery";

export type DestinationKind =
  | "use"
  | "share"
  | "donate"
  | "sellBusiness"
  | "sellPod"
  | "sellGrid"
  | "support";

export interface Household {
  id: string;
  name: string;
  homeLocationId: LocationId;
  solarGeneratedKwh: number;
  homeSelfUseKwh: number;
}

export interface LocationNode {
  id: LocationId;
  name: string;
  kind: "home" | "residential" | "job" | "transport" | "hospital" | "community" | "charity" | "business" | "grid";
  position: readonly [number, number, number];
  retailPriceKey: LocationId;
}

export interface Asset {
  id: AssetId;
  locationId: LocationId;
  kind: "solar" | "battery" | "meter" | "generator" | "ev" | "charger";
  capacityKwh?: number;
  initialKwh?: number;
}

export interface PriceTable {
  feedInTariff: number;
  retailByLocation: Record<LocationId, number>;
  wholesale: number;
  fastChargerRate: number;
}

export interface Destination {
  id: string;
  locationId: LocationId;
  kind: DestinationKind;
  priority: number;
  networkFeeMultiplier: number;
}

export interface SettlementEventSeed {
  id: string;
  t: string;
  beatId: number;
  fromLocationId: LocationId;
  toLocationId: LocationId;
  destinationId: string;
  kwh: number;
  labelTemplate: string;
  carbonMode?: "dieselAvoided";
}

export interface SettlementEvent {
  id: string;
  t: string;
  beatId: number;
  fromLocationId: LocationId;
  toLocationId: LocationId;
  destinationId: string;
  kwh: number;
  grossValue: number;
  networkFee: number;
  citetherMargin: number;
  netValue: number;
  feedInAlternative: number;
  benefitVsFiT: number;
  carbonAvoidedKg?: number;
  label: string;
}

export interface ScenarioDefinition {
  clockStart: string;
  households: Household[];
  locations: LocationNode[];
  assets: Asset[];
  prices: PriceTable;
  networkFeePerKwh: number;
  citetherMarginPct: number;
  destinations: Destination[];
  settlementEventSeeds: SettlementEventSeed[];
  carbon: {
    dieselKgPerKwh: number;
    gridKgPerKwh: number;
  };
}

export interface Scenario extends Omit<ScenarioDefinition, "settlementEventSeeds"> {
  settlementEvents: SettlementEvent[];
}

export interface SettlementTotals {
  kwh: number;
  grossValue: number;
  networkFee: number;
  citetherMargin: number;
  netValue: number;
  feedInAlternative: number;
  benefitVsFiT: number;
  carbonAvoidedKg: number;
}
