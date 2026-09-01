"use client";

import { useEffect, useRef } from "react";
import type { Interactable } from "@/world/interactables";
import { factByName } from "@/data/repo-facts";
import { styleFor } from "@/world/language";
import { subject } from "@/data/record";
import { dayToLabel } from "@/world/telemetry";

/**
 * What opens when you interact with something.
 *
 * One panel, four contents, because the four kinds genuinely differ: a plain
 * repository is a fact sheet, a case study is an argument, employment is a
 * role, and a certification is a credential with a link to verify it. Giving
 * all four the same template would have meant padding three of them.
 */

const line = "1px solid #3a2c12";

export function InteractPanel({
  target,
  onClose,
}: {
  target: Interactable;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "KeyE") {
        e.preventDefault();
        close.current();
      }
      if (e.key !== "Tab") return;
      const items = Array.from(
        panel.current?.querySelectorAll<HTMLElement>('a[href], button') ?? [],
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const here = document.activeElement;
      if (e.shiftKey && (here === first || here === panel.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && here === last) {
        e.preventDefault();
        first.focus();
      } else if (!panel.current?.contains(here)) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.current?.focus();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const style = target.entity
    ? styleFor(target.entity.language)
    : target.contributor
      ? styleFor(target.contributor.primaryLanguage)
      : styleFor("Other");
  const fact = target.entity ? factByName.get(target.entity.name) : undefined;

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={target.title}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8 sm:py-10"
      style={{ background: "rgba(16,11,5,0.97)" }}
    >
      <div className="mx-auto max-w-[46rem]">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div
              className="u-mono text-[0.6rem] uppercase tracking-[0.22em]"
              style={{ color: style.ui }}
            >
              {target.kind === "PROJECT"
                ? "Case study"
                : target.kind === "WORK"
                  ? "Employment"
                  : target.kind === "CERT"
                    ? "Certification"
                    : target.kind === "CORE"
                      ? "The core"
                      : target.kind === "NPC"
                        ? target.aiTool
                          ? "AI collaborator"
                          : "Collaborator"
                        : "Repository"}
              {target.entity ? ` · ${styleFor(target.entity.language).label}` : ""}
            </div>
            <h2
              className="u-display mt-2 break-words text-[clamp(1.5rem,5vw,2.6rem)] leading-[1.06]"
              style={{ color: "#f3e9d2" }}
            >
              {target.title}
            </h2>
            <p className="mt-2 text-[0.92rem]" style={{ color: "#b8a678" }}>
              {target.kicker}
            </p>
          </div>
          <button
            onClick={onClose}
            className="u-mono inline-flex min-h-[44px] shrink-0 items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em]"
            style={{ borderColor: "#3a2c12", color: "#c9b98a" }}
          >
            Close
          </button>
        </div>

        {/* Repository facts, wherever there is a repository behind this. */}
        {target.entity && (
          <dl
            className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-4"
            style={{ borderColor: "#3a2c12" }}
          >
            {[
              ["Commits", String(target.entity.commits)],
              ["First", dayToLabel(target.entity.firstDay)],
              ["Last", dayToLabel(target.entity.lastDay)],
              ["Stars", String(fact?.stars ?? 0)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt
                  className="u-mono text-[0.58rem] uppercase tracking-[0.18em]"
                  style={{ color: "#8a7a52" }}
                >
                  {k}
                </dt>
                <dd className="u-mono mt-1 text-[0.9rem]" style={{ color: "#f3e9d2" }}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {fact?.description && (
          <p className="mt-6 text-[0.98rem] leading-[1.6]" style={{ color: "#d9c9a0" }}>
            {fact.description}
          </p>
        )}

        {/* A case study, in full. */}
        {target.project && (
          <div className="mt-8 space-y-8">
            <p className="text-[0.98rem] leading-[1.62]" style={{ color: "#d9c9a0" }}>
              {target.project.description}
            </p>

            <Section title="What it had to do" items={target.project.aim} />
            <Section title="What I built" items={target.project.built} />

            <div>
              <H>Stack</H>
              <div className="mt-3 space-y-3">
                {target.project.techStackDetailed.map((g) => (
                  <div key={g.category} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className="u-mono w-[6rem] shrink-0 text-[0.58rem] uppercase tracking-[0.16em]"
                      style={{ color: "#8a7a52" }}
                    >
                      {g.category}
                    </span>
                    <span className="u-mono text-[0.78rem]" style={{ color: "#e8dcb8" }}>
                      {g.stack.join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* The architecture, as the graph the data already carries. */}
            {target.project.flowData && (
              <div>
                <H>Architecture</H>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {target.project.flowData.nodes.map((n) => (
                    <li
                      key={n.id}
                      className="border px-3 py-2"
                      style={{ borderColor: "#3a2c12" }}
                    >
                      <div
                        className="u-mono text-[0.72rem]"
                        style={{ color: "#f3e9d2" }}
                      >
                        {n.data.title}
                      </div>
                      <div
                        className="u-mono text-[0.6rem] uppercase tracking-[0.14em]"
                        style={{ color: "#b8a678" }}
                      >
                        {n.data.label}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {target.project.engineeringDecisions.length > 0 && (
              <div>
                <H>Decisions</H>
                <div className="mt-3 space-y-5">
                  {target.project.engineeringDecisions.map((d) => (
                    <div key={d.decision} className="border-l pl-4" style={{ borderColor: "#3a2c12" }}>
                      <div className="text-[0.92rem]" style={{ color: "#f3e9d2" }}>
                        {d.decision}
                      </div>
                      <p className="mt-1 text-[0.86rem] leading-[1.55]" style={{ color: "#b8a678" }}>
                        {d.why} <span style={{ color: "#d9c9a0" }}>{d.impact}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Section title="Results" items={target.project.results} />
            <Section title="Security" items={target.project.security} />
          </div>
        )}

        {/* A certification. */}
        {target.cert && (
          <div className="mt-8">
            <div className="flex flex-wrap gap-2">
              {target.cert.tags.map((t) => (
                <span
                  key={t}
                  className="u-mono border px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em]"
                  style={{ borderColor: "#3a2c12", color: "#c9b98a" }}
                >
                  {t}
                </span>
              ))}
            </div>
            {target.cert.skillsCovered && (
              <Section title="Covered" items={target.cert.skillsCovered} />
            )}
          </div>
        )}

        {target.kind === "CORE" && (
          <p className="mt-7 text-[0.98rem] leading-[1.62]" style={{ color: "#d9c9a0" }}>
            {subject.role}. {subject.employer}. {subject.located}. Everything in
            this world is verifiable: every structure is a repository, its mass
            is its commit count, its decay is the time since it was last
            touched.
          </p>
        )}

        {/* A real collaborator or AI tool — commit history across the
            digibranders repositories they actually touched, not a bio. */}
        {(target.contributor || target.aiTool) && (
          <div className="mt-8">
            <p className="text-[0.92rem] leading-[1.6]" style={{ color: "#d9c9a0" }}>
              {target.contributor
                ? "One of the people who built digibranders' own products alongside him — real commits, on real repositories in this world."
                : "An AI tool with a real, measurable hand in digibranders' commit history — not a decoration."}
            </p>
            <H>Repositories</H>
            <ul className="mt-3 space-y-2">
              {(target.contributor?.repos ?? target.aiTool?.repos ?? []).map((r) => (
                <li
                  key={r.repo}
                  className="flex items-center justify-between gap-3 text-[0.88rem]"
                  style={{ color: "#d9c9a0" }}
                >
                  <span className="u-mono truncate" style={{ color: "#f3e9d2" }}>
                    {r.repo}
                  </span>
                  <span
                    className="u-mono shrink-0 text-[0.72rem]"
                    style={{ color: "#8a7a52" }}
                  >
                    {r.commits} commits · {r.language}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links out. The whole point of walking to a thing. */}
        <div
          className="mt-9 flex flex-wrap items-center gap-3 border-t pt-6"
          style={{ borderColor: "#3a2c12" }}
        >
          {fact?.homepage && (
            <Link href={fact.homepage} primary>
              Open the live site
            </Link>
          )}
          {fact?.url && <Link href={fact.url}>View on GitHub</Link>}
          {target.contributor?.login && (
            <Link href={`https://github.com/${target.contributor.login}`} primary>
              View on GitHub
            </Link>
          )}
          {target.cert && <Link href={target.cert.credentialLink} primary>Verify credential</Link>}
          {target.kind === "CORE" && (
            <>
              <Link href={`mailto:${subject.email}`} primary>
                Email
              </Link>
              <Link href={subject.github}>GitHub</Link>
              <Link href={subject.linkedin}>LinkedIn</Link>
              <Link href="/resume/resume.pdf">Curriculum vitae</Link>
            </>
          )}
          {target.project?.links.demo && (
            <Link href={target.project.links.demo} primary>
              Live demo
            </Link>
          )}
          {target.project && !fact && (
            <Link href={target.project.links.github}>GitHub</Link>
          )}
        </div>
      </div>
    </div>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="u-mono border-b pb-2 text-[0.58rem] uppercase tracking-[0.2em]"
      style={{ color: "#8a7a52", borderBottom: line }}
    >
      {children}
    </h3>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <H>{title}</H>
      <ul className="mt-3 space-y-2">
        {items.map((s) => (
          <li key={s} className="text-[0.92rem] leading-[1.55]" style={{ color: "#d9c9a0" }}>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Link({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel="noreferrer noopener"
      className="u-mono inline-flex min-h-[44px] items-center border px-5 text-[0.62rem] uppercase tracking-[0.16em]"
      style={
        primary
          ? { borderColor: "#ffb703", background: "#ffb703", color: "#241a08" }
          : { borderColor: "#3a2c12", color: "#e8dcb8" }
      }
    >
      {children}
    </a>
  );
}
