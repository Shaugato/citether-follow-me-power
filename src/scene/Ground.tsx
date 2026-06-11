import { Grid } from "@react-three/drei";
import { colors } from "../lib/colors";

export function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[72, 54]} />
        <meshBasicMaterial color={colors.ground} />
      </mesh>
      <Grid
        position={[0, 0.012, 0]}
        args={[72, 54]}
        cellSize={1}
        cellThickness={0.35}
        cellColor="#142338"
        sectionSize={6}
        sectionThickness={0.7}
        sectionColor="#1b3651"
        fadeDistance={58}
        fadeStrength={1.3}
        infiniteGrid={false}
      />
      <mesh position={[11, 0.025, 13.5]} rotation-x={-Math.PI / 2} rotation-z={-0.16}>
        <planeGeometry args={[43, 2.2]} />
        <meshBasicMaterial color="#0d1725" />
      </mesh>
      <mesh position={[21, 0.03, 18.8]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[26, 8]} />
        <meshBasicMaterial color="#071b28" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}
