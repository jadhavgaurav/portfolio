import { Claim, Source, file, link, repo } from "@/lib/provenance";

/** Identity block — the header of the record. */
export const subject = {
  name: "Gaurav Vijay Jadhav",
  filedAs: "JADHAV, GAURAV VIJAY",
  located: "Mumbai, Maharashtra",
  email: "gaurav.vjadhav01@gmail.com",
  github: "https://github.com/jadhavgaurav",
  linkedin: "https://www.linkedin.com/in/gauravjadhav007",
  handle: "jadhavgaurav",
  /** GitHub account creation date. */
  accountOpened: "2023-05-24",
  lastEntry: "2026-08-29",
} as const;

/**
 * The thesis. One sentence, then the argument, then the sources.
 * This is a `read` — an interpretation of the record, and it says so.
 */
export const finding = {
  headline: "He builds systems that are required to justify themselves.",
  body: [
    "Across three years and forty repositories the subject returns, without apparent prompting, to a single structural preoccupation: a system should be able to account for what it did.",
    "It shows up first as explainability — a classifier that must produce a reason alongside a prediction. It becomes reproducibility — a training run that can be re-executed from versioned data. It becomes governance — an agent that will not take a high-risk action without asking a human, and that writes down every step it took. Most recently it becomes method itself — a game whose visual decisions must pass written rules and be recorded as approved before any of them may be implemented.",
    "Almost nothing survives the period intact — not the language, not the domain, not the tools, not even the kind of thing being built. The disposition does.",
  ],
  counterEvidence:
    "This is a reading, not a proof. The same repositories could be described as a developer following the ordinary curriculum of applied machine learning, in which experiment tracking and explainability are standard practice rather than personal conviction. What that reading does not account for is NULL, where nobody required a pre-production gate and one was built anyway.",
} as const;

/** The claims that support the finding, each with its own provenance. */
export const findingEvidence: Claim[] = [
  {
    id: "explain",
    text: "The phishing classifier was shipped with SHAP and LIME attached, and its feature set was reduced to 28 by four independent selection methods rather than one.",
    evidence: "attested",
    sources: [file("CodeB_Internship_Project", "README.md")],
  },
  {
    id: "repro",
    text: "The kidney-CT classifier tracks experiments in MLflow and versions its data with DVC against remote object storage, so a result can be re-derived rather than trusted.",
    evidence: "attested",
    sources: [file("Kidney_disease_classification_cnn", "README.md")],
  },
  {
    id: "govern",
    text: "PROJECT-VICTUS routes every tool call through a policy engine that can return REQUIRE_APPROVAL, and persists each step — tool, arguments, decision, duration — to a trace table.",
    evidence: "attested",
    sources: [
      file("PROJECT-VICTUS", "backend/src/policy/engine.py"),
      file("PROJECT-VICTUS", "backend/src/models/trace.py"),
    ],
  },
  {
    id: "method",
    text: "NULL gates implementation behind fourteen visual studies, each with binding rules, a deterministic capture script, a machine-written report and a recorded verdict.",
    evidence: "attested",
    sources: [
      link("NULL / docs/13-review-loop.md", "https://github.com/jadhavgaurav/Null"),
    ],
    note: "Repository is private; paths cited from the working tree.",
  },
  {
    id: "transparent",
    text: "The undergraduate thesis chose blockchain for voting on the stated grounds of transparency, and was published with a DOI.",
    evidence: "attested",
    sources: [
      link("DOI 10.35291/2454-9150.2024.0261", "https://doi.org/10.35291/2454-9150.2024.0261"),
      link("IJREAM V10SSJ2411 (PDF)", "https://ijream.org/papers/IJREAMV10SSJ2411.pdf"),
    ],
  },
  {
    id: "habit",
    text: "The habit is a disposition rather than a job requirement: no employer or coursework asked for NULL's pre-production gate.",
    evidence: "read",
  },
];

/** Header counters. Every one is derived from data on this page. */
export interface Measure {
  value: string;
  label: string;
  note: string;
}

