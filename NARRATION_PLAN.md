# citEther Cinematic — Narration / Voiceover Plan

> Research-backed plan to add a synced, cinematic voiceover to the citEther simulation. **No code yet** — this is the plan + the Codex-ready implementation prompt (§K). Grounded in the actual build: 15 beats, **195 s (3:15)** total, GSAP `clock` with `play/pause/restart/seek` via the `cinematicControls` singleton, deterministic, offline, `H` hide + quality modes, captions via `CaptionStrip`. No `public/` dir yet.

## A. Feasibility assessment

Highly feasible and low-risk. The cinematic already has the three things a synced voiceover needs: (1) a **single deterministic clock** (`useCinematic` → GSAP timeline tweening `clock.time` 0→195 at linear ease), (2) a **control surface** (`cinematicControls.play/pause/restart/seek`), and (3) **fixed beat windows** in `beats.ts` (start/duration). Audio integrates as one controller that shares those controls and a one-time user-gesture start. No backend, no API key at runtime, no architectural change. The only new infra is a `public/narration/` folder and a small narration config + hook. Risk to the existing cinematic is minimal if audio is additive and gated behind a toggle.

## B. Recommended voiceover approach

**Option A (pre-generated audio) as the production path, with Option C hybrid for dev/fallback.**
- Generate narration **outside the app** with a premium TTS voice (e.g. ElevenLabs, OpenAI TTS, or PlayHT — chosen for a calm, warm, natural read), export to compressed audio, commit the files. This gives full control over voice quality, pacing, and repeatability, works offline, records perfectly, and adds **no runtime key or network dependency**.
- Keep **Web Speech API (browser TTS) only as a dev/fallback** path (behind a flag) so the cinematic still narrates if an audio file is missing during development. It is never the production voice.

**Single full track vs per-beat clips — recommendation: produce per-beat clips, then assemble ONE master track.**
- Author/generate one short clip per beat (easy to iterate and re-voice a single line), then **concatenate them into one master `voiceover-full.mp3`** with the correct silence gaps so each line lands inside its beat window (per §G timings).
- **At runtime, play the single master file.** One decode, one element, zero inter-clip gaps/stutter, and — critically for a screen recording — **drift-free** A/V. The per-beat clips remain in the repo as the editable source; the master is what the app plays.

## C. Why not use live runtime AI voice

- **Quality/consistency:** Web Speech voices vary by OS/browser and sound robotic; you can't guarantee the premium voice on the recording machine.
- **Timing:** you can't control exact spoken duration, so it won't stay in sync with fixed visual beats.
- **Autoplay & reliability:** runtime synthesis is subject to the same gesture gate plus engine quirks; it can fail silently mid-record.
- **Repeatability:** non-deterministic timing breaks "identical every recording."
- **Dependency/professionalism:** live cloud TTS adds a key + network dependency and risks sounding unprofessional. Pre-generated files avoid all of this.

## D. Narration architecture

- `public/narration/voiceover-full.mp3` — the master track the app plays (assembled from per-beat clips).
- `public/narration/beats/b00.mp3 … b14.mp3` — editable per-beat source clips (not loaded at runtime; kept for regeneration).
- A typed **narration config** (`narration/narrationScript.ts`) with one cue per beat: `{ id, beatId, start, end, text, caption, audioSrc?, volume, enabled, fallbackText }` plus a track-level `{ fullSrc, totalDuration }`.
- A **narration controller hook** (`narration/useNarration.ts`) owning one `HTMLAudioElement`, preload, play/pause/restart/seek, mute, volume, error handling, and the autoplay gesture.
- **Sync model — audio is the master when narration is ON.** On each animation frame, set the visual timeline to the audio position: `cinematicControls.seek(audio.currentTime)` while the GSAP timeline is held paused. This locks visuals to audio → zero drift in the recording. When narration is OFF, the timeline plays itself exactly as today (audio is the optional layer, never a hard dependency).
- Captions continue to come from `beats.ts`/overlay; narration text is separate and slightly fuller (see §H).

## E. Browser autoplay handling

Never autoplay sound on load. Add one clear gesture gate — a start overlay with two buttons:
- **“▶ Start cinematic with narration”** — on click (a user gesture), `audio.play()` (resumes the audio element/context) **and** start the run, in the same handler. Audio becomes master; visuals follow.
- **“Start silent”** — runs the timeline as today with no audio (and a visible Unmute affordance to enable narration later, which then restarts from 0 with audio as master to stay in sync).
Also expose mute/unmute and a volume control once started. Pausing pauses both; restart (`R`) restarts both from 0.

## F. Voiceover script (full, ~195 s, calm/warm/visionary)

Written to be spoken slowly with breathing room. Required phrases woven in. Clarifies value/credits vs electrons.

