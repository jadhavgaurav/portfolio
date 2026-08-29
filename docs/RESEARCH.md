# STRATA — Research & Direction
### A world built from the GitHub record of Gaurav Vijay Jadhav

*All factual claims below are drawn from the public GitHub API (46 non-fork public
repositories, `jadhavgaurav`, account created 2023-05-24) and from repository READMEs.
Items that could not be verified are marked **[unverified]** and are not used in
site copy.*

---

## 1. GitHub identity — what the record actually shows

**Verified surface.** 46 non-fork public repositories spanning 2023-05-26 → 2026-08-29.
Profile reports 68 public repos total; the remaining ~22 are forks or empty, and are
excluded. 6 followers. Highest star count on any repository: **2** (`PROJECT-VICTUS`).
One repository has a fork (`E-Voting-using-Blockchain-and-Face-Recognition`, 1).

This matters for the design: **this is not a popularity story.** There is no
open-source traction to display, and inventing significance would be a lie. What the
record *does* contain, in unusual quantity, is **evidence of a person practising in
public over 39 months.** The design must be built on volume-over-time and repetition,
not on stars.

**Language distribution by repo count:** Python (13), TypeScript (9),
Jupyter Notebook (8), JavaScript (4), Java (4), PHP, Dart, and 4 empty.

**Size outliers** (a real signal of what was actually being wrestled with):
`YOLO_practice` 756 MB, `Kidney_disease_classification_cnn` 113 MB,
`victus-backend` 59 MB, `Jarvis-AI-Personal_Assistant` 48 MB,
`E-Voting…` 44 MB, `CodeB_Internship_Project` 26 MB.

---

## 2. Map of the work — six formations

Ordered by deposition. These are not "categories of project"; they are **periods with
different rock in them**, and the boundaries are visible in the creation dates.

### I. BASEMENT — 2023-05 → 2024-01 (9 repos)
Coursework. `twitter-blockchain-web3` (React + Solidity), `Algorithm-Visualizer`,
`android-music-player` (Java), `Bricks-Breaker`, `Tic-Tac-Toe`, `Elevator-Project-java`,
`Alpha-Practice`, `Box-Office`. Two of these READMEs credit the same two classmates
by name — Aakash Desale and Nitesh Sawardekar — and label the work
"sem V / sem VI Mini Project-2A". This is honest student rock: assigned, collaborative,
imitative.

**The one anomaly:** on **2023-07-24** a 4 KB Python repository called `Jarvis` —
*"Jarvis. An AI voice Assistant"* — is created. It is still receiving pushes in
**June 2025**, two years later. Nothing else from this period survives that long.

### II. UNCONFORMITY — 2024-02 → 2024-09 (4 repos)
An eleven-month near-gap. `ExcelR-practice` (empty, February),
`E-Voting-using-Blockchain-and-Face-Recognition` (May, the final-year project — PHP +
Ethereum smart contracts + a Flask face-recognition microservice),
`Cricket-WorldCup-Analysis` (August, the first Jupyter notebook in the account),
`assistant` (September).

In geology an unconformity is a gap in the record — erosion, or no deposition.
Here it is a **pivot**: the account goes quiet as a computer-engineering student and
comes back as something else. The IT Vedant Data Science programme runs
Jul 2024 – Aug 2025 across this boundary. The rock above it does not resemble the
rock below it.

### III. LAMINATE — 2024-12 → 2025-03 (7 repos in eleven weeks)
The densest band in the column, and the most repetitive:
`Insurance-premium-prediction-using-MachineLearning` (Jan 3),
`cement-composite-strength-prediction` (Jan 18),
`Bank_Telemarketing_predictionModel` (Feb 2),
`concrete-compressive-strength-prediction` (Mar 6),
plus `machine-learning-project-template` (Dec 21) and `github_actions` (Mar 8).

Four near-identical supervised-learning problems solved back to back, plus the
scaffold and the CI repo that grew out of them. This is
**deliberate practice** — the same shape run against different data until the shape is
automatic. The tell is `machine-learning-project-template`: partway through the run
he stopped and abstracted the pattern into a reusable scaffold. That is an engineer's
reflex, not a student's.

Two of the five are **materials-science** datasets (electrically conductive cementitious
composites; concrete compressive strength). Specific, unglamorous, and not the sort of
thing anyone picks to impress.

