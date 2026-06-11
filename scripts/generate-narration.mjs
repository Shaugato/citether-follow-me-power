#!/usr/bin/env node
/**
 * generate-narration.mjs — build-time narration audio generator (one-time, re-runnable).
 *
 * Pipeline:
 *   1. Read OPENAI_API_KEY from citether-sim/.env (never hardcoded/committed).
 *   2. Confirm ffmpeg is installed (needed for the master assembly).
 *   3. (A/B) Audition warmer voices on the key emotional beats (5, 7, 14).
 *   4. Generate one lossless WAV per beat (b00..b14) from the shared script via OpenAI TTS,
 *      using the steerable model with a rich, per-beat delivery instruction.
 *   5. Assemble a single 200s high-bitrate master (public/narration/voiceover-full.mp3) by
 *      placing each clip at its beat start (per §G) over a silent base — drift-free.
 *
 * Steerability: uses gpt-4o-mini-tts (NOT tts-1/tts-1-hd, which ignore delivery direction
 * and sound robotic). A global delivery direction + a per-beat `delivery` line are sent in
 * the `instructions` parameter on every call. Text is authored for natural prosody
 * (commas / em-dashes / ellipses) in src/narration/narrationLines.json — the single source
 * shared with the runtime.
 *
 * Idempotent: a per-clip manifest hashes {model|voice|instructions|format|text}. Unchanged
 * clips are skipped, so re-runs only pay for what changed.
 *
 * Usage (from citether-sim/):
 *   # 1) A/B the two warm candidates on beats 5/7/14, then listen in public/narration/auditions/
 *   node scripts/generate-narration.mjs --auditions-only --candidates coral,nova --audition-beats 5,7,14
 *   # 2) Once you've picked, generate the full 15 + master with that voice
 *   node scripts/generate-narration.mjs --voice coral --skip-auditions
 *   node scripts/generate-narration.mjs --force            # regenerate everything (re-bills)
 *
 * Model + voices verified against the OpenAI TTS docs:
 *   https://developers.openai.com/api/docs/guides/text-to-speech
 *   model: gpt-4o-mini-tts; warm/expressive voices incl. coral/nova/sage/ballad/shimmer;
 *   instructions steer delivery; response_format supports wav + mp3.
 */

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import lines from "../src/narration/narrationLines.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "narration");
const BEATS_DIR = join(OUT_DIR, "beats");
const AUDITION_DIR = join(OUT_DIR, "auditions");
const MASTER = join(OUT_DIR, "voiceover-full.mp3");
const MANIFEST = join(OUT_DIR, ".manifest.json");

const TTS_ENDPOINT = "https://api.openai.com/v1/audio/speech";
const MODEL = arg("--model") ?? "gpt-4o-mini-tts";

// Global delivery direction — the base of every instruction (per-beat delivery is appended).
const BASE_INSTRUCTIONS =
  "Voice: a warm, human documentary narrator — like a thoughtful friend explaining something " +
  "they find genuinely exciting. Calm, confident, quietly visionary; never salesy, never robotic. " +
  "Conversational and unhurried. Vary the pace — slow down and let key phrases land, with a small " +
  "breath after important lines. Use gentle, natural emphasis on contrast words (here vs there, " +
  "trapped vs follows you). Speak to one person, with sincerity. Clear articulation so a non-expert " +
  "easily follows.";

// Default full-run voice once chosen (override with --voice). Warm + expressive.
const VOICE = arg("--voice") ?? "coral";
// A/B candidates and the emotional beats to compare (overridable).
const CANDIDATE_VOICES = parseList(arg("--candidates")) ?? ["coral", "nova"];
const AUDITION_BEATS = (parseList(arg("--audition-beats")) ?? ["5", "7", "14"]).map(Number);

// Lossless per-beat sources, high-bitrate master.
const BEAT_FORMAT = "wav";
const MASTER_BITRATE = "320k";
const TOTAL_DURATION = 200; // CINEMATIC_DURATION (195s story + 5s end-card hold)

