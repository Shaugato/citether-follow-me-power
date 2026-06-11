import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clampVolume,
  createNarrationController,
  type NarrationController,
} from "./useNarration";
import type { AudioLoadState } from "../state/useSimStore";

interface HarnessState {
  started: boolean;
  narrationEnabled: boolean;
  playing: boolean;
  audioLoadState: AudioLoadState;
}

function makeHarness(overrides: Partial<HarnessState> = {}) {
  const state: HarnessState = {
    started: false,
    narrationEnabled: false,
    playing: false,
    audioLoadState: "ready",
    ...overrides,
  };

  const audio = {
    currentTime: 5,
    volume: 0.5,
    muted: false,
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
  };

  const cinematic = {
    play: vi.fn(),
    pause: vi.fn(),
    restart: vi.fn(),
    seek: vi.fn(),
  };

  const store = {
    setStarted: vi.fn((b: boolean) => { state.started = b; }),
    setNarrationEnabled: vi.fn((b: boolean) => { state.narrationEnabled = b; }),
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    setAudioLoadState: vi.fn((s: AudioLoadState) => { state.audioLoadState = s; }),
    setPlaying: vi.fn((b: boolean) => { state.playing = b; }),
    getState: () => ({ ...state }),
  };

  const startSync = vi.fn();
  const stopSync = vi.fn();
  const cancelSpeech = vi.fn();

  const controller: NarrationController = createNarrationController({
    audio,
    cinematic,
    store,
    startSync,
    stopSync,
    speak: vi.fn(),
    cancelSpeech,
    isDev: false,
  });

  return { state, audio, cinematic, store, startSync, stopSync, cancelSpeech, controller };
}

describe("clampVolume", () => {
  it("clamps into [0,1] and maps NaN to 0", () => {
    expect(clampVolume(0.4)).toBe(0.4);
    expect(clampVolume(1.7)).toBe(1);
    expect(clampVolume(-0.3)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(0);
  });
});

describe("narration controller — volume & mute", () => {
  let h: ReturnType<typeof makeHarness>;
  beforeEach(() => { h = makeHarness(); });

  it("applies clamped volume to the audio element and the store", () => {
    h.controller.setVolume(1.5);
    expect(h.audio.volume).toBe(1);
    expect(h.store.setVolume).toHaveBeenCalledWith(1);

    h.controller.setVolume(-2);
    expect(h.audio.volume).toBe(0);
  });

  it("mutes/unmutes the audio element and mirrors to the store", () => {
    h.controller.setMuted(true);
    expect(h.audio.muted).toBe(true);
    expect(h.store.setMuted).toHaveBeenCalledWith(true);

    h.controller.setMuted(false);
    expect(h.audio.muted).toBe(false);
  });
});

describe("narration controller — loadState gating", () => {
  it("plays audio + starts sync when the track is ready", () => {
    const h = makeHarness({ audioLoadState: "ready" });
    h.controller.startWithNarration();

    expect(h.store.setStarted).toHaveBeenCalledWith(true);
    expect(h.store.setNarrationEnabled).toHaveBeenCalledWith(true);
    expect(h.cinematic.pause).toHaveBeenCalled(); // timeline held
    expect(h.cinematic.seek).toHaveBeenCalledWith(0);
    expect(h.audio.play).toHaveBeenCalled();
    expect(h.startSync).toHaveBeenCalled();
    expect(h.cinematic.restart).not.toHaveBeenCalled();
    expect(h.state.playing).toBe(true);
  });

  it("falls back to the silent timeline when the track errored (no audio, no throw)", () => {
    const h = makeHarness({ audioLoadState: "error" });
    expect(() => h.controller.startWithNarration()).not.toThrow();

    expect(h.cinematic.restart).toHaveBeenCalled();
    expect(h.audio.play).not.toHaveBeenCalled();
    expect(h.startSync).not.toHaveBeenCalled();
    expect(h.stopSync).toHaveBeenCalled();
    expect(h.state.playing).toBe(true);
  });

  it("start silent never touches audio and runs the timeline from 0", () => {
    const h = makeHarness();
    h.controller.startSilent();

    expect(h.store.setNarrationEnabled).toHaveBeenCalledWith(false);
    expect(h.audio.pause).toHaveBeenCalled();
    expect(h.cinematic.restart).toHaveBeenCalled();
    expect(h.audio.play).not.toHaveBeenCalled();
    expect(h.startSync).not.toHaveBeenCalled();
  });
});

describe("narration controller — seek routing (audio master vs timeline)", () => {
  it("seeks the audio element when narration is the master", () => {
    const h = makeHarness({ narrationEnabled: true, audioLoadState: "ready" });
    h.controller.seek(42);
    expect(h.audio.currentTime).toBe(42);
    expect(h.cinematic.seek).not.toHaveBeenCalled();
  });

  it("seeks the timeline directly when narration is off", () => {
    const h = makeHarness({ narrationEnabled: false });
    h.controller.seek(42);
    expect(h.cinematic.seek).toHaveBeenCalledWith(42);
  });

  it("treats an errored track as timeline-master even if narration is enabled", () => {
    const h = makeHarness({ narrationEnabled: true, audioLoadState: "error" });
    h.controller.seek(42);
    expect(h.cinematic.seek).toHaveBeenCalledWith(42);
    expect(h.audio.currentTime).toBe(5); // unchanged
  });
});

describe("narration controller — pause & VO toggle", () => {
  it("pause stops audio + sync when audio is master", () => {
    const h = makeHarness({ narrationEnabled: true, playing: true, audioLoadState: "ready" });
    h.controller.pause();
    expect(h.audio.pause).toHaveBeenCalled();
    expect(h.stopSync).toHaveBeenCalled();
    expect(h.state.playing).toBe(false);
  });

  it("turning VO off mid-run hands control back to the timeline at the current position", () => {
    const h = makeHarness({ started: true, narrationEnabled: true, playing: true, audioLoadState: "ready" });
    h.controller.setNarrationEnabled(false);
    expect(h.store.setNarrationEnabled).toHaveBeenCalledWith(false);
    expect(h.audio.pause).toHaveBeenCalled();
    expect(h.stopSync).toHaveBeenCalled();
    expect(h.cinematic.play).toHaveBeenCalled(); // resume timeline, not restart
    expect(h.cinematic.restart).not.toHaveBeenCalled();
  });
});
