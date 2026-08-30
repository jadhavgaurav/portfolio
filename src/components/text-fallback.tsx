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
export function TextFallback() {
  const commits = entities.reduce((n, e) => n + e.commits, 0);

  return (
    <main
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
        <li>
          <a href={`mailto:${subject.email}`} style={{ color: "#e2e8f0" }}>
            {subject.email}
          </a>
        </li>
        <li>
          <a href={subject.github} style={{ color: "#e2e8f0" }}>
            github.com/{subject.handle}
          </a>
        </li>
        <li>
          <a href={subject.linkedin} style={{ color: "#e2e8f0" }}>
            LinkedIn
          </a>
        </li>
        <li>
          <a href="/resume/resume.pdf" style={{ color: "#e2e8f0" }}>
            Curriculum vitae
          </a>
        </li>
      </ul>
    </main>
  );
}
