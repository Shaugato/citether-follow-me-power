import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Vector3,
} from "three";
import { useSimStore } from "../state/useSimStore";
import { energyPaths, samplePath } from "./paths";

const POOL_SIZE = 48;
const TRAIL_LENGTH = 0.16;
const matrix = new Matrix4();
const position = new Vector3();
const scale = new Vector3();
const hiddenScale = new Vector3(0, 0, 0);
const headColor = new Color("#FFF7D1");
const trailColor = new Color();

export function EnergyCreditFlow() {
  const particlesRef = useRef<InstancedMesh | null>(null);
  const settledRef = useRef<InstancedMesh | null>(null);
  const settledHaloRef = useRef<InstancedMesh | null>(null);
  const trailRefs = useRef<Array<{ material: { opacity: number; visible: boolean } } | null>>([]);
  const colors = useMemo(() => energyPaths.map((path) => new Color(path.color)), []);

  useFrame((state) => {
    const particles = particlesRef.current;
    const settled = settledRef.current;
    const settledHalo = settledHaloRef.current;
    if (!particles || !settled || !settledHalo) return;

    const { cinematicTime: clock, activePaths: configuredPathIds, eventId, quality } = useSimStore.getState();
    const activePathIds = eventId === "six_destinations"
      ? configuredPathIds.slice(0, Math.min(Math.floor((clock - 150) / 1.8) + 1, configuredPathIds.length))
      : configuredPathIds;
    const activePaths = energyPaths.filter((path) => activePathIds.includes(path.id));
    let poolIndex = 0;

    energyPaths.forEach((path, pathIndex) => {
      const active = activePathIds.includes(path.id);
      const material = trailRefs.current[pathIndex]?.material;
      if (material) {
        material.opacity = active ? 0.42 : 0;
        material.visible = active;
      }

      if (!active) {
        matrix.compose(path.flowSamples[path.flowSamples.length - 1], settled.quaternion, hiddenScale);
        settled.setMatrixAt(pathIndex, matrix);
        settledHalo.setMatrixAt(pathIndex, matrix);
        return;
      }

      const [start] = path.activeWindow;
      const headProgress = ((clock - start) * path.speed) % 1;
      const qualityScale = quality === "low" ? 0.4 : quality === "med" ? 0.7 : 1;
      const count = Math.max(2, Math.floor((POOL_SIZE * qualityScale) / activePaths.length));
      const settledPulse = 0.48 + Math.sin(clock * 4 + pathIndex) * 0.07;
      scale.setScalar(settledPulse);
      matrix.compose(path.flowSamples[path.flowSamples.length - 1], settled.quaternion, scale);
      settled.setMatrixAt(pathIndex, matrix);
      settled.setColorAt(pathIndex, colors[pathIndex]);
      scale.setScalar(settledPulse * 1.45);
      matrix.compose(path.flowSamples[path.flowSamples.length - 1], settledHalo.quaternion, scale);
      settledHalo.setMatrixAt(pathIndex, matrix);

      for (let index = 0; index < count && poolIndex < POOL_SIZE; index += 1) {
        const trailAge = index / Math.max(count - 1, 1);
        const progress = (headProgress - trailAge * TRAIL_LENGTH + 1) % 1;
        samplePath(path, progress, position);

        const head = index === 0;
        const pulse = 0.88 + Math.sin((clock * 8 + index * 0.7)) * 0.12;
        const size = head ? 0.62 : (0.13 + (1 - trailAge) * 0.2) * pulse;
        scale.setScalar(size);
        matrix.compose(position, particles.quaternion, scale);
        particles.setMatrixAt(poolIndex, matrix);
        trailColor.copy(colors[pathIndex]).multiplyScalar(0.18 + (1 - trailAge) * 0.82);
        particles.setColorAt(poolIndex, head ? headColor : trailColor);
        poolIndex += 1;
      }
    });

    for (; poolIndex < POOL_SIZE; poolIndex += 1) {
      matrix.compose(position, particles.quaternion, hiddenScale);
      particles.setMatrixAt(poolIndex, matrix);
    }

    particles.instanceMatrix.needsUpdate = true;
    if (particles.instanceColor) particles.instanceColor.needsUpdate = true;
    settled.instanceMatrix.needsUpdate = true;
    if (settled.instanceColor) settled.instanceColor.needsUpdate = true;
    settledHalo.instanceMatrix.needsUpdate = true;

  });

  return (
    <group>
      {energyPaths.map((path, index) => (
        <Line
          key={path.id}
          ref={(line) => { trailRefs.current[index] = line; }}
          points={path.trailPoints}
          color={path.color}
          lineWidth={1.8}
          transparent
          opacity={0}
          depthWrite={false}
        />
      ))}
      <instancedMesh
        ref={(mesh) => {
          particlesRef.current = mesh;
          mesh?.instanceMatrix.setUsage(DynamicDrawUsage);
        }}
        args={[undefined, undefined, POOL_SIZE]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={(mesh) => {
          settledRef.current = mesh;
          mesh?.instanceMatrix.setUsage(DynamicDrawUsage);
        }}
        args={[undefined, undefined, energyPaths.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={1}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh
        ref={(mesh) => {
          settledHaloRef.current = mesh;
          mesh?.instanceMatrix.setUsage(DynamicDrawUsage);
        }}
        args={[undefined, undefined, energyPaths.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color="#F5C451"
          transparent
          opacity={0.72}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          wireframe
        />
      </instancedMesh>
    </group>
  );
}
