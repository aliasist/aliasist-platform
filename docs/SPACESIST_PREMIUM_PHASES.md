# SpaceSist premium roadmap

This document covers the **post-foundation product phases** for **SpaceSist** after the current `/space` feed + RAG branch. It is meant to sit beside **`SPACESIST_RAG_PLAN.md`**:

- **`SPACESIST_RAG_PLAN.md`** = current branch integration, hardening, and immediate polish
- **`SPACESIST_PREMIUM_PHASES.md`** = the long-form flagship roadmap for a deeper, more premium SpaceSist

The product goal is:

> **SpaceSist = live space intelligence + telescope/archive explorer + grounded explainer**

That is a stronger identity than a generic NASA feed reader. The emphasis is on:

1. **Interesting live data**
2. **Research-grade exploration**
3. **Educational explanations grounded in visible sources**

---

## Product pillars

### 1. Live intelligence

Users should be able to open SpaceSist and immediately see signals that are current, consequential, and interpretable:

- ISS / crew / launch activity
- space weather
- close approaches and planetary-defense context
- target visibility and ephemerides

### 2. Telescope and archive exploration

Users should be able to move from “what is happening?” to “show me the real observation data”:

- JWST / Hubble archive search
- instrument and filter exploration
- object-centered pages
- observation cards with enough metadata to teach as well as impress

### 3. Grounded knowledge layer

Users should be able to ask a question and get an answer that is:

- source-grounded
- aware of uncertainty
- clear about whether the fact is historical, stable, or needs live verification

---

## Current baseline

Current branch work already provides:

- `/space/apod`
- `/space/iss`
- `/space/people`
- `/space/launches/next`
- `POST /space/ask`
- local curated corpus via `@aliasist/rag`
- frontend answer UX and chunk/source display

This roadmap assumes that baseline remains the foundation.

---

## Phase 6 — Space weather intelligence

**Goal:** Add a genuinely live operational lane that broadens SpaceSist beyond launch + ISS monitoring.

**Primary source**

- NASA CCMC DONKI

**Worker routes**

- `GET /space/weather/summary`
- `GET /space/weather/events`
- `GET /space/weather/events/:id`

**Frontend surfaces**

- `Space weather now` summary card
- timeline of solar flares / CMEs / geomagnetic storms
- event drill-in panel with linked cause/effect relationships
- educational impact notes: satellites, radio, GPS, aurora, crew operations

**Why this phase matters**

- Adds live depth immediately
- Makes SpaceSist feel more like a real intelligence surface
- Supports richer “ask” answers about current solar activity later

**Exit criteria**

- [ ] Worker returns normalized DONKI summary + event list
- [ ] UI distinguishes active vs recent events clearly
- [ ] Feed failures degrade gracefully without breaking the page
- [ ] At least one route test covers normalization and fallback behavior

---

## Phase 7 — Object lookup and ephemeris

**Goal:** Let users search for real space targets and see where they are, how they move, and when they are visible.

**Primary source**

- JPL Horizons API

**Worker routes**

- `GET /space/targets/lookup?q=`
- `GET /space/targets/:id/summary`
- `GET /space/targets/:id/ephemeris`

**Frontend surfaces**

- target search bar on the main page or a new `/space/targets` route
- object detail card with aliases, type, and mission relevance
- observer-centric ephemeris panel: altitude, azimuth, rise/set, distance, phase, motion
- “good for observing now / later / not visible” status

**Why this phase matters**

- Turns SpaceSist from dashboard into tool
- Creates a foundation for telescope, archive, and visibility workflows
- Gives the RAG system a stable object vocabulary to anchor on

**Exit criteria**

- [ ] Name lookup resolves common targets and ambiguous names safely
- [ ] Ephemeris view works for at least planets, Moon, and one small-body case
- [ ] UI uses explicit observer assumptions (location, timezone, time range)
- [ ] Route tests cover both unique and ambiguous target lookup

---

## Phase 8 — Telescope archive and visuals explorer

**Goal:** Make SpaceSist feel premium by letting users explore real telescope observations and visual previews, not just summaries.

**Primary source**

