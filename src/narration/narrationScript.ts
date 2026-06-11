import { beats, CINEMATIC_DURATION } from "../cinematic/beats";
import narrationLines from "./narrationLines.json";

/**
 * Narration data model — the single source of truth for voiceover text + timing.
 *
 * Timings are derived directly from `beats.ts` so a cue can never drift out of its
 * beat window: `start`/`end` always describe the beat the line belongs to. The
 * runtime sync uses the *audio clock* as master (see `syncNarration.ts`), so these
 * values are used for validation, reference, and the dev Web Speech fallback — not
 * for scheduling the master MP3.
 *
 * Voiceover text is the full §F script; it complements (never duplicates) the short
 * on-screen captions in `beats.ts` (§H).
 */
export interface NarrationCue {
  /** Stable clip id, e.g. "b00" — also the per-beat source filename stem. */
  id: string;
  beatId: number;
  /** Seconds. Within the beat window; equals beat.start. */
  start: number;
  /** Seconds. Within the beat window; equals beat.start + beat.duration. */
  end: number;
  /** Full spoken line (§F). */
  text: string;
  /** Short caption anchor (§G) — reference only; never rendered as a 2nd caption. */
  caption: string;
  /** Per-beat delivery direction folded into the TTS instructions at generation time. */
  delivery: string;
  /** Per-beat source clip; not loaded at runtime (the app plays the master track). */
  audioSrc: string;
  /** Per-cue mix level (0..1). */
  volume: number;
  enabled: boolean;
  /** Text spoken by the dev Web Speech fallback when no MP3 is present. */
  fallbackText: string;
}

export interface NarrationTrack {
  /** The single master file the app plays. */
  fullSrc: string;
  /** Seconds of audio (silent base) the master spans — the full cinematic incl. hold. */
  totalDuration: number;
}

/**
 * Per-beat script: full VO line (§F, prosody-shaped), short caption anchor (§G), and a
 * delivery direction. Authored once in `narrationLines.json` — the single source shared
 * with `scripts/generate-narration.mjs` so the spoken text and the runtime text can't
 * diverge.
 */
interface NarrationLine {
  text: string;
  caption: string;
  delivery: string;
}
const SCRIPT = narrationLines as NarrationLine[];

/** Two-digit clip id for beat n, e.g. 0 -> "b00". */
export function clipId(beatId: number): string {
  return `b${String(beatId).padStart(2, "0")}`;
}

export const narrationCues: NarrationCue[] = beats.map((beat) => {
  const line = SCRIPT[beat.id];
  if (!line) throw new Error(`Missing narration script line for beat ${beat.id}`);
  const id = clipId(beat.id);
  return {
    id,
    beatId: beat.id,
    start: beat.start,
    end: beat.start + beat.duration,
    text: line.text,
    caption: line.caption,
    delivery: line.delivery,
    // Lossless per-beat sources (not loaded at runtime; the app plays the master).
    audioSrc: `/narration/beats/${id}.wav`,
    volume: 1,
    enabled: true,
    fallbackText: line.text,
  };
});

export const narrationTrack: NarrationTrack = {
  fullSrc: "/narration/voiceover-full.mp3",
  // The master spans the entire cinematic (story + end-card hold) so the audio
  // clock can drive the visuals all the way to the final frame.
  totalDuration: CINEMATIC_DURATION,
};
