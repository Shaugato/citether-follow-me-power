import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshBasicMaterial } from "three";
import { colors } from "../../lib/colors";
import { smoothstep } from "../../energy/effects";
import { useSimStore } from "../../state/useSimStore";
import { NodeLabel } from "../nodes/NodeLabel";
import { lightShellMaterial } from "./materials";
import { StateBadge } from "./StateBadge";

const posts: [number, number, number][] = [[-1.8, 1.4, -1.25], [1.8, 1.4, -1.25], [-1.8, 1.4, 1.25], [1.8, 1.4, 1.25]];

export function JobSite() {
  const generator = useRef<MeshBasicMaterial>(null);
  const tools = useRef<MeshBasicMaterial>(null);
  const badge = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const after = smoothstep((time - 115) / 2);
    if (generator.current) generator.current.color.set(after > 0.5 ? "#46505f" : colors.stress);
    if (tools.current) tools.current.color.set(after > 0.5 ? colors.settlement : "#aab6c5");
    if (badge.current) {
      badge.current.dataset.tone = after > 0.5 ? "after" : "before";
      badge.current.textContent = after > 0.5 ? "DIESEL OFF · CO₂ AVOIDED 1.96 KG" : "DIESEL RUNNING · SMOKE";
      badge.current.style.opacity = time >= 110 && time < 122 ? "1" : "0";
    }
  });

  return (
    <group position={[-3, 0, -12]}>
      <Instances limit={posts.length}>
        <boxGeometry args={[0.18, 2.8, 0.18]} />{lightShellMaterial}
        {posts.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <Instances limit={2}>
        <boxGeometry args={[4, 0.18, 3]} />{lightShellMaterial}
        <Instance position={[0, 1.35, 0]} />
        <Instance position={[0, 2.75, 0]} />
      </Instances>
      <mesh position={[-1.1, 0.42, 0.9]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.48, 0.48, 1.45, 8]} />
        <meshBasicMaterial ref={tools} color="#aab6c5" toneMapped={false} />
      </mesh>
      <mesh position={[2.4, 0.7, 0]}>
        <boxGeometry args={[1.35, 1.4, 1.2]} />
        <meshBasicMaterial ref={generator} color={colors.stress} toneMapped={false} />
      </mesh>
      <mesh position={[2.4, 1.55, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.55, 6]} />
        <meshBasicMaterial color="#5f6d7b" />
      </mesh>
      <StateBadge labelRef={badge} position={[0, 4.8, 0]} />
      <NodeLabel locationId="job_site" label="Tradie Job Site · Tools" color={colors.settlement} position={[0, 4, 0]} />
    </group>
  );
}