1. **(Title)** "This is citEther. Follow Me Power."
2. **(Solar surplus)** "Every sunny day, a rooftop makes more power than the home can use. The battery fills. And then there's surplus — clean energy, with nowhere to go."
3. **(Energy trapped)** "Today, that surplus has only one option: sell it back to the grid, for almost nothing. Your energy is trapped at the meter."
4. **(Outside needs)** "Meanwhile, the same person needs power somewhere else. A job site across town. A parent's flat. An electric car far from home."
5. **(System mismatch)** "Worth almost nothing here. Expensive there. The value is real — the connection isn't."
6. **(Settlement ignites)** "citEther changes that. The grid still supplies the electricity. citEther settles the value. Your surplus becomes credit you can use anywhere."
7. **(Account detaches)** "Your energy account is no longer tied to your address. It follows you."
8. **(Power mum)** "Power your mum's flat from your roof. The grid keeps her lights on; your solar covers the bill."
9. **(Diesel off)** "Run the tools on the job site from home solar — and switch the diesel generator off."
10. **(Coast charge)** "Charge your car at the coast, and let this morning's sunshine pay for it."
11. **(Hospital support)** "Park at the hospital, and your car can steady a strained part of the grid — earning real value while you work."
12. **(Six destinations)** "Use it. Share it. Donate it. Sell it. Always a better option than exporting for almost nothing."
13. **(Pod)** "Share it with your street first, and the value stays local."
14. **(Sankey / economics)** "Even after the network's fees, a day's surplus is worth many times a feed-in tariff. The numbers hold up."
15. **(Finale)** "Energy should follow people — not just meters. citEther. Your energy follows you. One suburb. One hundred homes. Three months."

## G. Beat-level narration table

Timings from `beats.ts`. "VO≈" = approx spoken seconds; lines are sized to land inside the beat with a breath before the next.

| Beat | Time (start–end) | Visual event | Narration (VO) | VO≈ | Caption (short) | Clip | Pacing |
|---|---|---|---|---|---|---|---|
| 0 | 0:00–0:10 | Title on one dark home | "This is citEther. Follow Me Power." | 4s | citEther · Follow Me Power | b00 | Let title breathe; VO at ~2s |
| 1 | 0:10–0:26 | Solar fills, surplus builds | "Every sunny day, a rooftop makes more power than the home can use. The battery fills. And then there's surplus — clean energy, with nowhere to go." | 12s | Solar + full battery | b01 | Warm, unhurried |
| 2 | 0:26–0:42 | Cage traps; weak FiT | "Today, that surplus has only one option: sell it back to the grid, for almost nothing. Your energy is trapped at the meter." | 11s | Trapped at the meter | b02 | Land "trapped at the meter" |
| 3 | 0:42–0:58 | Outside needs (red) | "Meanwhile, the same person needs power somewhere else. A job site across town. A parent's flat. An electric car far from home." | 12s | Needed elsewhere | b03 | Three beats, even rhythm |
| 4 | 0:58–1:10 | Contradiction | "Worth almost nothing here. Expensive there. The value is real — the connection isn't." | 9s | Cheap here · costly there | b04 | Slow; let the unfairness sit |
| 5 | 1:10–1:26 | Settlement ignites, cage breaks | "citEther changes that. The grid still supplies the electricity. citEther settles the value. Your surplus becomes credit you can use anywhere." | 13s | Grid = electricity · citEther = value | b05 | The key line — pause after "settles the value" |
| 6 | 1:26–1:36 | Account token detaches | "Your energy account is no longer tied to your address. It follows you." | 7s | Your account follows you | b06 | Calm reveal |
| 7 | 1:36–1:50 | Mum's flat warms | "Power your mum's flat from your roof. The grid keeps her lights on; your solar covers the bill." | 11s | Powering Mum's flat | b07 | Warmest line; emotional peak |
| 8 | 1:50–2:02 | Diesel off | "Run the tools on the job site from home solar — and switch the diesel generator off." | 9s | Diesel off | b08 | Confident |
| 9 | 2:02–2:14 | EV coast offset | "Charge your car at the coast, and let this morning's sunshine pay for it." | 9s | Coast charge offset | b09 | Light, almost a smile |
| 10 | 2:14–2:30 | Hospital red→green, earns | "Park at the hospital, and your car can steady a strained part of the grid — earning real value while you work." | 12s | Supports the grid · earns | b10 | Civic + credible |
| 11 | 2:30–2:42 | Six destinations fan | "Use it. Share it. Donate it. Sell it. Always a better option than exporting for almost nothing." | 10s | Use · Share · Donate · Sell | b11 | Four crisp verbs, then land |
| 12 | 2:42–2:52 | Pod local loop | "Share it with your street first, and the value stays local." | 6s | Local Pod first | b12 | Gentle |
| 13 | 2:52–3:04 | Real Sankey | "Even after the network's fees, a day's surplus is worth many times a feed-in tariff. The numbers hold up." | 10s | Net beats zero FiT | b13 | Grounded, matter-of-fact |
| 14 | 3:04–3:15 | Finale + end card | "Energy should follow people — not just meters. citEther. Your energy follows you. One suburb. One hundred homes. Three months." | 11s | Your energy follows you | b14 | Slow, visionary close |

