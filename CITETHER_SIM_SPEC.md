# citEther — "Follow Me Power" 3D Cinematic Simulation (Build Spec)

A fresh, standalone **real-time 3D cinematic** that visualises citEther's core idea: **your energy is no longer trapped at your meter — it follows you.** Built to auto-play a ~2.5–3 minute story you screen-record for LinkedIn.

This document is the source of truth for the build. An engineer (or Codex) should be able to build the whole thing from it.

---

## 1. The idea in one picture

Today, a home's solar energy is **locked to one address** — it hits an invisible wall at the property boundary. citEther adds a **settlement layer** so the energy becomes portable **credits** that flow, in real time, to wherever the person actually is: mum's flat, the job site, an EV at the coast, a hospital node, the community, a charity, a business, or the grid. The whole film is one metaphor made literal: **light (energy) breaking free of the meter-cage and following a person across a dark map of Australia.**

The visual thesis: **energy is light; the meter is a cage; citEther frees the light.**

---

## 2. Creative direction (and why it fits the P620)

- **Dark, cinematic "night" world.** Deep navy/black ground, silhouetted low-poly buildings, glowing energy as the only saturated colour. This looks premium, reads instantly on video, matches the citEther brand — and is **cheap to render** (less geometry, one key light, glow does the work). Ideal for a Quadro P620.
- **Energy = light.** All meaning is carried by emissive flows, pulses, and particles in brand colours. Solar = warm amber; credits/settlement = cyan; "share/family" = warm gold; "donate" = green; "sell/business" = violet; grid/wholesale = cool blue; stress/diesel = red.
- **Stylised, not photoreal.** Clean low-poly. No PBR texture sets. Emissive + simple materials + bloom.
- **Calm, confident pacing.** Slow cinematic camera moves; let each beat breathe. Motion always *explains* (energy moving from A to B), never random.

Brand palette (reuse from Aether for consistency): bg `#0A0F1A`, settlement/cyan `#22D3EE`, solar/amber `#FBBF24`, share/gold `#F5C451`, donate/green `#34D399`, sell/violet `#8B5CF6`, grid/blue `#3B82F6`, stress/red `#FB5E5E`, text `#EAF1FB`. Display font: Space Grotesk / Sora; UI/captions: Inter.

---

## 3. Tech stack (frozen)

- **Vite + React 18 + TypeScript**.
- **three.js** via **@react-three/fiber** (R3F) + **@react-three/drei** (helpers: `Instances`, `Line`, `Html`, `useGLTF` if needed, `PerspectiveCamera`, `Environment` optional).
- **@react-three/postprocessing** for **Bloom** (the glow). Perf-gated (see §8).
- **GSAP** as the **timeline director** (camera + value tweens, beat sequencing). (Theatre.js is an optional alternative; GSAP is simpler and Codex-friendly — use GSAP.)
- **Zustand** for the sim clock + current-beat state.
- DOM overlay (absolutely-positioned React) for **captions/HUD/metrics** — crisper than in-3D text and trivial to sync to the timeline.
- No backend. All data is a local, deterministic config. No network, no API keys.

---

## 4. World & scene graph

A single stylised scene — a dark, slightly stylised slab of "Australia / a city + suburbs + a coast highway." It does not need to be geographically accurate; it needs legible **location nodes** connected by **energy paths**.

**Location nodes (each a small low-poly landmark + a labelled marker):**
1. **Home** — the hero. Low-poly house with a glowing amber solar roof. The energy source.
2. **Mum's flat** — a small unit block across town (no solar).
3. **Job site** — a half-built structure with tools/compressor + a **diesel generator** (red, smoky) that later switches off.
4. **EV + coast fast-charger** — a car on a highway ribbon leading to a coastline.
5. **Hospital** — a larger building with a "constrained node" indicator; a nurse's EV parked beside it.
6. **Community battery / Pod** — a street of ~6–10 instanced houses sharing a battery unit.
7. **Charity / food bank** — a building with a freezer icon.
8. **Local business** — a shopfront.
9. **The grid** — transmission pylons + lines along the edge.
10. **citEther settlement layer** — a luminous, slowly-undulating **ribbon/mesh plane (or arc of nodes) floating above the map** that all credits route through. This is the brand's signature object; make it beautiful.

