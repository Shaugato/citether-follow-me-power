import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, ShaderMaterial } from "three";
import { colors } from "../lib/colors";
import { smoothstep } from "../energy/effects";
import { useSimStore } from "../state/useSimStore";

const points: [number, number, number][] = [
  [-22, 8.5, -10],
  [-12, 10, -3],
  [0, 9.2, 1],
  [12, 10.5, 4],
  [24, 8.8, 11],
];

export function SettlementLayer() {
  const shader = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.12 },
  }), []);

  useFrame(() => {
    const { cinematicTime: time, quality } = useSimStore.getState();
    if (!shader.current) return;
    shader.current.uniforms.uTime.value = time;
    const qualityScale = quality === "low" ? 0.5 : quality === "med" ? 0.75 : 1;
    shader.current.uniforms.uIntensity.value = (0.12 + smoothstep((time - 70) / 5) * 0.88) * qualityScale;
  });

  return (
    <group>
      <mesh position={[0, 8.8, 1]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[48, 4.2, 48, 5]} />
        <shaderMaterial
          ref={shader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          vertexShader={`
            uniform float uTime;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              vec3 p = position;
              p.z += sin(p.x * 0.34 + uTime * 0.7) * 0.16;
              p.z += sin(p.x * 0.12 - uTime * 0.35) * 0.1;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform float uIntensity;
            varying vec2 vUv;
            void main() {
              float edge = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
              float band = pow(max(0.0, sin((vUv.x * 12.0 - uTime * 0.9) * 6.28318)), 8.0);
              float core = 0.025 + band * 0.48;
              vec3 cyan = vec3(0.133, 0.827, 0.933);
              gl_FragColor = vec4(cyan * (0.18 + band), edge * core * uIntensity);
            }
          `}
        />
      </mesh>
      <Line points={points} color={colors.settlement} lineWidth={2.2} transparent opacity={0.8} />
      <Line
        points={points.map(([x, y, z]) => [x, y - 0.42, z] as [number, number, number])}
        color={colors.settlement}
        lineWidth={0.7}
        transparent
        opacity={0.28}
      />
      {points.map((point, index) => (
        <mesh key={index} position={point}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshBasicMaterial color={colors.settlement} toneMapped={false} />
        </mesh>
      ))}
      <Html position={[0, 10.25, 1]} center distanceFactor={32} zIndexRange={[10, 0]}>
        <div className="settlement-label">citEther settlement layer</div>
      </Html>
    </group>
  );
}
