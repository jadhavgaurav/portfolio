import { Source, file, link, repo } from "@/lib/provenance";

/**
 * Exhibits.
 *
 * Deliberately not a uniform shape. Each project is presented through the
 * apparatus it actually has: VICTUS through its policy decisions, NULL through
 * its approval gate, the phishing model through its own explanation output.
 * `kind` selects the presentation; the shared fields carry the narrative.
 */
export type ExhibitKind = "policy" | "gate" | "attribution" | "pipeline" | "system";

export interface Exhibit {
  id: string;
  index: string;
  kind: ExhibitKind;
  title: string;
  /** What it is, in one line a non-engineer can read. */
  standfirst: string;
  period: string;
  status: string;
  /** Question → answer. Progressive disclosure, in reading order. */
  reading: { q: string; a: string }[];
  stack: { group: string; items: string[] }[];
  sources: Source[];
  /** What the exhibit does not demonstrate. Always present. */
  limit: string;
}

export const exhibits: Exhibit[] = [
  {
    id: "victus",
    index: "01",
    kind: "policy",
    title: "PROJECT VICTUS",
    standfirst:
      "A personal assistant that will not take a consequential action without asking you first — and writes down everything it did.",
    period: "Aug 2025 – Jan 2026",
    status: "Public. Restructured into src/ layout, January 2026.",
    reading: [
      {
        q: "What is it?",
        a: "A FastAPI service and a React client that let you talk — by voice or text — to an agent with access to your files, your calendar, your mail and your machine. Faster-Whisper transcribes, an LLM reasons, Piper speaks back, and a FAISS index answers questions about documents you upload.",
      },
      {
        q: "What makes it different from a chatbot?",
        a: "Every tool the agent can call is registered with a risk level. Before a call executes it passes through a policy engine which returns one of three verdicts: allow, deny, or require approval. A high-risk call does not run. It becomes a pending action, surfaced in the client, waiting for a human to say yes.",
      },
      {
        q: "And if you want to know what it did?",
        a: "Every step is written to a trace: the tool name, the arguments, the decision that governed it, the output and how long it took. The client renders that trace as a timeline next to the conversation. The agent is not asking to be trusted; it is producing a record.",
      },
      {
        q: "What was hard about it?",
        a: "Authentication, mostly. There are four Alembic migrations in the repository and they read like a project growing up: OAuth accounts, then password-reset tokens, then a refactor of the model layer into a package, then the safety tables that hold traces and pending actions. The governance model arrived after the product worked, which is the usual and correct order.",
      },
    ],
    stack: [
      { group: "Agent", items: ["LangChain AgentExecutor", "tool registry", "policy engine", "FAISS"] },
      { group: "Service", items: ["FastAPI", "SQLAlchemy", "Alembic", "SSE"] },
      { group: "Voice", items: ["Faster-Whisper", "Piper TTS"] },
      { group: "Client", items: ["React", "TypeScript", "Vite"] },
      { group: "Integrations", items: ["Microsoft Graph", "OAuth 2.0"] },
    ],
    sources: [
      repo("PROJECT-VICTUS"),
      file("PROJECT-VICTUS", "backend/src/policy/engine.py"),
      file("PROJECT-VICTUS", "backend/src/models/trace.py"),
      file("PROJECT-VICTUS", "backend/src/api/routes/approvals.py"),
    ],
    limit:
      "Nine test modules exist, including one for the policy path and one for the SSE stream. Coverage is not published and the deployment configuration (Render, Railway) is present but unverified from outside.",
  },
  {
    id: "null",
    index: "02",
    kind: "gate",
    title: "NULL",
    standfirst:
      "A browser game that rebuilds a developer's history as a world — and refuses to let a single pixel be implemented before it has been argued for in writing.",
    period: "Aug 2026, ongoing",
    status: "Private repository. 71 commits in three days.",
    reading: [
      {
        q: "What is it?",
        a: "“Your code left a world behind.” NULL reads a developer's GitHub history and generates an explorable world from it. The stated intent is that the player recognises the shape of the place as autobiography before any label appears.",
      },
      {
        q: "Why is it here rather than under the other projects?",
        a: "Because the interesting artifact is not the game. It is the process. Before implementation was permitted, fourteen visual studies had to pass: void, signal, emergence, arrival, origin, interaction, reward, camera storyboard, UI language, material, lighting, typography and colour. Each has a design document, a deterministic capture script that renders frames, a machine-written report and a recorded verdict.",
      },
      {
        q: "Who required that?",
        a: "Nobody. There is no client and no team. The rule in the review loop reads: “No implementation is approved solely because it technically works.” And: “A technically correct feature can still be rejected creatively. This is the central rule of the project.”",
      },
      {
        q: "Does the gate actually bite?",
        a: "The commit log says yes. Study 08, the reward state, was revised four separate times — for route legibility, for construction-phase separation, for physical material divergence, for a widened exposure band — before a verdict of APPROVED was recorded. Nothing about the earlier versions failed to run.",
      },
    ],
    stack: [
      { group: "Runtime", items: ["Next.js", "TypeScript", "Vitest"] },
      { group: "Method", items: ["21 design documents", "4 ADRs", "14 gated studies", "dependency-cruiser"] },
      { group: "Evidence", items: ["deterministic capture scripts", "JSON study reports", "decision register"] },
    ],
    sources: [
      link("github.com/jadhavgaurav/Null (private)", "https://github.com/jadhavgaurav/Null"),
      { kind: "file", label: "NULL/docs/preproduction/slice-01/index.md" },
      { kind: "file", label: "NULL/docs/13-review-loop.md" },
    ],
    limit:
      "The gate has closed; the game has not been built. There is no playable slice yet, and this page makes no claim about whether NULL will ship.",
  },
  {
    id: "phishing",
    index: "03",
    kind: "attribution",
    title: "PHISHING DETECTION",
    standfirst:
      "A classifier for fraudulent websites that reports why it decided, not only what it decided.",
    period: "Feb – Apr 2025 · Code B Solutions internship",
    status: "Deployed. 112 commits — the most worked repository in the record.",
    reading: [
      {
        q: "What is it?",
        a: "Given a URL, decide whether the site behind it is phishing or legitimate. Trained on 11,430 labelled sites described by 89 features covering the URL string, the page's HTML and its external reputation.",
      },
      {
        q: "How was it built?",
        a: "Seven model families were trained and compared — logistic regression, KNN, SVM, decision tree, random forest, XGBoost and a small neural net. XGBoost won and was tuned with grid search. The reported figures are 95.83% accuracy and 0.990 ROC-AUC on held-out data.",
      },
      {
        q: "Where is the care?",
        a: "In the feature work. 89 columns were cut to 28 by agreement between four independent methods — correlation filtering, ANOVA, recursive feature elimination and random-forest importance — with variance inflation used to remove collinear survivors. Four engineered features were added, including URL complexity and a tag-to-link ratio. Skew was corrected with a Yeo-Johnson transform before scaling.",
      },
      {
        q: "Why does the explanation matter?",
        a: "Because a fraud classifier that cannot be interrogated cannot be deployed against a person. SHAP gives the global picture; LIME explains one decision at a time. For a real flagged URL the contributions are legible: not indexed by Google, phishing hints in the string, low page rank. A reviewer can agree or disagree with the reasoning rather than only with the verdict.",
      },
    ],
    stack: [
      { group: "Modelling", items: ["scikit-learn", "XGBoost", "GridSearchCV"] },
      { group: "Explanation", items: ["SHAP", "LIME"] },
      { group: "Delivery", items: ["Streamlit", "Docker", "DVC on GCS", "GitHub Actions"] },
    ],
    sources: [
      repo("CodeB_Internship_Project"),
      file("CodeB_Internship_Project", "README.md"),
      link("website-phishing-detection.streamlit.app", "https://website-phishing-detection.streamlit.app"),
    ],
    limit:
      "The accuracy figures are the author's own, reported in the repository README from a held-out split of a dataset supplied by the institute. They have not been independently reproduced here, and no live-traffic evaluation exists.",
  },
  {
    id: "kidney",
    index: "04",
    kind: "pipeline",
    title: "KIDNEY CT CLASSIFICATION",
    standfirst:
      "A medical imaging model built so that the result can be re-derived rather than believed.",
    period: "May – Jun 2025",
    status: "Public. Deployed to EC2 behind Nginx and Gunicorn.",
    reading: [
      {
        q: "What is it?",
        a: "Transfer learning on VGG16 to classify kidney CT scans, wrapped in a Flask inference app and containerised.",
      },
      {
        q: "Why is it an exhibit?",
        a: "The model is conventional; the surrounding apparatus is the point. Experiments are logged to MLflow through DagsHub with the model registered under a name. The dataset is versioned with DVC against Google Cloud Storage. GitHub Actions rebuilds and redeploys on change. Every one of those choices exists so that a number in the README can be traced back to the run that produced it.",
      },
      {
        q: "How does it get to a user?",
        a: "Docker image to Docker Hub, pulled onto an Ubuntu EC2 instance, served by Gunicorn behind Nginx on port 80. Unglamorous, complete, and done by hand rather than by platform.",
      },
    ],
    stack: [
      { group: "Model", items: ["TensorFlow", "Keras", "VGG16", "OpenCV"] },
      { group: "Reproducibility", items: ["MLflow", "DagsHub", "DVC", "GCS"] },
      { group: "Delivery", items: ["Flask", "Gunicorn", "Nginx", "Docker", "AWS EC2", "GitHub Actions"] },
    ],
    sources: [repo("Kidney_disease_classification_cnn"), file("Kidney_disease_classification_cnn", "README.md")],
    limit:
      "The README says “high accuracy” without a figure, and no confusion matrix or held-out score is published. That absence is left standing rather than filled in.",
  },
  {
    id: "evoting",
    index: "05",
    kind: "system",
    title: "TRANSPARENT VOTING",
    standfirst:
      "The undergraduate thesis, and the first time the preoccupation appears in the record.",
    period: "2024 · University of Mumbai",
    status: "Published, IJREAM Vol. 10 Issue 01, April 2024.",
    reading: [
      {
        q: "What is it?",
        a: "An electronic voting system in which votes are cast as transactions on an Ethereum chain and voters are authenticated by face recognition. A PHP application for administration and voting, a Flask microservice for the face matching, Solidity contracts deployed through Truffle against Ganache.",
      },
      {
        q: "Why does it belong in this record?",
        a: "Because of the title. The paper is not called an efficient voting system or a secure one. It is called a framework to make voting transparent. The technology was chosen for the property of being auditable — two years before the same instinct produced a policy engine and a pre-production gate.",
      },
      {
        q: "What would you do differently now?",
        a: "The stack shows its age plainly: XAMPP, dlib pinned to Python 3.6, a local chain. It is a 2024 undergraduate project and this page does not dress it up as anything else.",
      },
    ],
    stack: [
      { group: "Chain", items: ["Ethereum", "Solidity 0.8", "Truffle", "Ganache", "Web3"] },
      { group: "Identity", items: ["face_recognition", "dlib", "OpenCV", "Flask"] },
      { group: "Application", items: ["PHP", "MySQL", "Apache"] },
    ],
    sources: [
      repo("E-Voting-using-Blockchain-and-Face-Recognition"),
      link("DOI 10.35291/2454-9150.2024.0261", "https://doi.org/10.35291/2454-9150.2024.0261"),
    ],
    limit:
      "Ran on a local chain in an academic setting. It was never used in an election and no claim is made about its security under adversarial conditions.",
  },
  {
    id: "breadth",
    index: "06",
    kind: "system",
    title: "THE REST OF THE RECORD",
    standfirst:
      "Where the range is, briefly, without pretending each of these is a flagship.",
    period: "2025 – 2026",
    status: "Mixed. Some deployed, some prototypes, some abandoned.",
    reading: [
      {
        q: "Products",
        a: "INNEED is a rental marketplace with twelve independent backend service modules — auth, catalog, cart, checkout, rentals, payments, disputes, reviews, notifications, admin, uploads, saved — on Prisma and Postgres with CI and Sentry wired in. A billing system for a real enterprise, 45 commits and counting, handles GST and non-GST invoices, part payments and outstanding tracking. A Flutter finance app is built on strict clean architecture with Riverpod and GoRouter.",
      },
      {
        q: "Machine learning and vision",
        a: "VisionX runs face recognition, expression and age estimation on a live stream through a producer–consumer thread split so the GUI never blocks on inference: YOLOv8 and ArcFace as ONNX, FAISS for the identity search, SQLite for session logs. A multimodal search platform embeds text and images into one CLIP space so either can query the other, served from FastAPI over ChromaDB in non-root containers.",
      },
      {
        q: "Curiosities",
        a: "GITHUB // MIRROR classifies a developer into one of eight archetypes from their public footprint and renders a deterministic sixteen-vector signature — an earlier and more literal attempt at the problem this page is also trying to solve. An SEO agent that got as far as an outline engine and stopped. A YOLO practice repository of 739 MB, which is what learning object detection actually looks like.",
      },
    ],
    stack: [
      { group: "Product", items: ["Next.js", "Prisma", "PostgreSQL", "Flutter", "Riverpod"] },
      { group: "Vision", items: ["YOLOv8", "ArcFace", "ONNX", "FAISS", "Dear PyGui", "CLIP"] },
      { group: "Service", items: ["FastAPI", "ChromaDB", "Celery", "Redis", "Docker"] },
    ],
    sources: [
      repo("inneed"),
      repo("Vision-X"),
      repo("multimodal-search-platform"),
      repo("github-mirror"),
      repo("finance-dashboard"),
    ],
    limit:
      "Several of these are single-commit imports or prototypes that stopped. They are listed as range, not as depth, and the distinction is the reason this exhibit exists separately.",
  },
];

