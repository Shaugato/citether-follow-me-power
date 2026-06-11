import { beats, getBeatAt, type Beat } from "./beats";
import { settlementEvents } from "../scenario/settlementEvents";
import type { SettlementEvent } from "../scenario/types";

export interface EventDirectorState {
  beat: Beat;
  activeEvent?: SettlementEvent;
  completedEvents: SettlementEvent[];
  mode: "old" | "citether";
}

export function getEventDirectorState(time: number): EventDirectorState {
  const beat = getBeatAt(time);
  const completedEvents = settlementEvents.filter((event) => time >= getEventReleaseTime(event.id));
  const beatEvents = beat.settlementEventIds
    .map((id) => settlementEvents.find((event) => event.id === id))
    .filter((event): event is SettlementEvent => Boolean(event));
  const releasedBeatEvent = [...beatEvents]
    .reverse()
    .find((event) => time >= getEventReleaseTime(event.id));

  return {
    beat,
    activeEvent: releasedBeatEvent ?? beatEvents[0],
    completedEvents,
    mode: beat.id >= 5 ? "citether" : "old",
  };
}

export function getEventReleaseTime(eventId: string) {
  const beat = beats.find((candidate) => candidate.settlementEventIds.includes(eventId));
  if (!beat) return Number.POSITIVE_INFINITY;
  const index = beat.settlementEventIds.indexOf(eventId);
  const fraction = beat.settlementEventIds.length === 1
    ? 0.42
    : 0.25 + (index / Math.max(beat.settlementEventIds.length - 1, 1)) * 0.55;
  return beat.start + beat.duration * fraction;
}
