import { create } from "zustand";
import type { EnergyPathId } from "../energy/paths";
import { beats, type Beat, type CinematicEventId } from "../cinematic/beats";
import type { EventDirectorState } from "../cinematic/eventDirector";
import type { SettlementEvent } from "../scenario/types";

type Quality = "high" | "med" | "low";

export type AudioLoadState = "idle" | "loading" | "ready" | "error";

interface SimState {
  quality: Quality;
  cinematicTime: number;
  activeBeat: number;
  eventId: CinematicEventId;
  caption: string;
  activePaths: EnergyPathId[];
  activeEvent?: SettlementEvent;
  completedEvents: SettlementEvent[];
  beat: Beat;
  mode: "old" | "citether";
  playing: boolean;
  uiHidden: boolean;
  captionsHidden: boolean;
  // Narration (additive layer)
  started: boolean;
  narrationEnabled: boolean;
  muted: boolean;
  volume: number;
  audioLoadState: AudioLoadState;
  setQuality: (quality: Quality) => void;
  setPlaying: (playing: boolean) => void;
  setUiHidden: (hidden: boolean) => void;
  setCaptionsHidden: (hidden: boolean) => void;
  setStarted: (started: boolean) => void;
  setNarrationEnabled: (enabled: boolean) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setAudioLoadState: (state: AudioLoadState) => void;
  setCinematicState: (cinematicTime: number, director: EventDirectorState) => void;
}

export const useSimStore = create<SimState>((set) => ({
  quality: "high",
  cinematicTime: 0,
  activeBeat: 0,
  eventId: "title",
  caption: beats[0].caption,
  activePaths: [],
  activeEvent: undefined,
  completedEvents: [],
  beat: beats[0],
  mode: "old",
  playing: false,
  uiHidden: false,
  captionsHidden: false,
  started: false,
  narrationEnabled: false,
  muted: false,
  volume: 0.85,
  audioLoadState: "idle",
  setQuality: (quality) => set({ quality }),
  setPlaying: (playing) => set({ playing }),
  setUiHidden: (uiHidden) => set({ uiHidden }),
  setCaptionsHidden: (captionsHidden) => set({ captionsHidden }),
  setStarted: (started) => set({ started }),
  setNarrationEnabled: (narrationEnabled) => set({ narrationEnabled }),
  setMuted: (muted) => set({ muted }),
  setVolume: (volume) => set({ volume: Math.min(Math.max(volume, 0), 1) }),
  setAudioLoadState: (audioLoadState) => set({ audioLoadState }),
  setCinematicState: (cinematicTime, director) => set({
    cinematicTime,
    activeBeat: director.beat.id,
    eventId: director.beat.eventId,
    caption: director.beat.caption,
    activePaths: director.beat.activePaths,
    activeEvent: director.activeEvent,
    completedEvents: director.completedEvents,
    beat: director.beat,
    mode: director.mode,
  }),
}));