- [MAST API Access](https://jwst-docs.stsci.edu/accessing-jwst-data/mast-api-access) for archive discovery and retrieval
- [TESScut](https://mast.stsci.edu/tesscut/docs/) for TESS cutouts, including moving targets
- [HAPcut](https://mast.stsci.edu/hapcut/) for Hubble Advanced Products cutouts
- [AstroView](https://outerspace.stsci.edu/spaces/MASTDOCS/pages/94962998/AstroView) for observation-footprint visualization

**Worker routes**

- `GET /space/observations/search`
- `GET /space/observations/:id`
- `GET /space/observations/object/:target`
- `GET /space/observations/:id/cutout`
- `GET /space/observations/:id/footprints`
- `GET /space/observations/object/:target/preview`

**Frontend surfaces**

- telescope/archive search page
- filters for target, mission, instrument, filter, date, public/private/public-release metadata
- observation cards with thumbnail, program, instrument, wavelength context, and archive links
- quick-look image tiles from cutout services
- footprint/sky overlay view for archive planning
- object page section: `Related observations`
- pop-out image window for full-resolution preview or cutout inspection

**Why this phase matters**

- This is the clearest “premium” jump in the whole roadmap
- Users can discover and inspect real JWST/Hubble data
- The product gains research and educational value simultaneously

**Implementation notes**

- Start with metadata search and archive links before attempting custom image pipelines
- Prefer fast search + curated preview cards over trying to ingest huge product trees immediately
- Treat image and footprint endpoints as small, composable visual helpers rather than a monolithic telescope viewer
- Use archive search for discovery, then cutout services for the preview/visual layer

**Exit criteria**

- [ ] Search works for target-based observation discovery
- [ ] At least one telescope mission is supported end-to-end
- [ ] At least one cutout or thumbnail path renders a real image
- [ ] A footprint or sky-overlay view shows observation coverage
- [ ] Observation cards are readable on mobile and desktop
- [ ] Route tests cover empty results, large result sets, and normalization

---

## Phase 9 — Near-Earth object and close-approach watch

**Goal:** Add a planetary-defense / sky-events lane that is highly explorable and habit-forming.

**Primary source**

- JPL SBDB Close-Approach Data API

**Worker routes**

- `GET /space/neo/approaches`
- `GET /space/neo/highlights`
- `GET /space/neo/:id`

**Frontend surfaces**

- ranked list of upcoming close approaches
- filters by date window, object type, distance, size, relative speed
- detail page for a selected object
- educational framing around uncertainty, scale, and “not a hazard” vs “worth watching”

**Why this phase matters**

- Engaging without being gimmicky
- Strong recurring-use potential
- Good complement to the archive and ephemeris layers

**Exit criteria**

- [ ] Top-level board loads upcoming approach data reliably
- [ ] Users can inspect at least one object in detail
- [ ] Units and uncertainty are explained clearly
- [ ] Route tests cover distance/unit normalization

---

## Phase 10 — Premium knowledge layer

**Goal:** Upgrade `Ask SpaceSist` from a good RAG demo to a robust flagship explainer.

**Backend work**

- split corpus into domain packs:
  - programs
  - missions
  - vehicles
  - telescopes
  - space weather
  - target/object vocabulary
- blend relevant live route data into answer context when the question asks about unstable/current facts
- introduce explicit “live verification needed” behavior
- add corpus versioning and ingest notes

**Frontend work**

- tabs or sections for:
  - `Answer`
  - `Sources`
  - `Related missions / objects`
- better follow-up prompts
- answer provenance and confidence framing
- “retrieval only” vs “generated with context” presentation kept explicit

**Why this phase matters**

- This is where the flagship becomes unusually useful instead of merely attractive
- It lets SpaceSist teach while remaining trustworthy

**Exit criteria**

- [ ] RAG answers clearly separate stable history from current/live facts
- [ ] Source display remains comprehensible even when retrieval depth increases
- [ ] At least one live-data-backed answer path exists
- [ ] Product copy explicitly explains uncertainty and verification boundaries

---

## Phase 11 — Observing and discovery tools

**Goal:** Make SpaceSist rewarding to explore even when the user does not arrive with a specific query.

**Potential surfaces**

- `What’s visible tonight`
- target visibility planner
- comparison pages:
  - `Hubble vs Webb`
  - `Mercury vs Gemini vs Apollo`
  - `SLS vs Orion vs Gateway`
- interactive mission timelines

**Why this phase matters**

- Builds habitual exploration
- Gives the product a premium editorial and educational layer
- Reuses the data foundations built in phases 7–10

**Exit criteria**

- [ ] At least one planner/discovery surface works end-to-end
- [ ] Comparison pages are grounded in real corpus/data, not decorative copy alone
- [ ] Mobile browsing remains strong for exploratory sessions

---

## Phase 12 — Earth-from-space expansion *(optional)*

**Goal:** Add an Earth-observation lane if we intentionally want SpaceSist to cover orbital views of Earth.

**Primary sources**

- NASA GIBS
- NASA EONET

**Possible surfaces**

- Earth imagery time slider
- natural event overlays
- “Earth from orbit” gallery with fires, storms, dust, volcanoes, sea ice

**Why this phase is optional**

- Strong data, but there is product overlap with EcoSist
- Should only happen if we deliberately want SpaceSist to include observational Earth context from orbit

**Exit criteria**

- [ ] Product boundary with EcoSist is documented
- [ ] At least one GIBS/EONET surface feels native to SpaceSist rather than bolted on

---

## Recommended order

The preferred build sequence is:

1. **Phase 6** — space weather intelligence
2. **Phase 7** — object lookup and ephemeris
3. **Phase 8** — telescope archive explorer
4. **Phase 9** — NEO / close-approach watch
5. **Phase 10** — premium knowledge layer
6. **Phase 11** — observing and discovery tools
7. **Phase 12** — Earth-from-space expansion if desired

This order is intentional:

- Phase 6 adds live depth now
- Phase 7 creates a durable target model
- Phase 8 delivers the largest premium jump
- Phase 9 adds engaging repeat-use exploration
- Phase 10 makes the explainer truly flagship-grade
- Phase 11 turns all of that into a compelling product surface

---

## Architectural implications

As SpaceSist grows, keep these constraints in mind:

1. **Normalize in the worker, not the browser.**
   Frontend code should consume stable shapes from `@aliasist/api-client`, not raw upstream APIs.

2. **Keep unstable facts labeled.**
   Launch schedules, crew assignments, active events, and observing windows must be presented as current-state data, not timeless truth.

3. **Prefer premium coherence over feed sprawl.**
   Every new source should strengthen the identity: live intelligence, telescope/archive exploration, or grounded explanation.

4. **Do not let RAG become a dumping ground.**
   Curate corpora by domain and purpose. Retrieval quality matters more than raw corpus size.

5. **Treat visual polish as product truthfulness, not decoration.**
   Live, fallback, curated, and illustrative states should always be legible.

---

## Relationship to current work

The current branch should still finish the immediate checklist in **`SPACESIST_RAG_PLAN.md`** first. This roadmap starts **after** that branch is stable enough to merge and deploy safely.
