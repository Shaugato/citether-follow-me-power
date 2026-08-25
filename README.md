# citEther: Follow Me Power

A browser simulation of what would happen if the credit from your rooftop solar could follow you around the city instead of staying stuck at your home meter. The mechanism it models is a settlement layer: the grid still delivers every kilowatt hour of electricity, while a home's unused solar surplus becomes credit that is applied against energy the same person uses at another location.

**Live: [citether-sim.vercel.app](https://citether-sim.vercel.app)**

It runs for about three minutes and twenty seconds. Choose "Start cinematic with narration" for the voiceover, or "Start silent" to follow the captions. Use a desktop or laptop browser; the layout is not built for phones.

## This is a concept simulation, not a product

Read this before anything else.

- It settles nothing real. There is no billing, no ledger of record, no payment rail, no money.
- It controls nothing real. No meter, inverter, battery, charger or grid asset is connected to it.
- There is no backend, no database, no accounts, no API and no blockchain. It is a static page that runs entirely in the browser.
- Every figure on screen is illustrative. The numbers come from one small deterministic model in this repository, built on assumed prices, not from market data, a trial or a pilot.

The purpose is to make an idea legible in three minutes. It is not a claim that the idea has been built, priced or validated.

## The problem it describes

Australia has millions of homes with solar on the roof. On a sunny day a home generates more than it can use, the battery fills, and the surplus has one way out: export to the grid at a feed-in tariff worth a few cents.

Meanwhile the same household pays a much higher price for energy everywhere else. Charging an EV at a coastal fast charger. Running tools on a job site. Helping a parent across town with their bill.

So the value is real and the need is real, but they cannot meet, because the value is attached to a meter at one address rather than to the person who owns it. citEther is the question that follows from that: what if your energy account travelled with you instead of sitting at your address?

## What the simulation shows

A dark isometric city with nine locations: a home, a parent's flat, a job site, a coastal EV charger, a hospital node, a community pod, a food bank, a local business and the wholesale grid. The camera moves through fifteen fixed beats:

1. **The problem.** One home with solar and a full battery. Its surplus can only be exported for near nothing, so the value stays at the address.
2. **The contradiction.** The same person pays far more elsewhere. The simulation puts the two prices side by side.
3. **The mechanism.** The surplus becomes settlement credit tied to an energy account rather than a meter.
4. **The destinations.** Credit is applied at the parent's flat, the job site, the coastal charger, the food bank, a local business, the community pod and finally the wholesale grid as a fallback. A separate strand shows a nurse's EV supporting a constrained hospital node, kept deliberately apart from the household result so the two are never added into one headline.
5. **The economics.** A breakdown of gross value, network fees and platform margin down to a household net figure, compared against what the same surplus would have earned as a feed-in tariff.
6. **The closing statement.**

Two visual layers run at once and carry the central distinction. A blue layer is physical electricity moving on the grid. A brighter cyan and gold layer is settlement value moving between accounts. The point of the split is that credit moves, not electrons.

Alongside the 3D scene, a DOM overlay shows a live household ledger, a timestamped settlement event log, a per-beat explanation card, a Sankey-style economics breakdown and captions.

### The numbers, and the assumptions behind them

The on-screen figures are computed from one model in `src/scenario/`, so the 3D scene, the ledger and the economics panel can never disagree. For a single illustrative day the model assumes:

- 19.5 kWh generated, 7.1 kWh used at home, leaving 12.4 kWh of surplus.
- A feed-in tariff of $0.03/kWh, which values that surplus at $0.37.
- Destination retail prices from $0.30/kWh at the community pod to $0.95/kWh on the job site.
- A flat network fee of $0.08/kWh, reduced by 60% for a same-feeder local loop.
- A 10% platform margin on the value after network fees.

Those assumptions produce $6.63 gross, $0.82 in network fees, $0.58 in margin and $5.23 of household net value against the $0.37 feed-in alternative. The headline multiple in the simulation is a direct consequence of those inputs. Change the assumed prices and the story changes with them, which is exactly why they are all visible in one file rather than hard coded across the scene.

## Technology

Everything listed here is actually in the repository.

| Area | What is used |
| --- | --- |
| Build | Vite 6, TypeScript 5.9 in strict mode |
| UI | React 18, plain CSS in a single token stylesheet |
| 3D | three.js 0.180 via React Three Fiber 8 and drei 9 |
| Post-processing | @react-three/postprocessing, bloom only, at half resolution |
| Animation | GSAP 3 drives one master timeline for the whole sequence |
| State | Zustand 5 |
| Tests | Vitest, 34 unit tests across 5 files covering the economics model, the event director and the narration controller |
| Dev only | r3f-perf for a frame and draw call readout |

Scale: 63 tracked TypeScript files totalling roughly 3,900 lines in `src/`, five of which are tests, plus a 660 line stylesheet.

Some things worth knowing about how it is put together:

- **One clock.** The entire sequence is a single GSAP timeline keyed to elapsed seconds, so every playthrough is identical and safe to screen record. When the voiceover is on, the audio element becomes the master clock and a requestAnimationFrame bridge seeks the timeline to the audio position each frame, which means the visuals cannot drift from the narration over a three minute take.
- **Audio is never a hard dependency.** If the MP3 fails to load, the run continues silently with captions rather than erroring.
- **Playback is gated behind a click.** Browsers block autoplay with sound, so the start overlay exists to make the first play a user gesture.
- **The voiceover is pre-generated and committed.** `scripts/generate-narration.mjs` calls the OpenAI text to speech API and assembles a master track with ffmpeg, but that is a build-time step. Running the app needs no API key and makes no network calls beyond its own static assets. The generator hashes each line so a rerun only regenerates what changed.
- **Performance choices.** Device pixel ratio is clamped, shadows are off, repeated geometry and particles are instanced and pooled, and there is a three step quality toggle for weaker hardware.

## Running it locally

Requires Node.js 20 or newer and pnpm.

```bash
pnpm install
pnpm dev        # http://127.0.0.1:4173
pnpm build      # typecheck, then production build to dist/
pnpm preview    # serve the production build
pnpm test       # unit tests
```

Controls once it is running:

| Key | Action |
| --- | --- |
| `Space` | Play or pause |
| `R` | Restart from the beginning |
| `H` | Hide all overlay UI for a clean recording frame |

There is also a voiceover toggle, a mute button, a volume slider and a quality selector in the corners.

## Where this came from

The concept was created at **Watt The Hack 2026** in Melbourne by **Shaugato Paroi** with **Henry**, **Kirk Holt** and **Sam Sabey**. The team's demo ran late on the day and the project did not place.

This repository is what happened afterwards. Shaugato rebuilt the concept on his own as a 3D simulation with a voiceover, so the idea could be watched in three minutes rather than read in a pitch deck. The teammates above are credited for the concept; the code here is a solo build after the event.

## Status and limitations

Honest list, in rough order of how much they matter.

- **The economics are assumptions, not analysis.** The model treats the gap between a feed-in tariff and a destination retail price as capturable after a flat network fee and a platform margin. Real network tariffs, retailer margins, wholesale market settlement, metering rules and regulatory approval would all sit in that gap, and none of them are modelled. Nothing here demonstrates that the concept is commercially or legally workable.
- **It is linear, not explorable.** There is no free camera and no way to change the inputs from the interface. You watch a fixed sequence; you do not run your own scenario. Changing the numbers means editing the scenario file and rebuilding.
- **Desktop only.** There are no responsive breakpoints, so the overlay panels overlap and clip on narrow viewports and on phones.
- **The voiceover is synthetic**, generated with OpenAI text to speech, not recorded by a person.
- **The narration track is about 7.6 MB**, which is a slow first load on a poor connection.
- **Build-time dependency advisories.** `pnpm audit` currently reports issues in transitive build dependencies. They do not affect the deployed static page, but the lockfile is due a refresh.
- **The hospital vehicle-to-grid strand is the weakest part of the model.** It is deliberately kept separate from the household result, but its scale relative to the rooftop story reflects an assumed constrained-node price rather than anything observed.

## Licence

Licensed under the [MIT License](LICENSE).
