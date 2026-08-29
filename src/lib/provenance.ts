/**
 * The evidence model.
 *
 * Every factual statement rendered on this site is a `Claim`. A claim carries
 * its own class and, where the class is `attested`, the source that supports it.
 * There is no path through the UI that renders an unsourced assertion of fact —
 * `read` claims are labelled as interpretation, and `unclaimed` entries exist
 * precisely to name what the record does not support.
 */

export type EvidenceClass =
  /** Traceable to a public commit, file, DOI or URL. */
  | "attested"
  /** A pattern read across the record. Argued, not proven. */
  | "read"
  /** A thing a portfolio would normally assert, that the record cannot support. */
  | "unclaimed";

export type SourceKind = "repo" | "file" | "commit" | "doi" | "url" | "document";

export interface Source {
  kind: SourceKind;
  /** Short human label, e.g. `PROJECT-VICTUS/backend/src/policy/engine.py` */
  label: string;
  href?: string;
}

export interface Claim {
  id: string;
  /** The statement itself, plain and unembellished. */
  text: string;
  evidence: EvidenceClass;
  sources?: Source[];
  /** For `unclaimed`: why the record cannot support it. */
  note?: string;
}

export const GH = "https://github.com/jadhavgaurav";

export const repo = (name: string): Source => ({
  kind: "repo",
  label: name,
  href: `${GH}/${name}`,
});

export const file = (name: string, path: string, branch = "main"): Source => ({
  kind: "file",
  label: `${name}/${path}`,
  href: `${GH}/${name}/blob/${branch}/${path}`,
});

export const link = (label: string, href: string): Source => ({
  kind: "url",
  label,
  href,
});

export const EVIDENCE_LABEL: Record<EvidenceClass, string> = {
  attested: "Attested",
  read: "Read",
  unclaimed: "Not claimed",
};

export const EVIDENCE_DEFINITION: Record<EvidenceClass, string> = {
  attested: "Traceable to a public commit, file, DOI or published page.",
  read: "A pattern read across the record. Argued, not proven.",
  unclaimed: "The record does not support it, so it is not asserted.",
};
