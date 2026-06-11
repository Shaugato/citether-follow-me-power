import { describe, expect, it } from "vitest";
import { beats, CINEMATIC_DURATION, FINAL_HOLD_DURATION, STORY_DURATION } from "./beats";
import { getEventDirectorState, getEventReleaseTime } from "./eventDirector";

describe("event director", () => {
  it("defines the 15 V2 beats in order", () => {
    expect(beats).toHaveLength(15);
    expect(beats.map((beat) => beat.id)).toEqual(Array.from({ length: 15 }, (_, index) => index));
    beats.slice(1).forEach((beat, index) => {
      expect(beat.start).toBe(beats[index].start + beats[index].duration);
    });
  });

  it("flips from the old system to citEther settlement at Beat 5", () => {
    expect(getEventDirectorState(69).mode).toBe("old");
    expect(getEventDirectorState(70).mode).toBe("citether");
  });

  it("releases scenario events deterministically into the accumulating log", () => {
    const beforeMum = getEventDirectorState(getEventReleaseTime("mum_bill_offset") - 0.01);
    const afterMum = getEventDirectorState(getEventReleaseTime("mum_bill_offset"));
    expect(beforeMum.completedEvents).toHaveLength(0);
    expect(afterMum.completedEvents.map((event) => event.id)).toEqual(["mum_bill_offset"]);
  });

  it("keeps the hospital event separate from the household economics beat", () => {
    const hospital = getEventDirectorState(140);
    const economics = getEventDirectorState(178);
    expect(hospital.activeEvent?.id).toBe("hospital_grid_support");
    expect(economics.beat.overlay.metricKey).toBe("economics");
    expect(economics.beat.overlay.explanation).toContain("rooftop-surplus result");
  });

  it("returns identical director state for identical elapsed seconds", () => {
    [0, 26, 70, 103.25, 129.5, 148, 178, 199.9].forEach((time) => {
      expect(getEventDirectorState(time)).toEqual(getEventDirectorState(time));
    });
  });

  it("reserves the final five seconds for the end-card hold", () => {
    expect(STORY_DURATION).toBe(195);
    expect(FINAL_HOLD_DURATION).toBe(5);
    expect(CINEMATIC_DURATION).toBe(200);
    expect(getEventDirectorState(199.9).beat.id).toBe(14);
  });
});