### IV. APERTURE — 2025-03 → 2025-06 (5 repos)
The work learns to see. `brainTumorDetection`, `Kidney_disease_classification_cnn`
(VGG16 transfer learning, DVC + MLflow + DagsHub, Dockerised, deployed to AWS EC2
behind Gunicorn and Nginx), `YOLO_practice` (756 MB), `CodeB_Internship_Project`
(phishing detection, 11,430 × 89 rows, 28 features selected via correlation/ANOVA/RFE/
RF-importance/VIF, explained with LIME and SHAP, shipped to Streamlit Cloud),
`my-portfolio`.

This is where MLOps appears for the first time and never leaves.

### V. THE VEIN — 2025-06 → 2025-10 (8 repos in the formation; 11 in the lineage)
The assistant, rebuilt. In sequence:
`JarvisAI-pro` (Jun 10) → `Jarvis-AI-Personal_Assistant` (Jun 18) →
`victus-AI` (Jul 9) → `smart-email-assistant-newel` (Jul 10) →
`Victus-AI-Assistant` (Jul 15) → `PROJECT-VICTUS` (Aug 22) →
`seo-ai-agent` (Sep 10) → `victus-backend` + `victus-frontend` (Jan 4, 2026).

Counting the 2023 `Jarvis` and the 2024 `assistant`, that is **eleven repositories
attacking one idea across 31 months.** The substrate changes every time:
Vosk + Porcupine + local LLaMA 3 Q4 via Ollama + ChromaDB → Faster-Whisper + Piper TTS
+ GPT-4o + LangChain AgentExecutor + FAISS → finally a clean backend/frontend split
with Vega-Lite and Mermaid rendering in the client.

He does not refactor. He **re-excavates.**

### VI. OVERBURDEN — 2025-11 → 2026-08 (10 repos)
Recent, loose, uncompacted. Work done for other people and for money:
`i-draft` (built out from a Figma file), `fynix-digital`, `portfolio`,
`multimodal-search-platform` (CLIP ViT-B/32 + ChromaDB + FastAPI + React, Dockerised
with non-root containers), `inneed`, `finance-dashboard` (Flutter),
`jayendra-resume`, `shaharnama-news24`, `github-mirror`, `Null`,
`shree-ganesh-billing` ("GST and non-GST bills, part payments, outstanding" — a real
billing system for a real business, pushed three days ago).

---

## 3. Veins — ideas that cut across formations

Formations are *when*. Veins are *what keeps coming back*, and they are the more
interesting axis because they connect layers that are years apart.

| Vein | Layers | What it is |
|---|---|---|
| **ASSISTANT** | 11 | One idea, rebuilt from scratch eleven times, 2023-07 → 2026-02 |
| **RETRIEVAL** | 5 | FAISS / ChromaDB / CLIP — "find the nearest thing", built three ways for documents, faces, and images |
| **SIGHT** | 6 | Pixels in: face recognition, CT scans, tumours, YOLO, CLIP |
| **PREDICTION** | 7 | Tabular supervised learning, the 2025 Q1 drill run |
| **SHIPPING** | 8 | Every model ends in an interface — Streamlit, Flask, Dear PyGui, React. Nothing is left as a notebook |
| **COMMISSION** | 9 | Work with a client or an institution attached to it |

**RETRIEVAL is the most revealing vein.** He has independently built nearest-neighbour
search three times in three unrelated domains without ever framing it as one problem.
The site surfaces that connection because he apparently hasn't.

---

## 4. Narrative interpretation

Five things the record supports and a résumé would not say:

1. **He rebuilds rather than refactors.** Eleven assistants, two portfolios, two
   `victus` splits, four `Jarvis`-named repos. When something is wrong he starts the
   hole again rather than patching the walls.
2. **He will not leave a model in a notebook.** Eight of the ML repos end in a
   deployed interface. `Kidney_disease_classification_cnn` goes all the way to EC2
   behind Nginx. The compulsion is to make the thing *operable*.
3. **He productionises early and slightly excessively.** Docker, Poetry, DVC, MLflow,
   non-root containers — on personal projects with zero users.
4. **He works in bursts against long silences.** Ten weeks with seven repositories,
   then months of nothing. The 2024 unconformity is eleven months wide.
5. **He picks unglamorous data.** Cement conductivity. Concrete strength.
   Bank telemarketing. Nobody chooses these to look good.

