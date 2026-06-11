import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Vector3,
} from "three";
import { useSimStore } from "../state/useSimStore";
import { physicalGridPaths, samplePhysicalGridPath } from "./physicalGridPaths";

const PARTICLES_PER_FEEDER = 3;
const POOL_SIZE = physicalGridPaths.length * PARTICLES_PER_FEEDER;
const matrix = new Matrix4();
const position = new Vector3();
const scale = new Vector3();
const blue = new Color("#3B82F6");
const whiteBlue = new Color("#D9EEFF");

export function PhysicalGridFlow() {
  const particlesRef = useRef<InstancedMesh>(null);

  useFrame(() => {
    const particles = particlesRef.current;
    if (!particles) return;

    const time = useSimStore.getState().cinematicTime;
    let index = 0;

    physicalGridPaths.forEach((path, pathIndex) => {
      for (let pulseIndex = 0; pulseIndex < PARTICLES_PER_FEEDER; pulseIndex += 1) {
        const offset = pulseIndex / PARTICLES_PER_FEEDER;
        const progress = (time * path.speed + path.phase + offset) % 1;
        samplePhysicalGridPath(path, progress, position);
        const breathe = 0.85 + Math.sin(time * 1.4 + pathIndex + pulseIndex) * 0.15;
        scale.setScalar((pulseIndex === 0 ? 0.13 : 0.085) * breathe);
        matrix.compose(position, particles.quaternion, scale);
        particles.setMatrixAt(index, matrix);
        particles.setColorAt(index, pulseIndex === 0 ? whiteBlue : blue);
        index += 1;
      }
    });

    particles.instanceMatrix.needsUpdate = true;
    if (particles.instanceColor) particles.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={particlesRef}
      args={[undefined, undefined, POOL_SIZE]}
      frustumCulled={false}
      onUpdate={(mesh) => mesh.instanceMatrix.setUsage(DynamicDrawUsage)}
    >
      <sphereGeometry args={[1, 6, 4]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.82}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
