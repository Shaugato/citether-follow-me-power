import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshBasicMaterial } from "three";
import { smoothstep } from "../../energy/effects";
import { colors } from "../../lib/colors";
import { formatMoney } from "../../lib/formatters";
import { citetherScenario } from "../../scenario/citetherScenario";
import { settlementEvents } from "../../scenario/settlementEvents";
import { useSimStore } from "../../state/useSimStore";
import { NodeLabel } from "../nodes/NodeLabel";
import { shellMaterial } from "./materials";
import { StateBadge } from "./StateBadge";

const coastEvent = settlementEvents.find((event) => event.id === "coast_fast_charge")!;
const coastAfterPrice = citetherScenario.prices.fastChargerRate - coastEvent.netValue / coastEvent.kwh;

export function EVCoast() {
  const screen = useRef<MeshBasicMaterial>(null);
  const counter = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const time = useSimStore.getState().cinematicTime;
    const after = smoothstep((time - 127) / 3);
    const price = citetherScenario.prices.fastChargerRate + (coastAfterPrice - citetherScenario.prices.fastChargerRate) * after;
    if (screen.current) screen.current.color.set(after > 0.5 ? colors.settlement : colors.stress);
    if (counter.current) {
      counter.current.dataset.tone = after > 0.5 ? "after" : "before";
      counter.current.textContent = `${formatMoney(price)}/kWh`;
      counter.current.style.opacity = time >= 122 && time < 134 ? "1" : "0";
    }
    if (badge.current) {
      badge.current.dataset.tone = after > 0.5 ? "after" : "before";
      badge.current.textContent = after > 0.5 ? "HOME CREDIT APPLIED · SETTLED ✓" : "HIGH FAST-CHARGE PRICE";
      badge.current.style.opacity = time >= 122 && time < 134 ? "1" : "0";
    }
  });

  return (
    <group position={[20, 0, 14]}>
      <mesh position={[0, 0.42, 0]}><boxGeometry args={[2.8, 0.55, 1.3]} />{shellMaterial}</mesh>
      <mesh position={[-0.75, 0.84, 0]}><boxGeometry args={[1.15, 0.42, 1.05]} />{shellMaterial}</mesh>
      {[-0.9, 0.9].map((x) => [-0.52, 0.52].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.2, z]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.25, 0.25, 0.18, 8]} />
          <meshBasicMaterial color="#05080d" />
        </mesh>
      )))}
      <group position={[2.05, 1.25, 0]}>
        <mesh><boxGeometry args={[0.62, 2.5, 0.62]} /><meshBasicMaterial color={colors.grid} toneMapped={false} /></mesh>
        <mesh position={[0, 0.25, 0.34]}><boxGeometry args={[0.3, 0.5, 0.06]} /><meshBasicMaterial ref={screen} color={colors.stress} toneMapped={false} /></mesh>
        <Html position={[0, 1.7, 0]} center distanceFactor={24} zIndexRange={[8, 0]}>
          <div ref={counter} className="location-counter" />
        </Html>
      </group>
      <mesh position={[0, 0.08, 3]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[3.4, 20]} />
        <meshBasicMaterial color="#0a3a55" transparent opacity={0.65} />
      </mesh>
      <StateBadge labelRef={badge} position={[0, 4.45, 0]} />
      <NodeLabel locationId="ev_coast" label="EV · Coast Fast Charger" color={colors.grid} position={[0, 3.5, 0]} />
    </group>
  );
}