The arc, stated plainly: **a computer-engineering student who kept restarting the same
voice assistant until he had to learn everything underneath it to finish it** —
statistics, then computer vision, then retrieval, then deployment, then a frontend —
and who is now being paid to build systems for other people while the assistant is
still, eleven repositories in, not finished.

That last clause is the emotional centre of the site. It should not be hidden.

---

## 5. Reference research — 18 sites studied

Studied for **principles only**. Nothing below is cloned.

**Archive & catalogue logic**
1. *Chems.Studio archive* (Codrops, 2026-08) — designed an **archive, not a portfolio**:
   every project carries equal weight, visitors wander and build their own reading.
   Monospace throughout for "catalogue, production notes, archival reference" texture.
   → **Adopted:** the equal-weight principle and the mono instrument layer.
   → **Rejected:** its film-led full-bleed video; there is no footage here.
2. *MERSI* (Codrops, 2026-07) — print-to-digital translation; margins and rules as
   structure. → **Adopted:** notebook rules, marginalia, a real baseline grid.
3. *Pell Mell* (Codrops, 2026-03) — a display face carries identity so no graphic
   ornament is needed. → **Adopted:** typography as the decoration; zero decorative shapes.
4. *Digital Stamp Collection* (Codrops, 2026-06) — specimens you pick up and inspect
   under a shader loupe; typewriter reveal. → **Adopted:** the inspect-an-object model.
   → **Rejected:** the playful drag-scatter; wrong register for this work.
5. *Niccolò Miranda, "Paper Portfolio"* (SOTD/SOTM) — a single committed material
   metaphor (newsprint) carried into every interaction including the menu.
   → **Adopted:** commit the metaphor to the *navigation*, not just the skin.

**Spatial & world-building**
6. *Awwwards "3D Spatial Portfolio"* — 3D as the index rather than as decoration.
7. *Iventions* (CSSDA WOTM / Awwwards SOTD) — each project lit like a spotlit
   installation; GSAP paces the reveal. → **Adopted:** one light, hard shadow, restraint.
   → **Rejected:** the dark gallery void — too close to the generic dark portfolio.
8. *Obys Agency* — a "shape-shifting vessel" that changes state as you move.
   → **Adopted:** one object, multiple readings. → **Rejected:** its kinetic maximalism.
9. *Valentin Gassend* — a dedicated "Lab" for unfinished front-end R&D.
   → **Adopted:** unfinished work is shown as unfinished, not padded into case studies.
10. *Samsy* — computational form as the content itself.
11. *Bruno Simon "Car Portfolio"* — the canonical spatial portfolio.
    → **Rejected wholesale:** playful game-world is exactly the "3D portfolio template"
    read the brief forbids. Studied as a boundary, not a model.
12. *Awwwards "Best of Navigation" collection* — reviewed 6 entries. Consistent
    finding: memorable navigation is **one mechanism used everywhere**, never a
    novelty bolted onto a normal menu.

**Editorial, texture, restraint**
13. *eloyb.design* — 14. *0110 Studio* — 15. *Eraf* (kinetic type, grain, monochrome
shifting per section) — 16. *Grit Pictures* (torn/collage monochrome).
→ **Adopted:** grain as a *material* (SVG turbulence, not a gradient); palette that
shifts by section but stays within one family.
→ **Rejected:** collage/scrapbook energy — it would misrepresent a methodical person.
17. *Muz.li Top-100 2026 survey* — scanned for what is now cliché. Confirmed
tired: glass cards, aurora gradients, floating 3D blobs, cursor blobs, marquee tech
logos, "scroll to explore" arrows. All excluded by name.
18. *Awwwards Experimental category, Aug 2026 SOTDs* — confirmed the current
high-water mark is **restraint plus one strong idea**, not effect density.

**The seven questions, answered across the set:** the memorable sites all
(1) commit to a single material, (2) make navigation *be* the metaphor rather than
decorate it, (3) reveal information by physical action rather than by fade-in,
(4) use one light and one gesture, and (5) are legible with the WebGL turned off.
The forgettable ones animate everything and mean nothing.

---

## 6. Five candidate directions