**The "you" token** — a small glowing avatar/marker representing the account-holder that moves between locations; energy visibly follows it.

**Energy paths** — `CatmullRomCurve3` splines from Home → settlement layer → destination. Particles travel along them (see §6).

Keep the ground a single large plane with a subtle grid/contour shader at low opacity (the "network" motif). Buildings are instanced boxes/extrusions. Trees/streetlights instanced. Target a clean, sparse, premium look — empty dark space is good.

---

## 5. The cinematic — beat-by-beat director timeline (~2:45)

One GSAP master timeline drives camera, scene state, energy flows, and caption cues. Time-based (use elapsed seconds, not frame counts) so it's deterministic and recording-safe. Each beat = a camera move + an energy/scene event + a caption. Captions mirror the pitch.

| # | t (mm:ss) | Camera | Scene / energy event | Caption (overlay) |
|---|-----------|--------|----------------------|-------------------|
| 0 | 0:00–0:08 | Slow push-in on a single dark city, stars/grid | Title fades in | **citEther** — "Your energy follows you." |
| 1 | 0:08–0:25 | Orbit to the Home, amber solar glowing | Solar particles rise from roof… then **hit an invisible cage** at the property line and fall back | "Four million homes make their own power — trapped at one meter." |
| 2 | 0:25–0:40 | Quick cuts: job site, coast charger, mum's flat | Diesel generator smokes (red) while home battery sits full; EV pays at red fast-charger while panels export for cents; mum's flat dark while a roof overflows | "Generated here. Needed there. The system treats them as strangers." |
| 3 | 0:40–1:00 | Pull up & back; reveal the whole map | The **citEther settlement layer** ignites above the map; the meter-**cage shatters**; trapped energy lifts free into the layer (cyan) | "citEther is the settlement layer. The grid is the wire. **Your energy breaks free of the address.**" |
| 4 | 1:00–1:12 | Glide to mum's flat | A warm-gold credit flows Home → settlement → mum's flat; her unit lights up | "Power your mum's flat from your roof." |
| 5 | 1:12–1:24 | Glide to job site | Diesel generator **switches off** (red→grey, smoke stops); tools glow on amber credits | "Run your tools on home solar — not diesel." |
| 6 | 1:24–1:36 | Track the EV on the highway to the coast | Home credits chase the car; coast charger cost ticks toward ~$0 | "Charge at the coast. Pay with your roof." |
| 7 | 1:36–1:50 | Glide to hospital | Nurse's EV feeds the hospital's constrained node (cyan into a red node turning green); a $ counter rises | "Your car earns while you work a 12-hour shift." |
| 8 | 1:50–2:05 | Pull back to Home; 6 paths fan out | **Six destinations** light in sequence: Use, Share, Donate (green→food bank), Sell-business (violet), Sell-Pod, Sell-grid | "Use it. Share it. Donate it. Sell it. Always a better option than zero." |
| 9 | 2:05–2:18 | Drift over the Pod street | Houses link to the community battery; a gentle pulse equalises across the street | "Your street becomes one cooperative. Auto-Arb runs every asset." |
| 10 | 2:18–2:32 | Rise to a top-down "Sankey" moment | Energy flow Home → citEther → six destinations, with a thin **network-fee layer** visibly skimmed; net value still positive | "Even after network fees — it beats a zero feed-in tariff." |
| 11 | 2:32–2:45 | Slow pull back; whole network alive with flowing light, the "you" token moving and energy following | Everything glowing, calm | **"citEther — Your energy follows you."** + small CTA: "One suburb. 100 homes. 3 months." |

Add a 3–5s hold on the final frame for a clean end card. Optionally loop back to title.

