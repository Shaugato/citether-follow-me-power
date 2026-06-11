# citEther — "Follow Me Power" — Explainer Simulation Spec **v2**

> Supersedes `CITETHER_SIM_SPEC.md`. This version turns the simulation from "animated but not clear" into a **self-explaining 3D product explainer**: a viewer who knows nothing about solar, feed-in tariffs, settlement, or VPPs should understand citEther by the end — without you saying a word.

**Status:** specification + migration plan. **Do not change code until the user approves this spec.**

---

## A. Executive summary

citEther's idea is **Follow Me Power**: today a household's rooftop-solar *value* is trapped at the home meter (exported for a near-zero feed-in tariff), while the same person pays high prices elsewhere — charging an EV, running tools on a job site, helping a parent across town. citEther adds a **settlement layer** so that value becomes **portable credits** settled against consumption at other locations. The grid still moves the electricity; **citEther moves the value.**

The v2 simulation is a **2:45–3:15 deterministic cinematic** that teaches this in six stages — *problem → contradiction → breakthrough → use cases → economics → thesis* — using a **dual-layer visual** (physical grid vs settlement credits), a **live ledger/event-log overlay** that shows real (deterministic) numbers, and **before/after** transformations at each location. It is data-driven (a scenario config + economics model), readable on dark low-poly 3D, and runs at 1080p/60fps on a Quadro P620.

## B. Why the current (Phase-4) version is not enough — blunt critique

Grounded in the actual build (`src/`) and its phase screenshots:

1. **Captions carry the entire explanation.** The only overlay is `Captions.tsx`. There is no ledger, no event log, no "why this" card. Remove the captions and the viewer understands nothing — the *visuals* aren't explaining, the *text* is. (Spec asked for explainability overlays; they don't exist.)
2. **No data model.** There is no `scenario/` or `economics/` — numbers like "$52 earned" or "network fee" are not computed or shown anywhere, so nothing feels like a real system. It's a movie, not a simulation.
3. **The opening doesn't establish the problem.** Beat 0/1 already show the *entire map* with all nodes and flows (`phase3-director-opening.png`). The viewer is dropped into a complex network before they understand the one home and its trapped surplus. The first 10 seconds must be one home, one problem.
4. **Nodes are abstract coloured boxes with tiny labels.** `phase4-fan.png` shows cubes labelled "CHARITY / FOOD BANK", "LOCAL BUSINESS" in ~8px text. A non-expert can't read what each place *is* or *why it matters*. They look like a diagram, not places with people.
5. **The conceptual-accuracy risk is unaddressed.** There is **no distinction between physical electricity and settlement value** — everything is glowing flow. An energy-sector viewer will think you're claiming electrons teleport across Australia and dismiss it. There is no `PhysicalGridLayer`.
6. **"Sankey/economics" is decorative.** `phase4-sankey.png` is just the settlement ring + a caption "beats a zero feed-in tariff." There is no actual gross → network-fee → margin → net breakdown. The single most credibility-building beat is the weakest.
7. **No before/after per use case.** The diesel-off effect exists, but mum's flat, EV, hospital don't show a clear *problem state → settle → improved state*. Without contrast, the value doesn't land.
8. **Everything glows at once.** Many cyan dashed flows are on from early beats (opening screenshot), so nothing has focus. Motion is decorative, not sequential teaching.
9. **Label collisions.** `phase4-cage.png` shows "MUM'S FLAT" overlapping the Home/solar node — the labelling system isn't beat-aware.
10. **Hardcoded beats, not a system.** `beats.ts` holds 13 beats with captions only; visuals are wired ad hoc. There's no event director reading a scenario, so the "real system underneath" feeling is absent.

**Verdict:** good cinematic foundation (dark world, cage, settlement layer, flows, autoplay) but it **shows** rather than **explains**, has **no data/economics substance**, and risks **conceptual inaccuracy**. v2 fixes those three things first.

## C. Core concept (the thing the sim must teach)

