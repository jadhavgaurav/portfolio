"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Claim, EvidenceClass, Source } from "@/lib/provenance";
import { EVIDENCE_LABEL } from "@/lib/provenance";

/**
 * Reveal — one IntersectionObserver per element, disconnected on first hit.
 * No scroll listeners anywhere in this codebase.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  variant = "rise",
  "aria-hidden": ariaHidden,
}: {
  children: ReactNode;
  "aria-hidden"?: boolean;
  as?: "div" | "section" | "li" | "article" | "p" | "header" | "tr";
  delay?: number;
  className?: string;
  variant?: "rise" | "draw";
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-shown={shown}
      aria-hidden={ariaHidden}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${variant === "draw" ? "u-draw" : "u-rise"} ${className}`}
    >
      {children}
    </Tag>
  );
}

/** A hairline. Draws itself once when it enters the viewport. */
export function Rule({ strong = false, className = "" }: { strong?: boolean; className?: string }) {
  return (
    <Reveal
      variant="draw"
      className={`u-rule ${strong ? "u-rule-strong" : ""} ${className}`}
      aria-hidden
    >
      {null}
    </Reveal>
  );
}

/** Corner registration marks. Structural only — they mark the trim. */
export function RegistrationMarks() {
  const mark = (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="6" cy="6" r="3.25" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
  return (
    <div aria-hidden="true" className="u-noprint">
      <div className="u-reg left-[var(--gutter)] top-6 -translate-x-1/2">{mark}</div>
      <div className="u-reg right-[var(--gutter)] top-6 translate-x-1/2">{mark}</div>
    </div>
  );
}

export function EvidenceMark({ of, children }: { of: EvidenceClass; children?: ReactNode }) {
  return (
    <span className={`ev ev-${of}`}>
      {children ?? EVIDENCE_LABEL[of]}
    </span>
  );
}

/** A single source, rendered as a citation. External links open in a new tab. */
export function Cite({ source }: { source: Source }) {
  const body = <span className="u-mono text-[0.6875rem] tracking-[0.04em]">{source.label}</span>;
  if (!source.href) return <span className="text-ink-3">{body}</span>;
  return (
    <a className="u-cite" href={source.href} target="_blank" rel="noreferrer noopener">
      {body}
    </a>
  );
}

export function SourceList({ sources, label = "Source" }: { sources: Source[]; label?: string }) {
  if (!sources.length) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
      <span className="u-label">{sources.length > 1 ? `${label}s` : label}</span>
      {sources.map((s) => (
        <Cite key={s.label} source={s} />
      ))}
    </div>
  );
}

/** A claim with its evidence class and provenance shown inline. */
export function ClaimBlock({ claim, n }: { claim: Claim; n?: string }) {
  return (
    <div className="grid gap-3 border-t border-rule pt-5 sm:grid-cols-[auto_1fr] sm:gap-8">
      <div className="flex items-baseline gap-3 sm:w-32 sm:flex-col sm:items-start sm:gap-2">
        {n && <span className="u-label u-label-ink">{n}</span>}
        <EvidenceMark of={claim.evidence} />
      </div>
      <div>
        <p className="text-[0.98rem] leading-[1.6] text-ink">{claim.text}</p>
        {claim.note && <p className="mt-2 text-[0.9rem] leading-[1.6] text-ink-3">{claim.note}</p>}
        {claim.sources?.length ? (
          <div className="mt-3">
            <SourceList sources={claim.sources} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Chapter heading. The numeral sits in the margin on wide screens and inline
 * on narrow ones, which is the whole responsive strategy for the document
 * furniture: the margin becomes a line.
 */
export function ChapterHead({
  index,
  kicker,
  title,
  standfirst,
  id,
}: {
  index: string;
  kicker: string;
  title: string;
  standfirst?: string;
  id?: string;
}) {
  return (
    <header id={id} className="scroll-mt-24">
      <Reveal className="flex items-baseline gap-4">
        <span className="u-label u-label-ink tabular-nums">{index}</span>
        <span className="u-label">{kicker}</span>
      </Reveal>
      <Rule className="my-5" />
      <Reveal delay={60}>
        <h2 className="u-display text-[clamp(2rem,4.4vw,3.6rem)]">{title}</h2>
      </Reveal>
      {standfirst && (
        <Reveal delay={110}>
          <p className="u-lede u-prose mt-6">{standfirst}</p>
        </Reveal>
      )}
    </header>
  );
}

/** Page shell. One max-width, one gutter, used everywhere. */
export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-shell px-[var(--gutter)] xl:pl-[calc(var(--gutter)+8.5rem)] ${className}`}
    >
      {children}
    </div>
  );
}
