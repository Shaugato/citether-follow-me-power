import { Instance, Instances } from "@react-three/drei";
import { colors } from "../../lib/colors";
import { NodeLabel } from "../nodes/NodeLabel";

const homes: [number, number, number][] = [
  [-2.5, 0.55, -1.3], [0, 0.55, -1.3], [2.5, 0.55, -1.3],
  [-2.5, 0.55, 1.3], [0, 0.55, 1.3], [2.5, 0.55, 1.3],
];

export function CommunityPod() {
  return (
    <group position={[-10, 0, 10]}>
      <Instances limit={homes.length}>
        <boxGeometry args={[1.7, 1.1, 1.5]} />
        <meshBasicMaterial color="#183047" />
        {homes.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <Instances limit={homes.length}>
        <coneGeometry args={[1.25, 0.8, 4]} />
        <meshBasicMaterial color="#243b56" />
        {homes.map(([x, , z], index) => <Instance key={index} position={[x, 1.45, z]} rotation-y={Math.PI / 4} />)}
      </Instances>
      <mesh position={[4.4, 1, 0]}><boxGeometry args={[1.2, 2, 1.2]} /><meshBasicMaterial color={colors.settlement} toneMapped={false} /></mesh>
      <mesh position={[4.4, 2.2, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.75, 0.08, 5, 20]} /><meshBasicMaterial color={colors.settlement} toneMapped={false} /></mesh>
      <NodeLabel locationId="pod" label="Community Pod · Shared Battery" color={colors.settlement} position={[0, 3.6, 0]} />
    </group>
  );
}
