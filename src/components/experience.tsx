"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  OPENING_SECONDS,
  SKIPPABLE_AFTER,
  beatAt,
  nearestOnRoute,
  traversalPose,
  type Phase,
} from "@/world/sequence";
import { dayAtZ, dayToLabel } from "@/world/telemetry";
import {
  DISCOVERY_TARGETS,
  TUNING,
  discoveryFor,
  mostSalient,
  type Lens,
} from "@/world/discovery";
import { Overlay } from "./overlay";
import { Dossier } from "./dossier";
import { WorldNav } from "./world-nav";
import { EXHIBIT_BY_ENTITY } from "@/data/exhibits";
import type { Entity } from "@/world/telemetry";

const World = dynamic(() => import("@/world/World"), {
  ssr: false,
  loading: () => <Booting />,
});

/**
 * The one thing shown before the world exists.
 *
 * Not a spinner: a spinner says a page is loading. This says a place is being
 * assembled, and it is the same ground colour and the same mono voice the
 * world uses, so nothing about the first paint contradicts what follows.
 */
function Booting() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-12">
      <p
        className="u-mono text-[0.625rem] uppercase tracking-[0.24em]"
        style={{ color: "#5c6a6e", animation: "null-breathe 2.4s ease-in-out infinite" }}
      >
        Assembling the record
      </p>
    </div>
  );
}

/**
 * Capability probe. A failed context means the written record is served
 * instead. A software renderer — SwiftShader, llvmpipe, an unaccelerated VM —
 * still gets the world, but starts on the cheap tier rather than discovering
 * the hard way that it cannot afford ambient occlusion.
 */
function probe(): { webgl: boolean; software: boolean } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { webgl: false, software: false };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)).toLowerCase()
      : "";
    const software = /swiftshader|llvmpipe|software|basic render|microsoft basic/.test(renderer);
    return { webgl: true, software };
  } catch {
    return { webgl: false, software: false };
  }
}

/** Total scroll length of the traverse. Long enough that the camera moves
 *  slowly — the camera language calls for under 6 units per second. */
const SCROLL_VH = 940;