**Director requirements:** a single `useCinematic()` controller exposing `play/pause/restart/seek`; a `beats[]` config (start, duration, camera keyframe, event id, caption); GSAP tweens camera position + lookAt between keyframes with eased cuts where the table says "cuts." A keyboard `Space` = play/pause, `R` = restart, `H` = hide all dev UI (for clean recording). Everything off the timeline must be idle/calm so recording is predictable.

---

## 6. Energy-flow visual system (the core effect)

- **Paths:** precompute `CatmullRomCurve3` for each (source → settlement → destination). Store per-path colour + active window (which beat turns it on).
- **Particles:** one **instanced mesh** (or `Points` with a sprite/shader) of N small glowing quads/spheres per active path; animate each instance's position by sampling `curve.getPointAt((t0 + speed*elapsed) % 1)`; emissive colour = path colour; size pulse for life. Cap total live particles (see §8).
- **Pulse/flow look:** vary opacity along the curve so it reads as a *stream* with a bright head. Add a faint additive trail line (`drei <Line>`).
- **Settlement layer:** a subdivided plane with a vertex/fragment shader doing a slow undulation + flowing emissive bands (cyan), or a lighter approximation: an instanced grid of points pulsing in waves. Keep it GPU-cheap.
- **Cage effect (beat 1/3):** a translucent wireframe box around the home that the particles bounce off; on beat 3 it **shatters** (scale/opacity-out + a few debris instances) — a one-shot.
- **Diesel→off (beat 5):** swap a red emissive + a cheap smoke puff (a few additive sprites fading) to grey/none.

All effects must be **deterministic functions of the timeline clock** so the recording is identical every run.

---

## 7. Captions / HUD (DOM overlay)

- Bottom-center **caption strip** (large, Space Grotesk, fades per beat).
- Top-left tiny **brand mark** "#citEther".
- Optional small **metric chips** that count up during the relevant beats (e.g. "Coast charge: $0.78 → $0.04", "Nurse earns: $0 → $52", "Net after fees: +$X vs 0c FiT") — animated with GSAP, synced to beats. Keep to 1 chip at a time; numbers are illustrative and labelled as such if needed.
- A subtle **progress bar** for the 2:45 timeline (hideable with `H`).
- Everything in the overlay must be hideable for a clean recording, and must not capture pointer events during playback.

---

## 8. Performance budget (Quadro P620, 4GB — must hold)

- Target **1920×1080 @ 60fps**; acceptable floor 40fps (recording still looks smooth). Provide a `quality` toggle (high/med) that scales effects.
- **Draw calls:** keep low via **instancing** for all repeated meshes (houses, trees, pylons, particles). Aim < ~150 draw calls.
- **Lighting:** one directional/key light + low ambient + emissive materials. **No real-time shadows** (or a single low-res shadow only if cheap). Glow comes from Bloom, not many lights.
- **Bloom:** `@react-three/postprocessing` Bloom at **half-resolution**, mipmapBlur, modest intensity. If fps drops, the `med` quality path disables Bloom and uses additive emissive sprites instead.
- **Particles:** instanced; cap ~1,500 live across all active paths; reuse the pool. No per-particle React state — animate in a single `useFrame`.
- **Materials:** prefer `MeshBasicMaterial`/emissive + `MeshStandardMaterial` only where lighting matters. Small/no textures; procedural where possible.
- **Pixel ratio:** clamp `dpr` to `[1, 1.5]`.
- **Geometry:** low-poly; merge static geometry where sensible; dispose on unmount.
- Test fps with `r3f-perf` (dev only) and confirm the floor on the actual laptop before recording.

---

## 9. Architecture & file structure

