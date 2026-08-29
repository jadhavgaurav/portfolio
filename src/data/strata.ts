/**
 * STRATA — the core record.
 *
 * Every mechanical field below (created, pushed, language, sizeKb, stars, forks,
 * description) is transcribed directly from the GitHub API for user `jadhavgaurav`
 * on 2026-08-29: 46 non-fork public repositories. Nothing is rounded, inflated or
 * invented. `note` and `specimen` are written observations drawn from the READMEs
 * and the chronology; where a reading is inferred rather than stated it says so.
 */

export type FormationId =
  | 'basement' | 'unconformity' | 'laminate' | 'aperture' | 'vein' | 'overburden';

export type VeinId =
  | 'assistant' | 'retrieval' | 'sight' | 'prediction' | 'shipping'
  | 'commission' | 'coursework';

export interface Layer {
  id: string;
  title: string;
  repo: string;
  created: string;
  pushed: string;
  language: string | null;
  sizeKb: number;
  stars: number;
  forks: number;
  description: string;
  formation: FormationId;
  veins: VeinId[];
  note: string;
}

export interface Formation {
  id: FormationId;
  name: string;
  span: string;
  pigment: string;
  /** One line, spoken plainly. Appears in the margin as the head enters the band. */
  reading: string;
}

export interface Vein {
  id: VeinId;
  name: string;
  reading: string;
}

export const FORMATIONS: Formation[] = [
  {
    id: 'overburden',
    name: 'Overburden',
    span: 'Nov 2025 — Aug 2026',
    pigment: '#7A6A54',
    reading:
      'Loose material, not yet compacted. Work with other people’s names on it — a news site, a Flutter finance app, a GST billing system for a business that is actually using it. Paid work looks different from practice: fewer READMEs, more deadlines.',
  },
  {
    id: 'vein',
    name: 'The Vein',
    span: 'Jun 2025 — Oct 2025',
    pigment: '#4E6B57',
    reading:
      'The assistant, over and over. Eight repositories in four months, all of them the same idea, each one restarted from an empty directory rather than branched from the last. The substrate changes every time — local LLaMA, then GPT-4o, then a split backend — but the intention does not.',
  },
  {
    id: 'aperture',
    name: 'Aperture',
    span: 'Mar 2025 — Jun 2025',
    pigment: '#8C4A32',
    reading:
      'The work learns to see. CT scans, tumours, object detection, and a phishing classifier built to somebody else’s deadline. It is also where deployment stops being an afterthought: DVC, MLflow, Docker, EC2 behind Nginx — on projects with no users.',
  },
  {
    id: 'laminate',
    name: 'Laminate',
    span: 'Dec 2024 — Mar 2025',
    pigment: '#A67C3D',
    reading:
      'The densest band in the column. Four supervised-learning problems in nine weeks — insurance charges, cement conductivity, bank telemarketing, concrete strength — solved with almost the same pipeline each time. Halfway through he stopped and wrote the pipeline down as a template. That is the moment repetition turned into method.',
  },
  {
    id: 'unconformity',
    name: 'Unconformity',
    span: 'Feb 2024 — Sep 2024',
    pigment: '#B9AF97',
    reading:
      'A gap. Four repositories in eleven months, one of them empty. Underneath this line the work is Java and JavaScript written for marks; above it, it is Python written against data. The person changed here, and the record mostly went quiet while it happened.',
  },
  {
    id: 'basement',
    name: 'Basement',
    span: 'May 2023 — Jan 2024',
    pigment: '#5A6470',
    reading:
      'Bedrock. Coursework, games, a blockchain Twitter clone — several of them signed by the same two classmates, several still carrying unedited Create React App boilerplate. Ordinary student rock, with one anomaly buried in it.',
  },
];

