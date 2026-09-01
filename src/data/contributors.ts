import { districtFor } from "@/world/language";

/**
 * The other real people (and AI tools) in the record.
 *
 * repo-facts.ts and ledger.ts are both scoped to commits Gaurav authored
 * himself — that is what the structures are built from, and it has to stay
 * that way or a district's size stops meaning what the rest of the game
 * says it means. But he did not build the digibranders repos alone, and
 * pretending otherwise once their names are visible in the world would be
 * its own kind of dishonesty. This is the layer that puts the rest of the
 * team in the world too — as people walking through it, not as buildings.
 *
 * Every entry here is a real GitHub identity found in commit history across
 * the 32 digibranders repositories that made the activity bar, restricted to
 * commits that are not Gaurav's own three git identities and not a bot.
 * Four unlinked git names too generic to attribute confidently to one person
 * on their own ("Fynix", "OyeChats", a bare "Dev") were left out rather than
 * guessed at; a handful of obvious casing/shorthand duplicates ("Dhruv jain"
 * / "Dhruv Jain", "saikumargandhi" / "Sai-Kumar-Gandhi") were merged. Gathered
 * 2026-09-01, names and GitHub logins only — no email address was collected
 * or is stored anywhere in this file.
 */

export interface RepoCredit {
  repo: string;
  commits: number;
  language: string;
}

export interface Contributor {
  name: string;
  /** Null for a handful of unlinked git identities with no GitHub account
   *  resolved on any of their commits — a real person, just not a clickable
   *  one. */
  login: string | null;
  totalCommits: number;
  primaryRepo: string;
  primaryLanguage: string;
  repos: RepoCredit[];
}

export const contributors: Contributor[] = [
  { name: "sharfudeen", login: "sharfudeen", totalCommits: 222, primaryRepo: "cleanstart_ui", primaryLanguage: "TypeScript", repos: [{ repo: "cleanstart_ui", commits: 56, language: "TypeScript" }, { repo: "alsonotify_frontend_nextjs_v14.2.14", commits: 54, language: "TypeScript" }, { repo: "eventus-partner-portal-frontend", commits: 51, language: "TypeScript" }, { repo: "cleanstart_repo_ui_temp", commits: 26, language: "TypeScript" }, { repo: "eventus_report_backend", commits: 13, language: "EJS" }, { repo: "alsonotify_website_new", commits: 9, language: "TypeScript" }, { repo: "eventus_report_frontend", commits: 6, language: "TypeScript" }, { repo: "alsonotify_backend-yusuf", commits: 4, language: "TypeScript" }, { repo: "currycook_frontend", commits: 1, language: "TypeScript" }, { repo: "partner_portal_backend", commits: 1, language: "Go" }, { repo: "currycook_backend", commits: 1, language: "TypeScript" }] },
  { name: "56steve", login: "56steve", totalCommits: 91, primaryRepo: "fynix-digital-v2", primaryLanguage: "TypeScript", repos: [{ repo: "fynix-digital-v2", commits: 31, language: "TypeScript" }, { repo: "gkrhospitality-website", commits: 18, language: "TypeScript" }, { repo: "oyechats-website", commits: 15, language: "TypeScript" }, { repo: "oye-chats-platform", commits: 9, language: "Python" }, { repo: "alfeco-foundation-web", commits: 8, language: "TypeScript" }, { repo: "oyechats-website-v2", commits: 6, language: "TypeScript" }, { repo: "fynix-digital-web-legacy", commits: 3, language: "TypeScript" }, { repo: "oyechats-admin", commits: 1, language: "HTML" }] },
  { name: "yusufshaikhai", login: "yusufshaikhai", totalCommits: 87, primaryRepo: "alsonotify_backend-yusuf", primaryLanguage: "TypeScript", repos: [{ repo: "alsonotify_backend-yusuf", commits: 49, language: "TypeScript" }, { repo: "partner_portal_backend", commits: 24, language: "Go" }, { repo: "alsonotify_frontend_nextjs_v14.2.14", commits: 5, language: "TypeScript" }, { repo: "eventus_report_frontend", commits: 4, language: "TypeScript" }, { repo: "eventus_report_backend", commits: 3, language: "EJS" }, { repo: "eventus-partner-portal-frontend", commits: 2, language: "TypeScript" }] },
  { name: "Dev Suthar", login: null, totalCommits: 24, primaryRepo: "cleanstart_ui", primaryLanguage: "TypeScript", repos: [{ repo: "cleanstart_ui", commits: 24, language: "TypeScript" }] },
  { name: "Manojakkaldevi", login: "Manojakkaldevi", totalCommits: 21, primaryRepo: "fynix-digital-web-legacy", primaryLanguage: "TypeScript", repos: [{ repo: "fynix-digital-web-legacy", commits: 15, language: "TypeScript" }, { repo: "currycook_frontend", commits: 5, language: "TypeScript" }, { repo: "alsonotify_frontend_nextjs_v14.2.14", commits: 1, language: "TypeScript" }] },
  { name: "Dhruv Mistry", login: null, totalCommits: 21, primaryRepo: "cleanstart_ui", primaryLanguage: "TypeScript", repos: [{ repo: "cleanstart_ui", commits: 21, language: "TypeScript" }] },
  { name: "KarthikaThiruvengatam", login: "KarthikaThiruvengatam", totalCommits: 17, primaryRepo: "alsonotify_website_new", primaryLanguage: "TypeScript", repos: [{ repo: "alsonotify_website_new", commits: 17, language: "TypeScript" }] },
  { name: "Dhruv Jain", login: null, totalCommits: 8, primaryRepo: "cleanstart_ui", primaryLanguage: "TypeScript", repos: [{ repo: "cleanstart_ui", commits: 8, language: "TypeScript" }] },
  { name: "Sai Kumar Gandhi", login: "saikumargandhi", totalCommits: 8, primaryRepo: "alsonotify_frontend_nextjs_v14.2.14", primaryLanguage: "TypeScript", repos: [{ repo: "alsonotify_frontend_nextjs_v14.2.14", commits: 8, language: "TypeScript" }] },
  { name: "shaikh-rafik", login: "shaikh-rafik", totalCommits: 6, primaryRepo: "alsonotify_frontend_nextjs_v14.2.14", primaryLanguage: "TypeScript", repos: [{ repo: "alsonotify_frontend_nextjs_v14.2.14", commits: 3, language: "TypeScript" }, { repo: "alsonotify_backend-yusuf", commits: 3, language: "TypeScript" }] },
  { name: "Abdulrahim2000-1", login: "Abdulrahim2000-1", totalCommits: 5, primaryRepo: "eventus_report_backend", primaryLanguage: "EJS", repos: [{ repo: "eventus_report_backend", commits: 5, language: "EJS" }] },
  { name: "AtharvFynix", login: null, totalCommits: 3, primaryRepo: "fynix-digital-web-legacy", primaryLanguage: "TypeScript", repos: [{ repo: "fynix-digital-web-legacy", commits: 3, language: "TypeScript" }] },
];

