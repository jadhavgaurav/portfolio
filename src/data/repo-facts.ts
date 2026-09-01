/**
 * Repository facts straight from the GitHub API, kept separate from the
 * derived world so the two can be checked against each other. Language is
 * what colours a structure; homepage is what makes it visitable.
 *
 * 46 personal repositories, plus 32 from the digibranders org that clear the
 * activity bar (10+ commits, or 2+ real contributors beyond Gaurav's own
 * three git identities) — 24 more digibranders repos exist but are too thin
 * (often a single solo commit) to earn a place, the same standard the
 * personal record was already held to.
 */

export interface RepoFact {
  name: string;
  /** Absent means the personal record: jadhavgaurav. Set for the org merge. */
  owner?: "digibranders";
  language: string;
  /** A deployed URL, where one exists. Six of these are live. */
  homepage: string | null;
  description: string | null;
  stars: number;
  forks: number;
  /** Kilobytes, as GitHub reports it. */
  size: number;
  /** Set on digibranders entries; absent (not false) on the personal record,
   *  which is entirely public. */
  private?: boolean;
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

  /* digibranders — the org account, merged in once the personal record was
     found to be missing his own company's product work entirely. Fetched
     2026-09-01, filtered to the 32 of 56 repos that clear the activity bar.
     Two of those 32 — eventus_report_backend and eventus_report_frontend —
     are real, active repos with real contributors, but have zero commits
     from any of Gaurav's own three git identities. Since every structure
     here is built from his own commit record, they don't get one; the
     people who built them are still in the world, in contributors.ts. */
  { name: "adobe-mcp", owner: "digibranders", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 115, private: false, url: "https://github.com/digibranders/adobe-mcp" },
  { name: "alfeco-foundation-web", owner: "digibranders", language: "TypeScript", homepage: "https://alfecofoundation.vercel.app/", description: null, stars: 1, forks: 0, size: 56560, private: false, url: "https://github.com/digibranders/alfeco-foundation-web" },
  { name: "alsonotify-backend", owner: "digibranders", language: "TypeScript", homepage: null, description: "Alsonotify Backend for new frontend", stars: 0, forks: 0, size: 4101, private: true, url: "https://github.com/digibranders/alsonotify-backend" },
  { name: "alsonotify-landing-page", owner: "digibranders", language: "TypeScript", homepage: "https://alsonotify.com", description: "Alsonotify Website", stars: 0, forks: 0, size: 3962, private: true, url: "https://github.com/digibranders/alsonotify-landing-page" },
  { name: "alsonotify-next-app-frontend", owner: "digibranders", language: "TypeScript", homepage: "https://app.alsonotify.com", description: null, stars: 0, forks: 0, size: 21539, private: false, url: "https://github.com/digibranders/alsonotify-next-app-frontend" },
  { name: "alsonotify_backend-yusuf", owner: "digibranders", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 421, private: true, url: "https://github.com/digibranders/alsonotify_backend-yusuf" },
  { name: "alsonotify_frontend_nextjs_v14.2.14", owner: "digibranders", language: "TypeScript", homepage: "https://alsonotify-frontend.vercel.app", description: null, stars: 0, forks: 0, size: 1703, private: true, url: "https://github.com/digibranders/alsonotify_frontend_nextjs_v14.2.14" },
  { name: "alsonotify_website_new", owner: "digibranders", language: "TypeScript", homepage: "https://alsonotify-website-new.vercel.app", description: null, stars: 0, forks: 0, size: 39686, private: true, url: "https://github.com/digibranders/alsonotify_website_new" },
  { name: "cleanstart-email-signatures", owner: "digibranders", language: "HTML", homepage: "https://digibranders.github.io/cleanstart-email-signatures/", description: null, stars: 0, forks: 0, size: 1882, private: false, url: "https://github.com/digibranders/cleanstart-email-signatures" },
  { name: "cleanstart-v3-next", owner: "digibranders", language: "TypeScript", homepage: "https://cleanstart-v3-next.vercel.app", description: null, stars: 0, forks: 0, size: 338781, private: false, url: "https://github.com/digibranders/cleanstart-v3-next" },
  { name: "cleanstart-web", owner: "digibranders", language: "TypeScript", homepage: "https://cleanstart-tau.vercel.app", description: null, stars: 1, forks: 0, size: 274809, private: false, url: "https://github.com/digibranders/cleanstart-web" },
  { name: "cleanstart_repo_ui_temp", owner: "digibranders", language: "TypeScript", homepage: "https://cleanstart-repo-ui-temp.vercel.app", description: null, stars: 0, forks: 0, size: 488, private: true, url: "https://github.com/digibranders/cleanstart_repo_ui_temp" },
  { name: "cleanstart_ui", owner: "digibranders", language: "TypeScript", homepage: "https://celanstart-ui.vercel.app", description: null, stars: 0, forks: 0, size: 831, private: true, url: "https://github.com/digibranders/cleanstart_ui" },
  { name: "currycook_backend", owner: "digibranders", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 7672, private: true, url: "https://github.com/digibranders/currycook_backend" },
  { name: "currycook_frontend", owner: "digibranders", language: "TypeScript", homepage: "https://currycook.vercel.app", description: null, stars: 0, forks: 0, size: 2761, private: true, url: "https://github.com/digibranders/currycook_frontend" },
  { name: "eventus-partner-portal-frontend", owner: "digibranders", language: "TypeScript", homepage: "https://eventus-partner-portal.vercel.app", description: null, stars: 0, forks: 0, size: 40761, private: true, url: "https://github.com/digibranders/eventus-partner-portal-frontend" },
  { name: "eventus-security-v1", owner: "digibranders", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 1379, private: true, url: "https://github.com/digibranders/eventus-security-v1" },
  { name: "fynix-digital-v2", owner: "digibranders", language: "TypeScript", homepage: "https://fynix-digital-v2.vercel.app", description: null, stars: 1, forks: 0, size: 79506, private: false, url: "https://github.com/digibranders/fynix-digital-v2" },
  { name: "fynix-digital-web-legacy", owner: "digibranders", language: "TypeScript", homepage: "https://www.fynix.digital", description: null, stars: 0, forks: 0, size: 770418, private: true, url: "https://github.com/digibranders/fynix-digital-web-legacy" },
  { name: "gkrhospitality-website", owner: "digibranders", language: "TypeScript", homepage: "https://garrett-ronan-web.vercel.app", description: null, stars: 1, forks: 0, size: 392507, private: false, url: "https://github.com/digibranders/gkrhospitality-website" },
  { name: "oye-chat-landing-age", owner: "digibranders", language: "HTML", homepage: "https://oye-chat-landing-age.vercel.app", description: null, stars: 0, forks: 0, size: 466, private: true, url: "https://github.com/digibranders/oye-chat-landing-age" },
  { name: "oye-chats-platform", owner: "digibranders", language: "Python", homepage: "https://oye-chats-platform.vercel.app", description: null, stars: 1, forks: 0, size: 23416, private: false, url: "https://github.com/digibranders/oye-chats-platform" },
  { name: "oyechats-admin", owner: "digibranders", language: "HTML", homepage: "https://oyechats-admin.vercel.app", description: null, stars: 0, forks: 0, size: 821, private: true, url: "https://github.com/digibranders/oyechats-admin" },
  { name: "oyechats-mobile-app", owner: "digibranders", language: "TypeScript", homepage: null, description: null, stars: 0, forks: 0, size: 5546, private: true, url: "https://github.com/digibranders/oyechats-mobile-app" },
  { name: "oyechats-status", owner: "digibranders", language: "TypeScript", homepage: "https://oyechats-status.vercel.app", description: "GitHub-style public status page for OyeChats (status.oyechats.com), hosted independently of the DO droplet.", stars: 0, forks: 0, size: 89, private: true, url: "https://github.com/digibranders/oyechats-status" },
  { name: "oyechats-website", owner: "digibranders", language: "TypeScript", homepage: "https://oyechats.com", description: null, stars: 1, forks: 0, size: 4110, private: false, url: "https://github.com/digibranders/oyechats-website" },
  { name: "oyechats-website-v2", owner: "digibranders", language: "TypeScript", homepage: "https://oyechats-website-v2.vercel.app", description: null, stars: 0, forks: 0, size: 3466, private: false, url: "https://github.com/digibranders/oyechats-website-v2" },
  { name: "partner_portal_backend", owner: "digibranders", language: "Go", homepage: null, description: null, stars: 0, forks: 0, size: 265, private: true, url: "https://github.com/digibranders/partner_portal_backend" },
  { name: "photonmatters-26", owner: "digibranders", language: "TypeScript", homepage: "https://photonmatters-26.vercel.app", description: null, stars: 0, forks: 0, size: 18105, private: false, url: "https://github.com/digibranders/photonmatters-26" },
  { name: "stylobliss-SAAS-landing-page", owner: "digibranders", language: "TypeScript", homepage: "https://stylobliss-landing-page.vercel.app", description: null, stars: 0, forks: 0, size: 4443, private: false, url: "https://github.com/digibranders/stylobliss-SAAS-landing-page" },
];

export const factByName = new Map(repoFacts.map((r) => [r.name, r]));

/** Languages present, most repositories first. */
export const LANGUAGES = Array.from(
  repoFacts.reduce((m, r) => m.set(r.language, (m.get(r.language) ?? 0) + 1), new Map<string, number>()),
).sort((a, b) => b[1] - a[1]);
