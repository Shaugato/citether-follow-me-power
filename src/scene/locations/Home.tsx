import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshBasicMaterial } from "three";
import { colors } from "../../lib/colors";
import { useSimStore } from "../../state/useSimStore";
import { NodeLabel } from "../nodes/NodeLabel";
import { darkMaterial, shellMaterial } from "./materials";
import { StateBadge } from "./StateBadge";

const windows: [number, number, number][] = [[-1.2, 1.25, 1.67], [0, 1.25, 1.67], [1.2, 1.25, 1.67]];
const panels: [number, number, number][] = [
  [-0.82, 4.02, -0.52], [0.82, 4.02, -0.52],
  [-0.82, 4.02, 0.52], [0.82, 4.02, 0.52],
];

export function Home() {
  const showSolarArray = useSimStore((state) => state.beat.focusNodeId === "home" || state.activeBeat >= 13);

  return (
    <group position={[-18, 0, -7]}>
      <mesh position={[0, 1.25, 0]}>{<boxGeometry args={[4.2, 2.5, 3.3]} />}{shellMaterial}</mesh>
      <mesh position={[0, 3.05, 0]} rotation-y={Math.PI / 4} scale={[1, 1, 0.76]}>
        <coneGeometry args={[3.35, 1.85, 4]} />{darkMaterial}
      </mesh>
      {showSolarArray && (
        <>
          <mesh position={[0, 3.91, 0]}>
            <boxGeometry args={[3.5, 0.1, 2.25]} />
            <meshBasicMaterial color="#132033" />
          </mesh>
          <Instances limit={panels.length}>
            <boxGeometry args={[1.42, 0.09, 0.82]} />
            <meshBasicMaterial color={colors.solar} toneMapped={false} />
            {panels.map((position, index) => <Instance key={index} position={position} />)}
          </Instances>
        </>
      )}
      <Instances limit={windows.length}>
        <boxGeometry args={[0.55, 0.72, 0.08]} />
        <meshBasicMaterial color="#8ecae6" toneMapped={false} />
        {windows.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <mesh position={[-2.18, 1.2, 0.72]}>
        <boxGeometry args={[0.34, 1.7, 0.68]} />
        <meshBasicMaterial color={colors.settlement} transparent opacity={0.65} toneMapped={false} />
      </mesh>
      <mesh position={[2.18, 1.25, 0.72]}>
        <boxGeometry args={[0.28, 0.75, 0.62]} />
        <meshBasicMaterial color="#aab6c5" />
      </mesh>
      <HomeCreditState />
      <NodeLabel locationId="home" label="Home · Solar + Full Battery" color={colors.solar} position={[0, 5.2, 0]} />
    </group>
  );
}

function HomeCreditState() {
  const fill = useRef<MeshBasicMaterial>(null);
  const badge = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const authorised = time >= 74;
    if (fill.current) {
      fill.current.color.set(authorised ? colors.settlement : "#313b49");
      fill.current.opacity = authorised ? 0.95 : 0.45;
    }
    if (badge.current) {
      badge.current.dataset.tone = authorised ? "after" : "before";
      badge.current.textContent = authorised ? "AUTHORISED · 12.4 CREDITS" : "NOT YET AUTHORISED · 0 CREDITS";
      badge.current.style.opacity = time < 96 ? "1" : "0";
    }
  });

  return (
    <>
      <mesh position={[2.18, 0.65, 0.72]}>
        <boxGeometry args={[0.42, 0.16, 0.72]} />
        <meshBasicMaterial ref={fill} color="#313b49" transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <StateBadge labelRef={badge} position={[0, 5.85, 0]} />
    </>
  );
}
