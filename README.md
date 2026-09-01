# NULL

A 3D world generated from a real commit history, for **Gaurav Vijay Jadhav**.

Everything you can walk up to is derived from actual GitHub data: 72
repositories and 4,397 commits across ten language districts, arranged in a
ring around a central hub. A structure's height and mass come from its own
commit count. A district's colour is the language's own GitHub colour, not an
invented palette. The people wandering the districts are real collaborators
with real, verifiable commits on the repositories they stand near. Nothing on
screen is placed to look good; it is placed because the record says it
belongs there.

This replaced an earlier version of the site, "The Record" — a scrollable,
citation-first document. The idea underneath both versions is the same: don't
claim more than the evidence supports. The 3D world is that same discipline
applied to a place instead of a page.

## Controls

| Key | Does |
| --- | --- |
| `W A S D` | Move |
| `Shift` | Run |
| `Space` | Jump |
| Drag | Look around |
| `E` | Open whatever structure or marker you're near |
| `I` | Talk to whoever you've walked up to |
| `M` | Open the world map |
| `O` | Open the log (districts / case studies / certifications / repositories found) |
| `Esc` | Back to the title screen |

On a touch device the left half of the screen is a walk stick, the right half
looks around, and a button handles jump; tapping the prompt that appears near
something takes the place of `E`/`I`.

A browser that can't run WebGL (or a screen reader) gets [text-fallback.tsx](src/components/text-fallback.tsx)
instead: the same content — the work, what the world's seven lenses show, the
eight attempts at one idea, what isn't claimed, and contact details — as a
plain document.

## How the world is built

- **Districts** ([src/world/language.ts](src/world/language.ts)) — one per
  language that has real commits behind it, arranged on a ring around the
  hub. Order follows the order the subject actually arrived at each
  ecosystem; radius and spread follow how much real work is in each one.
- **Structures** ([src/world/geometry.ts](src/world/geometry.ts),
  [shapes.ts](src/world/shapes.ts)) — every repository becomes a shape chosen
  by what kind of work it is (an origin shrine, a relic tower, a monolith, an
  ordinary hut, a tree for something that grew slowly, a leaning hut for
  something dormant, a small crate pile for an abandoned fragment), sized
  from its real commit count and lifespan.
- **The core** ([src/world/telemetry.ts](src/world/telemetry.ts):
  `CORE_PLINTH`) — the hub every district rings: a stone plinth you walk (not
  jump) onto, topped by a small gazebo and a floating gem.
- **People** ([src/world/NPC.tsx](src/world/NPC.tsx),
  [src/data/contributors.ts](src/data/contributors.ts)) — real collaborators
  who committed to the same repositories, walking their home district, plus
  Claude and Jules as the two AI tools with a measurable hand in the commit
  history. Walk up to one and they'll name a real repo you both touched.
- **Achievements** ([src/world/Markers.tsx](src/world/Markers.tsx)) — eight
  of the eleven written case studies sit over a real repository and become a
  marker in the world, alongside the two employers; each gets its own shape
  (drawn from the case study's own authored category — Flagship, SaaS,
  Blockchain, Mobile...) and colour (the language of the repository behind
  it), so no two read as the same thing from a distance.

## Structure

