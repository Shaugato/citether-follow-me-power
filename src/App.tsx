import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Perf, usePerf } from "r3f-perf";
import { World } from "./scene/World";
import { useSimStore } from "./state/useSimStore";
import { colors } from "./lib/colors";
import { OverlaySystem } from "./overlay/OverlaySystem";
import { StartOverlay } from "./overlay/StartOverlay";
import { NarrationControls } from "./overlay/NarrationControls";
import { useNarration } from "./narration/useNarration";
import { CINEMATIC_DURATION } from "./cinematic/beats";
import { formatClock } from "./lib/formatters";

export function App() {
  const quality = useSimStore((state) => state.quality);
  const setQuality = useSimStore((state) => state.setQuality);
  const uiHidden = useSimStore((state) => state.uiHidden);
  const showPerf = import.meta.env.DEV && new URLSearchParams(window.location.search).get("perf") !== "0";

  // Owns the single narration audio element + the narrationControls singleton.
  useNarration();

  return (
    <main className={uiHidden ? "ui-hidden" : undefined}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [24, 25, 31], fov: 42, near: 0.1, far: 180 }}
        shadows={false}
      >
        <color attach="background" args={[colors.bg]} />
        <fog attach="fog" args={[colors.bg, 38, 90]} />
        <World />
        {quality === "high" && (
          <EffectComposer multisampling={0} resolutionScale={0.5}>
            <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.5} luminanceSmoothing={0.2} />
          </EffectComposer>
        )}
        {showPerf && !uiHidden && <Perf position="top-left" minimal={false} />}
      </Canvas>

      {!uiHidden && (
        <>
          <header className="brand">
            <strong>#citEther</strong>
            <span>Follow Me Power · Final cinematic / Phase H</span>
          </header>
          <OverlaySystem />
          <NarrationControls />
          <StartOverlay />
          <button
            className="quality"
            type="button"
            onClick={() => setQuality(quality === "high" ? "med" : quality === "med" ? "low" : "high")}
          >
            Quality: {quality === "low" ? "recording-safe" : quality}
          </button>
          {showPerf && <PerfReadout />}
          {showPerf && <FlowReadout />}
        </>
      )}
    </main>
  );
}

function FlowReadout() {
  const cinematicTime = useSimStore((state) => state.cinematicTime);
  const activePaths = useSimStore((state) => state.activePaths);
  const activeBeat = useSimStore((state) => state.activeBeat);
  const eventId = useSimStore((state) => state.eventId);
  const playing = useSimStore((state) => state.playing);

  return (
    <output className="flow-readout" aria-label="Energy flow readout">
      {formatClock(cinematicTime)} / {formatClock(CINEMATIC_DURATION)} · Beat {activeBeat} · {eventId} ·
      {" "}{activePaths.length} routes · {playing ? "playing" : "paused"}
    </output>
  );
}

function PerfReadout() {
  const fps = usePerf((state) => state.log?.fps ?? 0);
  const calls = usePerf((state) => state.gl?.info.render.calls ?? 0);
  const triangles = usePerf((state) => state.gl?.info.render.triangles ?? 0);

  return (
    <output className="perf-readout" aria-label="Performance readout">
      {Math.round(fps)} FPS · {Math.round(calls)} calls · {Math.round(triangles).toLocaleString()} tris
    </output>
  );
}
