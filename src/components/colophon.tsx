"use client";

import { useState } from "react";
import { facts, subject } from "@/data/record";
import { ChapterHead, Cite, Reveal, Rule, Shell } from "./primitives";

type Status = "idle" | "sending" | "sent" | "failed";

/** Contact. A real form, with the direct address always visible beside it so
 *  a failed POST never costs the reader the ability to make contact. */
function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
        }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  const field =
    "u-mono w-full border-0 border-b border-rule bg-transparent py-3 text-[0.9rem] text-ink placeholder:text-ink-3 focus:border-oxide focus:outline-none focus:ring-0";

  return (
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <span className="u-label u-label-ink">Direct</span>
        <ul className="mt-4 space-y-2.5">
          <li>
            <a className="u-link u-mono text-[0.85rem]" href={`mailto:${subject.email}`}>
              {subject.email}
            </a>
          </li>
          <li>
            <a
              className="u-link u-mono text-[0.85rem]"
              href={subject.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              github.com/{subject.handle}
            </a>
          </li>
          <li>
            <a
              className="u-link u-mono text-[0.85rem]"
              href={subject.linkedin}
              target="_blank"
              rel="noreferrer noopener"
            >
              linkedin.com/in/gauravjadhav007
            </a>
          </li>
          <li>
            <a className="u-link u-mono text-[0.85rem]" href="/resume/resume.pdf">
              Curriculum vitae (PDF)
            </a>
          </li>
        </ul>
      </div>

      <form onSubmit={onSubmit} className="lg:col-span-8">
        <span className="u-label u-label-ink">Or write here</span>
        <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">Your name</span>
            <input name="name" required autoComplete="name" placeholder="Name" className={field} />
          </label>
          <label className="block">
            <span className="sr-only">Your email address</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className={field}
            />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="sr-only">Message</span>
          <textarea name="message" required rows={4} placeholder="Message" className={`${field} resize-y`} />
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-6">
          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            className="u-mono border border-ink px-7 py-3 text-[0.6875rem] uppercase tracking-[0.15em] transition-colors duration-200 hover:border-oxide hover:bg-oxide hover:text-paper disabled:opacity-40"
          >
            {status === "sending" ? "Sending" : status === "sent" ? "Sent" : "Send"}
          </button>
          <p aria-live="polite" className="u-label">
            {status === "sent" && "Received. He will reply from the address above."}
            {status === "failed" && (
              <>
                Did not send. Use{" "}
                <a className="u-link text-oxide" href={`mailto:${subject.email}`}>
                  {subject.email}
                </a>
                .
              </>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}

/**
 * Colophon.
 *
 * The verifiable biography, the contact, and an account of how the page was
 * made — including the decisions not taken. A record that documents its own
 * construction is consistent with the thing it describes.
 */
export function Colophon() {
  return (
    <section id="colophon" className="scroll-mt-16 py-24 sm:py-32" aria-labelledby="colophon-title">
      <Shell>
        <ChapterHead index="06" kicker="Colophon" title="On paper, and how this was made." />

        {/* The verifiable biography. Short, because only this much is verifiable. */}
        <ol className="mt-16">
          {facts.map((f, i) => (
            <Reveal
              as="li"
              key={f.title}
              delay={i * 60}
              className="grid gap-x-8 gap-y-2 border-t border-rule py-6 lg:grid-cols-[10rem_1fr]"
            >
              <div className="u-label u-label-ink">{f.period}</div>
              <div>
                <h3 className="text-[1.05rem] leading-snug">{f.title}</h3>
                <p className="mt-2 max-w-[42rem] text-[0.92rem] leading-[1.6] text-ink-2">
                  {f.detail}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-4">
                  {f.sources.map((s) => (
                    <Cite key={s.label} source={s} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <Rule strong className="mt-4" />

        <div className="mt-20">
          <Contact />
        </div>

        {/* Method. */}
        <Reveal className="mt-24 border-t border-rule pt-8">
          <div className="grid gap-x-8 gap-y-8 lg:grid-cols-[10rem_1fr]">
            <span className="u-label u-label-ink">Method</span>
            <div>
              <div className="u-prose">
                <p className="text-[0.95rem] leading-[1.65] text-ink-2">
                  Sources: the GitHub commit search API and repository trees for
                  the account <span className="u-mono">jadhavgaurav</span>, read on
                  29 August 2026; the READMEs and working trees of the
                  repositories cited; the published paper; and a curriculum vitae
                  supplied by the subject. Where the CV and the commit record
                  disagreed, the commit record was taken.
                </p>
                <p className="mt-4 text-[0.95rem] leading-[1.65] text-ink-2">
                  Built with Next.js and Tailwind. Two typefaces: Newsreader,
                  a reading face carrying both the display and the text sizes,
                  and JetBrains Mono, restricted to data — paths, counts, dates,
                  enum values — so it never becomes decoration. Newsreader ships
                  without its optical-size axis, which costs a little refinement
                  at display sizes and halves the font payload to 300 KB. The
                  palette is two pigments on a bone ground: iron-oxide red for
                  what is attested, ochre for what is interpreted, and an outline
                  with nothing inside it for what is not claimed.
                </p>
                <p className="mt-4 text-[0.95rem] leading-[1.65] text-ink-2">
                  There is no 3D on this page. A WebGL scene was considered for
                  the chronology and rejected: the record is a dense
                  two-dimensional time series, and a canvas plate reads it more
                  precisely, loads faster and survives on a mid-range phone. The
                  chronology is the only inverted section in the document,
                  because a dense trace reads better as light marks on dark, and
                  because an effect used once means something.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Rule className="mt-20" />
        <div className="flex flex-wrap items-baseline justify-between gap-4 pt-5">
          <span className="u-label">
            {subject.filedAs} · {subject.located}
          </span>
          <span className="u-label">
            Record opened {subject.accountOpened} · last entry {subject.lastEntry}
          </span>
        </div>
      </Shell>
    </section>
  );
}
