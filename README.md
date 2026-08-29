# STRATA

A core sample drilled through the public GitHub record of **Gaurav Vijay Jadhav** —
46 non-fork repositories deposited between May 2023 and August 2026, stood on end
and read as a geological section.

**Depth is time.** The surface is today. Scrolling down descends into the past.
Each band is one repository; its thickness is the repository's size; the gaps are
months where nothing was pushed. The eleven-month silence of 2024 is a barren
interval you physically travel through.

Full research, art direction and rationale: [`docs/RESEARCH.md`](docs/RESEARCH.md).

---

## The three readings

The same dataset, three ways.

| | |
|---|---|
| **Section** | Travel the column. The margin annotates whichever layer the reading head is inside. `↑` `↓` step between layers, `Enter` opens one. |
| **Veins** (`V`) | The rock goes translucent and the recurring ideas appear as intrusions cutting across formations. Isolate one and the column keeps only its layers — eleven assistants stacked, 2023 to 2026, with nothing in between. |
| **Field log** (`L`) | The complete written record: every layer, date, language, size and note. Server-rendered on every request. |

`Esc` surfaces. The depth gauge on the right margin is simultaneously the
scrollbar, the map, the chapter index and the formation legend; every band in it
is a real button with an accessible name.

## Content honesty

Every mechanical figure in `src/data/strata.ts` — created, pushed, language,
size, stars, forks, description — is transcribed from the GitHub API on
2026-08-29 and is neither rounded nor embellished. There are no invented metrics,
no fabricated impact percentages and no claimed traction. The highest star count
on any repository in the record is two, and the site says so.

Written `note` and `specimen` fields are readings drawn from the repositories'
own READMEs and from the chronology. A specimen's `friction` field is populated
only where the repository provides *evidence* of a difficulty — a committed
workaround, a guard, a README caveat — and it cites the artifact it was read from.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

## Architecture

```
src/
├─ data/strata.ts               the record: 46 layers, 6 formations, 7 veins
├─ lib/core.ts                  geometry — depth, thickness, barren intervals
└─ components/strata/
   ├─ field-record.tsx          server-rendered; the whole site without JS
   ├─ world.tsx                 state, the frame loop, keys
   ├─ column-scene.ts           three.js: one instanced mesh, three lights
   ├─ svg-column.tsx            the measured section drawing
   ├─ depth-gauge.tsx           scrollbar / map / index / legend
   ├─ marginalia.tsx            the field note for the current layer
   ├─ specimen.tsx              the cut face
   └─ use-travel.ts             damped descent
```

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind for layout only —
all design tokens are CSS custom properties · **three.js r169 used directly.**

No React Three Fiber, no drei, no GSAP, no smooth-scroll library. There is one
static mesh and one camera, so a reconciler would buy nothing and cost the render
loop this needs to control. Damped travel is about thirty lines. Total new runtime
dependency: **one package.**

**Type:** Newsreader (narration; italic carries all annotation) and IBM Plex Mono
(the entire instrument layer). Two families, two roles, no exceptions.

## Performance

- The canvas renders **on demand** — measured at **0 draw calls over 2s idle**,
  ~33 while travelling.
- One `InstancedMesh` for all 46 bands. No textures, no environment map, no
  shadow maps, no post-processing.
- DPR capped at 1.75, dropping to 1.0 automatically after two frames over 24 ms.
- three.js is dynamically imported and never blocks first paint.
  Measured FCP ~210 ms; the record is real HTML before any of it arrives.

## Accessibility

- **The no-JavaScript page is the complete archive**, not a stub — the same
  markup serves as the Field Log. There is no second, thinner version of the
  content anywhere.
- No WebGL, low memory (`deviceMemory < 4`), or viewport under 860px → the SVG
  section drawing, which is a first-class design rather than a degradation.
- Every layer is keyboard reachable through the gauge; the specimen view traps
  and restores focus.
- `prefers-reduced-motion` turns damping off and cuts instead of travelling.

## Sound

None. Chosen deliberately, not omitted.

---

### Notes for the owner

- The previous site's components and data (`hero-section`, `projects-section`,
  `capabilities`, `certifications`, …) were removed — they carried the old visual
  language and nothing references them. They remain in git history.
- The **OyeChats support widget was removed** from the root layout. A floating
  chat bubble is incompatible with the art direction. Restoring it is a one-line
  change in `src/app/layout.tsx` if you want it back.
- `/api/send` and the email templates are untouched and still functional, but the
  world contacts by `mailto:` and nothing currently posts to the endpoint.
