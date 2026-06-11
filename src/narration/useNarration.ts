import { useEffect } from "react";
import { cinematicControls } from "../cinematic/useCinematic";
import { useSimStore, type AudioLoadState } from "../state/useSimStore";
import { narrationCues, narrationTrack } from "./narrationScript";
import { startNarrationSync, stopNarrationSync } from "./syncNarration";
import { cancelSpeech, speak } from "./webSpeechFallback";

/**
 * Narration audio controller.
 *
 * One `HTMLAudioElement` plays the assembled master track. When narration is ON the
 * audio is the master clock (see `syncNarration.ts`); when OFF the cinematic behaves
 * exactly as before (GSAP timeline master, no audio). Audio is never a hard
 * dependency: if the MP3 is missing/fails, the cinematic still runs silently with
 * captions (and, in dev only, a Web Speech read).
 *
 * Mirrors the `cinematicControls` pattern: a module-level `narrationControls`
 * singleton with no-op defaults, replaced with the live controller on mount.
 */

export interface AudioLike {
  currentTime: number;
  volume: number;
  muted: boolean;
  play: () => Promise<void> | void;
  pause: () => void;
}

interface CinematicLike {
  play: () => void;
  pause: () => void;
  restart: () => void;
  seek: (time: number) => void;
}

interface StoreLike {
  setStarted: (started: boolean) => void;
  setNarrationEnabled: (enabled: boolean) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setAudioLoadState: (state: AudioLoadState) => void;
  setPlaying: (playing: boolean) => void;
  getState: () => {
    started: boolean;
    narrationEnabled: boolean;
    playing: boolean;
    audioLoadState: AudioLoadState;
  };
}

export interface NarrationDeps {
  audio: AudioLike;
  cinematic: CinematicLike;
  store: StoreLike;
  startSync: (getTime: () => number) => void;
  stopSync: () => void;
  speak: (text: string) => void;
  cancelSpeech: () => void;
  isDev: boolean;
}

export interface NarrationController {
  /** Gesture handler: play audio from 0 + start visuals together (audio master). */
  startWithNarration: () => void;
  /** Gesture handler: run the timeline as today, no audio. */
  startSilent: () => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  restart: () => void;
  seek: (time: number) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setNarrationEnabled: (enabled: boolean) => void;
}

