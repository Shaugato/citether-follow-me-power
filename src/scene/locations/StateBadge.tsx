import { Html } from "@react-three/drei";
import type { RefObject } from "react";

interface StateBadgeProps {
  labelRef: RefObject<HTMLDivElement>;
  position: [number, number, number];
}

export function StateBadge({ labelRef, position }: StateBadgeProps) {
  return (
    <Html position={position} center distanceFactor={28} zIndexRange={[8, 0]}>
      <div ref={labelRef} className="location-state" />
    </Html>
  );
}