// §G beat start times (seconds, mirrors src/cinematic/beats.ts) + a small lead-in so each
// line lands inside its beat with a breath before it.
const TIMING = [
  { start: 0, lead: 2.0 },
  { start: 10, lead: 1.5 },
  { start: 26, lead: 1.0 },
  { start: 42, lead: 1.0 },
  { start: 58, lead: 1.0 },
  { start: 70, lead: 1.0 },
  { start: 86, lead: 1.0 },
  { start: 96, lead: 1.0 },
  { start: 110, lead: 1.0 },
  { start: 122, lead: 1.0 },
  { start: 134, lead: 1.0 },
  { start: 150, lead: 1.0 },
  { start: 162, lead: 1.0 },
  { start: 172, lead: 1.0 },
  { start: 184, lead: 0.8 },
];

const SCRIPT = lines.map((line, i) => ({
  ...TIMING[i],
  text: line.text,
  delivery: line.delivery,
}));

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && i + 1 < process.argv.length ? process.argv[i + 1] : null;
}
function parseList(value) {
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : null;
}
function hasFlag(flag) {
  return process.argv.includes(flag);
}
function clipId(i) {
  return `b${String(i).padStart(2, "0")}`;
}
function instructionsFor(cue) {
  return `${BASE_INSTRUCTIONS}\n\nFor this line specifically: ${cue.delivery}`;
}
function hashOf(voice, text, instructions, format) {
  return createHash("sha256").update(`${MODEL}|${voice}|${instructions}|${format}|${text}`).digest("hex");
}

function loadEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) {
    fail(`No .env at ${envPath}. Add OPENAI_API_KEY=sk-... (it is git-ignored, never committed).`);
  }
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) fail("OPENAI_API_KEY not found in .env.");
  return key;
}

function ensureFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (r.error || r.status !== 0) {
    fail(
      "ffmpeg not found. Install it, then re-run:\n" +
        "  Windows : winget install Gyan.FFmpeg   (or: choco install ffmpeg)\n" +
        "  macOS   : brew install ffmpeg\n" +
        "  Linux   : sudo apt install ffmpeg\n" +
        "Open a fresh terminal afterwards so PATH refreshes.",
    );
  }
}

