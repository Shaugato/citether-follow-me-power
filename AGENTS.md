# AGENTS.md — citEther 3D Cinematic Simulation (read every run)

You are building a **fresh, standalone real-time 3D cinematic** in this folder. Source of truth: **`CITETHER_SIM_SPEC.md`** — build exactly to it. This is NOT the Aether platform; do not pull in that repo.

## What we're making
A ~2:45 auto-playing 3D "film" of citEther's **Follow Me Power** concept: home solar energy breaks free of the meter and follows a person to wherever they consume — mum's flat, job site, EV at the coast, hospital, community, charity, business, grid. The deliverable is a **cinematic the user screen-records for LinkedIn** (not an interactive app).

## Hard rules
- **Spec is law.** Build the world, the beat timeline (§5), the energy-flow system, the effects, and the overlay exactly as specified. Don't add features or pages beyond it. If ambiguous, pick the minimal spec-consistent option and note it in `OPEN_QUESTIONS.md`.
- **Frozen stack:** Vite + React 18 + TypeScript + @react-three/fiber + @react-three/drei + @react-three/postprocessing (Bloom) + GSAP (timeline director) + Zustand. DOM overlay for captions. No backend, no network, no API keys — runs fully offline.
- **Cinematic-first, deterministic.** The whole sequence is driven by ONE GSAP master timeline keyed off elapsed seconds (not frame counts), so playback is identical every run and safe to record. Nothing animates randomly off-timeline.
- **Performance is a requirement, not a nice-to-have.** Target hardware = **NVIDIA Quadro P620 (4GB)**. Hold §8: instance everything repeated, <~150 draw calls, one key light + emissive + half-res Bloom, no real-time shadows, ≤~1,500 pooled particles, clamp dpr to [1,1.5], dispose on unmount. Add `r3f-perf` in dev and verify ≥40fps (target 60) at 1080p. Provide a high/med quality toggle (med drops Bloom).
- **Look:** dark "night" world, energy = light, brand colours from the spec. Stylised low-poly, not photoreal. Glow does the work.
- **Recording-friendly:** `Space` play/pause, `R` restart, `H` hide all dev/overlay UI; a clean end-card hold.

## Build order
Follow `CITETHER_SIM_SPEC.md` §10 Phases 0→6 in order. Validate each phase's "Done when" before moving on. Keep the app running and the fps budget green at every phase.

## Self-check before calling it done (§12)
Full §5 sequence auto-plays deterministically at ≥40fps/1080p on the P620; the trapped→freed→follows-you metaphor is unmistakable; all six destinations + four hero examples read with captions; offline; dev UI hides cleanly; no memory growth across a full playthrough. Write a short `README.md` with run + OBS recording steps.