/** Where a contributor stands, by default — the district of their
 *  heaviest-commit repository. */
export function homeDistrictFor(c: Contributor) {
  return districtFor(c.primaryLanguage);
}

export interface AITool {
  tool: "Claude" | "Jules";
  /** How the world names it — "Claude" writes code directly; Jules is
   *  Google's own coding agent, credited under its real bot identity. */
  label: string;
  totalCommits: number;
  repos: RepoCredit[];
}

export const aiTools: AITool[] = [
  { tool: "Claude", label: "Claude", totalCommits: 164, repos: [{ repo: "oye-chats-platform", commits: 51, language: "Python" }, { repo: "fynix-digital-v2", commits: 36, language: "TypeScript" }, { repo: "oyechats-mobile-app", commits: 19, language: "TypeScript" }, { repo: "alsonotify-next-app-frontend", commits: 11, language: "TypeScript" }, { repo: "alsonotify-backend", commits: 10, language: "TypeScript" }, { repo: "cleanstart-v3-next", commits: 9, language: "TypeScript" }, { repo: "alfeco-foundation-web", commits: 8, language: "TypeScript" }, { repo: "oyechats-website", commits: 7, language: "TypeScript" }, { repo: "cleanstart-web", commits: 5, language: "TypeScript" }, { repo: "oyechats-admin", commits: 4, language: "HTML" }, { repo: "oyechats-website-v2", commits: 2, language: "TypeScript" }, { repo: "cleanstart-email-signatures", commits: 1, language: "HTML" }, { repo: "stylobliss-SAAS-landing-page", commits: 1, language: "TypeScript" }] },
  { tool: "Jules", label: "Jules", totalCommits: 137, repos: [{ repo: "alsonotify-next-app-frontend", commits: 42, language: "TypeScript" }, { repo: "alsonotify-landing-page", commits: 40, language: "TypeScript" }, { repo: "alsonotify-backend", commits: 26, language: "TypeScript" }, { repo: "fynix-digital-web-legacy", commits: 15, language: "TypeScript" }, { repo: "gkrhospitality-website", commits: 14, language: "TypeScript" }] },
];