export const VEINS: Vein[] = [
  {
    id: 'assistant',
    name: 'Assistant',
    reading:
      'Eleven repositories, thirty-one months, one idea. It starts as four kilobytes of Python in July 2023 and is still not finished. He never refactored it — he restarted it, from nothing, eleven times.',
  },
  {
    id: 'retrieval',
    name: 'Retrieval',
    reading:
      'Find the nearest thing. FAISS over documents in Victus, FAISS over faces in Vision-X, ChromaDB over text in Jarvis, CLIP over images and language in the search platform. The same primitive built four times, in four domains — and, going by the repositories, never once named as a single problem.',
  },
  {
    id: 'sight',
    name: 'Sight',
    reading:
      'Pixels in. Face verification for a voting system, CT scans, tumours, YOLO, then CLIP. Everything here treats an image as something to be recognised rather than displayed.',
  },
  {
    id: 'prediction',
    name: 'Prediction',
    reading:
      'Tabular supervised learning, mostly in a ten-week run at the start of 2025. Two of the datasets are materials science — cement conductivity, concrete strength. Unfashionable data, chosen anyway.',
  },
  {
    id: 'shipping',
    name: 'Shipping',
    reading:
      'Nothing is left in a notebook. Every model in this column ends inside something a person can open — Streamlit, Flask, a Dear PyGui dashboard, a React client. The compulsion is not to prove the model works but to make it operable.',
  },
  {
    id: 'commission',
    name: 'Commission',
    reading:
      'Work with a client, an institution or a deadline attached. It begins with the final-year project and the Code B internship, and by 2026 it is most of what gets pushed.',
  },
  {
    id: 'coursework',
    name: 'Coursework',
    reading:
      'Assigned, imitative, and left in public. Practice repositories are not deleted here — the ExcelR folder is empty, YOLO_practice is 756 megabytes of uncleaned experiment, and both are still up.',
  },
];

