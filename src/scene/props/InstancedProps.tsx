import { Instance, Instances } from "@react-three/drei";
import { colors } from "../../lib/colors";

const trees: [number, number, number][] = [
  [-23, 0.8, 12], [-20, 0.8, 14], [-15, 0.8, 13], [-8, 0.8, 17],
  [-4, 0.8, 15], [3, 0.8, 17], [8, 0.8, 15], [15, 0.8, 14],
  [21, 0.8, 12], [25, 0.8, 8], [-24, 0.8, -15], [23, 0.8, -13],
];

const lights: [number, number, number][] = [
  [-19, 0.9, 3], [-12, 0.9, 5], [-5, 0.9, 7], [2, 0.9, 9],
  [9, 0.9, 11], [16, 0.9, 13], [23, 0.9, 15],
];

const pylons: [number, number, number][] = [
  [28, 1.6, -15], [28, 1.6, -8], [28, 1.6, -1], [28, 1.6, 6],
];

export function InstancedProps() {
  return (
    <group>
      <Instances limit={trees.length}>
        <coneGeometry args={[0.65, 1.6, 5]} />
        <meshBasicMaterial color="#102b29" />
        {trees.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <Instances limit={lights.length}>
        <cylinderGeometry args={[0.035, 0.035, 1.8, 5]} />
        <meshBasicMaterial color="#28415d" />
        {lights.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
      <Instances limit={lights.length}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshBasicMaterial color={colors.solar} toneMapped={false} />
        {lights.map(([x, , z], index) => <Instance key={index} position={[x, 1.82, z]} />)}
      </Instances>
      <Instances limit={pylons.length}>
        <boxGeometry args={[0.16, 3.2, 0.16]} />
        <meshBasicMaterial color={colors.grid} />
        {pylons.map((position, index) => <Instance key={index} position={position} />)}
      </Instances>
    </group>
  );
}
