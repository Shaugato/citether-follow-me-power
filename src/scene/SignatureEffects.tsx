import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Group,
  Quaternion,
  Vector3,
} from "three";
import { colors } from "../lib/colors";
import { beatProgress, pulse, smoothstep } from "../energy/effects";
import { useSimStore } from "../state/useSimStore";

const matrix = new Matrix4();
const position = new Vector3();
const scale = new Vector3();
const rotation = new Quaternion();

const debrisDirections = [
  [-1.2, 1.2, -0.8], [1.1, 1.5, -0.9], [-0.8, 1.8, 1.1], [1.3, 1.1, 0.9],
  [-1.5, 0.8, 0.2], [1.5, 0.9, -0.2], [-0.4, 2.1, -1.3], [0.5, 2.2, 1.3],
  [-1.1, 1.6, 0.8], [1.1, 1.7, -0.7], [-1.6, 1.3, -0.5], [1.6, 1.4, 0.5],
] as const;

export function SignatureEffects() {
  return (
    <>
      <MeterCage />
      <DieselAndSmoke />
      <NodeLightUps />
      <HospitalGreenCross />
      <SankeyFeeLayer />
    </>
  );
}

function MeterCage() {
  const cage = useRef<Mesh>(null);
  const trapped = useRef<InstancedMesh>(null);
  const debris = useRef<InstancedMesh>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const cageMesh = cage.current;
    const trappedMesh = trapped.current;
    const debrisMesh = debris.current;
    if (!cageMesh || !trappedMesh || !debrisMesh) return;

    const cageMaterial = cageMesh.material as MeshBasicMaterial;
    const cageIn = smoothstep(beatProgress(time, 26, 2));
    const shatter = smoothstep(beatProgress(time, 70, 4));
    cageMaterial.opacity = cageIn * (1 - shatter) * 0.55;
    cageMesh.scale.setScalar(0.9 + cageIn * 0.1 + shatter * 0.7);
    cageMesh.visible = cageMaterial.opacity > 0.01;

    for (let index = 0; index < 18; index += 1) {
      const phase = (time * 0.2 + index / 18) % 1;
      const bounce = phase < 0.58 ? phase / 0.58 : 1 - (phase - 0.58) / 0.42;
      const radius = 0.45 + (index % 5) * 0.2;
      position.set(
        -18 + Math.cos(index * 2.19) * radius,
        3.45 + bounce * 2.25,
        -7 + Math.sin(index * 2.19) * radius,
      );
      const particleSize = time >= 26 && time < 74 ? (0.08 + (index % 3) * 0.025) * (1 - shatter) : 0;
      scale.setScalar(particleSize);
      matrix.compose(position, rotation, scale);
      trappedMesh.setMatrixAt(index, matrix);
    }
    trappedMesh.instanceMatrix.needsUpdate = true;

    debrisDirections.forEach((direction, index) => {
      const visible = time >= 70 && time < 78;
      const p = visible ? smoothstep(beatProgress(time, 70, 6)) : 0;
      position.set(
        -18 + direction[0] * p * 4,
        4.2 + direction[1] * p * 3 - p * p * 2,
        -7 + direction[2] * p * 4,
      );
      scale.setScalar(visible ? 0.18 * (1 - p * 0.7) : 0);
      matrix.compose(position, rotation, scale);
      debrisMesh.setMatrixAt(index, matrix);
    });
    debrisMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={cage} position={[-18, 4.35, -7]}>
        <boxGeometry args={[5.7, 4.3, 4.8]} />
        <meshBasicMaterial color={colors.solar} wireframe transparent opacity={0} toneMapped={false} />
      </mesh>
      <instancedMesh ref={trapped} args={[undefined, undefined, 18]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={colors.solar} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={debris} args={[undefined, undefined, debrisDirections.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={colors.settlement} transparent opacity={0.85} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function DieselAndSmoke() {
  const generator = useRef<Mesh>(null);
  const smoke = useRef<InstancedMesh>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const off = smoothstep(beatProgress(time, 115, 2));
    const generatorMesh = generator.current;
    const smokeMesh = smoke.current;
    if (!generatorMesh || !smokeMesh) return;

    const material = generatorMesh.material as MeshBasicMaterial;
    material.color.set(time < 116 ? colors.stress : "#46505f");
    material.opacity = time >= 42 ? 1 : 0.72;

    for (let index = 0; index < 8; index += 1) {
      const phase = (time * 0.32 + index / 8) % 1;
      position.set(
        -0.6 + Math.sin(index * 2.4) * 0.24 * phase,
        1.2 + phase * 3,
        -12 + Math.cos(index * 1.7) * 0.2 * phase,
      );
      const size = time >= 42 && time < 119 ? (0.12 + phase * 0.46) * (1 - off) : 0;
      scale.setScalar(size);
      matrix.compose(position, rotation, scale);
      smokeMesh.setMatrixAt(index, matrix);
    }
    smokeMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={generator} position={[-0.6, 0.55, -12]}>
        <boxGeometry args={[1.25, 1.15, 1.15]} />
        <meshBasicMaterial color={colors.stress} transparent toneMapped={false} />
      </mesh>
      <instancedMesh ref={smoke} args={[undefined, undefined, 8]} frustumCulled={false}>
        <sphereGeometry args={[1, 5, 4]} />
        <meshBasicMaterial color="#79818d" transparent opacity={0.24} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

const nodePulses = [
  { id: "mum", position: [-12, 5, 1], color: colors.share, start: 96 },
  { id: "job", position: [-3, 2.1, -12], color: colors.solar, start: 110 },
  { id: "coast", position: [20, 1.7, 14], color: colors.grid, start: 122 },
  { id: "hospital", position: [13, 4.5, -9], color: colors.donate, start: 134 },
  { id: "charity", position: [1, 2.8, 11], color: colors.donate, start: 152 },
  { id: "business", position: [6, 2.7, 2], color: colors.sell, start: 154 },
  { id: "pod", position: [-5.6, 2.4, 10], color: colors.settlement, start: 156 },
  { id: "grid", position: [23.5, 3.5, -4], color: colors.grid, start: 158 },
] as const;

function NodeLightUps() {
  const lights = useRef<InstancedMesh>(null);
  const colorsMemo = useMemo(() => nodePulses.map((node) => new Color(node.color)), []);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const mesh = lights.current;
    if (!mesh) return;

    nodePulses.forEach((node, index) => {
      const singleActive = time >= node.start && time < node.start + 14;
      const fanActive = time >= 150 && time < 162 && time >= node.start;
      const finaleActive = time >= 172;
      const active = singleActive || fanActive || finaleActive;
      const size = active ? 0.7 + pulse(time + index, 4) * 0.45 : 0;
      position.set(node.position[0], node.position[1], node.position[2]);
      scale.setScalar(size);
      matrix.compose(position, rotation, scale);
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, colorsMemo[index]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={lights} args={[undefined, undefined, nodePulses.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial
        vertexColors
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function HospitalGreenCross() {
  const cross = useRef<Group>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const group = cross.current;
    if (!group) return;
    const active = (time >= 143 && time < 150) || time >= 172;
    group.visible = active;
    group.scale.setScalar(active ? 0.9 + pulse(time, 4) * 0.16 : 0);
  });

  return (
    <group ref={cross} position={[13, 2.2, -7.02]} visible={false}>
      <mesh>
        <boxGeometry args={[0.38, 2.05, 0.16]} />
        <meshBasicMaterial color={colors.donate} toneMapped={false} />
      </mesh>
      <mesh rotation-z={Math.PI / 2}>
        <boxGeometry args={[0.38, 2.05, 0.16]} />
        <meshBasicMaterial color={colors.donate} toneMapped={false} />
      </mesh>
    </group>
  );
}

const feePoints: [number, number, number][] = [[0, 9.3, 1], [2.5, 9.6, 3.4], [5.2, 9.1, 5.8]];
const feeStart = new Vector3(...feePoints[0]);
const feeEnd = new Vector3(...feePoints[2]);

function SankeyFeeLayer() {
  const group = useRef<Group>(null);
  const fees = useRef<InstancedMesh | null>(null);
  const label = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const visible = time >= 172 && time < 184;
    const groupRef = group.current;
    const feeMesh = fees.current;
    if (!groupRef || !feeMesh) return;
    groupRef.visible = visible;
    if (label.current) label.current.style.opacity = visible ? "1" : "0";

    for (let index = 0; index < 7; index += 1) {
      const p = (time * 0.17 + index / 7) % 1;
      position.lerpVectors(feeStart, feeEnd, p);
      position.y += Math.sin(p * Math.PI) * 1.2;
      scale.setScalar(visible ? 0.12 + (1 - p) * 0.1 : 0);
      matrix.compose(position, rotation, scale);
      feeMesh.setMatrixAt(index, matrix);
    }
    feeMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} visible={false}>
      <Line points={feePoints} color={colors.solar} lineWidth={2.2} transparent opacity={0.8} />
      <mesh position={[0, 9.35, 1]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.35, 0.08, 6, 28]} />
        <meshBasicMaterial color={colors.solar} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <instancedMesh
        ref={(mesh) => {
          fees.current = mesh;
          mesh?.instanceMatrix.setUsage(DynamicDrawUsage);
        }}
        args={[undefined, undefined, 7]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={colors.solar} toneMapped={false} />
      </instancedMesh>
      <Html position={[4.8, 10.2, 5.7]} center distanceFactor={30}>
        <div ref={label} className="fee-label">network fee · net positive</div>
      </Html>
    </group>
  );
}
