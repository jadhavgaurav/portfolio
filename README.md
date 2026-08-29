# The Record

An evidence-led portfolio for **Gaurav Vijay Jadhav**.

Every factual statement on the page carries the commit, file, DOI or published
page that supports it. Statements that are interpretation are marked as
interpretation. Claims a portfolio would normally make, that the underlying
record cannot support, are named and left unmade.

## The idea

The concept was derived from the work rather than chosen for it. Across three
years and forty repositories the same structural preoccupation recurs: a system
should be able to account for what it did.

- The phishing classifier ships with SHAP and LIME so a prediction can be argued with
- The kidney-CT model versions its data with DVC and logs runs to MLflow so results can be re-derived
- `PROJECT-VICTUS` routes tool calls through a policy engine that can answer `REQUIRE_APPROVAL`, and persists a trace of every step
- `NULL` gates implementation behind fourteen visual studies, each with binding rules and a recorded verdict
- The published paper is titled *A Framework to Make Voting System **Transparent** Using Blockchain Technology*

So the site is built the same way: as an audited record.

## Structure

```
src/
├── lib/provenance.ts      The evidence model: Claim, Source, evidence classes
├── data/
│   ├── record.ts          Identity, the finding and its evidence, verified
│   │                      biography, and the not-claimed list
│   ├── ledger.ts          433 authored commits as day-offsets, plus named eras
│   ├── exhibits.ts        Six projects, each with the apparatus it is shown through
│   └── lineage.ts         Eight attempts at one idea
├── components/
│   ├── primitives.tsx     Reveal, Rule, ClaimBlock, Cite, ChapterHead, Shell
│   ├── arrival.tsx        01 · the title plate
│   ├── finding.tsx        02 · the argument, its evidence and the case against
│   ├── ledger.tsx         03 · the chronology, drawn to canvas
│   ├── exhibits.tsx       04 · the six exhibits and their apparatus
│   ├── recursion.tsx      05 · the eight attempts
│   ├── unclaimed.tsx      06 · what the record does not show
│   └── colophon.tsx       07 · biography, contact, method
└── app/
    ├── globals.css        The whole visual system as tokens
    ├── layout.tsx         Fonts and metadata
    ├── page.tsx           The document in reading order
    └── api/send/          Contact form (nodemailer)
```

## Editing the content

All copy and data live in `src/data`. Nothing factual is hard-coded into a
component, so the record can be updated without touching the layout.

When adding a claim, choose its evidence class honestly:

| Class | Meaning |
| --- | --- |
| `attested` | Traceable to a public commit, file, DOI or page. Attach `sources`. |
| `read` | A pattern read across the record. Argued, not proven. |
| `unclaimed` | The record does not support it, so it is not asserted. Say why in `note`. |

Refreshing the chronology means re-running the GitHub commit search for
`user:jadhavgaurav author:jadhavgaurav`, converting each commit date to a day
offset from `EPOCH`, and replacing `lanes` in `src/data/ledger.ts`.

## Design notes

**Two typefaces.** Newsreader for display and reading text; JetBrains Mono
restricted to data — paths, counts, dates, enum values — so it never becomes
decoration.

**Two pigments on a bone ground.** Iron-oxide red for what is attested, ochre
for what is interpreted, and an outline with nothing inside it for what is not
claimed. Colour carries meaning here; it is not a mood.

**No 3D.** A WebGL scene was considered for the chronology and rejected. The
record is a dense two-dimensional time series, and a canvas plate reads it more
precisely, loads faster and survives on a mid-range phone.

**One inversion.** The chronology is the only dark section, because a dense
instrument trace reads better as light marks on dark — and because an effect
used once means something.

**Accessibility.** Semantic sectioning, a keyboard-operable chronology with a
live readout and a full tabular equivalent, visible focus, AA contrast for all
text including the small labels, and a reduced-motion path that renders the
document complete and still.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

The contact form needs `GMAIL_USER` and `GMAIL_APP_PASSWORD`. Without them the
form reports a failure and shows the direct address instead, which is always
visible beside it.
