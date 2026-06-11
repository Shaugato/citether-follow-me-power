import { describe, expect, it } from "vitest";
import { beats, CINEMATIC_DURATION } from "../cinematic/beats";
import { clipId, narrationCues, narrationTrack } from "./narrationScript";

describe("narrationScript", () => {
  it("has exactly one cue per beat (15 total)", () => {
    expect(narrationCues).toHaveLength(15);
    expect(narrationCues).toHaveLength(beats.length);
  });

  it("maps each cue to its beat with the right id", () => {
    narrationCues.forEach((cue, index) => {
      expect(cue.beatId).toBe(index);
      expect(cue.id).toBe(clipId(index));
    });
  });

  it("keeps every cue start/end inside its beat window", () => {
    narrationCues.forEach((cue) => {
      const beat = beats.find((candidate) => candidate.id === cue.beatId);
      expect(beat).toBeDefined();
      const beatStart = beat!.start;
      const beatEnd = beat!.start + beat!.duration;
      expect(cue.start).toBeGreaterThanOrEqual(beatStart);
      expect(cue.end).toBeLessThanOrEqual(beatEnd);
      expect(cue.end).toBeGreaterThan(cue.start);
    });
  });

  it("orders cues monotonically by start and end", () => {
    for (let i = 1; i < narrationCues.length; i += 1) {
      expect(narrationCues[i].start).toBeGreaterThan(narrationCues[i - 1].start);
      expect(narrationCues[i].end).toBeGreaterThan(narrationCues[i - 1].end);
    }
  });

  it("has non-empty spoken text, delivery, and a fallback for each cue", () => {
    narrationCues.forEach((cue) => {
      expect(cue.text.trim().length).toBeGreaterThan(0);
      expect(cue.delivery.trim().length).toBeGreaterThan(0);
      expect(cue.fallbackText).toBe(cue.text);
      expect(cue.audioSrc).toBe(`/narration/beats/${cue.id}.wav`);
    });
  });

  it("points at the assembled master spanning the whole cinematic", () => {
    expect(narrationTrack.fullSrc).toBe("/narration/voiceover-full.mp3");
    expect(narrationTrack.totalDuration).toBe(CINEMATIC_DURATION);
  });
});
