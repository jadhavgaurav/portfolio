import { exhibits } from "@/data/exhibits";
import { lineage } from "@/data/lineage";
import { subject, unclaimed } from "@/data/record";
import { DISCOVERIES } from "@/world/discovery";
import { entities } from "@/world/telemetry";

/**
 * The text layer.
 *
 * Not a page and not a second design — nobody navigates to this. It exists
 * for two cases only: a browser that cannot run WebGL, and a screen reader,
 * which needs the world's content as a document because it cannot perceive
 * the world. Kept deliberately plain and short.
 */
/**
 * `interactive` is false when this is the screen-reader copy behind a running
 * world. Its four contact links are invisible on screen but still focusable,
 * so a sighted keyboard visitor had to tab through eight dead stops before
 * reaching a single control they could see. The addresses are written out as
 * text instead — nothing is lost to a reader — and the world's own index
 * carries the same four as real, visible links.
 */
export function TextFallback({ interactive = true }: { interactive?: boolean }) {
  const commits = entities.reduce((n, e) => n + e.commits, 0);
  const link = (href: string, label: string, spoken?: string) =>
    interactive ? (
      <a href={href} style={{ color: "#e2e8f0" }}>
        {label}
      </a>
    ) : (
      <span>{spoken ?? label}</span>
    );

  return (
    <main
      id="record"
      tabIndex={-1}
      style={{
        maxWidth: "46rem",
        margin: "0 auto",
        padding: "3rem 1.5rem 5rem",
        color: "#c8c8c8",
        fontFamily: "var(--font-text), Georgia, serif",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "1.9rem", lineHeight: 1.15, margin: 0 }}>
        {subject.name}
      </h1>
      <p style={{ color: "#9eaab0", marginTop: "0.5rem" }}>
        {subject.role} — {subject.employer}. {subject.located}.
      </p>

      <p style={{ marginTop: "2rem" }}>
        This site is normally a 3D world generated from {entities.length}{" "}
        repositories and {commits} commits, which your browser cannot render.
        The same content follows as text.
      </p>

      <h2 style={{ fontSize: "1.15rem", marginTop: "2.5rem" }}>Work</h2>
      <ul style={{ paddingLeft: "1.1rem" }}>
        {exhibits.map((e) => (
          <li key={e.id} style={{ marginTop: "1rem" }}>
            <strong>{e.title}</strong> — {e.standfirst}
            <br />
            <span style={{ color: "#9eaab0", fontSize: "0.92rem" }}>
              {e.period}. {e.reading[0]?.a}
            </span>
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: "1.15rem", marginTop: "2.5rem" }}>
        What the world shows
      </h2>
      <ul style={{ paddingLeft: "1.1rem" }}>
        {DISCOVERIES.map((d) => (
          <li key={d.lens} style={{ marginTop: "0.6rem" }}>
            <strong>{d.lens}</strong> — {d.because}
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: "1.15rem", marginTop: "2.5rem" }}>
        One idea, {lineage.length} times
      </h2>
      <p style={{ color: "#9eaab0" }}>
        A personal assistant, begun and abandoned and begun again between
        September 2024 and January 2026: {lineage.map((a) => a.name).join(", ")}.
        Six went nowhere. What made the last one different was a decision about
        who is allowed to authorise an action.
      </p>

      <h2 style={{ fontSize: "1.15rem", marginTop: "2.5rem" }}>Not claimed</h2>
      <ul style={{ paddingLeft: "1.1rem", color: "#9eaab0" }}>
        {unclaimed.map((c) => (
          <li key={c.id} style={{ marginTop: "0.5rem" }}>
            {c.text} {c.note}
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: "1.15rem", marginTop: "2.5rem" }}>Contact</h2>
      <ul style={{ paddingLeft: "1.1rem" }}>
        <li>{link(`mailto:${subject.email}`, subject.email)}</li>
        <li>{link(subject.github, `github.com/${subject.handle}`)}</li>
        <li>{link(subject.linkedin, "LinkedIn", `LinkedIn: ${subject.linkedin}`)}</li>
        <li>
          {link("/resume/resume.pdf", "Curriculum vitae", "Curriculum vitae at /resume/resume.pdf")}
        </li>
      </ul>
    </main>
  );
}