export function Experience({
  fallback,
  srCopy,
}: {
  /** Served whole when there is no WebGL: a real document, with real links. */
  fallback: React.ReactNode;
  /** The same record, kept in the accessibility tree behind the world, with
   *  its links flattened to text so they are not invisible tab stops. */
  srCopy: React.ReactNode;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [phase, setPhase] = useState<Phase>("VOID");
  const [t, setT] = useState(0);
  const [scroll, setScroll] = useState(0);
  const scrollRef = useRef(0);
  const discoveredRef = useRef<string[]>([]);
  const raf = useRef<number | null>(null);

  /* Discovery state. `discovered` is irreversible once written, per the
     design: DISCOVER is the only stage that cannot be undone. */
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [noticing, setNoticing] = useState<{ id: string; progress: number } | null>(null);
  const [reward, setReward] = useState<{ lens: Lens; grants: string; entity: string } | null>(null);
  const investigation = useRef<{ id: string; t: number } | null>(null);
  /* The mechanic is taught once, the first time the world offers it, and then
     never again. A rule stated before it can be used is a rule nobody reads. */
  const [taught, setTaught] = useState(false);
  const taughtRef = useRef(false);

  /* FOCUS: the record for a structure, opened where the visitor stands. */
  const [focused, setFocused] = useState<Entity | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const openIndex = useCallback((v: boolean) => setIndexOpen(v), []);
  const startedAt = useRef<number | null>(null);
  const skipped = useRef(false);
  /* Whether the skip has been offered yet. Control rule C2 already allowed the
     opening to be interrupted; nothing said so, which is the same as it not
     being there. */
  const [canSkip, setCanSkip] = useState(false);

  /* Capability and preference detection. */
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    setReduced(rm.matches);
    const cap = probe();
    setQuality(
      cap.software || coarse.matches || window.innerWidth < 900 ? "low" : "high",
    );
    setSupported(cap.webgl);
    const onChange = () => setReduced(rm.matches);
    rm.addEventListener("change", onChange);
    return () => rm.removeEventListener("change", onChange);
  }, []);

  /* The authored opening. Reduced motion skips straight to arrival. */
  useEffect(() => {
    if (supported !== true) return;
    if (reduced) {
      setPhase("PLAYER");
      setT(1);
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const tick = (now: number) => {
      if (startedAt.current === null) startedAt.current = now;
      const elapsed = (now - startedAt.current) / 1000;
      if (skipped.current || elapsed >= OPENING_SECONDS) {
        setPhase("PLAYER");
        setT(1);
        document.body.style.overflow = "";
        return;
      }
      const b = beatAt(elapsed);
      setPhase(b.phase);
      setT(b.t);
      if (elapsed >= SKIPPABLE_AFTER) setCanSkip(true);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      document.body.style.overflow = "";
    };
  }, [supported, reduced]);

  /* Control rule C2: any input hands authority back. Not before SIGNAL, so
     the opening is never skipped by the scroll position a browser restores. */
  const skip = useCallback(() => {
    if (startedAt.current === null) return;
    const elapsed = (performance.now() - startedAt.current) / 1000;
    if (elapsed < SKIPPABLE_AFTER) return;
    skipped.current = true;
  }, []);

  useEffect(() => {
    if (supported !== true || reduced) return;
    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener("wheel", skip, opts);
    window.addEventListener("touchstart", skip, opts);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [supported, reduced, skip]);

  /* The discovery loop. Salience is evaluated against the camera each frame
     while the visitor has authority; sustained attention resolves an entity
     and grants its lens. */
  useEffect(() => {
    if (supported !== true || phase !== "PLAYER") return;
    let raf2 = 0;
    let last = performance.now();

    const frame = (now: number) => {
      // Clamped so a stalled tab cannot jump the investigation, but loose
      // enough that a slow device does not demand four times the attention.
      const dt = Math.min(0.2, (now - last) / 1000);
      last = now;

      const pose = traversalPose(scrollRef.current);
      const [cx, , cz] = pose.position;
      const hx = pose.lookAt[0] - cx;
      const hz = pose.lookAt[2] - cz;
      const hl = Math.hypot(hx, hz) || 1;

      const seen = new Set(discoveredRef.current);
      const hit = mostSalient(cx, cz, hx / hl, hz / hl, seen);

      if (hit && discoveryFor(hit.entity.id) && !seen.has(hit.entity.id)) {
        const cur = investigation.current;
        const inv =
          cur && cur.id === hit.entity.id ? cur : { id: hit.entity.id, t: 0 };
        inv.t += dt;
        investigation.current = inv;
        const p = Math.min(1, inv.t / TUNING.investigateSeconds);
        // Quantised: a new object every frame re-rendered the whole tree
        // sixty times a second for no visible gain.
        const step = Math.round(p * 24) / 24;
        setNoticing((prev) =>
          prev && prev.id === hit.entity.id && prev.progress === step
            ? prev
            : { id: hit.entity.id, progress: step },
        );
        if (!taughtRef.current) {
          taughtRef.current = true;
          setTaught(true);
        }

        if (p >= 1) {
          const d = discoveryFor(hit.entity.id)!;
          discoveredRef.current = [...discoveredRef.current, hit.entity.id];
          setDiscovered(discoveredRef.current);
          setReward({ lens: d.lens, grants: d.grants, entity: hit.entity.name });
          investigation.current = null;
          setNoticing(null);
        }
      } else {
        // Attention decays rather than snapping — the entity relaxes.
        if (investigation.current) {
          investigation.current.t -= dt * (TUNING.investigateSeconds / TUNING.relaxSeconds);
          if (investigation.current.t <= 0) investigation.current = null;
        }
        setNoticing((prev) => (prev === null ? prev : null));
      }
      raf2 = requestAnimationFrame(frame);
    };
    raf2 = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf2);
  }, [supported, phase]);

  /* The index is a full-screen surface. Leaving the page scrollable under it
     meant the world moved while the visitor was reading a list of places to
     go, and re-rendered every entry on every frame to do it. */
  useEffect(() => {
    if (!indexOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [indexOpen]);

  /* The reward beat holds briefly, then the world keeps the change. */
  useEffect(() => {
    if (!reward) return;
    const id = setTimeout(() => setReward(null), 2600);
    return () => clearTimeout(id);
  }, [reward]);

  /* Scroll drives the traverse once the visitor has authority. */
  useEffect(() => {
    if (supported !== true) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.body.scrollHeight - window.innerHeight;
        const v = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        scrollRef.current = v;
        setScroll(v);
      });
    };
    /* Position is a fraction of the route, but the browser keeps scroll in
       pixels. When the viewport height changes the route gets longer or
       shorter and the same pixel offset lands somewhere else in the world —
       measured as a 12% jump backwards on a 900 to 1200 change. On a phone
       that fires every time the address bar hides, so the world drifts under
       the visitor while they are standing still. Hold the fraction and let
       the pixels follow. */
    let maxWas = document.body.scrollHeight - window.innerHeight;
    const onResize = () => {
      const held = scrollRef.current;
      requestAnimationFrame(() => {
        const max = document.body.scrollHeight - window.innerHeight;
        if (max <= 0 || Math.abs(max - maxWas) < 1) return;
        maxWas = max;
        window.scrollTo({ top: held * max, behavior: "auto" });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [supported]);

  /* No WebGL: serve the document. It is a complete, readable version of the
     same record, not a stub. While probing, hold the ground colour so the
     opening never flashes the paper stock behind it. */
  if (supported === false) return <>{fallback}</>;
  if (supported === null)
    return (
      <div className="world-root fixed inset-0 z-0 bg-[#0d0f10]">
        <Booting />
      </div>
    );

  /* Travel: move along the same spine rather than teleporting, so position
     keeps meaning what it means. */
  const travel = (target: number) => {
    const max = document.body.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * target, behavior: "smooth" });
  };


  const z = traversalPose(scroll).position[2];
  const passing = phase === "PLAYER" ? nearestOnRoute(z) : null;
  // Prefer the date of the structure being passed; fall back to the
  // interpolated position between works.
  const day = passing ? passing.firstDay : dayAtZ(z);

  return (
    <>
      {/* The canvas carries no accessible content of its own — everything it
          shows is stated in the text layer below, which is what a screen
          reader is actually given. */}
      <div
        className="world-root fixed inset-0 z-0 bg-[#0d0f10]"
        aria-hidden="true"
        /* The sequence's current beat, so the opening can be measured from
           outside rather than inferred from what happens to be on screen. */
        data-phase={phase}
      >
        <World
          phase={phase}
          t={t}
          scroll={scroll}
          reduced={reduced}
          quality={quality}
          lenses={discovered.map((id) => discoveryFor(id)!.lens)}
          noticing={noticing}
        />
      </div>

      <Overlay
        phase={phase}
        scroll={scroll}
        passing={passing}
        dateLabel={dayToLabel(day)}
        scrollVh={SCROLL_VH}
        srCopy={srCopy}
        discovered={discovered}
        noticing={noticing}
        reward={reward}
        total={DISCOVERY_TARGETS.length}
        record={passing ? (EXHIBIT_BY_ENTITY[passing.name] ?? null) : null}
        onFocus={() => passing && setFocused(passing)}
        focusing={Boolean(focused)}
        indexOpen={indexOpen}
        canSkip={canSkip}
        onSkip={() => {
          skipped.current = true;
        }}
        taught={taught && discovered.length === 0}
      />

      {phase === "PLAYER" && !focused && (
        <WorldNav
          discovered={discovered}
          onTravel={travel}
          onFocus={setFocused}
          open={indexOpen}
          setOpen={openIndex}
          hidden={scroll > 0.948}
        />
      )}

      {focused && EXHIBIT_BY_ENTITY[focused.name] && (
        <Dossier
          exhibit={EXHIBIT_BY_ENTITY[focused.name]}
          entity={focused}
          onClose={() => setFocused(null)}
        />
      )}
    </>
  );
}
