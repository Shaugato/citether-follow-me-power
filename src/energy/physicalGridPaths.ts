import { CatmullRomCurve3, Vector3 } from "three";
import type { LocationId } from "../scenario/types";

export interface PhysicalGridPath {
  id: string;
  toLocationId: LocationId;
  curve: CatmullRomCurve3;
  points: Vector3[];
  samples: Vector3[];
  speed: number;
  phase: number;
}

const GROUND_Y = 0.11;
const GRID = new Vector3(23.5, GROUND_Y, -4);
const EAST_JUNCTION = new Vector3(8, GROUND_Y, -2);
const WEST_JUNCTION = new Vector3(-8, GROUND_Y, -2);
const SOUTH_JUNCTION = new Vector3(1, GROUND_Y, -9);
const NORTH_JUNCTION = new Vector3(5, GROUND_Y, 8);

const feeders: Array<{
  id: string;
  toLocationId: LocationId;
  points: Vector3[];
}> = [
  {
    id: "grid-home",
    toLocationId: "home",
    points: [GRID, EAST_JUNCTION, WEST_JUNCTION, new Vector3(-18, GROUND_Y, -7)],
  },
  {
    id: "grid-mum",
    toLocationId: "mums_flat",
    points: [GRID, EAST_JUNCTION, WEST_JUNCTION, new Vector3(-12, GROUND_Y, 1)],
  },
  {
    id: "grid-job",
    toLocationId: "job_site",
    points: [GRID, EAST_JUNCTION, SOUTH_JUNCTION, new Vector3(-3, GROUND_Y, -12)],
  },
  {
    id: "grid-coast",
    toLocationId: "ev_coast",
    points: [GRID, new Vector3(19, GROUND_Y, 3), new Vector3(20, GROUND_Y, 14)],
  },
  {
    id: "grid-hospital",
    toLocationId: "hospital",
    points: [GRID, new Vector3(18, GROUND_Y, -7), new Vector3(13, GROUND_Y, -9)],
  },
  {
    id: "grid-pod",
    toLocationId: "pod",
    points: [GRID, EAST_JUNCTION, NORTH_JUNCTION, new Vector3(-10, GROUND_Y, 10)],
  },
  {
    id: "grid-charity",
    toLocationId: "charity",
    points: [GRID, EAST_JUNCTION, NORTH_JUNCTION, new Vector3(1, GROUND_Y, 11)],
  },
  {
    id: "grid-business",
    toLocationId: "business",
    points: [GRID, EAST_JUNCTION, new Vector3(6, GROUND_Y, 2)],
  },
];

export const physicalGridPaths: PhysicalGridPath[] = feeders.map((feeder, index) => {
  const curve = new CatmullRomCurve3(feeder.points, false, "centripetal", 0.5);
  return {
    id: feeder.id,
    toLocationId: feeder.toLocationId,
    curve,
    points: curve.getPoints(40),
    samples: curve.getSpacedPoints(128),
    speed: 0.035 + (index % 3) * 0.004,
    phase: index / feeders.length,
  };
});

export function samplePhysicalGridPath(path: PhysicalGridPath, progress: number, target: Vector3) {
  const last = path.samples.length - 1;
  const scaled = progress * last;
  const lower = Math.floor(scaled);
  const upper = Math.min(lower + 1, last);
  return target.lerpVectors(path.samples[lower], path.samples[upper], scaled - lower);
}
