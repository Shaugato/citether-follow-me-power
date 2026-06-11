import { Html } from "@react-three/drei";
import type { CSSProperties } from "react";
import type { LocationId } from "../../scenario/types";
import { useSimStore } from "../../state/useSimStore";

export function NodeLabel({ locationId, label, color, position = [0, 3.6, 0] }: {
  locationId: LocationId;
  label: string;
  color: string;
  position?: [number, number, number];
}) {
  const focused = useSimStore((state) => state.beat.focusNodeId === locationId);
  if (!focused) return null;

  return (
    <Html position={position} center distanceFactor={28} zIndexRange={[10, 0]}>
      <div className="node-label" style={{ "--node-color": color } as CSSProperties}>{label}</div>
    </Html>
  );
}