export const LAYERS: Layer[] = [
  { id: 'twitter-blockchain-web3', title: 'Twitter, On Chain', repo: 'twitter-blockchain-web3', created: '2023-05-26', pushed: '2023-06-02', language: 'JavaScript', sizeKb: 6361, stars: 0, forks: 0, description: 'Twitter clone based on blockchain technology using reactJS and solidity', formation: 'basement', veins: ['coursework'], note: 'Semester VI mini-project, written with Aakash Desale and Nitesh Sawardekar. React front end, Solidity contracts. The README is still the unedited Create React App boilerplate with three names pasted above it.' },
  { id: 'android-music-player', title: 'Music Player', repo: 'android-music-player', created: '2023-06-02', pushed: '2023-06-02', language: 'Java', sizeKb: 1065, stars: 0, forks: 0, description: 'Android Music Player in Java ', formation: 'basement', veins: ['coursework'], note: 'Java, Android. One of four repositories created in a single week in June 2023.' },
  { id: 'algorithm-visualizer', title: 'Algorithm Visualizer', repo: 'Algorithm-Visualizer', created: '2023-06-02', pushed: '2024-07-17', language: 'JavaScript', sizeKb: 12886, stars: 0, forks: 0, description: '', formation: 'basement', veins: ['coursework'], note: 'Semester V mini-project, same three authors. 12 MB of React. The first thing here built to make something invisible visible — an instinct that returns, much later, as SHAP plots and Vega charts.' },
  { id: 'tic-tac-toe', title: 'Tic-Tac-Toe', repo: 'Tic-Tac-Toe', created: '2023-06-13', pushed: '2023-07-24', language: 'JavaScript', sizeKb: 242, stars: 0, forks: 0, description: '', formation: 'basement', veins: ['coursework'], note: 'JavaScript. Small, finished, abandoned.' },
  { id: 'bricks-breaker', title: 'Bricks Breaker', repo: 'Bricks-Breaker', created: '2023-06-22', pushed: '2023-07-25', language: 'Java', sizeKb: 13206, stars: 0, forks: 0, description: '', formation: 'basement', veins: ['coursework'], note: 'Java, 13 MB. Game loops and collision — the last time anything here was written for fun rather than for a mark or a client.' },
  { id: 'box-office', title: 'Box Office', repo: 'Box-Office', created: '2023-06-27', pushed: '2023-06-27', language: null, sizeKb: 0, stars: 0, forks: 0, description: 'Box-Office App', formation: 'basement', veins: ['coursework'], note: 'Created and never pushed to. Zero bytes. The record keeps its empty holes.' },
  { id: 'jarvis', title: 'Jarvis — I', repo: 'Jarvis', created: '2023-07-24', pushed: '2025-06-12', language: 'Python', sizeKb: 4, stars: 0, forks: 0, description: 'Jarvis. An AI voice Assistant', formation: 'basement', veins: ['assistant'], note: 'Four kilobytes of Python, created 24 July 2023 and described as "An AI voice Assistant". Still receiving pushes in June 2025. Nothing else from this year survives past that autumn. Everything above it in the column descends from this.' },
  { id: 'alpha-practice', title: 'Alpha — Practice', repo: 'Alpha-Practice', created: '2023-07-24', pushed: '2023-07-24', language: 'Java', sizeKb: 6, stars: 0, forks: 0, description: 'Alpha Java Course by Shraddha Didi (Apna College) Practice Code', formation: 'basement', veins: ['coursework'], note: 'Java exercises from a course, committed publicly. He does not hide the scaffolding.' },
  { id: 'elevator-project-java', title: 'Elevator', repo: 'Elevator-Project-java', created: '2023-08-12', pushed: '2023-08-14', language: 'Java', sizeKb: 5, stars: 0, forks: 0, description: '', formation: 'basement', veins: ['coursework'], note: 'Java. Five kilobytes. State machines.' },
  { id: 'excelr-practice', title: 'ExcelR', repo: 'ExcelR-practice', created: '2024-02-07', pushed: '2024-02-07', language: null, sizeKb: 0, stars: 0, forks: 0, description: '', formation: 'unconformity', veins: ['coursework'], note: 'Empty. Created February 2024 and never filled. The first mark of the turn toward data, and it is a blank.' },
  { id: 'e-voting-using-blockchain-and-face-recognition', title: 'E-Voting', repo: 'E-Voting-using-Blockchain-and-Face-Recognition', created: '2024-05-07', pushed: '2026-07-10', language: 'PHP', sizeKb: 43659, stars: 0, forks: 1, description: '', formation: 'unconformity', veins: ['sight', 'shipping', 'commission'], note: 'The final-year project, and the largest thing attempted so far: PHP and MySQL for the interface, Ethereum smart contracts so votes cannot be altered after casting, and a separate Flask microservice doing face verification in OpenCV. Three unrelated technologies wired together because the problem needed all three. It is also the only repository here anyone else has forked.' },
  { id: 'cricket-worldcup-analysis', title: 'Cricket World Cup', repo: 'Cricket-WorldCup-Analysis', created: '2024-08-10', pushed: '2024-08-10', language: 'Jupyter Notebook', sizeKb: 548, stars: 0, forks: 0, description: '', formation: 'unconformity', veins: ['prediction'], note: 'The first Jupyter notebook in the account, August 2024. After fourteen months of Java and JavaScript, the tooling changes completely and does not change back.' },
  { id: 'assistant', title: 'assistant', repo: 'assistant', created: '2024-09-20', pushed: '2024-09-24', language: 'JavaScript', sizeKb: 355, stars: 0, forks: 0, description: '', formation: 'unconformity', veins: ['assistant'], note: 'JavaScript, four days of pushes, September 2024. An attempt at the Jarvis idea in the wrong language, quickly dropped.' },
  { id: 'machine-learning-project-template', title: 'Project Template', repo: 'machine-learning-project-template', created: '2024-12-21', pushed: '2025-03-25', language: 'Jupyter Notebook', sizeKb: 15, stars: 0, forks: 0, description: '', formation: 'laminate', veins: ['prediction'], note: 'A scaffold, not a project. Written in the middle of the prediction run, once the shape of the work had repeated often enough to be worth abstracting. This is the most engineer-ish thing in the column and the easiest to miss.' },
  { id: 'insurance-premium-prediction-using-machinelearning', title: 'Insurance Premium', repo: 'Insurance-premium-prediction-using-MachineLearning', created: '2025-01-03', pushed: '2025-01-08', language: 'Jupyter Notebook', sizeKb: 4914, stars: 0, forks: 0, description: '', formation: 'laminate', veins: ['prediction', 'shipping'], note: 'Regression on medical charges. SVM, XGBoost, CatBoost and random forests trained and compared on R², grid-searched. Ends, as all of these do, in a Streamlit app that accepts a CSV.' },
  { id: 'cement-composite-strength-prediction', title: 'Cement Composite', repo: 'cement-composite-strength-prediction', created: '2025-01-18', pushed: '2025-01-25', language: 'Jupyter Notebook', sizeKb: 9736, stars: 0, forks: 0, description: '', formation: 'laminate', veins: ['prediction'], note: 'Predicting compressive strength of electrically conductive cementitious composites for structural health monitoring — 81 mixtures tested for strength, 108 for resistivity, varying graphite powder, steel slag and blast-furnace slag. Random forest against a neural network. Nobody picks this dataset to look impressive.' },
  { id: 'bank-telemarketing-predictionmodel', title: 'Bank Telemarketing', repo: 'Bank_Telemarketing_predictionModel', created: '2025-02-02', pushed: '2025-02-10', language: 'Jupyter Notebook', sizeKb: 1283, stars: 0, forks: 0, description: '', formation: 'laminate', veins: ['prediction'], note: 'Classification. Third in the run. No README was written — by this point the shape is assumed.' },
  { id: 'concrete-compressive-strength-prediction', title: 'Concrete Strength', repo: 'concrete-compressive-strength-prediction', created: '2025-03-06', pushed: '2025-03-06', language: 'Jupyter Notebook', sizeKb: 12964, stars: 0, forks: 0, description: '', formation: 'laminate', veins: ['prediction'], note: 'Materials science again, a second time, deliberately. 13 MB, pushed and closed the same day.' },
  { id: 'jadhavgaurav', title: 'Profile', repo: 'jadhavgaurav', created: '2025-03-06', pushed: '2025-06-19', language: null, sizeKb: 22, stars: 0, forks: 0, description: '', formation: 'laminate', veins: [], note: 'The profile README. Reads "passionate Data Scientist" — written before most of the work below it existed, and never updated since.' },
  { id: 'github-actions', title: 'GitHub Actions', repo: 'github_actions', created: '2025-03-08', pushed: '2025-03-08', language: 'Python', sizeKb: 26, stars: 0, forks: 0, description: '', formation: 'laminate', veins: ['coursework'], note: 'Learning CI in public, March 2025. The month automation starts appearing everywhere else.' },
  { id: 'braintumordetection', title: 'Brain Tumor', repo: 'brainTumorDetection', created: '2025-03-15', pushed: '2025-03-15', language: null, sizeKb: 0, stars: 0, forks: 0, description: '', formation: 'aperture', veins: ['sight'], note: 'Created, named, never filled. An intention recorded in the rock.' },
  { id: 'codeb-internship-project', title: 'Phishing Detection', repo: 'CodeB_Internship_Project', created: '2025-03-22', pushed: '2026-04-06', language: 'Jupyter Notebook', sizeKb: 26428, stars: 0, forks: 0, description: '', formation: 'aperture', veins: ['prediction', 'shipping', 'commission'], note: 'The internship at Code B, through IT Vedant. 11,430 rows and 89 columns of URL and page-behaviour features, cut to 28 through correlation filtering, ANOVA, RFE, random-forest importance and VIF. Logistic regression through to XGBoost and a neural net, then LIME and SHAP so the predictions could be argued with. Deployed to Streamlit Cloud. The first work here with someone else\'s deadline on it.' },
  { id: 'yolo-practice', title: 'YOLO', repo: 'YOLO_practice', created: '2025-05-15', pushed: '2025-06-12', language: 'Python', sizeKb: 756747, stars: 0, forks: 0, description: '', formation: 'aperture', veins: ['sight', 'coursework'], note: '756 megabytes — by far the heaviest layer in the column, and it is named "practice". Weights, datasets and experiments committed wholesale. This is what learning object detection actually looks like when nothing is cleaned up afterwards.' },
  { id: 'kidney-disease-classification-cnn', title: 'Kidney Disease', repo: 'Kidney_disease_classification_cnn', created: '2025-05-28', pushed: '2025-06-07', language: 'Jupyter Notebook', sizeKb: 113333, stars: 0, forks: 0, description: '', formation: 'aperture', veins: ['sight', 'shipping'], note: 'CT scan classification on VGG16 transfer learning, but the model is not the point: DVC for data versioning, MLflow and DagsHub for experiment tracking, Docker, then AWS EC2 behind Gunicorn and Nginx. A personal project with no users, taken all the way to a deployed service. The habit starts here.' },
  { id: 'my-portfolio', title: 'Portfolio — I', repo: 'my-portfolio', created: '2025-05-30', pushed: '2025-06-05', language: 'Python', sizeKb: 36, stars: 0, forks: 0, description: '', formation: 'aperture', veins: [], note: 'The first attempt at this problem. Python, 36 KB, six days.' },
  { id: 'jarvisai-pro', title: 'Jarvis — II', repo: 'JarvisAI-pro', created: '2025-06-10', pushed: '2026-08-25', language: 'Python', sizeKb: 38, stars: 1, forks: 0, description: '', formation: 'vein', veins: ['assistant', 'retrieval'], note: 'The rebuild that gets serious. Vosk for speech, Porcupine for the wake word, LLaMA 3 quantised to Q4 running locally through Ollama, ChromaDB for document memory, LangChain and LangGraph for the agent. Hybrid offline-first, because the assistant should work without a network.' },
  { id: 'jarvis-ai-personal-assistant', title: 'Jarvis — III', repo: 'Jarvis-AI-Personal_Assistant', created: '2025-06-18', pushed: '2025-06-23', language: 'Python', sizeKb: 48187, stars: 0, forks: 0, description: '', formation: 'vein', veins: ['assistant', 'retrieval'], note: '48 MB, created eight days after the previous one. Same idea, same name, new hole.' },
  { id: 'victus-ai', title: 'Victus — I', repo: 'victus-AI', created: '2025-07-09', pushed: '2025-07-09', language: 'Python', sizeKb: 126, stars: 0, forks: 0, description: '', formation: 'vein', veins: ['assistant'], note: 'The name changes. The README is one line: "use python 3.11 for this project".' },
  { id: 'smart-email-assistant-newel', title: 'Smart Email Assistant', repo: 'smart-email-assistant-newel', created: '2025-07-10', pushed: '2025-07-11', language: 'Jupyter Notebook', sizeKb: 2631, stars: 0, forks: 0, description: '', formation: 'vein', veins: ['assistant', 'retrieval', 'shipping'], note: 'Three agents: a logistic-regression classifier sorting mail into HR, IT or other; a local LLaMA 3 8B through Ollama drafting the reply; and an escalation agent that hands the message to a human when the classifier\'s confidence is low. That last one is the interesting part — a system designed around the assumption that it will be wrong.' },
  { id: 'victus-ai-assistant', title: 'Victus — II', repo: 'Victus-AI-Assistant', created: '2025-07-15', pushed: '2025-07-18', language: 'Python', sizeKb: 9, stars: 0, forks: 0, description: '', formation: 'vein', veins: ['assistant'], note: 'Nine kilobytes. Three days. Started and abandoned within a week of the last one.' },
  { id: 'vision-x', title: 'Vision-X', repo: 'Vision-X', created: '2025-07-24', pushed: '2025-10-23', language: 'Python', sizeKb: 7018, stars: 0, forks: 0, description: '', formation: 'vein', veins: ['retrieval', 'sight', 'shipping'], note: 'Real-time face recognition for attendance: YOLOv8 for detection and ArcFace for identity, both exported to ONNX, with FAISS doing the nearest-neighbour lookup and SQLite logging entry and exit times. Multi-threaded, with a GPU-accelerated Dear PyGui desktop dashboard so it never blocks. It also caches identity so someone stepping out of frame and back does not get logged twice — a fix that only comes from watching the thing fail in a room.' },
  { id: 'project-victus', title: 'Victus — III', repo: 'PROJECT-VICTUS', created: '2025-08-22', pushed: '2026-01-02', language: 'Python', sizeKb: 1330, stars: 2, forks: 0, description: '', formation: 'vein', veins: ['assistant', 'retrieval', 'shipping'], note: 'The assistant, seventh attempt, and the furthest it has got. Faster-Whisper transcribing, Piper synthesising, GPT-4o reasoning, a LangChain AgentExecutor choosing tools, FAISS holding uploaded PDFs and DOCX for retrieval, and real system control — launching applications, handling Microsoft 365 mail and calendar. Two stars, which is two more than anything else here.' },
  { id: 'seo-ai-agent', title: 'SEO Agent', repo: 'seo-ai-agent', created: '2025-09-10', pushed: '2025-09-10', language: 'Python', sizeKb: 96, stars: 0, forks: 0, description: '', formation: 'vein', veins: ['assistant'], note: 'September 2025, single day of work. The agent pattern applied to somebody\'s marketing problem.' },
  { id: 'i-draft', title: 'i-draft', repo: 'i-draft', created: '2025-11-06', pushed: '2025-11-06', language: 'TypeScript', sizeKb: 17656, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['commission'], note: '17 MB of TypeScript generated out of a Figma file. Honest about its origin in its own README.' },
  { id: 'fynix-digital', title: 'Fynix', repo: 'fynix-digital', created: '2025-11-08', pushed: '2025-11-08', language: null, sizeKb: 0, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['commission'], note: 'Empty repository, created the day after i-draft. Named, reserved, unbuilt.' },
  { id: 'portfolio', title: 'Portfolio — II', repo: 'portfolio', created: '2025-12-14', pushed: '2026-08-08', language: 'TypeScript', sizeKb: 16009, stars: 0, forks: 0, description: 'Gaurav Jadhav\'s Portfoilio', formation: 'overburden', veins: [], note: 'The site this one replaces. Next.js, Framer Motion, a cyan-and-magenta palette on void black, and a README that calls its own design philosophy "cyberpunk-inspired". Kept in the column because deleting it would be dishonest — it is the layer directly beneath the ground you are standing on.' },
  { id: 'victus-frontend', title: 'Victus — Frontend', repo: 'victus-frontend', created: '2026-01-04', pushed: '2026-02-04', language: 'TypeScript', sizeKb: 159, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['assistant'], note: 'The assistant finally splits in two. React with Zustand, and — notably — Vega-Lite and Mermaid rendering in the client, so the agent can answer with a chart or a diagram instead of a paragraph.' },
  { id: 'victus-backend', title: 'Victus — Backend', repo: 'victus-backend', created: '2026-01-04', pushed: '2026-02-04', language: 'Python', sizeKb: 58691, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['assistant', 'retrieval'], note: '59 MB. The other half. Eleventh repository in the lineage that began with four kilobytes in July 2023.' },
  { id: 'multimodal-search-platform', title: 'Multimodal Search', repo: 'multimodal-search-platform', created: '2026-02-04', pushed: '2026-02-04', language: 'Python', sizeKb: 36, stars: 1, forks: 0, description: '', formation: 'overburden', veins: ['retrieval', 'sight', 'shipping'], note: 'CLIP ViT-B/32 embedding both text and images into one space, ChromaDB holding the vectors, FastAPI serving, React querying. Search a photo library by describing it, or by handing it another photo. This is the third time nearest-neighbour search has been built here — documents in Victus, faces in Vision-X, now pixels and language together — and as far as the repositories show, the first time the three have not been treated as one problem.' },
  { id: 'inneed', title: 'inneed', repo: 'inneed', created: '2026-02-04', pushed: '2026-03-29', language: 'TypeScript', sizeKb: 882, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['commission'], note: 'TypeScript. Two months of pushes across February and March 2026.' },
  { id: 'finance-dashboard', title: 'Agency Finance', repo: 'finance-dashboard', created: '2026-02-04', pushed: '2026-02-04', language: 'Dart', sizeKb: 350, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['commission'], note: 'Flutter and Dart, package name `agency_finance`. The only mobile work since the 2023 Java Android player, and a completely different reason for it.' },
  { id: 'jayendra-resume', title: 'Jayendra', repo: 'jayendra-resume', created: '2026-02-04', pushed: '2026-02-04', language: 'TypeScript', sizeKb: 164, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['commission'], note: 'A résumé site built for someone else.' },
  { id: 'shaharnama-news24', title: 'Shaharnama News24', repo: 'shaharnama-news24', created: '2026-03-22', pushed: '2026-04-16', language: 'TypeScript', sizeKb: 3498, stars: 0, forks: 0, description: '', formation: 'overburden', veins: ['commission'], note: 'A news publication front end, 3.5 MB, worked on across March and April 2026.' },
  { id: 'github-mirror', title: 'GitHub Mirror', repo: 'github-mirror', created: '2026-08-22', pushed: '2026-08-22', language: 'TypeScript', sizeKb: 155, stars: 0, forks: 0, description: '', formation: 'overburden', veins: [], note: 'Reads a public GitHub footprint and derives an engineering archetype and a deterministic visual signature from it — cadence, stewardship, technology entropy. Written three days before this column was drilled, and pointed at the same question from the other direction.' },
  { id: 'null', title: 'Null', repo: 'Null', created: '2026-08-25', pushed: '2026-08-26', language: 'TypeScript', sizeKb: 25566, stars: 0, forks: 0, description: '', formation: 'overburden', veins: [], note: '25 MB of TypeScript, created and pushed over two days in August 2026, with no description. The most recent unexplained thing in the record.' },
  { id: 'shree-ganesh-billing', title: 'Shree Ganesh Billing', repo: 'shree-ganesh-billing', created: '2026-08-26', pushed: '2026-08-29', language: 'TypeScript', sizeKb: 2042, stars: 0, forks: 0, description: 'Billing system for Shree Ganesh Enterprises: GST and non-GST bills, part payments, outstanding tracking', formation: 'overburden', veins: ['shipping', 'commission'], note: 'GST and non-GST invoices, part payments, outstanding balances. A billing system for an actual business with actual money moving through it. Pushed to most recently of anything here — this is the top of the core, and it is still wet.' },
];

