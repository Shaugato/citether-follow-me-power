# Narration audio

The app plays a single assembled master track: **`voiceover-full.mp3`** (320 kbps, the
only audio loaded at runtime). The per-beat clips in **`beats/`** (`b00.wav … b14.wav`)
are the lossless editable sources used to build the master — they are not loaded at runtime.

Voice: **coral** (warm, expressive). Generated with the steerable **`gpt-4o-mini-tts`**
model — a rich global delivery direction plus a per-beat `delivery` line (authored in
[`../../src/narration/narrationLines.json`](../../src/narration/narrationLines.json), the
single source shared with the app).

If `voiceover-full.mp3` is absent, the cinematic still runs **silently with captions**
(no errors); in `pnpm dev` only, a Web Speech read fills in.

## Regenerate (one-time, build-time)

From `citether-sim/`:

```bash
# Full generate + 320k master with the chosen voice:
node scripts/generate-narration.mjs --voice coral --skip-auditions

# A/B warmer voices on the key emotional beats before deciding:
node scripts/generate-narration.mjs --auditions-only --candidates coral,nova --audition-beats 5,7,14

node scripts/generate-narration.mjs --force        # force full regen (re-bills)
```

Requirements:
- `OPENAI_API_KEY` in `citether-sim/.env` (git-ignored, never committed).
- `ffmpeg` on PATH (assembles the master). Windows: `winget install Gyan.FFmpeg`.
  (OpenAI's WAVs use a streaming header, so ffmpeg prints harmless "corrupt input packet"
  notes during assembly — the audio decodes fine; verify with `ffprobe`.)

The script is idempotent: each clip hashes `{model|voice|instructions|format|text}` in
`.manifest.json`, so re-runs only pay for what changed. Editing one beat's text or
`delivery` re-bills just that beat. Model/voices verified against the OpenAI TTS docs.

Commit `voiceover-full.mp3`, `beats/*.wav`, and `.manifest.json`. The `auditions/`
folder is git-ignored (reference takes only).
