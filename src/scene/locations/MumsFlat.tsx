import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AdditiveBlending, Group, InstancedMesh, MeshBasicMaterial } from "three";
import { colors } from "../../lib/colors";
import { smoothstep } from "../../energy/effects";
import { useSimStore } from "../../state/useSimStore";
import { NodeLabel } from "../nodes/NodeLabel";
import { darkMaterial, shellMaterial } from "./materials";
import { StateBadge } from "./StateBadge";

const windows: [number, number, number][] = [
  [-0.85, 1.1, 1.43], [0.85, 1.1, 1.43],
  [-0.85, 2.35, 1.43], [0.85, 2.35, 1.43],
  [-0.85, 3.6, 1.43], [0.85, 3.6, 1.43],
];

export function MumsFlat() {
  const windowsRef = useRef<InstancedMesh>(null);

  return (
    <group position={[-12, 0, 1]}>
      <mesh position={[0, 2.4, 0]}><boxGeometry args={[3.2, 4.8, 2.8]} />{shellMaterial}</mesh>
      <mesh position={[0, 4.87, 0]}><boxGeometry args={[3.5, 0.18, 3.1]} />{darkMaterial}</mesh>
      <Instances ref={windowsRef} limit={windows.length}>
        <boxGeometry args={[0.62, 0.7, 0.07]} />
        <meshBasicMaterial color="#536174" />
        {windows.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <Instances limit={3}>
        <boxGeometry args={[2.55, 0.1, 0.68]} />
        <meshBasicMaterial color="#24364d" />
        {[1.52, 2.77, 4.02].map((y) => <Instance key={y} position={[0, y, 1.7]} />)}
      </Instances>
      <NoSolarIcon />
      <MumSettlementCue />
      <MumState windowsRef={windowsRef} />
      <NodeLabel locationId="mums_flat" label="Mum's Flat · No Solar" color={colors.share} position={[0, 6.2, 0]} />
    </group>
  );
}

function MumState({ windowsRef }: { windowsRef: { current: InstancedMesh | null } }) {
  const ring = useRef<MeshBasicMaterial>(null);
  const badge = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const after = smoothstep((time - 102) / 2);
    const windowsMaterial = windowsRef.current?.material as MeshBasicMaterial | undefined;
    if (windowsMaterial) windowsMaterial.color.set(after > 0.5 ? "#FFD58A" : "#536174");
    if (ring.current) ring.current.color.set(after > 0.5 ? colors.donate : colors.stress);
    if (badge.current) {
      badge.current.dataset.tone = after > 0.5 ? "after" : "before";
      badge.current.textContent = after > 0.5 ? "BILL STRESS ↓ · SETTLED ✓" : "BILL STRESS HIGH · NO SOLAR";
      badge.current.style.opacity = time >= 96 && time < 110 ? "1" : "0";
    }
  });

  return (
    <>
      <mesh position={[0, 2.45, 1.58]}>
        <torusGeometry args={[1.52, 0.07, 6, 32]} />
        <meshBasicMaterial ref={ring} color={colors.stress} toneMapped={false} />
      </mesh>
      <StateBadge labelRef={badge} position={[0, 7.1, 0]} />
    </>
  );
}

function NoSolarIcon() {
  return (
    <group position={[0, 5.12, 0]} rotation-y={-0.3}>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.48, 0.07, 5, 20]} />
        <meshBasicMaterial color="#8b98a9" />
      </mesh>
      <mesh rotation-z={-0.72}>
        <boxGeometry args={[0.12, 1.2, 0.12]} />
        <meshBasicMaterial color={colors.stress} toneMapped={false} />
      </mesh>
    </group>
  );
}

function MumSettlementCue() {
  const token = useRef<Group>(null);
  const glow = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const active = time >= 96 && time < 110;
    const progress = smoothstep((time - 98) / 5);
    if (token.current) {
      token.current.visible = active;
      token.current.position.set(3.4 - progress * 1.75, 6.6 - progress * 4.6, -0.2);
      token.current.rotation.y = time * 2;
      token.current.scale.setScalar(0.65 + Math.sin(time * 5) * 0.08);
    }
    if (glow.current) glow.current.opacity = active ? 0.08 + progress * 0.22 : 0;
  });

  return (
    <>
      <group ref={token} visible={false}>
        <mesh>
          <octahedronGeometry args={[0.48, 0]} />
          <meshBasicMaterial color={colors.share} toneMapped={false} />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.72, 0.055, 5, 20]} />
          <meshBasicMaterial color={colors.settlement} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[1.65, 2, -0.2]}>
        <sphereGeometry args={[0.72, 8, 6]} />
        <meshBasicMaterial ref={glow} color={colors.share} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
    </>
  );
}