/** Clamp a volume into [0,1]; NaN -> 0. */
export function clampVolume(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

/** True when audio can drive the cinematic (narration on and the file is not broken). */
function audioIsMaster(deps: NarrationDeps): boolean {
  const state = deps.store.getState();
  return state.narrationEnabled && state.audioLoadState !== "error";
}

export function createNarrationController(deps: NarrationDeps): NarrationController {
  const { audio, cinematic, store, startSync, stopSync } = deps;

  // Audio becomes master: hold the timeline paused, sync visuals to audio each frame.
  const beginAudioMaster = (fromZero: boolean) => {
    cinematic.pause();
    if (fromZero) {
      audio.currentTime = 0;
      cinematic.seek(0);
    }
    startSync(() => audio.currentTime);
    store.setPlaying(true);
    const result = audio.play();
    Promise.resolve(result).catch(() => {
      // play() was blocked/failed — degrade gracefully to the silent timeline.
      stopSync();
      cinematic.restart();
      store.setPlaying(true);
    });
  };

  // Timeline becomes master (today's behavior / silent fallback).
  const runTimeline = (fromZero: boolean) => {
    stopSync();
    deps.cancelSpeech();
    if (fromZero) cinematic.restart();
    else cinematic.play();
    store.setPlaying(true);
  };

  const controller: NarrationController = {
    startWithNarration: () => {
      store.setStarted(true);
      store.setNarrationEnabled(true);
      if (store.getState().audioLoadState === "error") {
        // No usable MP3 — silent run with captions (dev adds Web Speech elsewhere).
        runTimeline(true);
        return;
      }
      beginAudioMaster(true);
    },

    startSilent: () => {
      store.setStarted(true);
      store.setNarrationEnabled(false);
      audio.pause();
      runTimeline(true);
    },

    play: () => {
      if (audioIsMaster(deps)) {
        cinematic.pause();
        startSync(() => audio.currentTime);
        store.setPlaying(true);
        Promise.resolve(audio.play()).catch(() => undefined);
      } else {
        cinematic.play();
        store.setPlaying(true);
      }
    },

    pause: () => {
      if (audioIsMaster(deps)) {
        audio.pause();
        stopSync();
        deps.cancelSpeech();
      } else {
        cinematic.pause();
      }
      store.setPlaying(false);
    },

    toggle: () => {
      store.getState().playing ? controller.pause() : controller.play();
    },

    restart: () => {
      if (audioIsMaster(deps)) beginAudioMaster(true);
      else runTimeline(true);
    },

    seek: (time) => {
      if (audioIsMaster(deps)) {
        audio.currentTime = time; // the rAF bridge propagates this to the visuals
      } else {
        cinematic.seek(time);
      }
    },

    setMuted: (muted) => {
      audio.muted = muted;
      store.setMuted(muted);
    },

    setVolume: (volume) => {
      const next = clampVolume(volume);
      audio.volume = next;
      store.setVolume(next);
    },

    setNarrationEnabled: (enabled) => {
      store.setNarrationEnabled(enabled);
      const state = store.getState();
      if (enabled) {
        if (!state.started) return;
        if (state.audioLoadState === "error") {
          runTimeline(true); // can't add real audio; restart silent (+ dev speech)
          return;
        }
        beginAudioMaster(true); // restart from 0 with audio as master (§E)
      } else {
        audio.pause();
        stopSync();
        deps.cancelSpeech();
        if (state.started && state.playing) cinematic.play(); // hand back to timeline
      }
    },
  };

  return controller;
}

function noopController(): NarrationController {
  return {
    startWithNarration: () => undefined,
    startSilent: () => undefined,
    play: () => undefined,
    pause: () => undefined,
    toggle: () => undefined,
    restart: () => undefined,
    seek: () => undefined,
    setMuted: () => undefined,
    setVolume: () => undefined,
    setNarrationEnabled: () => undefined,
  };
}

export const narrationControls: NarrationController = noopController();

export function useNarration(): void {
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.volume = clampVolume(useSimStore.getState().volume);
    audio.muted = useSimStore.getState().muted;
    audio.src = narrationTrack.fullSrc;

    useSimStore.getState().setAudioLoadState("loading");

    const onCanPlay = () => useSimStore.getState().setAudioLoadState("ready");
    const onError = () => useSimStore.getState().setAudioLoadState("error");
    const onEnded = () => {
      // Master finished — settle on the final frame (end-card hold) and stop.
      stopNarrationSync();
      cinematicControls.seek(narrationTrack.totalDuration);
      useSimStore.getState().setPlaying(false);
    };
    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    const controller = createNarrationController({
      audio,
      cinematic: cinematicControls,
      store: {
        setStarted: (b) => useSimStore.getState().setStarted(b),
        setNarrationEnabled: (b) => useSimStore.getState().setNarrationEnabled(b),
        setMuted: (b) => useSimStore.getState().setMuted(b),
        setVolume: (v) => useSimStore.getState().setVolume(v),
        setAudioLoadState: (s) => useSimStore.getState().setAudioLoadState(s),
        setPlaying: (b) => useSimStore.getState().setPlaying(b),
        getState: () => {
          const s = useSimStore.getState();
          return {
            started: s.started,
            narrationEnabled: s.narrationEnabled,
            playing: s.playing,
            audioLoadState: s.audioLoadState,
          };
        },
      },
      startSync: startNarrationSync,
      stopSync: stopNarrationSync,
      speak,
      cancelSpeech,
      isDev: import.meta.env.DEV,
    });
    Object.assign(narrationControls, controller);

    // Dev-only Web Speech fallback: speak each beat's line when there is no MP3.
    let lastSpokenBeat = -1;
    const unsubscribe = useSimStore.subscribe((state) => {
      if (!import.meta.env.DEV) return;
      if (state.audioLoadState !== "error" || !state.narrationEnabled || !state.started || !state.playing) {
        lastSpokenBeat = state.activeBeat;
        return;
      }
      if (state.activeBeat !== lastSpokenBeat) {
        lastSpokenBeat = state.activeBeat;
        const cue = narrationCues[state.activeBeat];
        if (cue) speak(cue.fallbackText);
      }
    });

    audio.load();

    return () => {
      unsubscribe();
      stopNarrationSync();
      cancelSpeech();
      audio.pause();
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audio.removeAttribute("src");
      audio.load();
      Object.assign(narrationControls, noopController());
    };
  }, []);
}