- A home makes solar. After self-use there's **surplus**.
- The old system's only option for surplus is **export at a near-zero feed-in tariff** → value trapped at the meter/address.
- The same person **consumes elsewhere at high prices** (EV charge, job site, mum's flat).
- **citEther** turns surplus into **credits tied to the person's energy account**, and **settles** those credits against consumption at authorised destinations.
- **The grid still delivers the physical electricity at each location.** citEther reconciles the *value* — a financial/settlement layer, not a physical rerouting of electrons.
- After **network fees** and a citEther **margin**, the **net value still beats a zero feed-in tariff** — because the alternative was exporting for nothing.

## D. Narrative goals

Teach by showing **pain → mechanism → use cases → value outcome**, across three always-visible layers:
- **Layer 1 — Human story:** real people/places (home, mum's flat, tradie job site, EV coast trip, nurse/hospital, charity, business, Pod).
- **Layer 2 — Energy/value story:** solar generated, self-use, surplus, weak feed-in alternative, credits created, routed, settled, fees deducted, net value.
- **Layer 3 — System story:** citEther receives export value → maps it to the person's energy identity → allocates credits to destinations → applies rules/fees → produces measurable outcomes.

## E. Viewer comprehension goals (what they must "get")

By the end, a cold viewer can state, unprompted: *"Their solar surplus was worth almost nothing stuck at home; citEther lets that value follow them and pay for energy they use elsewhere; the grid still carries the power, citEther just settles the value; even after fees it beats exporting for free."* Each is a checkable acceptance item (§S).

## F. Visual metaphor & conceptual accuracy (the #1 fix)

**Dual-visual system — always distinguish the two layers:**
- **Physical grid layer** (`PhysicalGridLayer`): thin, calm **blue/white** lines along real infrastructure (feeders/pylons) that are *always on* under everything. Caption anchor: **"The grid supplies the electricity."**
- **Settlement layer** (`SettlementLayer` + credit tokens): brighter **cyan/gold** discrete **tokens/packets** that travel **up to citEther and back down to a destination** — clearly *above* the physical layer. Caption anchor: **"citEther settles the value."**

Reinforcing caption grammar (use verbatim where relevant):
- "The grid supplies the electricity."
- "citEther settles the value."
- "Your energy account follows you."
- "Your rooftop generation offsets consumption wherever you authorise it."

**Rule:** credits never travel *along the ground wire* between distant homes — they always rise into the citEther layer and settle down. This visually encodes "value, not electrons." This is what keeps energy-sector viewers on side.

## G. World design

A dark, stylised low-poly slab of "a city + suburbs + a coast highway." Sparse and premium; empty dark space is good. Two persistent strata:
- **Ground/physical:** matte dark plane with a faint contour grid; feeder lines + pylons (thin blue) connecting all nodes to the grid edge — the physical layer, always subtly live.
- **Sky/settlement:** the citEther layer floats above as a **network mesh** (nodes + links that pulse), not a flat glowing plane — it should read as a *settlement network/ledger*, with an **account-identity token**, **routing**, **fee layer**, and **settlement-confirmation pulses**.
- **The "you"/account token:** a glowing marker that, after citEther activates, **detaches from the home address** and moves between locations while credits follow it. It must visually say *"the account travels, not the meter."*

Camera lives in this world; beats focus it on one region at a time (§L). Default to one home at the start; reveal the full network only at the finale.

## H. Location / node design (readable places, not boxes)

Each node = a small, instantly-recognisable low-poly landmark + a **beat-gated label** + a **state** (before/after). Keep poly low; readability comes from silhouette + one icon + colour, not detail.

- **Home (hero):** house + **solar roof** (amber), **battery** on side wall (fill indicator), **meter box** with a visible **"address-lock" cage**, a weak grey **export arrow** with a low feed-in counter, a **full-battery** indicator (surplus has nowhere to go).
- **Mum's flat:** darker unit block, **"no solar"** marker, a **bill-stress** meter (red), windows that **warm up** after settlement.
- **Tradie job site:** half-built frame, compressor/tools, **red diesel generator** + smoke/pollution indicator; generator **switches off** after credit allocation.
- **EV coast trip:** stylised highway ribbon to a coastline, an **EV token** moving, a **fast charger** with a **high price counter**; home credits **offset** the cost (counter drops).
- **Hospital:** larger building, **constrained-node** indicator with a **red stress ring**; nurse's **EV plugged in**; ring turns **green/blue** and an **earning counter** rises after support.
- **Community Pod:** cluster of 6–10 instanced houses + a **shared community battery**; **local loop** pulse; "same feeder / local loop" cue.
- **Charity / food bank:** building + **freezer icon**; a **green** donated credit turns the **freezer lights on**.
- **Local business:** shopfront + a **bid/offer** marker (violet); business **buys** community credit.
- **Grid:** pylons / transmission edge; **wholesale fallback** path, visually lowest priority (dimmer, last).
- **citEther settlement layer:** as in §G — identity token, routing, destination matching, fee layer, settlement pulses.

## I. Visual grammar (colour = meaning; form = meaning)

**Colour:** Amber `#FBBF24` = physical **solar generation**. Cyan `#22D3EE` = **citEther settlement credits**. Gold `#F5C451` = **family/share**. Green `#34D399` = **donation/community/social**. Violet `#8B5CF6` = **business/local market**. Blue `#3B82F6` = **grid/wholesale/physical network**. Red `#FB5E5E` = **stress / high cost / diesel / constrained node**. Grey `#6B7280` = **inactive / old system / low value**. White `#EAF1FB` = **neutral UI/labels**.

**Form (energy is never "just particles"):**
- Physical electricity → **thin steady blue lines** (always-on, calm).
- Settlement credits → **discrete glowing tokens/packets** rising to citEther and settling down.
- Trapped value → **amber particles hit the cage and fall back**.
- Low feed-in → a **tiny weak grey export line** with a near-zero counter.
- High external cost → a **red counter rising** at the destination.
- Successful settlement → destination receives a cyan/gold token + a **"settled ✓" tick**.
- Network fees → a **thin fee layer skimmed** from the token stream.
- Net benefit → the **remaining bright token** continues to the destination.
- Donation → **green token + charity icon**. Business sale → **violet token + bid marker**. Pod sharing → **circular local-loop pulse**.

## J. Data / simulation model (make it a system, not a movie)

The cinematic must **read from a deterministic scenario**, not hardcode visuals. Add `src/scenario/`.

```ts
// types.ts (illustrative, deterministic — no randomness)
interface Scenario {
  clockStart: string;            // "08:00"
  households: Household[];
  locations: LocationNode[];     // home, mums_flat, job_site, ev_coast, hospital, pod, charity, business, grid
  assets: Asset[];               // solar, battery, ev, hvac, tools, generator
  prices: PriceTable;            // feedInTariff, retailByLocation, wholesale, fastChargerRate
  networkFeePerKwh: number;      // T&D charge
  citetherMarginPct: number;     // platform take on net value
  destinations: Destination[];   // ordered priority: use, share, donate, sellBusiness, sellPod, sellGrid
  settlementEvents: SettlementEvent[]; // the timeline of value movements (derived or authored)
  carbon: { dieselKgPerKwh: number; gridKgPerKwh: number };
}
interface SettlementEvent {
  t: string;                     // "09:20"
  beatId: number;
  fromLocationId: string;        // "home"
  toLocationId: string;          // "mums_flat"
  kwh: number;                   // credit size
  grossValue: number;            // kwh * destination retail price
  networkFee: number;            // kwh * networkFeePerKwh
  citetherMargin: number;
  netValue: number;              // gross - fee - margin
  feedInAlternative: number;     // kwh * feedInTariff (the weak old option)
  carbonAvoidedKg?: number;      // e.g. diesel avoided
  label: string;                 // human line for the event log
}
```

The director (`eventDirector.ts`) walks `settlementEvents` in time order, driving (a) the matching credit-token animation, (b) the ledger/event-log overlay numbers, (c) the destination before/after state. **One source of truth → 3D + overlay never disagree.**

## K. Economic / settlement model (credibility)

`scenario/economics.ts` — pure functions, deterministic, internally consistent:

```
surplusKwh        = solarGenerated - homeSelfUse
feedInAlternative = surplusKwh * feedInTariff            // the weak baseline (~$0.03–0.08/kWh, can be ~0)
grossValue(dest)  = kwh * retailPrice[dest]              // value of offsetting consumption there
networkFee        = kwh * networkFeePerKwh               // T&D; smaller if same feeder/Pod (local loop)
citetherMargin    = (grossValue - networkFee) * marginPct
netValue          = grossValue - networkFee - citetherMargin
benefitVsFiT      = netValue - feedInAlternative         // must be > 0 in every shown case
carbonAvoided     = kwh * (dieselKgPerKwh - gridKgPerKwh)  // job site etc.
```

Show one running ledger for the day plus per-event numbers. Pick numbers so every use case has `benefitVsFiT > 0` and the day totals are tidy and quotable (e.g. surplus ~12 kWh, net day value an order of magnitude above the FiT alternative). Numbers are **illustrative but consistent** — never random, and labelled as illustrative on the end card.

## L. Beat-by-beat cinematic timeline (~2:55)

15 beats. Each: purpose · camera · visual action · caption · metric/overlay · credit behaviour · emotional takeaway · impl notes · must-be-visible. Use-case beats (7–10) follow **before → action → after**. Captions are reinforcement, not the only explanation — the visuals + ledger must carry it.

**Beat 0 — Hook / title (0:00–0:10).** *Purpose:* set tone. *Camera:* slow push toward a single dark suburb, one home faintly lit. *Visual:* title; the physical blue grid lines breathe faintly underneath. *Caption:* "citEther — Follow Me Power." *Overlay:* mode chip "Old system". *Credits:* none. *Takeaway:* calm, premium. *Impl:* camera keyframe A→B; no flows yet. *Visible:* one home, not the whole map.

**Beat 1 — Home solar creates surplus (0:10–0:26).** *Purpose:* establish generation + surplus. *Camera:* orbit the Home, settle on the amber roof. *Visual:* amber solar particles flow roof→home (self-use), battery fills to full, **surplus** keeps coming with nowhere to go. *Caption:* "A home makes more power than it can use." *Overlay ledger:* Solar 12.4 kWh · Home used 7.1 · **Surplus 5.3**. *Credits:* none yet (physical only). *Takeaway:* abundance. *Impl:* ledger panel fades in here. *Visible:* roof glowing, battery full, surplus building.

**Beat 2 — The meter cage traps value (0:26–0:42).** *Purpose:* the core pain. *Camera:* dolly to the **meter box**; tighten. *Visual:* surplus amber particles hit the **address-lock cage** and **fall back**; a tiny weak **grey export line** trickles to the grid with a near-zero counter. *Caption:* "Today its only option is export — for almost nothing." *Overlay:* "Feed-in alternative: **$0.03/kWh → $0.16**" (weak). *Credits:* trapped. *Takeaway:* frustration. *Impl:* reuse existing cage; add the weak grey export + FiT counter. *Visible:* particles bouncing off cage; pitiful FiT number.

**Beat 3 — Outside needs appear (0:42–0:58).** *Purpose:* the same person needs power elsewhere. *Camera:* pull up; reveal mum's flat, job site, EV/coast, hospital — **each with a red cost/stress marker**, home still caged in frame. *Visual:* red rising-cost counters at each destination. *Caption:* "Meanwhile the same person pays full price everywhere else." *Overlay:* mini costs (Mum bill, diesel $/kWh, fast-charge $0.78, hospital stress). *Credits:* none. *Takeaway:* contradiction. *Impl:* reveal nodes with red states; keep settlement layer hidden. *Visible:* 4 destinations in red, home surplus wasted.

**Beat 4 — The contradiction, side-by-side (0:58–1:10).** *Purpose:* make the injustice explicit. *Camera:* split focus home ↔ a destination. *Visual:* weak grey FiT line (home) vs tall red cost bar (destination). *Caption:* "Worth almost nothing here. Expensive there." *Overlay:* contrast chip "Export $0.03 ⟷ Pay $0.78". *Takeaway:* "this is broken." *Impl:* two synced counters. *Visible:* the gap.

**Beat 5 — citEther settlement layer activates (1:10–1:26).** *Purpose:* the breakthrough + accuracy. *Camera:* rise; the **settlement network** ignites above the map. *Visual:* the **cage shatters**; trapped amber lifts and **converts into cyan credit tokens** in the citEther layer; the **physical blue grid stays visibly on underneath**. *Caption:* "citEther settles the value. The grid still carries the power." *Overlay:* mode flips "Old system → **citEther settlement**". *Credits:* minted (event-log: "citEther minted 5.3 kWh-equiv credits"). *Takeaway:* relief/wonder. *Impl:* cage-break reused; add amber→cyan conversion + PhysicalGridLayer remains lit. *Visible:* both layers at once — the key accuracy beat.

**Beat 6 — Energy identity separates from address (1:26–1:36).** *Purpose:* the "follows you" mechanic. *Camera:* follow the **account token** detaching from the meter. *Visual:* a glowing "you" token lifts off the home and stands ready to travel; credits attach to *it*, not the house. *Caption:* "Your energy account follows you — not your meter." *Overlay:* "Account: 5.3 credits available." *Takeaway:* empowerment. *Impl:* the account token (new). *Visible:* token detached, credits bound to it.

**Beat 7 — Mum's flat (1:36–1:50).** *before:* mum's unit dark, bill-stress red. *action:* a **gold** credit token routes Home→citEther→Mum's flat; **fee skim** visible; "settled ✓". *after:* windows warm, bill-stress drops. *Caption:* "Offset Mum's bill from your roof — the grid powers her flat, citEther moves the value." *Overlay event:* "09:20 Mum's flat bill offset **$4.80** (after **$0.40** network fee)." *Takeaway:* love. *Impl:* before/after state on the node + event-log row. *Visible:* dark→warm, ledger row.

**Beat 8 — Tradie job site (1:50–2:02).** *before:* red diesel generator, smoke. *action:* amber/cyan credit settles to the site; **generator switches off**. *after:* tools glow on credits; smoke clears; carbon-avoided chip. *Caption:* "Run the site on home solar — not diesel." *Overlay:* "Diesel avoided **6.2 kWh** · CO₂ −**4.7 kg** · saved **$3.10**." *Takeaway:* pride/clean. *Impl:* reuse diesel-off; add carbon chip + event row. *Visible:* generator off, smoke gone.

**Beat 9 — EV road trip (2:02–2:14).** *before:* EV at coast fast-charger, **red $0.78** counter climbing. *action:* home credits chase the moving EV; settle at the charger; **fee skim**. *after:* net charge cost counter drops toward ~$0. *Caption:* "Charge at the coast — paid by this morning's roof." *Overlay:* "Fast-charge $0.78 → **net $0.06/kWh**." *Takeaway:* freedom. *Impl:* moving EV token + counter tween. *Visible:* price collapsing.

**Beat 10 — Nurse / hospital grid support (2:14–2:30).** *before:* hospital **constrained node**, red stress ring; nurse EV plugged in. *action:* EV **discharges** into the node (cyan); ring **green/blue**; citEther settles earnings back to the nurse's account. *after:* "earned" counter rises. *Caption:* "Her car supports a strained hospital node — and earns while she works." *Overlay:* "18:00 Hospital support earned **$52**." *Takeaway:* civic value + income. *Impl:* stress-ring color tween + earning counter. *Visible:* red→green ring, $ up.

**Beat 11 — Six destinations fan-out (2:30–2:42).** *Purpose:* the optionality. *Camera:* back to Home; **six paths** light **in sequence** (not all at once): Use, Share, Donate (green→food bank freezer on), Sell-business (violet bid), Sell-Pod, Sell-grid (dim, last). *Caption:* "Use it. Share it. Donate it. Sell it. Always better than zero." *Overlay:* six small destination chips ticking "settled ✓". *Takeaway:* control. *Impl:* sequence the existing fan; add donate/business/pod/grid states. *Visible:* six labelled, readable destinations, one at a time.

**Beat 12 — Pod / community battery (2:42–2:52).** *Purpose:* local value. *Camera:* drift over the Pod street. *Visual:* houses link to the community battery; a **local-loop** circular pulse; "same feeder = lower fee" cue. *Caption:* "Share locally first — the value stays in your street, and network fees shrink." *Overlay:* "Local loop: network fee **−60%**." *Takeaway:* community. *Impl:* Pod loop pulse + reduced-fee number. *Visible:* local loop, lower fee.

**Beat 13 — Settlement economics / Sankey (2:52–3:04).** *Purpose:* credibility (the weakest beat in v1 — make it real). *Camera:* rise to a clean top-down. *Visual:* an actual **Sankey/flow**: Solar surplus → citEther → six destinations, with a **visible network-fee band** and **citEther margin** skimmed, and the **net** continuing bright; beside it a small bar: **FiT alternative (tiny grey) vs citEther net (tall)**. *Caption:* "Even after network fees and our margin — it beats a zero feed-in tariff." *Overlay ledger (totals):* Gross $X · Network fee $Y · citEther margin $Z · **Net $N** vs **FiT $0.40**. *Takeaway:* "this is real and fair." *Impl:* a real Sankey (instanced ribbons or drei lines with width ∝ value) + totals from `economics.ts`. *Visible:* the money math, honestly.

**Beat 14 — Living network / end card (3:04–3:15+).** *Purpose:* thesis. *Camera:* slow pull back; the whole network alive, the account token moving between places with credits following. *Visual:* dense, beautiful (the one allowed "everything glows" moment); then settle to an end card. *Caption → end card:* "Your energy is no longer trapped at your address. **citEther — your energy follows you.**" + small "One suburb · 100 homes · 3 months." + "Illustrative figures." *Takeaway:* the line that gets shared. *Impl:* full reveal + hold 4–5s. *Visible:* the whole system, then the logo line.

## M. Overlay / HUD design (must do real explanatory work)

DOM overlay (crisper than 3D text), all hideable with `H`, never captures pointer during playback:
- **Bottom caption strip** — one line per beat (reinforcement).
- **Mode chip** (top) — "Old system" → "citEther settlement" (flips at Beat 5).
- **Left mini-ledger** (persistent from Beat 1): Solar generated · Home used · **Surplus** · Feed-in alternative · **citEther credits** · Destination · **Network fee** · **Net value** — values update from the active `SettlementEvent`.
- **Right "Why this decision?" card** (per use case) — e.g. *Mum:* "Surplus solar credit from Home settles against Mum's unit bill. The grid supplies her electricity; citEther transfers the value." (Tradie / EV / Hospital / Pod / Final lines per the brief.)
- **One metric chip per beat** — the single number that beat is about (count-up).
- **Event log** (bottom-left, accumulating): timestamped settlement events ("09:20 Mum's flat offset $4.80"). This is what makes it feel like a running system.
- **Final impact summary** (Beat 14): day totals + "vs FiT".
Keep it minimal and legible at 1080p; one focal overlay element per beat, never all shouting at once.

## N. Motion design rules

- Camera moves **only when it helps**; each beat has **one focal point**.
- **Flows start only after the problem is shown** (no credits before Beat 5; physical blue grid may breathe earlier).
- **Slow reveals**, easing + anticipation before big transitions (cage break, layer ignite); **hold 1–2s** on key moments so the viewer absorbs.
- **No chaotic simultaneous animation.** Only the finale (Beat 14) may be dense; Beats 0–4 are deliberately simple/educational.
- Every line/particle has **semantic purpose** (per §I). Each destination shows a **before/after**.
- Frame-rate-independent (elapsed-seconds timeline) → deterministic, recording-safe.

## O. Technical architecture

Keep the stack: **Vite · React · TypeScript · React Three Fiber · drei · GSAP timeline · Zustand · DOM overlay · local deterministic scenario · no backend · no keys.** Change: become **data-driven** — the cinematic reads a scenario + economics model and an event director, instead of hardcoding visuals in components.

## P. Component / file structure

```
src/
  scenario/
    types.ts              # Scenario, Household, LocationNode, Asset, SettlementEvent, Destination
    citetherScenario.ts   # the one authored deterministic scenario (numbers live here)
    economics.ts          # pure functions (§K): surplus, gross, fee, margin, net, benefitVsFiT, carbon
    settlementEvents.ts   # build the ordered event timeline from the scenario
  cinematic/
    beats.ts              # §L beats: timing, camera keyframe, focusNodeId, eventIds, caption, overlay cues
    useCinematic.ts       # GSAP master timeline; play/pause/restart/seek; exposes clock + activeBeat
    cameraRig.ts          # camera keyframe tween + lookAt per beat
    eventDirector.ts      # walks settlementEvents by clock → drives 3D + overlay + node before/after
  scene/
    World.tsx             # assembles ground, layers, lights, nodes
    PhysicalGridLayer.tsx # thin always-on blue grid/feeder lines (electricity)
    SettlementLayer.tsx   # citEther network mesh above map: identity, routing, fee layer, settle pulses
    locations/            # Home, MumsFlat, JobSite, EVCoast, Hospital, Pod, Charity, Business, Grid
    assets/               # instanced trees, pylons, streetlights, community battery, tools
  energy/
    EnergyCreditFlow.tsx  # cyan/gold settlement tokens (rise→citEther→settle down)
    PhysicalGridFlow.tsx  # subtle blue physical flow along feeders
    FlowPathManager.tsx   # curve registry + which paths active per beat/event
    CreditToken.tsx       # a single token (colour by destination type, "settled ✓")
  effects/
    MeterCage.tsx  CageBreakEffect.tsx  DieselGenerator.tsx  NodeStressRing.tsx
    BuildingLightUp.tsx  FeeSkimEffect.tsx  AccountToken.tsx
  overlay/
    CaptionStrip.tsx  LedgerPanel.tsx  ExplanationCard.tsx  MetricChip.tsx
    EventLog.tsx  ModeChip.tsx  ImpactSummary.tsx  EndCard.tsx  DevControls.tsx
  state/ useSimStore.ts   # clock, activeBeat, quality, uiHidden, activeEvent
  lib/ colors.ts curves.ts formatters.ts perf.ts
```
**Module duties (key ones):** `economics.ts` = single math source; `settlementEvents.ts` = derive the event timeline; `eventDirector.ts` = the bridge that keeps 3D + overlay + node states in lockstep with the clock; `PhysicalGridLayer` vs `SettlementLayer` = the accuracy split; `AccountToken` = the "follows you" device; `LedgerPanel`/`EventLog`/`ExplanationCard` = the explanation that v1 lacks.

## Q. Implementation roadmap (we already have a Phase-4 build — refactor, don't restart)

**Phase A — Audit current implementation.** *Goal:* map what's reusable (cage, settlement layer, flows, director, autoplay) vs missing (data model, overlays, dual-layer, before/after). *Files:* read-only. *Acceptance:* a short reuse/replace list. *Risk:* low. *Fallback:* n/a.

**Phase B — Data-driven scenario model.** *Goal:* add `scenario/` (types, citetherScenario, economics, settlementEvents); numbers come from here. *Files:* new `scenario/*`. *Acceptance:* `economics.ts` unit-tested; every shown number derives from the scenario; `benefitVsFiT>0` for all cases. *Risk:* low. *Fallback:* author events by hand if derivation is fiddly.

**Phase C — Narrative timeline + overlay system.** *Goal:* rewrite `beats.ts` to §L; build `LedgerPanel`, `ExplanationCard`, `EventLog`, `ModeChip`, `MetricChip`, `ImpactSummary`; `eventDirector` ties them to the clock. *Files:* `cinematic/*`, `overlay/*`. *Acceptance:* with **captions hidden**, the overlays alone explain each beat. *Risk:* med (sync). *Fallback:* fewer overlay elements, but keep ledger + event log.

**Phase D — World readability + node detail.** *Goal:* upgrade nodes to readable landmarks with beat-gated labels (fix the box look + label collisions). *Files:* `scene/locations/*`, `NodeLabel`. *Acceptance:* a cold viewer can name each place on a still frame. *Risk:* med (perf/poly). *Fallback:* icon + label plate above each node if geometry is too costly.

**Phase E — Settlement/economic events.** *Goal:* wire `settlementEvents` → credit-token animations + ledger + event log per use case. *Files:* `energy/*`, `eventDirector`. *Acceptance:* each use-case beat shows a token settle + a matching ledger/event row with consistent numbers. *Risk:* med. *Fallback:* animate value as counters even if token routing is simplified.

**Phase F — Dual-layer physical vs settlement (accuracy).** *Goal:* add `PhysicalGridLayer` + `PhysicalGridFlow` (always-on blue) beneath the cyan settlement tokens; captions anchor the distinction. *Files:* `scene/PhysicalGridLayer.tsx`, `energy/PhysicalGridFlow.tsx`. *Acceptance:* on screen, electricity (blue, ground) and value (cyan, above) are visibly different; the "electrons don't teleport" critique is answered. *Risk:* low–med. *Fallback:* a static blue feeder layer (no flow) still communicates it.

**Phase G — Use-case before/after transformations.** *Goal:* each location has a clear problem→action→improved state (mum dark→warm, diesel on→off, EV price high→net~0, hospital red→green). *Files:* `effects/*`, `scene/locations/*`. *Acceptance:* pausing mid-beat shows an unambiguous before or after. *Risk:* med. *Fallback:* colour/counter state changes if geometry swaps are heavy.

**Phase H — Final cinematic polish + recording mode.** *Goal:* Beat 13 real Sankey, Beat 14 reveal + end card; `H`/`Space`/`R`; timing lock. *Files:* `overlay/*`, `cinematic/*`. *Acceptance:* looks like a finished film; clean recording with UI hidden. *Risk:* med. *Fallback:* simpler Sankey (bars) if ribbon flow is costly.

**Phase I — Performance pass + acceptance.** *Goal:* hold §R on the P620; quality toggle; dispose checks. *Files:* `lib/perf.ts`, quality gating. *Acceptance:* §S all green at ≥40fps (target 60), deterministic, offline. *Risk:* med. *Fallback:* recording-safe quality preset for the actual capture.

## R. Performance budget (Quadro P620 4GB)

1080p, target 60fps / floor 40fps, deterministic, offline. No heavy textures, no large imported assets, no raytracing, no expensive shadows, no physics engine. Clamp DPR 1–1.5. **Instancing** for houses/trees/pylons/tokens. **Particle cap** with quality settings. **Bloom** quality-toggle. DOM text for labels (not 3D text). Low draw calls; low-poly procedural geometry. **Quality modes:** *High* (bloom, more tokens, richer settlement mesh) · *Medium* (fewer tokens, simpler bloom) · *Low/Recording-safe* (few tokens, no heavy post, strong emissive). Verify with `r3f-perf` before recording.

## S. Acceptance criteria

A cold viewer, no narration, understands the concept. Specifically: first 10s establish the problem; meter-trap is visually obvious; **physical-grid vs settlement-credit distinction is clear**; ≥4 hero use cases (mum, tradie, EV coast, nurse) read; six destinations visible; network fees acknowledged visually; weak FiT shown as the old option; final line lands ("your energy account follows you"); world alive but not cluttered; camera smooth/story-driven; overlays readable at 1080p; **with captions hidden the overlays still explain it**; offline + deterministic; ≥40fps on the P620; clean for screen recording.

## T. LinkedIn recording guidance

Prod build (`pnpm build && pnpm preview`), full-screen 1920×1080, browser zoom 100%, dev UI hidden (`H`), Recording-safe quality. Record with **OBS** or Win+G at 1080p60 high bitrate; `R` then `Space`, let ~3:00 play untouched, hold the end card. Add a soft ambient music bed + optional voiceover in post. Strong first 3 seconds. Export a 1:1 / 9:16 crop variant for mobile feeds if wanted.

## U. Risks & simplifications

- **Over-claiming physical transfer** → mitigated by the dual-layer (Phase F) + caption grammar; do this early.
- **Overlay clutter** → one focal overlay element per beat; ledger persistent but quiet.
- **Perf from many tokens/bloom** → instancing + caps + quality modes; sequence flows (not all at once).
- **Numbers feel fake** → one economics model, internally consistent, labelled illustrative.
- **Scope creep** → it's a linear cinematic, not an interactive sim; resist adding interactivity.

## V. What NOT to build

No backend, no live data, no API keys, no user interactivity/clicking during playback, no real maps/geo data, no photoreal/PBR assets, no imported heavy GLB cities, no physics engine, no real-time shadows/raytracing, no multi-scene routing. One scene, one deterministic timeline, one scenario. Keep it a film backed by a small real model.

