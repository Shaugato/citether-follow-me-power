import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, type Group, type MeshBasicMaterial } from "three";
import { smoothstep } from "../../energy/effects";
import { colors } from "../../lib/colors";
import { formatMoney } from "../../lib/formatters";
import { settlementEvents } from "../../scenario/settlementEvents";
import { useSimStore } from "../../state/useSimStore";
import { NodeLabel } from "../nodes/NodeLabel";
import { lightShellMaterial, shellMaterial } from "./materials";
import { StateBadge } from "./StateBadge";

const windows: [number, number, number][] = [
  [-1.8, 1.2, 2.18], [-0.9, 1.2, 2.18], [0.9, 1.2, 2.18], [1.8, 1.2, 2.18],
  [-1.8, 2.3, 2.18], [-0.9, 2.3, 2.18], [0.9, 2.3, 2.18], [1.8, 2.3, 2.18],
];

export function Hospital() {
  const stressRing = useRef<MeshBasicMaterial>(null);
  const cross = useRef<Group>(null);
  const badge = useRef<HTMLDivElement>(null);
  const earning = settlementEvents.find((event) => event.id === "hospital_grid_support")!.netValue;

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const after = smoothstep((time - 140) / 3);
    if (stressRing.current) stressRing.current.color.set(after > 0.5 ? colors.donate : colors.stress);
    if (cross.current) {
      cross.current.scale.setScalar(1 + after * 0.08);
      cross.current.traverse((object) => {
        if (object instanceof Mesh) {
          (object.material as MeshBasicMaterial).color.set(after > 0.5 ? colors.donate : colors.stress);
        }
      });
    }
    if (badge.current) {
      badge.current.dataset.tone = after > 0.5 ? "after" : "before";
      badge.current.textContent = after > 0.5
        ? `NODE SUPPORTED · EARNED ${formatMoney(earning)}`
        : "CONSTRAINED NODE · SUPPORT NEEDED";
      badge.current.style.opacity = time >= 134 && time < 150 ? "1" : "0";
    }
  });

  return (
    <group position={[13, 0, -9]}>
      <mesh position={[0, 2, 0]}><boxGeometry args={[5.4, 4, 4.2]} />{shellMaterial}</mesh>
      <mesh position={[-3.15, 1.35, 0]}><boxGeometry args={[1.2, 2.7, 3]} />{lightShellMaterial}</mesh>
      <mesh position={[3.15, 1.35, 0]}><boxGeometry args={[1.2, 2.7, 3]} />{lightShellMaterial}</mesh>
      <Instances limit={windows.length}>
        <boxGeometry args={[0.48, 0.55, 0.07]} />
        <meshBasicMaterial color="#6f91ad" />
        {windows.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <group ref={cross} position={[0, 2.3, 2.16]}>
        <mesh><boxGeometry args={[0.38, 2.25, 0.14]} /><meshBasicMaterial color={colors.stress} toneMapped={false} /></mesh>
        <mesh rotation-z={Math.PI / 2}><boxGeometry args={[0.38, 2.25, 0.14]} /><meshBasicMaterial color={colors.stress} toneMapped={false} /></mesh>
      </group>
      <mesh position={[0, 2.2, 2.25]}>
        <torusGeometry args={[2.25, 0.1, 6, 36]} />
        <meshBasicMaterial ref={stressRing} color={colors.stress} toneMapped={false} />
      </mesh>
      <mesh position={[3.7, 0.7, 2.3]}><boxGeometry args={[1.5, 0.45, 0.85]} /><meshBasicMaterial color={colors.grid} /></mesh>
      <mesh position={[4.45, 1.35, 2.3]}><boxGeometry args={[0.28, 1.6, 0.28]} /><meshBasicMaterial color={colors.settlement} toneMapped={false} /></mesh>
      <StateBadge labelRef={badge} position={[0, 6.25, 0]} />
      <NodeLabel locationId="hospital" label="Hospital · Nurse EV + Grid Node" color={colors.grid} position={[0, 5.35, 0]} />
    </group>
  );
}
