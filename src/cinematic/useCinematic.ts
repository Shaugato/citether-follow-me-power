import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { beats, CINEMATIC_DURATION, OPENING_CAMERA } from "./beats";
import { createCameraRig } from "./cameraRig";
import { useSimStore } from "../state/useSimStore";
import { getEventDirectorState } from "./eventDirector";
import { narrationControls } from "../narration/useNarration";

export interface CinematicController {
  play: () => void;
  pause: () => void;
  restart: () => void;
  seek: (time: number) => void;
}

export const cinematicControls: CinematicController = {
  play: () => undefined,
  pause: () => undefined,
  restart: () => undefined,
  seek: () => undefined,
};

export function useCinematic(): CinematicController {
  const camera = useThree((state) => state.camera);
  const controllerRef = useRef<CinematicController>(cinematicControls);

  useEffect(() => {
    const rig = createCameraRig(camera, OPENING_CAMERA);
    const clock = { time: 0 };
    const timeline = gsap.timeline({
      paused: true,
      defaults: { ease: "power2.inOut" },
      onUpdate: () => {
        const time = clock.time;
        useSimStore.getState().setCinematicState(time, getEventDirectorState(time));
      },
      onComplete: () => useSimStore.getState().setPlaying(false),
    });

    rig.apply();
    timeline.to(clock, { time: CINEMATIC_DURATION, duration: CINEMATIC_DURATION, ease: "none" }, 0);
    beats.forEach((beat) => {
      const transitionDuration = beat.camera.transition === "cut"
        ? 0.35
        : Math.min(Math.max(beat.duration * 0.48, 3), 8);
      timeline.to(rig.state, {
        px: beat.camera.position[0],
        py: beat.camera.position[1],
        pz: beat.camera.position[2],
        tx: beat.camera.target[0],
        ty: beat.camera.target[1],
        tz: beat.camera.target[2],
        duration: transitionDuration,
        ease: beat.camera.transition === "cut" ? "power4.inOut" : "power2.inOut",
        onUpdate: rig.apply,
      }, beat.start);
      beat.cameraCuts?.forEach(({ offset, camera: cut }) => {
        timeline.to(rig.state, {
          px: cut.position[0],
          py: cut.position[1],
          pz: cut.position[2],
          tx: cut.target[0],
          ty: cut.target[1],
          tz: cut.target[2],
          duration: 0.35,
          ease: "power4.inOut",
          onUpdate: rig.apply,
        }, beat.start + offset);
      });
    });

    const controller: CinematicController = {
      play: () => {
        timeline.play();
        useSimStore.getState().setPlaying(true);
      },
      pause: () => {
        timeline.pause();
        useSimStore.getState().setPlaying(false);
      },
      restart: () => {
        timeline.pause(0, false);
        timeline.play();
        useSimStore.getState().setPlaying(true);
      },
      seek: (time) => {
        timeline.seek(Math.min(Math.max(time, 0), CINEMATIC_DURATION), false);
        rig.apply();
      },
    };

    Object.assign(cinematicControls, controller);
    controllerRef.current = controller;

    // Space/R route through the narration controller so they act on both audio +
    // visuals when narration is ON, and exactly as before (timeline only) when OFF.
    // They do nothing until the run is started via the StartOverlay gesture gate.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (useSimStore.getState().started) narrationControls.toggle();
      }
      if (event.key.toLowerCase() === "r") {
        if (useSimStore.getState().started) narrationControls.restart();
      }
      if (event.key.toLowerCase() === "h") {
        const store = useSimStore.getState();
        store.setUiHidden(!store.uiHidden);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const seekParam = import.meta.env.DEV
      ? new URLSearchParams(window.location.search).get("seek")
      : null;
    const speedParam = import.meta.env.DEV
      ? new URLSearchParams(window.location.search).get("speed")
      : null;
    const captionsParam = import.meta.env.DEV
      ? new URLSearchParams(window.location.search).get("captions")
      : null;
    const devSeek = seekParam === null ? Number.NaN : Number(seekParam);
    const devSpeed = speedParam === null ? 1 : Math.max(Number(speedParam) || 1, 0.1);
    timeline.timeScale(devSpeed);
    useSimStore.getState().setCaptionsHidden(captionsParam === "0");
    if (Number.isFinite(devSeek)) {
      controller.seek(devSeek);
      controller.pause();
    } else {
      // Hold paused at the start; the StartOverlay gesture gate begins the run
      // (with or without narration). This replaces the old autoplay-on-load so we
      // never play audio without a user gesture.
      controller.seek(0);
      controller.pause();
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      timeline.kill();
    };
  }, [camera]);

  return controllerRef.current;
}