| # | Direction | Metaphor | Why it could work | Why it fails |
|---|---|---|---|---|
| A | **THE CORE SAMPLE** | A drilled stratigraphic column; depth = time; veins = recurring ideas | Encodes sequence, density, gaps *and* recurrence simultaneously. The 2024 unconformity, the Q1-2025 laminate and the assistant vein are all literally true geological features of this dataset | Risks reading as an infographic if the object isn't beautiful |
| B | **THE WORKSHOP BENCH** | Top-down table of artifacts and offcuts | Tactile, warm, good for "unfinished work" | Spatially arbitrary — nothing in the data says *bench*. Position becomes decoration |
| C | **THE INSTRUMENT** | The site as a device you operate; work loaded onto a specimen stage | Fits the measurement-heavy ML work | Slides straight into the banned "fake system diagnostics / fake terminal" register |
| D | **THE HERBARIUM** | Pressed, labelled specimen sheets in a flat file | Beautiful; perfect museum-catalogue typography | Static. Cannot express time, recurrence, or the gap. Flattens 46 unequal things into 46 equal cards |
| E | **THE MACHINE** | An apparatus that keeps rebuilding the same object | Captures his single truest trait — the rebuild loop | Captures *only* that. No room for the Q1 prediction run or the client work |

## 7. Selected direction — **A: THE CORE SAMPLE**

**Why A, specifically for this person.** Every other direction is a costume. A is a
*description*. The GitHub record is literally sediment: 46 discrete deposits laid down
in strict chronological order, with variable thickness (repo size), variable composition
(language), one visible unconformity, one abnormally dense laminated band, and a mineral
intrusion running the full height of the column. Drilling a core and reading the section
is exactly the operation this dataset supports — and it is the only one of the five in
which **the 2024 silence becomes content instead of an omission.**

It also earns its 3D honestly. You cannot show a vein cutting non-adjacently through
strata in a list, a grid, or a timeline. The whole point of the object is that it has an
inside, and that the same column can be read two ways — down through time, or across
through idea. That requires a solid you can rotate, section, and make transparent.

And it inverts the scroll. You enter at the surface, at today, and **descend into the
past.** Going deeper is going older. That single decision replaces the entire
conventional hero-to-contact sequence with a physical act.

---

## 8. Visual design system

**Ground.** Paper, not void. `#E7E2D6` limestone at the surface warming to `#DED7C7`
at depth. A dark object on a pale page — the opposite of every dark developer portfolio,
and the reason the column reads as a photographed *thing* rather than a glowing effect.

**Ink.** `#16150F` graphite for all primary text. `#4A4638` for secondary.
`#8A8371` for the instrument layer.

**Mineral pigments** — one per formation, sampled from real rock, none saturated
above ~55%:

| Formation | Pigment | Hex |
|---|---|---|
| Basement | Slate | `#5A6470` |
| Unconformity | Bone | `#B9AF97` |
| Laminate | Ochre | `#A67C3D` |
| Aperture | Iron oxide | `#8C4A32` |
| The Vein | Malachite (desaturated) | `#4E6B57` |
| Overburden | Umber | `#7A6A54` |

No colour appears at full opacity in a large field. No gradients except the single
depth-warming of the ground. **No neon, no glow, no bloom, no emissive materials.**

**Typography.**
- **Newsreader** (variable serif) — narration, field observations, specimen prose.
  Italic carries all annotation, as in a real field notebook.
- **IBM Plex Mono** — the entire instrument layer: depths, dates, coordinates, labels,
  languages, byte counts. Uppercase, `0.08em` tracking, never above 12px.
  *(Deliberately not JetBrains Mono or Space Grotesk — both are on the old site.)*
- Scale is a 1.26 ratio on a 4px base. Two families, two roles, no exceptions.

**Texture.** SVG `feTurbulence` paper grain at 3.5% opacity, composited once and
reused — not a per-element gradient. Horizontal rules at the notebook baseline.
Everything else is empty paper.

**Object language.** Corners are sharp. There are no cards, no panels, no borders used
as decoration — rules exist only where a real notebook would rule a line. Elevation is
expressed by shadow from the single light, never by a border.

## 9. Interaction principles

1. **One gesture.** Vertical travel is the only navigation. Scroll, drag the gauge,
   arrow keys — all the same axis.
2. **Down is backwards.** Descending the page descends into the past. This is stated
   once, at the surface, and then never explained again.
3. **Proximity reveals.** A layer's annotation appears when the reading head reaches it
   and *holds* until the head leaves. Nothing fades on and off repeatedly.
4. **The column has an inside.** Switching to vein reading makes the rock translucent.
   Same object, different question.
5. **Depth is always legible.** The gauge shows metres-of-record and the date at all
   times. You can never be lost.