```
citether-sim/
  index.html
  package.json  vite.config.ts  tsconfig.json
  src/
    main.tsx  App.tsx
    cinematic/
      beats.ts            # the §5 beat config (timings, camera keyframes, event ids, captions)
      useCinematic.ts     # GSAP master timeline; play/pause/restart/seek; exposes clock + activeBeat
      cameraRig.ts        # camera keyframe tweening + lookAt
    scene/
      World.tsx           # ground, settlement layer, lights, environment
      SettlementLayer.tsx # the signature floating ribbon/mesh
      nodes/              # Home, MumsFlat, JobSite, EVCoast, Hospital, Pod, Charity, Business, Grid
      props/              # instanced trees, pylons, streetlights, debris
    energy/
      paths.ts            # CatmullRom path definitions (source->settlement->dest) + colours
      EnergyFlow.tsx      # instanced particle system driven by the clock
      effects.ts          # cage shatter, diesel-off, node light-up helpers
    overlay/
      Captions.tsx  MetricChips.tsx  ProgressBar.tsx  BrandMark.tsx  DevControls.tsx
    state/
      useSimStore.ts      # clock, activeBeat, quality, uiHidden
    lib/ colors.ts  curves.ts  easing.ts  perf.ts
    styles/ tokens.css
  public/ (any low-poly .glb if used; otherwise procedural)
  README.md (run + record instructions)
```

---

## 10. Build roadmap (phased, for Codex)

- **Phase 0 — Scaffold.** Vite+React+TS+R3F+drei+postprocessing+gsap+zustand; dark canvas; a single emissive cube + Bloom; `r3f-perf`; confirm 60fps. *Done when: app runs, glows, hits fps target.*
- **Phase 1 — Static world.** Ground + grid shader, Home (glowing solar roof), all location nodes placed + labelled, settlement layer object, instanced props. Dev `OrbitControls` to inspect. *Done when: the world reads clearly and holds the perf budget.*
- **Phase 2 — Energy-flow system.** Paths + instanced particle streams + trails; turn one path on/off by clock. *Done when: a credit visibly flows Home→settlement→a destination, smoothly.*
- **Phase 3 — Director timeline.** `beats.ts` + `useCinematic` GSAP timeline; camera keyframes/cuts; wire each beat to its energy event + caption. *Done when: the full §5 sequence auto-plays start to finish.*
- **Phase 4 — Signature effects.** Cage + shatter, diesel-off + smoke, node light-ups, settlement-layer shader, six-destinations fan, Sankey/network-fee moment. *Done when: every beat's hero effect lands.*
- **Phase 5 — Overlay & polish.** Captions, metric chips, brand mark, progress bar, end card; `H` to hide UI; `Space`/`R` controls; colour/timing polish. *Done when: it looks like a finished film at 1080p.*
- **Phase 6 — Record-ready pass.** Lock timing, verify deterministic playback, verify fps floor on the laptop, hide dev UI, add README record steps. *Done when: one clean 1080p screen-record looks great.*

---

## 11. Recording guidance (for you)

- Run the prod build (`pnpm build && pnpm preview`) full-screen at 1920×1080, browser zoom 100%, dev UI hidden (`H`).
- Record with **OBS Studio** (free) or Windows **Xbox Game Bar** (Win+G) at 1080p60, high bitrate; capture the browser/monitor. Press `R` then `Space`, let the ~2:45 play untouched.
- Optionally add a soft ambient music bed in post (the video, not the app) — energy/ambient track, ducked. Keep captions burned-in from the overlay.
- For LinkedIn: 1080p, ~2:45, strong first 3 seconds (the title + first glow). A square/9:16 crop variant can be exported in post if you want a mobile-first cut.

---

## 12. Acceptance (definition of done)

- The app auto-plays the full §5 sequence deterministically, identical every run, at ≥40fps (target 60) at 1080p on the P620.
- The core metaphor is unmistakable on screen: energy trapped → cage breaks → energy follows the person to each destination.
- All six destinations and the four hero examples (mum, tradie, EV coast, nurse) read clearly with captions.
- No network/keys; runs fully offline. Dev UI hides cleanly for recording. `Space`/`R`/`H` work.
- Holds the §8 perf budget; no memory growth over a full playthrough (dispose correctly).
