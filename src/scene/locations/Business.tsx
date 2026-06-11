import { Instance, Instances } from "@react-three/drei";
import { colors } from "../../lib/colors";
import { NodeLabel } from "../nodes/NodeLabel";
import { shellMaterial } from "./materials";

export function Business() {
  return (
    <group position={[6, 0, 2]}>
      <mesh position={[0, 1.3, 0]}><boxGeometry args={[3.8, 2.6, 2.7]} />{shellMaterial}</mesh>
      <mesh position={[0, 2.35, 1.65]} rotation-x={-0.38}><boxGeometry args={[4.3, 0.14, 1.15]} /><meshBasicMaterial color={colors.sell} toneMapped={false} /></mesh>
      <Instances limit={4}>
        <boxGeometry args={[0.78, 1.1, 0.08]} />
        <meshBasicMaterial color="#6684a2" />
        {[-1.35, -0.45, 0.45, 1.35].map((x) => <Instance key={x} position={[x, 1.1, 1.39]} />)}
      </Instances>
      <mesh position={[0, 3.15, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.58, 0.09, 5, 20]} /><meshBasicMaterial color={colors.sell} toneMapped={false} /></mesh>
      <NodeLabel locationId="business" label="Local Business · Bid / Offer" color={colors.sell} position={[0, 4.25, 0]} />
    </group>
  );
}