function loadManifest() {
  if (!existsSync(MANIFEST)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch {
    return {};
  }
}
function saveManifest(m) {
  writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
}

async function tts({ key, voice, text, instructions, format, outPath }) {
  const res = await fetch(TTS_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, voice, input: text, instructions, response_format: format }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let hint = "";
    if (res.status === 429) hint = "\n  → Your OpenAI account is out of quota. Add billing/credits at https://platform.openai.com/account/billing, then re-run.";
    if (res.status === 401) hint = "\n  → OPENAI_API_KEY is invalid. Check citether-sim/.env.";
    throw new Error(`TTS ${res.status} ${res.statusText}: ${body.slice(0, 300)}${hint}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  return buf.length;
}

async function generateAuditions(key, manifest) {
  mkdirSync(AUDITION_DIR, { recursive: true });
  console.log(`\n▶ A/B auditions — voices [${CANDIDATE_VOICES.join(", ")}] on beats [${AUDITION_BEATS.join(", ")}]:`);
  for (const voice of CANDIDATE_VOICES) {
    for (const beat of AUDITION_BEATS) {
      const cue = SCRIPT[beat];
      if (!cue) fail(`--audition-beats includes ${beat}, which is out of range (0–14).`);
      const instructions = instructionsFor(cue);
      const id = `${voice}-${clipId(beat)}`;
      const outPath = join(AUDITION_DIR, `${id}.${BEAT_FORMAT}`);
      const key2 = `audition:${id}`;
      const h = hashOf(voice, cue.text, instructions, BEAT_FORMAT);
      if (!hasFlag("--force") && existsSync(outPath) && manifest[key2]?.hash === h) {
        console.log(`  · ${id}.${BEAT_FORMAT} (cached)`);
        continue;
      }
      const bytes = await tts({ key, voice, text: cue.text, instructions, format: BEAT_FORMAT, outPath });
      manifest[key2] = { hash: h, voice, model: MODEL, bytes };
      saveManifest(manifest);
      console.log(`  ✓ ${id}.${BEAT_FORMAT} (${(bytes / 1024).toFixed(0)} KB)`);
    }
  }
  console.log(`  Listen in: ${AUDITION_DIR}`);
}

async function generateBeats(key, manifest) {
  mkdirSync(BEATS_DIR, { recursive: true });
  console.log(`\n▶ Beat clips (voice: ${VOICE}, model: ${MODEL}, format: ${BEAT_FORMAT}):`);
  for (let i = 0; i < SCRIPT.length; i += 1) {
    const cue = SCRIPT[i];
    const id = clipId(i);
    const instructions = instructionsFor(cue);
    const outPath = join(BEATS_DIR, `${id}.${BEAT_FORMAT}`);
    const h = hashOf(VOICE, cue.text, instructions, BEAT_FORMAT);
    if (!hasFlag("--force") && existsSync(outPath) && manifest[id]?.hash === h) {
      console.log(`  · ${id}.${BEAT_FORMAT} (cached)`);
      continue;
    }
    const bytes = await tts({ key, voice: VOICE, text: cue.text, instructions, format: BEAT_FORMAT, outPath });
    manifest[id] = { hash: h, voice: VOICE, model: MODEL, bytes };
    saveManifest(manifest);
    console.log(`  ✓ ${id}.${BEAT_FORMAT} (${(bytes / 1024).toFixed(0)} KB)`);
  }
}

function assembleMaster() {
  console.log(`\n▶ Assembling master (ffmpeg → mp3 ${MASTER_BITRATE}): each clip placed at its beat start over a silent base…`);
  const inputs = [];
  const filters = [];
  // input 0 = silent anchor spanning the whole cinematic
  inputs.push("-f", "lavfi", "-t", String(TOTAL_DURATION), "-i", "anullsrc=channel_layout=stereo:sample_rate=44100");
  const mixLabels = ["[0:a]"];
  SCRIPT.forEach((cue, i) => {
    const file = join(BEATS_DIR, `${clipId(i)}.${BEAT_FORMAT}`);
    if (!existsSync(file)) fail(`Missing ${file} — generate beats first (drop --skip-auditions, or run without --auditions-only).`);
    const inputIndex = i + 1;
    inputs.push("-i", file);
    const delayMs = Math.round((cue.start + cue.lead) * 1000);
    // Resample to a common format, delay all channels to the beat start, label it.
    filters.push(`[${inputIndex}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${delayMs}:all=1[a${i}]`);
    mixLabels.push(`[a${i}]`);
  });
  // Sum (clips don't overlap) — normalize=0 keeps each clip at full level.
  filters.push(`${mixLabels.join("")}amix=inputs=${mixLabels.length}:normalize=0:dropout_transition=0[mix]`);
  const filterComplex = filters.join(";");

  const args = [
    "-y",
    ...inputs,
    "-filter_complex", filterComplex,
    "-map", "[mix]",
    "-t", String(TOTAL_DURATION),
    "-ar", "44100",
    "-ac", "2",
    "-b:a", MASTER_BITRATE,
    MASTER,
  ];

  return new Promise((res, rej) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "inherit"] });
    p.on("error", rej);
    p.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`))));
  });
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

async function main() {
  console.log("citEther narration generator (steerable: gpt-4o-mini-tts + per-beat delivery)");
  const key = loadEnv();
  ensureFfmpeg();
  mkdirSync(OUT_DIR, { recursive: true });
  const manifest = loadManifest();

  if (!hasFlag("--skip-auditions") || hasFlag("--auditions-only")) {
    await generateAuditions(key, manifest);
  }
  if (hasFlag("--auditions-only")) {
    console.log("\nDone (auditions only). Listen, then re-run with --voice <pick> --skip-auditions.");
    return;
  }

  await generateBeats(key, manifest);
  await assembleMaster();
  console.log(`\n✓ Master written: ${MASTER}`);
  console.log("  Commit public/narration/ (sources + master + manifest). The app plays the master.");
}

main().catch((e) => {
  // Avoid process.exit() here so pending sockets close cleanly (no libuv assertion on Windows).
  console.error(`\n✗ ${e?.message ?? String(e)}\n`);
  process.exitCode = 1;
});
