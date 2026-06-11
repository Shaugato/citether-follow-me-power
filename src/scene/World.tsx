import { OrbitControls, Stars } from "@react-three/drei";
import { colors } from "../lib/colors";
import { Ground } from "./Ground";
import { SettlementLayer } from "./SettlementLayer";
import { Landmarks } from "./locations/Landmarks";
import { InstancedProps } from "./props/InstancedProps";
import { EnergyCreditFlow } from "../energy/EnergyCreditFlow";
import { Director } from "../cinematic/Director";
import { SignatureEffects } from "./SignatureEffects";
import { PhysicalGridLayer } from "./PhysicalGridLayer";
import { PhysicalGridFlow } from "../energy/PhysicalGridFlow";

export function World() {
  return (
    <>
      <ambientLight intensity={0.3} color="#7aa2c8" />
      <directionalLight position={[-12, 22, 8]} intensity={1.25} color="#dbeafe" />
      <Stars radius={75} depth={30} count={550} factor={2} saturation={0} fade speed={0} />
      <Ground />
      <PhysicalGridLayer />
      <PhysicalGridFlow />
      <Landmarks />
      <SettlementLayer />
      <InstancedProps />
      <EnergyCreditFlow />
      <SignatureEffects />
      <Director />

      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshBasicMaterial color={colors.settlement} toneMapped={false} />
      </mesh>

      {import.meta.env.DEV && <OrbitControls enabled={false} />}
    </>
  );
}
