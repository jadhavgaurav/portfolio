/**
 * The chronology.
 *
 * Every commit the subject authored on a default branch of a repository he
 * owns, resolved to a day and grouped by repository. Derived from the GitHub
 * commit search API on 2026-08-29 and stored as day-offsets from EPOCH so the
 * whole three-year record costs under 3 KB in the bundle.
 *
 * Lanes are ordered by first commit, so reading the chart top to bottom is
 * reading the record forwards in time.
 */

export const EPOCH = "2023-05-01";
export const SPAN_DAYS = 1216;

export type Lane = {
  /** Repository name. */
  r: string;
  /** Day offsets from EPOCH, ascending. One entry per commit. */
  d: number[];
};

export const lanes: Lane[] = [
  { r: "twitter-blockchain-web3", d: [26, 32, 32, 32, 32] },
  { r: "android-music-player", d: [32, 32, 32, 32] },
  { r: "Algorithm-Visualizer", d: [32, 32, 32, 32, 302, 443] },
  { r: "Bricks-Breaker", d: [52, 85] },
  { r: "Elevator-Project-java", d: [103, 104, 104, 105] },
  { r: "E-Voting-using-Blockchain-and-Face-Recognition", d: [372] },
  { r: "Cricket-WorldCup-Analysis", d: [467] },
  { r: "assistant", d: [508, 510, 510, 512, 512] },
  { r: "machine-learning-project-template", d: [600, 600, 600, 600, 602, 649, 651, 694] },
  { r: "Insurance-premium-prediction-using-MachineLearning", d: [616, 616, 616, 618] },
  { r: "cement-composite-strength-prediction", d: [628, 628, 628, 629, 629, 635] },
  { r: "Bank_Telemarketing_predictionModel", d: [643, 651] },
  { r: "concrete-compressive-strength-prediction", d: [675] },
  { r: "jadhavgaurav", d: [675, 675, 675, 675, 675, 760, 760, 780] },
  { r: "github_actions", d: [677, 677, 677, 677, 677, 677, 677, 677, 677, 677] },
  { r: "CodeB_Internship_Project", d: [691, 691, 723, 723, 723, 723, 723, 723, 723, 724, 724, 724, 730, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 731, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 732, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 733, 734, 734, 734, 734, 734, 735, 735, 735, 735, 737, 737, 737, 737, 737, 737, 737, 737, 743, 743, 755, 1071, 1071] },
  { r: "YOLO_practice", d: [745, 745, 745, 745, 773, 773, 773] },
  { r: "Kidney_disease_classification_cnn", d: [758, 758, 759, 759, 759, 759, 759, 759, 759, 759, 759, 759, 759, 759, 759, 759, 759, 762, 762, 764, 764, 764, 764, 764, 764, 765, 765, 766, 767, 769] },
  { r: "my-portfolio", d: [760, 760, 760, 760, 760, 760, 763, 763, 763, 764, 764, 764, 766] },
  { r: "JarvisAI-pro", d: [771, 772, 772, 773, 773, 773, 773, 773, 1212, 1212] },
  { r: "Jarvis", d: [773, 773] },
  { r: "Jarvis-AI-Personal_Assistant", d: [779, 779, 779, 784] },
  { r: "victus-AI", d: [800, 800] },
  { r: "smart-email-assistant-newel", d: [801, 801, 801, 801, 801, 801, 801, 801, 801, 801, 801, 801, 801, 801, 801, 802] },
  { r: "Victus-AI-Assistant", d: [809] },
  { r: "Vision-X", d: [815, 816, 816, 817, 818, 818, 818, 818, 906] },
  { r: "PROJECT-VICTUS", d: [844, 844, 844, 844, 844, 844, 844, 844, 845, 855, 855] },
  { r: "seo-ai-agent", d: [863, 863] },
  { r: "i-draft", d: [920] },
  { r: "portfolio", d: [962, 1192, 1193, 1195, 1195] },
  { r: "victus-frontend", d: [979] },
  { r: "victus-backend", d: [979] },
  { r: "multimodal-search-platform", d: [1010] },
  { r: "finance-dashboard", d: [1010] },
  { r: "jayendra-resume", d: [1011] },
  { r: "shaharnama-news24", d: [1056, 1056, 1056, 1057, 1058, 1058, 1060, 1063, 1064, 1065, 1078, 1078, 1081] },
  { r: "inneed", d: [1062, 1062, 1062, 1063, 1063] },
  { r: "github-mirror", d: [1209, 1209] },
  { r: "Null", d: [1211, 1211, 1211, 1211, 1211, 1211, 1211, 1211, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1212, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213, 1213] },
  { r: "shree-ganesh-billing", d: [1213, 1213, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1214, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1215, 1216, 1216] },
];

/** Named periods, used to annotate the chart. Boundaries are chosen, not derived. */
export interface Era {
  from: string;
  to: string;
  name: string;
  gloss: string;
}

export const eras: Era[] = [
  {
    from: "2023-05",
    to: "2024-08",
    name: "Coursework",
    gloss:
      "Java, Android, a Solidity Twitter clone, an algorithm visualiser. Semester projects with two named collaborators. The record is thin and bursty because the deadlines were.",
  },
  {
    from: "2024-09",
    to: "2025-04",
    name: "Apparatus",
    gloss:
      "A voice assistant, then a project template, then five regression and classification notebooks in a row. The interesting artifact of this period is the template: before building the models, he built the thing that makes models reproducible.",
  },
  {
    from: "2025-05",
    to: "2025-10",
    name: "The first crush",
    gloss:
      "126 commits in May alone. The internship, the kidney classifier, YOLO, a portfolio, an email agent, VisionX and the first Victus. Six months in which almost everything he now knows was acquired at speed.",
  },
  {
    from: "2025-11",
    to: "2026-07",
    name: "Products",
    gloss:
      "Quieter and heavier. Victus splits into a backend and a frontend. A rental marketplace with twelve service modules. A Flutter finance app, a news platform, a CLIP search engine. The work stops being exercises.",
  },
  {
    from: "2026-08",
    to: "2026-08",
    name: "The second crush",
    gloss:
      "124 commits in eight days across two repositories: a billing system in production for a real business, and NULL — where the commit messages stop describing features and start recording verdicts.",
  },
];