```
src/
├── lib/provenance.ts       The evidence model this world's data still honours
├── data/
│   ├── record.ts           Identity, the finding and its evidence
│   ├── ledger.ts           4,397 authored commits, day-offset from EPOCH
│   ├── repo-facts.ts       Per-repository facts: homepage, stars, description
│   ├── contributors.ts     Real collaborators and the two AI tools, by repo
│   ├── projects.ts         The eleven case studies and two employers, in full
│   ├── certifications.ts   The seven certifications
│   └── lineage.ts          Eight attempts at one idea
├── audio/engine.ts          Every sound in the game, synthesised — no audio files
├── world/
│   ├── telemetry.ts        Real commit data → Entity objects (mass, height, position)
│   ├── language.ts         District layout and GitHub's own language colours
│   ├── geometry.ts          Entities → merged per-language building geometry
│   ├── shapes.ts            The primitive vocabulary geometry.ts builds from
│   ├── interactables.ts     Everything you can walk up to and open
│   ├── mapdata.ts           What the full map and minimap draw from
│   ├── discovery.ts         The seven lenses and the discoveries that grant them
│   ├── Player.tsx           Movement, camera, ground/collision physics
│   ├── NPC.tsx              Collaborators, Claude, Jules — wandering and meetups
│   ├── Markers.tsx          Floating markers, achievement identity, collect bursts
│   ├── Scene.tsx            The assembled world: ground, structures, lights, districts
│   ├── GameCanvas.tsx       The R3F canvas, quality tiers, camera setup
│   └── Atmosphere.tsx       Sky, dust, ambient particulate
└── components/
    ├── game.tsx             Game state: title/playing, panels, progress, controls UI
    ├── title-screen.tsx     What plays before you enter the world
    ├── interact-panel.tsx   What opens when you interact with something
    ├── world-map.tsx        The full, pannable/zoomable map
    ├── minimap.tsx          The corner map, drawn to canvas every frame
    ├── compass.tsx          The heading strip across the top of the screen
    ├── objectives.tsx       The log: four categories, found/total, a bar each
    ├── achievement-banner.tsx  The toast when a category closes out
    ├── joystick.tsx         Touch movement/look/jump
    └── text-fallback.tsx    The no-WebGL / screen-reader document
```

## Editing the content

All copy and data live in `src/data`. Nothing factual is hard-coded into a
world or UI component, so the record can be updated without touching either.

When adding a claim to `src/data/record.ts` or `lineage.ts`, choose its
evidence class honestly (from [src/lib/provenance.ts](src/lib/provenance.ts)):

| Class | Meaning |
| --- | --- |
| `attested` | Traceable to a public commit, file, DOI or page. Attach `sources`. |
| `read` | A pattern read across the record. Argued, not proven. |
| `unclaimed` | The record does not support it, so it is not asserted. Say why in `note`. |

Refreshing the chronology means re-running the GitHub commit search for
`user:jadhavgaurav author:jadhavgaurav` (and, for the digibranders
repositories, the org's own commit history), converting each commit date to
a day offset from `EPOCH`, and updating `src/data/ledger.ts` — `telemetry.ts`
derives every structure, district population and mass from that data alone.

## Design notes

**Two typefaces.** Newsreader for display and reading text; JetBrains Mono
restricted to data — paths, counts, dates, commit numbers — so it never
becomes decoration.

**Real colour, not invented colour.** Every district's hue is the language's
own GitHub colour — Python's blue, TypeScript's blue-grey, the Notebook
orange — because anyone who has looked at a repository page has already
learned them. A structure's material family (foundation, constructed,
active, organic, ruined) follows real state: how it was built, whether it's
still touched, whether it grew slowly or was built in a burst.

**Toon-shaded, warm, legible from a distance.** Four-step toon shading with a
fresnel rim light, tuned so a district reads by flat colour and a bright edge
rather than by heavy ambient occlusion pulling a moody scene together.

**No slope you can't see.** The one deliberate exception to a flat world is
the core's own plinth — a real two-unit rise the player physically climbs by
walking into its tapered stone, matched exactly between the render geometry
and the ground-height function in [Player.tsx](src/world/Player.tsx) so the
two never drift apart.

**Accessibility.** Semantic landmarks, a keyboard-operable interface with
every panel closeable by the key that opened it (or `Esc`), visible focus,
AA contrast, and a text-and-screen-reader path
([text-fallback.tsx](src/components/text-fallback.tsx)) that carries the same
content as the 3D world rather than a reduced summary of it.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

No environment variables are required.