Total VO ≈ 146 s of speech inside 195 s of runtime → ~25% silence for cinematic breathing. Good.

## H. Caption vs voiceover strategy

- **Captions stay short** (2–5 words, the on-screen labels already in `beats.ts`/overlay). They are visual anchors.
- **Voiceover is slightly fuller** and **complements**, never reads, the caption. (Caption: "Trapped at the meter." VO: "…sell it back for almost nothing. Your energy is trapped at the meter.")
- Captions remain visible with narration on, and the cinematic must still make sense **with sound off** (LinkedIn autoplays muted) — so captions carry the silent story, narration enriches it. Don't let VO duplicate caption text verbatim.

## I. Implementation plan (phases)

- **Phase 1 — Audio strategy & files.** Create `public/narration/` (+ `beats/`). Produce per-beat clips externally, assemble `voiceover-full.mp3` to the §G timings. Commit. Document the regen steps in the README.
- **Phase 2 — Narration data model.** `narration/narrationScript.ts`: cues `{ id, beatId, start, end, text, caption, audioSrc?, volume, enabled, fallbackText }` + track `{ fullSrc, totalDuration }`. Single source of truth for text + timing.
- **Phase 3 — Audio controller.** `narration/useNarration.ts` + a `narrationControls` singleton mirroring `cinematicControls`: preload (`<audio preload="auto">`), play/pause/restart/seek, mute/unmute, volume, `loadState` (idle/loading/ready/error), and the gesture-gated start. On error → fallback (Web Speech per-cue in dev, or silent + captions in prod).
- **Phase 4 — Timeline integration (sync).** When narration ON: hold the GSAP timeline paused and, each rAF, `cinematicControls.seek(audio.currentTime)` so visuals track audio (audio = master). Pause/restart/`R`/`Space` act on both. When OFF: today's behavior (timeline master, no audio).
- **Phase 5 — UI controls.** Start overlay ("Start cinematic with narration" / "Start silent"); mute/unmute; voiceover on/off toggle; volume slider; audio-loading status; dev "test voice" button. All hidden by `H` for recording.
- **Phase 6 — Caption/overlay integration.** Ensure captions and VO don't fight (§H); captions unchanged in length; VO text only in the audio + (optionally) a small "now narrating" affordance, not a second caption line.
- **Phase 7 — Recording test.** Production build, full-screen 1080p, click "Start with narration", `H`, record once; verify A/V stays in sync start→finish and the end-card holds with the final line.

## J. File / component plan

```
public/narration/
  voiceover-full.mp3            # master track the app plays (assembled)
  beats/ b00.mp3 … b14.mp3      # editable per-beat sources (not loaded at runtime)
src/narration/
  narrationScript.ts            # cues + track config (text, start/end, caption, volume)
  useNarration.ts               # audio controller hook + narrationControls singleton
  syncNarration.ts              # rAF bridge: audio.currentTime -> cinematicControls.seek (narration ON)
  webSpeechFallback.ts          # dev/fallback only
src/overlay/
  StartOverlay.tsx              # gesture gate: "Start with narration" / "Start silent"
  NarrationControls.tsx         # mute/volume/VO-toggle/status (hidden by H)
src/state/
  useSimStore.ts                # + narrationEnabled, muted, volume, audioLoadState, started
README.md                       # + narration regen + recording-with-sound steps
```
Touch lightly: `App.tsx`/`OverlaySystem.tsx` to mount StartOverlay + NarrationControls; `useCinematic` only if a tiny "external clock" hook is needed (prefer using existing `seek`).

## K. Codex implementation prompt

