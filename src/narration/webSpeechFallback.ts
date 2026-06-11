/**
 * Web Speech API fallback — DEV ONLY.
 *
 * Used purely so the cinematic still narrates during development if the master MP3
 * is missing/failed. It is never the production voice (quality varies by OS/browser
 * and timing can't be guaranteed). In production, a missing MP3 simply runs silent
 * with captions — this module is not engaged.
 */

const supported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

/** Speak a single line, cancelling anything already queued. No-op if unsupported. */
export function speak(text: string): void {
  if (!supported()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Calm, unhurried read to loosely match the intended cinematic narrator.
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    synth.speak(utterance);
  } catch {
    // Speech synthesis is best-effort in dev; never throw into the cinematic.
  }
}

export function cancelSpeech(): void {
  if (!supported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export function isWebSpeechSupported(): boolean {
  return supported();
}
