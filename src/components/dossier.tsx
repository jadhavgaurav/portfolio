"use client";

import { useEffect, useRef } from "react";
import {
  gateStudies,
  limeExample,
  metrics,
  policyTable,
  type Exhibit,
} from "@/data/exhibits";
import { UI } from "@/world/palette";
import type { Entity } from "@/world/telemetry";

/**
 * FOCUS.
 *
 * The fourth verb: deliberate attention on one structure, deeper than
 * APPROACH. The record that was previously a separate document now opens
 * here, in the world, at the structure it describes — and each project is
 * still shown through the instrument it actually contains rather than as a
 * uniform card.
 */

function Apparatus({ kind }: { kind: Exhibit["kind"] }) {
  if (kind === "policy") {
    return (
      <Block label="Policy engine · every tool call passes through this">
        <table className="w-full border-collapse text-left">
          <tbody className="u-mono text-[0.7rem]">
            {policyTable.map((r) => (
              <tr key={r.risk} style={{ borderTop: `1px solid ${UI.border}` }}>
                <td className="py-2 pr-4" style={{ color: UI.textSecondary }}>
                  {r.risk}
                </td>
                <td
                  className="py-2 pr-4"
                  style={{ color: r.executes ? UI.textHighlight : "#d8613c" }}
                >
                  {r.decision}
                </td>
                <td className="py-2" style={{ color: UI.textMuted }}>
                  {r.example}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>
    );
  }

  if (kind === "gate") {
    const revised = gateStudies.filter((s) => s.revisions).length;
    return (
      <Block
        label={`Pre-production gate · ${gateStudies.length} studies · ${revised} were sent back`}
      >
        <ul className="grid gap-x-6 sm:grid-cols-2">
          {gateStudies.map((s) => (
            <li
              key={s.n}
              className="flex items-baseline gap-2 py-1.5"
              style={{ borderBottom: `1px solid ${UI.border}` }}
            >
              <span className="u-mono text-[0.65rem]" style={{ color: UI.textMuted }}>
                {s.n}
              </span>
              <span className="flex-1 text-[0.85rem]" style={{ color: UI.textSecondary }}>
                {s.name}
              </span>
              {s.revisions ? (
                <span className="u-mono text-[0.6rem]" style={{ color: "#c39a3a" }}>
                  ×{s.revisions + 1}
                </span>
              ) : null}
              <span className="u-mono text-[0.6rem]" style={{ color: "#8cbcae" }}>
                {s.verdict}
              </span>
            </li>
          ))}
        </ul>
        <p
          className="u-serif-italic mt-5 text-[0.95rem]"
          style={{ color: UI.textHighlight }}
        >
          “No implementation is approved solely because it technically works.”
        </p>
      </Block>
    );
  }

  if (kind === "attribution") {
    const max = Math.max(...limeExample.contributions.map((c) => c.weight));
    return (
      <Block label="One decision, explained · quoted from the repository">
        <code
          className="u-mono block break-all text-[0.72rem]"
          style={{ color: UI.textMuted }}
        >
          {limeExample.url} → {limeExample.verdict}
        </code>
        <ul className="mt-4 space-y-3">
          {limeExample.contributions.map((c) => (
            <li key={c.feature}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="u-mono text-[0.7rem]" style={{ color: UI.textSecondary }}>
                  {c.feature} = {c.value}
                </span>
                <span className="u-mono text-[0.7rem]" style={{ color: "#d8613c" }}>
                  +{c.weight.toFixed(2)}
                </span>
              </div>
              <div className="mt-1.5 h-px w-full" style={{ background: UI.border }}>
                <div
                  className="h-px"
                  style={{ width: `${(c.weight / max) * 100}%`, background: "#d8613c" }}
                />
              </div>
              <div className="mt-1 text-[0.78rem]" style={{ color: UI.textMuted }}>
                {c.reading}
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          {metrics.map((m) => (
            <div key={m.k}>
              <dt className="u-mono text-[0.6rem] uppercase tracking-[0.14em]" style={{ color: UI.textMuted }}>
                {m.k}
              </dt>
              <dd className="u-mono text-[0.85rem]" style={{ color: UI.textHighlight }}>
                {m.v}
              </dd>
            </div>
          ))}
        </dl>
      </Block>
    );
  }

  if (kind === "pipeline") {
    const stages = [
      "DVC, versioned to Google Cloud Storage",
      "VGG16 transfer learning, Keras",
      "MLflow via DagsHub, model registered",
      "Docker image, pushed to Docker Hub",
      "Flask under Gunicorn, behind Nginx on EC2",
      "GitHub Actions, on change",
    ];
    return (
      <Block label="The chain · each stage exists so the next can be re-derived">
        <ol>
          {stages.map((s, i) => (
            <li
              key={s}
              className="flex gap-3 py-2"
              style={{ borderBottom: `1px solid ${UI.border}` }}
            >
              <span className="u-mono text-[0.65rem]" style={{ color: "#d8613c" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[0.85rem]" style={{ color: UI.textSecondary }}>
                {s}
              </span>
            </li>
          ))}
        </ol>
      </Block>
    );
  }

  return null;
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h4
        className="u-mono text-[0.6rem] uppercase tracking-[0.2em]"
        style={{ color: UI.textMuted }}
      >
        {label}
      </h4>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Dossier({
  exhibit,
  entity,
  onClose,
}: {
  exhibit: Exhibit;
  entity: Entity | null;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  /* onClose is a fresh closure on every render of the experience, and the
     experience re-renders on every scroll frame. With it in the dependency
     list the whole modal effect tore down and set up sixty times a second:
     focus was yanked back to the panel continuously, the scroll lock was
     toggled on and off, and the element it had memorised to return focus to
     was whatever happened to be focused a frame ago. The effect must run
     once, so the handler is read through a ref. */
  const close = useRef(onClose);
  close.current = onClose;

  /**
   * Modal behaviour, which this was declaring but not doing: it said
   * aria-modal and then left focus on <body>, let Tab walk out into the world
   * behind it, and dropped focus on the floor when it closed. A dialog takes
   * focus, keeps it, and gives it back.
   */
  useEffect(() => {
    /* Not document.activeElement: the control that opened this record is
       unmounted in the same commit that mounts the record, so by the time
       this runs the active element has already fallen back to <body>, and
       returning focus there is the bug this was written to fix. */
    const here = document.activeElement as HTMLElement | null;
    const opener = here && here !== document.body && here !== document.documentElement ? here : null;
    const focusable = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) {
        e.preventDefault();
        panel.current?.focus();
        return;
      }
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

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      /* Back to whatever opened it — but the control that opened it is
         unmounted while this record is up, so by the time we get here the
         stored element is detached and focusing it drops focus on <body>.
         Wait a frame for the world's chrome to come back, then aim at the
         same control, falling back to the index. */
      requestAnimationFrame(() => {
        const back =
          (opener?.isConnected ? opener : null) ??
          document.querySelector<HTMLElement>('[data-focus-return="record"]') ??
          document.querySelector<HTMLElement>('[data-focus-return="index"]');
        back?.focus();
      });
    };
  }, []);

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={`${exhibit.title} — record`}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
      style={{ background: "rgba(6,8,9,0.97)", backdropFilter: "blur(2px)" }}
    >
      <div className="mx-auto max-w-[46rem] px-5 py-8 sm:px-10 sm:py-14">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div
              className="u-mono text-[0.6rem] uppercase tracking-[0.22em]"
              style={{ color: UI.textMuted }}
            >
              Focus · {entity?.type ?? "record"}
              {entity ? ` · ${entity.commits} commits` : ""}
            </div>
            <h2
              className="u-display mt-3 text-[clamp(1.7rem,5vw,2.8rem)] leading-[1.04]"
              style={{ color: UI.textPrimary }}
            >
              {exhibit.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="u-mono inline-flex min-h-[44px] shrink-0 items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em] transition-colors"
            style={{ borderColor: UI.border, color: UI.textSecondary }}
          >
            Close
          </button>
        </div>

        <p
          className="mt-5 max-w-[38rem] text-[1rem] leading-[1.55]"
          style={{ color: UI.textSecondary }}
        >
          {exhibit.standfirst}
        </p>
        <div
          className="u-mono mt-4 text-[0.65rem] tracking-[0.06em]"
          style={{ color: UI.textMuted }}
        >
          {exhibit.period} · {exhibit.status}
        </div>

        <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {exhibit.reading.map((r) => (
            <div key={r.q}>
              <dt
                className="u-mono pt-4 text-[0.6rem] uppercase tracking-[0.18em]"
                style={{ borderTop: `1px solid ${UI.border}`, color: UI.textMuted }}
              >
                {r.q}
              </dt>
              <dd className="mt-3 text-[0.9rem] leading-[1.6]" style={{ color: UI.textSecondary }}>
                {r.a}
              </dd>
            </div>
          ))}
        </dl>

        <Apparatus kind={exhibit.kind} />

        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3">
          {exhibit.stack.map((g) => (
            <div key={g.group}>
              <div
                className="u-mono text-[0.6rem] uppercase tracking-[0.18em]"
                style={{ color: UI.textMuted }}
              >
                {g.group}
              </div>
              <div className="u-mono mt-1 text-[0.7rem]" style={{ color: UI.textSecondary }}>
                {g.items.join(" · ")}
              </div>
            </div>
          ))}
        </div>

        <section
          className="mt-10 pt-5"
          style={{ borderTop: `1px solid ${UI.border}` }}
        >
          <h4
            className="u-mono text-[0.6rem] uppercase tracking-[0.2em]"
            style={{ color: "#c39a3a" }}
          >
            Not demonstrated
          </h4>
          <p className="mt-3 max-w-[38rem] text-[0.85rem] leading-[1.6]" style={{ color: UI.textMuted }}>
            {exhibit.limit}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 pb-4">
          {exhibit.sources.map((s) =>
            s.href ? (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="u-mono text-[0.65rem] underline-offset-4 hover:underline"
                style={{ color: UI.textSecondary }}
              >
                {s.label}
              </a>
            ) : (
              <span key={s.label} className="u-mono text-[0.65rem]" style={{ color: UI.textMuted }}>
                {s.label}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
