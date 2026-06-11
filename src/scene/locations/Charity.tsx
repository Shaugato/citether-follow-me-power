import { colors } from "../../lib/colors";
import { NodeLabel } from "../nodes/NodeLabel";
import { shellMaterial } from "./materials";

export function Charity() {
  return (
    <group position={[1, 0, 11]}>
      <mesh position={[0, 1.3, 0]}><boxGeometry args={[3.4, 2.6, 2.8]} />{shellMaterial}</mesh>
      <mesh position={[0, 2.72, 0]}><coneGeometry args={[2.45, 1.15, 4]} /><meshBasicMaterial color="#1b3441" /></mesh>
      <mesh position={[0, 1.25, 1.44]}><boxGeometry args={[1.4, 1.7, 0.1]} /><meshBasicMaterial color="#d9f5ef" /></mesh>
      <group position={[0, 1.25, 1.52]}>
        {[0, Math.PI / 3, -Math.PI / 3].map((rotation) => (
          <mesh key={rotation} rotation-z={rotation}><boxGeometry args={[0.08, 0.72, 0.08]} /><meshBasicMaterial color={colors.donate} toneMapped={false} /></mesh>
        ))}
      </group>
      <NodeLabel locationId="charity" label="Food Bank · Freezer Donation" color={colors.donate} position={[0, 4.1, 0]} />
    </group>
  );
}