export const measures: Measure[] = [
  { value: "40", label: "repositories with authored commits", note: "Public and private, excluding forks." },
  { value: "433", label: "commits attributable to the subject", note: "Default branches only; the true figure is higher." },
  { value: "39", label: "months from first commit to last", note: "2023-05-27 to 2026-08-29, unevenly." },
  { value: "1", label: "peer-reviewed publication", note: "IJREAM, April 2024, with DOI." },
];

/** Verified biography. Short, because only this much is verifiable. */
export interface Fact {
  period: string;
  title: string;
  detail: string;
  sources: Source[];
}

export const facts: Fact[] = [
  {
    period: "2024",
    title: "B.E. Computer Engineering, University of Mumbai",
    detail: "Graduated 7.83 CGPA. Final-year work became the published paper on blockchain voting.",
    sources: [{ kind: "document", label: "Curriculum vitae (on file)" }],
  },
  {
    period: "Apr 2024",
    title: "Published: A Framework to Make Voting System Transparent Using Blockchain Technology",
    detail: "IJREAM, Vol. 10 Issue 01. ISSN 2454-9150. Paper ID IJREAMV10SSJ2411.",
    sources: [link("doi.org/10.35291/2454-9150.2024.0261", "https://doi.org/10.35291/2454-9150.2024.0261")],
  },
  {
    period: "Jun 2024 – Jun 2025",
    title: "Master in Data Science & Analytics with AI — IT Vedant / IBM",
    detail: "The bootcamp that produced the 2025 run of end-to-end ML repositories.",
    sources: [{ kind: "document", label: "Curriculum vitae (on file)" }],
  },
  {
    period: "Feb – Apr 2025",
    title: "Data Science Intern, Code B Solutions",
    detail: "Phishing website detection, taken from raw dataset to deployed Streamlit application with CI and data versioning.",
    sources: [repo("CodeB_Internship_Project"), link("website-phishing-detection.streamlit.app", "https://website-phishing-detection.streamlit.app")],
  },
  {
    period: "2023 – 2025",
    title: "Six course certificates",
    detail:
      "Four from IBM Skills Network (Python for Data Science, Data Analysis with Python, Machine Learning with Python, Cloud Essentials), Generative AI Fundamentals from Databricks Academy, Data Science 360 from FutureSkills Prime. Listed once, as a count, rather than tiled: they record attendance, and the repositories record what came of it.",
    sources: [{ kind: "document", label: "Curriculum vitae (on file)" }],
  },
  {
    period: "Present",
    title: "Building at Digibranders",
    detail: "Listed as current affiliation on the GitHub profile. The commercial work is not public and is not described here.",
    sources: [link("github.com/jadhavgaurav", "https://github.com/jadhavgaurav")],
  },
];

/** The negative space. This is the section that makes the rest credible. */
export const unclaimed: Claim[] = [
  {
    id: "u-adoption",
    text: "Adoption, users, downloads or revenue.",
    evidence: "unclaimed",
    note: "The public repositories carry four stars between them. Nothing in the record measures reach, so nothing here asserts it.",
  },
  {
    id: "u-oss",
    text: "A record of open-source contribution.",
    evidence: "unclaimed",
    note: "Twenty-six repositories — langfuse, hoppscotch, plane, the MCP Python SDK, first-contributions — were forked across three days in August 2026. That is a documented intention to start. No merged pull request exists yet, so this is filed as intent, not history.",
  },
  {
    id: "u-scale",
    text: "Production traffic, uptime or latency figures.",
    evidence: "unclaimed",
    note: "Several projects are deployed — Streamlit Cloud, an EC2 instance behind Nginx and Gunicorn — but no telemetry is published, so no performance number appears on this page.",
  },
  {
    id: "u-team",
    text: "Team size, seniority or scope of responsibility.",
    evidence: "unclaimed",
    note: "Three university projects name two collaborators. Everything after 2024 is single-author in the commit record. That is what the record shows; it is not evidence about how he works with others.",
  },
  {
    id: "u-private",
    text: "Most of the commercial work.",
    evidence: "unclaimed",
    note: "Two of the four busiest repositories are private. They are counted in the chronology because the commits are attributable, and they are not described because their contents are not public.",
  },
];
