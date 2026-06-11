import { Instance, Instances } from "@react-three/drei";
import { colors } from "../../lib/colors";
import { NodeLabel } from "../nodes/NodeLabel";

const pylons: [number, number, number][] = [[0, 1.8, -4.5], [0, 1.8, 0], [0, 1.8, 4.5]];

export function Grid() {
  return (
    <group position={[23.5, 0, -4]}>
      <Instances limit={pylons.length}>
        <boxGeometry args={[0.22, 3.6, 0.22]} />
        <meshBasicMaterial color={colors.grid} />
        {pylons.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <Instances limit={pylons.length}>
        <boxGeometry args={[2.4, 0.16, 0.16]} />
        <meshBasicMaterial color={colors.grid} />
        {pylons.map(([x, , z], index) => <Instance key={index} position={[x, 2.7, z]} />)}
      </Instances>
      <NodeLabel locationId="grid" label="The Grid · Wholesale Fallback" color={colors.grid} position={[0, 5, 0]} />
    </group>
  );
}