/** VICTUS policy table — the real enum values, used by the policy exhibit. */
export const policyTable = [
  { risk: "LOW", decision: "ALLOW", example: "Read the weather. Search the web.", executes: true },
  { risk: "MEDIUM", decision: "ALLOW", example: "Query an uploaded document. Recall a stored fact.", executes: true },
  { risk: "HIGH", decision: "REQUIRE_APPROVAL", example: "Send mail as the user. Write to the filesystem.", executes: false },
  { risk: "UNCLASSIFIED", decision: "DENY", example: "Anything the registry cannot account for.", executes: false },
];

/** NULL's pre-production gate — the fourteen studies and their recorded state. */
/**
 * NULL's pre-production gate, transcribed from the decision register at
 * docs/preproduction/slice-01/index.md. All fourteen carry a named human
 * APPROVED verdict; the register records the gate as CLOSED on 2026-08-26.
 * `revisions` counts the revise-and-resubmit rounds visible in the commit log
 * before each verdict was recorded.
 */
export const gateStudies = [
  { n: "01", name: "World keyframe", verdict: "APPROVED" },
  { n: "02", name: "Void keyframe", verdict: "APPROVED" },
  { n: "03", name: "Signal keyframe", verdict: "APPROVED" },
  { n: "04", name: "Emergence keyframe", verdict: "APPROVED" },
  { n: "05", name: "Arrival keyframe", verdict: "APPROVED" },
  { n: "06", name: "Origin keyframe", verdict: "APPROVED" },
  { n: "07", name: "World-space interaction state", verdict: "APPROVED" },
  { n: "08", name: "Reward state", verdict: "APPROVED", revisions: 4 },
  { n: "09", name: "Camera storyboard", verdict: "APPROVED" },
  { n: "10", name: "UI / HUD language", verdict: "APPROVED", revisions: 1 },
  { n: "11", name: "Material study", verdict: "APPROVED" },
  { n: "12", name: "Lighting study", verdict: "APPROVED", revisions: 1 },
  { n: "13", name: "Typography study", verdict: "APPROVED", revisions: 1 },
  { n: "14", name: "Colour study", verdict: "APPROVED", revisions: 1 },
];

/** LIME contributions for one flagged URL, quoted from the project README. */
export const limeExample = {
  url: "http://secure-login-info.confirmupdate.biz",
  verdict: "PHISHING",
  contributions: [
    { feature: "google_index", value: "0", weight: 0.31, reading: "Not indexed by Google" },
    { feature: "phish_hints", value: "1", weight: 0.22, reading: "Phishing vocabulary in the URL" },
    { feature: "page_rank", value: "1", weight: 0.18, reading: "Effectively no inbound authority" },
  ],
};

export const metrics = [
  { k: "Accuracy", v: "95.83%" },
  { k: "Precision", v: "95.46%" },
  { k: "Recall", v: "96.23%" },
  { k: "F1", v: "95.86%" },
  { k: "ROC-AUC", v: "0.990" },
];
