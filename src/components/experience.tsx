"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { OPENING_SECONDS, beatAt, nearest, type Phase } from "@/world/sequence";
import { traversalPose } from "@/world/sequence";
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

const World = dynamic(() => import("@/world/World"), { ssr: false });

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

export function Experience({ fallback }: { fallback: React.ReactNode }) {
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

  /* FOCUS: the record for a structure, opened where the visitor stands. */
  const [focused, setFocused] = useState<Entity | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const openIndex = useCallback((v: boolean) => setIndexOpen(v), []);
  const startedAt = useRef<number | null>(null);
  const skipped = useRef(false);

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
    if (elapsed < 1.6) return;
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

    const step = (now: number) => {
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
        setNoticing({ id: hit.entity.id, progress: p });

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
        setNoticing(null);
      }
      raf2 = requestAnimationFrame(step);
    };
    raf2 = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf2);
  }, [supported, phase]);

  /* The reward beat holds briefly, then the world keeps the change. */
  useEffect(() => {
    if (!reward) return;
    const id = setTimeout(() => setReward(null), 4200);
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
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [supported]);

  /* No WebGL: serve the document. It is a complete, readable version of the
     same record, not a stub. While probing, hold the ground colour so the
     opening never flashes the paper stock behind it. */
  if (supported === false) return <>{fallback}</>;
  if (supported === null) return <div className="world-root fixed inset-0 z-0 bg-[#0d0f10]" />;

  /* Travel: move along the same spine rather than teleporting, so position
     keeps meaning what it means. */
  const travel = (target: number) => {
    const max = document.body.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * target, behavior: "smooth" });
  };

  const z = traversalPose(scroll).position[2];
  const passing = phase === "PLAYER" ? nearest(z) : null;
  // Prefer the date of the structure being passed; fall back to the
  // interpolated position between works.
  const day = passing ? passing.firstDay : dayAtZ(z);

  return (
    <>
      <div className="world-root fixed inset-0 z-0 bg-[#0d0f10]">
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
        fallback={fallback}
        discovered={discovered}
        noticing={noticing}
        reward={reward}
        total={DISCOVERY_TARGETS.length}
        record={passing ? (EXHIBIT_BY_ENTITY[passing.name] ?? null) : null}
        onFocus={() => passing && setFocused(passing)}
        focusing={Boolean(focused)}
        indexOpen={indexOpen}
      />

      {phase === "PLAYER" && !focused && (
        <WorldNav
          discovered={discovered}
          onTravel={travel}
          onFocus={setFocused}
          open={indexOpen}
          setOpen={openIndex}
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