/**
 * Deeper readings for the layers that carry the most weight.
 * `friction` is only populated where the repository itself provides evidence of
 * a difficulty — a workaround committed, a guard added, a README caveat. It is
 * never guessed.
 */
export interface Specimen {
  /** Why the thing exists. */
  problem: string;
  /** What was actually built, in specifics. */
  built: string[];
  /** Evidence of difficulty, with the artifact it is read from. */
  friction?: { observation: string; evidence: string };
  /** What this layer says about the person, stated carefully. */
  reading: string;
}

export const SPECIMENS: Record<string, Specimen> = {
  'project-victus': {
    problem:
      'Seven attempts in, the assistant still could not do the two things that would make it worth using: hold a conversation about your own documents, and actually operate the machine it runs on.',
    built: [
      'Faster-Whisper transcribing speech and Piper synthesising it back, chosen for latency rather than quality',
      'GPT-4o behind a LangChain AgentExecutor that picks and chains tools rather than following a fixed script',
      'A persistent FAISS store holding uploaded PDF and DOCX files so retrieval survives a restart',
      'System-level tools: finding and launching installed applications, file operations, Microsoft 365 mail and calendar',
      'Conversation memory and user preferences carried across sessions',
    ],
    friction: {
      observation:
        'The README documents authentication, rate limiting and a security section — unusual for a personal assistant with one user, and a sign the tool-calling surface was understood to be dangerous.',
      evidence: 'README § Security',
    },
    reading:
      'This is the furthest the eleven-repository lineage has got, and it is still the only repository here with more than one star. It is also, notably, the version where the assistant stopped being a voice toy and became something with a permissions problem.',
  },
  'vision-x': {
    problem:
      'Recognising a face once is a demo. Recognising the same person repeatedly, in a real room, without logging them twice, is a system.',
    built: [
      'YOLOv8 for detection and ArcFace for identity, both exported to ONNX so inference does not carry a training framework',
      'FAISS doing the nearest-neighbour lookup against the enrolled face index',
      'Expression recognition and age estimation via Hugging Face transformers, running alongside',
      'SQLite logging entry and exit times, and the direction of exit',
      'A multi-threaded Dear PyGui dashboard, GPU-accelerated so the interface never blocks on inference',
    ],
    friction: {
      observation:
        'A re-identification cache holds a person’s identity when they briefly leave the frame, specifically to stop duplicate log entries. That is not a feature you design up front — it is a fix written after watching the thing fail in a room.',
      evidence: 'README § Features, "Person Re-identification"',
    },
    reading:
      'The interesting engineering here is not the models, which are off the shelf. It is the threading, the ONNX export, and the cache — all decisions about making a recognition pipeline survive continuous real-time use.',
  },
  'multimodal-search-platform': {
    problem:
      'Text and images live in different systems. CLIP puts them in one vector space, which means a photo library can be searched by describing it.',
    built: [
      'CLIP ViT-B/32 embedding both queries and images into a shared space',
      'ChromaDB for persistent vector storage, FastAPI serving, React and Vite querying',
      'Both directions: text-to-image and image-to-image',
      'Docker Compose with non-root containers and a deterministic ingestion pipeline',
    ],
    friction: {
      observation:
        'The local-development instructions carry two environment variables — OMP_NUM_THREADS=1 and KMP_DUPLICATE_LIB_OK=TRUE — described as a fix for a threading hang on Apple Silicon. Somebody lost an afternoon to that.',
      evidence: 'README § Local Development',
    },
    reading:
      'This is the third independent implementation of nearest-neighbour search in the column — after documents in Victus and faces in Vision-X. The repositories give no indication he has noticed they are the same problem.',
  },
  'kidney-disease-classification-cnn': {
    problem:
      'Classifying CT scans is a solved exercise. Getting a personal project all the way onto a server, reproducibly, is not.',
    built: [
      'VGG16 transfer learning with frozen base layers and custom dense heads for binary classification',
      'DVC for data versioning and MLflow with DagsHub for experiment tracking',
      'A Flask application, containerised',
      'Deployed to AWS EC2 behind Gunicorn and Nginx',
    ],
    reading:
      'The model is the least interesting part and he clearly knew it — the README spends most of its length on the pipeline. This is where the deployment habit starts, and it never goes away.',
  },
  'codeb-internship-project': {
    problem:
      'Detect phishing sites from URL and page structure — and be able to explain any individual verdict, because a classifier nobody can argue with is not usable.',
    built: [
      '11,430 rows × 89 features reduced to 28, selected through correlation filtering, ANOVA, RFE, random-forest importance and VIF',
      'Engineered features including url_complexity, tag_to_link_ratio, domain_numeric_intensity and path_word_complexity',
      'Robust scaling and a Yeo-Johnson transform for skew',
      'Logistic regression, KNN, SVM, decision tree, random forest, XGBoost and a neural net, compared',
      'LIME and SHAP for per-prediction explanation; shipped to Streamlit Cloud',
    ],
    reading:
      'The first work in the column with an external deadline on it. The feature-selection stack is more careful than the problem strictly required — five different methods to justify one set of 28 columns.',
  },
  'e-voting-using-blockchain-and-face-recognition': {
    problem:
      'A vote must be verifiably cast by the right person and impossible to alter afterwards. Those are two separate problems and they wanted two separate technologies.',
    built: [
      'PHP, MySQL and an Apache stack for the voter and administrator interfaces',
      'Ethereum smart contracts recording each vote as a transaction, with results read back off-chain',
      'A separate Flask microservice performing face verification in OpenCV as the authentication step',
    ],
    reading:
      'The final-year project, and structurally the most ambitious thing in the lower half of the column: three unrelated stacks wired together because the problem genuinely needed all three. It is also the only repository anyone here has forked.',
  },
  'smart-email-assistant-newel': {
    problem:
      'Automatically answering email is easy until the classifier is unsure — and that is exactly when an automatic answer does the most damage.',
    built: [
      'A logistic-regression agent classifying mail into HR, IT or other',
      'A response agent generating replies via LLaMA 3 8B running locally through Ollama',
      'An escalation agent that routes to a human when classification confidence is low',
      'Streamlit interface, interaction logging, optional S3 upload, fully containerised',
    ],
    reading:
      'The escalation agent is the whole point. It is a system designed around the assumption that it will be wrong, which is a more mature instinct than anything else in this band.',
  },
  'jarvisai-pro': {
    problem:
      'The second serious attempt at the assistant, built on a constraint the later versions abandon: it should work with no network.',
    built: [
      'Vosk for speech recognition and Porcupine for wake-word detection, both local',
      'LLaMA 3 quantised to Q4 running through Ollama',
      'A scikit-learn intent classifier routing between deterministic skills and the LLM',
      'ChromaDB for local document question-answering',
      'LangChain and LangGraph agents, Docker-ready',
    ],
    reading:
      'Offline-first, hybrid routing, a cheap classifier in front of an expensive model. Two months later he moves to GPT-4o and drops all of it. Worth reading as the road not taken.',
  },
  'cement-composite-strength-prediction': {
    problem:
      'Electrically conductive cementitious composites can sense strain in a structure — but the fillers that make them conductive weaken them. The tradeoff needs predicting before it is mixed.',
    built: [
      'Random forest and an artificial neural network trained on 81 mixtures tested for compressive strength and 108 tested for electrical resistivity',
      'Variables across graphite powder, waste steel slag and ground granulated blast-furnace slag content, cement proportion and curing age',
    ],
    reading:
      'Nobody picks this dataset to look impressive. It appears in the middle of a run of five practice problems, and then a second materials-science dataset follows six weeks later — so it was not an accident.',
  },
  'shree-ganesh-billing': {
    problem:
      'GST and non-GST invoices, part payments, outstanding balances — for a business that has to reconcile them.',
    built: [
      'TypeScript. Created 26 August 2026, pushed to three days later.',
    ],
    reading:
      'This is the top of the core, and it is the least glamorous thing in it: no model, no agent, just money that has to add up. The most recent push in the entire record.',
  },
};

/** Origin of the record — the first repository creation. All depths measure from here. */
export const ORIGIN = '2023-05-26';

export const TOTALS = {
  layers: LAYERS.length,
  spanMonths: 39,
  firstPush: '2023-05-26',
  lastPush: '2026-08-29',
  /** Profile reports 68 public repos; the balance are forks or empty and are not charted. */
  publicReposReported: 68,
};