6. **Silence is content.** The 2024 unconformity is an empty stretch you must travel
   through. It is not skipped, compressed, or apologised for.

## 10. 3D / environment concept

A single vertical core column, ~46 stacked bands, rendered in one instanced mesh.
One key light from the upper left, one bounce fill, a real contact shadow on the paper.
Matte, slightly rough, faintly dusty surface — sandstone, not chrome.

**Why 3D is required here** — and it must survive the question:
- The column's **thickness** encodes repo size; you must see the silhouette to read it.
- **Veins** run vertically *inside* the solid, linking non-adjacent layers. Translucency
  is the only way to show that.
- Opening a specimen **cuts the column** and rotates the cut face toward the reader —
  a physical act, not a modal.
- Depth-of-field and scale communicate *how much record there is*, instantly.

There is exactly one object in the scene. No particles. No environment map. No
post-processing beyond a subtle vignette baked into the paper.

## 11–13. World architecture

Three readings of one dataset, plus the specimen view.

- **SECTION** *(default)* — travel down the column. Marginalia annotates each layer as
  the reading head passes.
- **VEINS** — the rock goes translucent; the six veins appear as intrusions. Selecting
  one collapses the column to only its layers — eleven assistants stacked with nothing
  between them.
- **FIELD LOG** — the complete flat text record. Every layer, date, language, size and
  note, keyboard-navigable, no WebGL. This is both the accessibility floor and a
  legitimate part of the world.
- **SPECIMEN** — the cut face. Catalogue-entry prose: what it is, what was actually
  built, what was hard, what it connects to, and the repository.

Navigation is a **depth gauge** pinned to the right margin — simultaneously the
scrollbar, the map, the chapter index and the era legend. Formation boundaries are
ticked. Keyboard: `↑`/`↓` layer, `Enter` open, `Esc` surface, `V` veins, `L` log.

## 14. Technical architecture

Next.js 14 App Router (already in place) · TypeScript · Tailwind for layout only
(all design tokens are CSS custom properties, not Tailwind theme extensions) ·
**three.js r169 directly — no React Three Fiber, no drei, no GSAP, no Lenis.**

Rationale for raw three.js: there is one static mesh and one camera. A reconciler buys
nothing and costs a render loop I need to control. Damped scroll is ~30 lines. Total
new runtime dependency: **one package.** `motion` (already present) handles DOM
transitions only.

Content lives in `src/data/strata.ts` — one typed record per repository, all values
transcribed from the GitHub API, with `verified: false` on anything inferred.

## 15. Performance strategy

- The canvas renders **on demand** — only while scrolling, animating, or interacting.
  Idle cost is zero frames.
- One `InstancedMesh` for all 46 bands. ~3 draw calls total.
- DPR capped at 1.75; drops to 1.0 automatically if frame time exceeds 24ms twice.
- No textures. No environment maps. No shadow maps — the contact shadow is a single
  blurred radial baked into the paper.
- WebGL is dynamically imported and never blocks first paint. **All content is server
  rendered as real HTML first**; the column is an enhancement layered on top.
- `prefers-reduced-motion` → damping off, camera cuts instead of travels.
- No WebGL / low-power / small viewport → the SVG column, which is a first-class
  design, not a degraded one.

---

## 16. Self-critique — applied, with cuts made

| Test | Verdict |
|---|---|
| Looks AI-generated? | No gradient mesh, no glass, no purple, no glow, no rounded cards. Paper ground with a matte object |
| Mistakable for a Three.js tutorial? | One object, no orbit controls, no floating animation, no particles |
| Framer/Webflow template? | No hero, no section rhythm, no nav bar, no footer, no cards |
| Is the 3D meaningful? | Thickness = size, position = date, translucency = cross-cutting ideas. Remove the 3D and you lose the veins |
| Communicates the person? | Yes — the rebuild loop, the gap year, and the unglamorous datasets are the *content*, not the styling |
| Accidental conventional sections? | Checked. No about/skills/projects/contact blocks exist |

**Cut during critique:** a rotating drill-bit animation at the surface (decoration
with no informational job); per-layer hover glow (glow was banned and it was
compensating for weak silhouettes — the fix was better lighting); an audio ambience of
drilling (novelty, would have violated "never feel like a game menu"); a "core
temperature" readout (fake instrumentation, exactly the banned register);
and animated numeric counters on the depth gauge (motion without meaning).

**Sound: none.** Silence was chosen deliberately and is stated as a design decision,
not an omission.
