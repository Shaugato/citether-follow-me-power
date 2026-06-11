import { Line } from "@react-three/drei";
import { AdditiveBlending } from "three";
import { physicalGridPaths } from "../energy/physicalGridPaths";
import { colors } from "../lib/colors";

export function PhysicalGridLayer() {
  return (
    <group>
      {physicalGridPaths.map((path) => (
        <group key={path.id}>
          <Line
            points={path.points}
            color="#EAF1FB"
            lineWidth={0.7}
            transparent
            opacity={0.38}
            depthWrite={false}
          />
          <Line
            points={path.points}
            color={colors.grid}
            lineWidth={1.7}
            transparent
            opacity={0.52}
            depthWrite={false}
          />
        </group>
      ))}
      <mesh position={[8, 0.13, -2]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.45, 0.62, 20]} />
        <meshBasicMaterial
          color={colors.grid}
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-8, 0.13, -2]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.38, 0.54, 20]} />
        <meshBasicMaterial
          color="#EAF1FB"
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
