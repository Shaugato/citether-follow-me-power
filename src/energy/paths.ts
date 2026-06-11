import { CatmullRomCurve3, Vector3 } from "three";
import { colors } from "../lib/colors";

export type EnergyPathId =
  | "mum"
  | "job"
  | "coast"
  | "hospital"
  | "pod"
  | "charity"
  | "business"
  | "grid";

export interface EnergyPath {
  id: EnergyPathId;
  label: string;
  color: string;
  activeWindow: readonly [number, number];
  speed: number;
  curve: CatmullRomCurve3;
  trailPoints: Vector3[];
  flowSamples: Vector3[];
}

const HOME = new Vector3(-18, 3.55, -7);
const SETTLEMENT_ENTRY = new Vector3(-15.5, 7.4, -5.8);
const SETTLEMENT_HUB = new Vector3(0, 9.25, 1);

const destinations: Record<EnergyPathId, Vector3> = {
  mum: new Vector3(-12, 5.05, 1),
  job: new Vector3(-3, 2.25, -12),
  coast: new Vector3(22.05, 3.25, 14),
  hospital: new Vector3(13, 4.5, -9),
  pod: new Vector3(-5.6, 2.35, 10),
  charity: new Vector3(1, 2.75, 11),
  business: new Vector3(6, 2.65, 2),
  grid: new Vector3(23.5, 3.5, -4),
};

function makePath(
  id: EnergyPathId,
  label: string,
  color: string,
  activeWindow: readonly [number, number],
  speed: number,
) {
  const destination = destinations[id];
  const exit = SETTLEMENT_HUB.clone().lerp(destination, 0.34);
  exit.y = Math.max(exit.y, 7.2);

  const curve = new CatmullRomCurve3(
    [HOME, SETTLEMENT_ENTRY, SETTLEMENT_HUB, exit, destination],
    false,
    "centripetal",
    0.5,
  );

  return {
    id,
    label,
    color,
    activeWindow,
    speed,
    curve,
    trailPoints: curve.getPoints(72),
    flowSamples: curve.getSpacedPoints(256),
  } satisfies EnergyPath;
}

// Windows match the §5 director timings. Phase 2 loops around the Mum window as its proof.
export const energyPaths: EnergyPath[] = [
  makePath("mum", "Home → settlement → Mum's flat", colors.share, [96, 110], 0.23),
  makePath("job", "Home → settlement → Job site", colors.settlement, [110, 122], 0.2),
  makePath("coast", "Home → settlement → Coast charger", colors.settlement, [122, 134], 0.18),
  makePath("hospital", "Home → settlement → Hospital", colors.settlement, [134, 150], 0.18),
  makePath("pod", "Home → settlement → Community Pod", colors.settlement, [150, 184], 0.19),
  makePath("charity", "Home → settlement → Charity", colors.donate, [150, 162], 0.2),
  makePath("business", "Home → settlement → Local business", colors.sell, [150, 162], 0.2),
  makePath("grid", "Home → settlement → Grid", colors.settlement, [150, 184], 0.17),
];

export function isPathActive(path: EnergyPath, clock: number) {
  return clock >= path.activeWindow[0] && clock < path.activeWindow[1];
}

export function samplePath(path: EnergyPath, progress: number, target: Vector3) {
  const last = path.flowSamples.length - 1;
  const scaled = progress * last;
  const lower = Math.floor(scaled);
  const upper = Math.min(lower + 1, last);
  return target.lerpVectors(path.flowSamples[lower], path.flowSamples[upper], scaled - lower);
}
