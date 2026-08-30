/**
 * Repository facts straight from the GitHub API, kept separate from the
 * derived world so the two can be checked against each other. Language is
 * what colours a structure; homepage is what makes it visitable.
 *
 * 46 repositories. The world had forty; six were simply missing.
 */

export interface RepoFact {
  name: string;
  language: string;
  /** A deployed URL, where one exists. Six of these are live. */
  homepage: string | null;
  description: string | null;
  stars: number;
  forks: number;
  /** Kilobytes, as GitHub reports it. */
  size: number;
  url: string;
}

export const repoFacts: RepoFact[] = [
  { name: "Algorithm-Visualizer", language: "JavaScript", homepage: null, description: null, stars: 0, forks: 0, size: 12886, url: "https://github.com/jadhavgaurav/Algorithm-Visualizer" },
  { name: "Alpha-Practice", language: "Java", homepage: null, description: "Alpha Java Course by Shraddha Didi (Apna College) Practice Code", stars: 0, forks: 0, size: 6, url: "https://github.com/jadhavgaurav/Alpha-Practice" },
  { name: "android-music-player", language: "Java", homepage: null, description: "Android Music Player in Java", stars: 0, forks: 0, size: 1065, url: "https://github.com/jadhavgaurav/android-music-player" },
  { name: "assistant", language: "JavaScript", homepage: null, description: null, stars: 0, forks: 0, size: 355, url: "https://github.com/jadhavgaurav/assistant" },
  { name: "Bank_Telemarketing_predictionModel", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 1283, url: "https://github.com/jadhavgaurav/Bank_Telemarketing_predictionModel" },
  { name: "Box-Office", language: "Other", homepage: null, description: "Box-Office App", stars: 0, forks: 0, size: 0, url: "https://github.com/jadhavgaurav/Box-Office" },
  { name: "brainTumorDetection", language: "Other", homepage: null, description: null, stars: 0, forks: 0, size: 0, url: "https://github.com/jadhavgaurav/brainTumorDetection" },
  { name: "Bricks-Breaker", language: "Java", homepage: null, description: null, stars: 0, forks: 0, size: 13206, url: "https://github.com/jadhavgaurav/Bricks-Breaker" },
  { name: "cement-composite-strength-prediction", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 9736, url: "https://github.com/jadhavgaurav/cement-composite-strength-prediction" },
  { name: "CodeB_Internship_Project", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 26428, url: "https://github.com/jadhavgaurav/CodeB_Internship_Project" },
  { name: "concrete-compressive-strength-prediction", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 12964, url: "https://github.com/jadhavgaurav/concrete-compressive-strength-prediction" },
  { name: "Cricket-WorldCup-Analysis", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 548, url: "https://github.com/jadhavgaurav/Cricket-WorldCup-Analysis" },
  { name: "E-Voting-using-Blockchain-and-Face-Recognition", language: "PHP", homepage: null, description: null, stars: 0, forks: 1, size: 43659, url: "https://github.com/jadhavgaurav/E-Voting-using-Blockchain-and-Face-Recognition" },
  { name: "Elevator-Project-java", language: "Java", homepage: null, description: null, stars: 0, forks: 0, size: 5, url: "https://github.com/jadhavgaurav/Elevator-Project-java" },
  { name: "ExcelR-practice", language: "Other", homepage: null, description: null, stars: 0, forks: 0, size: 0, url: "https://github.com/jadhavgaurav/ExcelR-practice" },
  { name: "finance-dashboard", language: "Dart", homepage: null, description: null, stars: 0, forks: 0, size: 350, url: "https://github.com/jadhavgaurav/finance-dashboard" },
  { name: "fynix-digital", language: "Other", homepage: null, description: null, stars: 0, forks: 0, size: 0, url: "https://github.com/jadhavgaurav/fynix-digital" },
  { name: "github-mirror", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 155, url: "https://github.com/jadhavgaurav/github-mirror" },
  { name: "github_actions", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 26, url: "https://github.com/jadhavgaurav/github_actions" },
  { name: "i-draft", language: "TypeScript", homepage: "https://i-draft-one.vercel.app", description: null, stars: 0, forks: 0, size: 17656, url: "https://github.com/jadhavgaurav/i-draft" },
  { name: "inneed", language: "TypeScript", homepage: "https://inneed-frontend.vercel.app", description: null, stars: 0, forks: 0, size: 882, url: "https://github.com/jadhavgaurav/inneed" },
  { name: "Insurance-premium-prediction-using-MachineLearning", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 4914, url: "https://github.com/jadhavgaurav/Insurance-premium-prediction-using-MachineLearning" },
  { name: "jadhavgaurav", language: "Other", homepage: null, description: null, stars: 0, forks: 0, size: 22, url: "https://github.com/jadhavgaurav/jadhavgaurav" },
  { name: "Jarvis", language: "Python", homepage: null, description: "Jarvis. An AI voice Assistant", stars: 0, forks: 0, size: 4, url: "https://github.com/jadhavgaurav/Jarvis" },
  { name: "Jarvis-AI-Personal_Assistant", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 48187, url: "https://github.com/jadhavgaurav/Jarvis-AI-Personal_Assistant" },
  { name: "JarvisAI-pro", language: "Python", homepage: null, description: null, stars: 1, forks: 0, size: 38, url: "https://github.com/jadhavgaurav/JarvisAI-pro" },
  { name: "jayendra-resume", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 164, url: "https://github.com/jadhavgaurav/jayendra-resume" },
  { name: "Kidney_disease_classification_cnn", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 113333, url: "https://github.com/jadhavgaurav/Kidney_disease_classification_cnn" },
  { name: "machine-learning-project-template", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 15, url: "https://github.com/jadhavgaurav/machine-learning-project-template" },
  { name: "multimodal-search-platform", language: "Python", homepage: null, description: null, stars: 1, forks: 0, size: 36, url: "https://github.com/jadhavgaurav/multimodal-search-platform" },
  { name: "my-portfolio", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 36, url: "https://github.com/jadhavgaurav/my-portfolio" },
  { name: "Null", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 25566, url: "https://github.com/jadhavgaurav/Null" },
  { name: "portfolio", language: "TypeScript", homepage: "https://gaurav-portfolio-theta.vercel.app", description: "Gaurav Jadhav's Portfoilio", stars: 0, forks: 0, size: 16583, url: "https://github.com/jadhavgaurav/portfolio" },
  { name: "PROJECT-VICTUS", language: "Python", homepage: "https://project-victus.vercel.app", description: null, stars: 2, forks: 0, size: 1330, url: "https://github.com/jadhavgaurav/PROJECT-VICTUS" },
  { name: "seo-ai-agent", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 96, url: "https://github.com/jadhavgaurav/seo-ai-agent" },
  { name: "shaharnama-news24", language: "TypeScript", homepage: "https://shaharnama-news24.vercel.app", description: null, stars: 0, forks: 0, size: 3498, url: "https://github.com/jadhavgaurav/shaharnama-news24" },
  { name: "shree-ganesh-billing", language: "TypeScript", homepage: "https://billing.iamgaurav.online/", description: "Billing system for Shree Ganesh Enterprises: GST and non-GST bills, part payments, outstanding tracking", stars: 0, forks: 0, size: 2042, url: "https://github.com/jadhavgaurav/shree-ganesh-billing" },
  { name: "smart-email-assistant-newel", language: "Jupyter Notebook", homepage: null, description: null, stars: 0, forks: 0, size: 2631, url: "https://github.com/jadhavgaurav/smart-email-assistant-newel" },
  { name: "Tic-Tac-Toe", language: "JavaScript", homepage: null, description: null, stars: 0, forks: 0, size: 242, url: "https://github.com/jadhavgaurav/Tic-Tac-Toe" },
  { name: "twitter-blockchain-web3", language: "JavaScript", homepage: null, description: "Twitter clone based on blockchain technology using reactJS and solidity", stars: 0, forks: 0, size: 6361, url: "https://github.com/jadhavgaurav/twitter-blockchain-web3" },
  { name: "victus-AI", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 126, url: "https://github.com/jadhavgaurav/victus-AI" },
  { name: "Victus-AI-Assistant", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 9, url: "https://github.com/jadhavgaurav/Victus-AI-Assistant" },
  { name: "victus-backend", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 58691, url: "https://github.com/jadhavgaurav/victus-backend" },
  { name: "victus-frontend", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 159, url: "https://github.com/jadhavgaurav/victus-frontend" },
  { name: "Vision-X", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 7018, url: "https://github.com/jadhavgaurav/Vision-X" },
  { name: "YOLO_practice", language: "Python", homepage: null, description: null, stars: 0, forks: 0, size: 756747, url: "https://github.com/jadhavgaurav/YOLO_practice" },
];

export const factByName = new Map(repoFacts.map((r) => [r.name, r]));

/** Languages present, most repositories first. */
export const LANGUAGES = Array.from(
  repoFacts.reduce((m, r) => m.set(r.language, (m.get(r.language) ?? 0) + 1), new Map<string, number>()),
).sort((a, b) => b[1] - a[1]);