> Add a synced cinematic voiceover to the citEther simulation. Read `NARRATION_PLAN.md` (this file) and `AGENTS.md` first; it is the spec. **Do not change the existing visuals, beats, economics, or the §S acceptance behavior** — narration is an additive, optional layer.
>
> **Inspect first:** `src/cinematic/useCinematic.ts` (the `cinematicControls` singleton + `clock`), `src/cinematic/beats.ts` (15 beats, 195 s), `src/overlay/OverlaySystem.tsx`, `src/overlay/CaptionStrip.tsx`, `src/state/useSimStore.ts`, `src/App.tsx`. Confirm how play/pause/restart/seek and `uiHidden` work.
>
> **Create:** `public/narration/` with `voiceover-full.mp3` (placeholder/silent file is fine until I supply the real one) and a `beats/` folder; `src/narration/narrationScript.ts` (typed cues `{id,beatId,start,end,text,caption,audioSrc?,volume,enabled,fallbackText}` + track `{fullSrc,totalDuration:195}`, text/timings from §G); `src/narration/useNarration.ts` (+ `narrationControls` singleton) owning one `HTMLAudioElement` with preload, play/pause/restart/seek, mute/unmute, volume, `loadState`, error handling; `src/narration/syncNarration.ts` (rAF bridge); `src/narration/webSpeechFallback.ts` (dev/fallback only); `src/overlay/StartOverlay.tsx` and `src/overlay/NarrationControls.tsx`.
>
> **Modify:** `useSimStore.ts` (add `narrationEnabled`, `muted`, `volume`, `audioLoadState`, `started`); mount the new overlays in `App.tsx`/`OverlaySystem.tsx`.
>
> **Behaviour / architecture:**
> - **Autoplay:** never play audio on load. Show `StartOverlay` with "▶ Start cinematic with narration" and "Start silent". The narration button, in one user-gesture handler, calls `audio.play()` AND starts the run together.
> - **Sync (narration ON = audio is master):** keep the GSAP timeline paused; each rAF call `cinematicControls.seek(audio.currentTime)` so visuals track audio with zero drift. `Space` pauses/resumes both; `R` restarts both from 0. **Narration OFF = today's behavior** (timeline master, no audio) — audio is never a hard dependency.
> - **Missing/failed audio:** if `voiceover-full.mp3` fails to load → set `audioLoadState:"error"`, fall back to silent timeline + captions in production (and Web Speech per-cue only in dev). The cinematic must always still run.
> - **Recording mode:** `H` hides StartOverlay + NarrationControls + all dev UI; the run + audio continue. Must produce a clean frame.
> - Captions unchanged (short); do not render narration text as a second caption.
>
> **Constraints:** no backend, no runtime API key, works offline once the mp3 is present, works in production build, deterministic/repeatable, no heavy per-frame allocation (reuse one audio element; the rAF sync is a single `seek` call). Keep `pnpm test` + `pnpm build` green; keep the draw-call/triangle budget unchanged.
>
> **Acceptance:** (1) Start overlay gates audio; clicking "Start with narration" plays voice + visuals together. (2) With narration on, audio and visuals stay in sync from 0:00 to the end-card across a full play and after `R`. (3) Mute/unmute, volume, and the VO on/off toggle work; with VO off the cinematic is unchanged from today. (4) Deleting/renaming the mp3 → cinematic still runs silently with captions, no errors. (5) `H` gives a clean recordable frame with sound continuing. (6) Tests/build green. Add a Vitest test for `narrationScript` (cue count = 15, every cue start/end within its beat window, monotonic) and for the controller's mute/volume/loadState logic. Report what you created/changed and the test results.
>
> **Do not touch:** the 3D scene, beat timings, economics model, or the §S behavior. Voiceover is additive only.

## L. Testing & recording checklist

- `pnpm test` (incl. new narration tests) + `pnpm build` green.
- Start overlay appears; no audio before the click.
- "Start with narration": voice + animation begin together; sync holds to the end card; `R` re-syncs from 0.
- Mute/unmute, volume, VO on/off all work; VO off = unchanged cinematic.
- Remove the mp3 → runs silently with captions, no console errors.
- `H` → clean frame, sound continues; production preview at 1080p.
- Record once with OBS/Win+G (system audio captured); play back: A/V in sync, end-card line lands.
- Confirm it still reads with **sound off** (captions carry it) for muted LinkedIn autoplay.

## M. Risks & mitigations

- **A/V drift over 3 min** → audio-as-master (seek visuals to audio each frame) eliminates it; don't run two independent clocks.
- **Autoplay block** → single gesture gate; never autoplay.
- **Missing/failed audio** → silent + captions fallback; never hard-depend on the file.
- **VO duplicating captions** → script complements, doesn't read, captions (§H).
- **Recording has no sound** → capture *system* audio in OBS/Game Bar; verify on a test clip.
- **TTS sounds robotic** → use a premium external voice; audition 2–3 voices before assembling the master.
- **Perf** → one audio element, one `seek`/frame; no new geometry; budget unchanged.

## N. Final recommendation

Go with **pre-generated audio, one assembled master track, audio-as-master sync, gated by a "Start cinematic with narration" button**, with Web Speech only as a dev fallback. Produce per-beat clips from the §F script (audition a calm, warm voice), assemble to the §G timings, commit to `public/narration/`, and have Codex build the additive controller + start overlay per §K. This yields a premium, drift-free, offline, repeatable narration that turns the silent cinematic into a professional product explainer — without risking the finished visuals.
