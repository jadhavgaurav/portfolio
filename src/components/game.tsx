"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { makeInput, type Input, type PlayerState } from "@/world/Player";
import { useKeyboardAndPointer, PLAYER } from "@/world/Player";
import { ARRIVAL_POSE } from "@/world/sequence";
import { Joystick } from "./joystick";
import { Minimap } from "./minimap";
import { WorldMap } from "./world-map";
import { TitleScreen } from "./title-screen";
import { InteractPanel } from "./interact-panel";
import { nearestInteractable, type Interactable } from "@/world/interactables";
import { Compass } from "./compass";
import type { Waypoint } from "@/world/mapdata";

const GameCanvas = dynamic(() => import("@/world/GameCanvas"), {
  ssr: false,
  loading: () => <Booting />,
});

function Booting() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-12">
      <p
        className="u-mono text-[0.625rem] uppercase tracking-[0.24em]"
        style={{ color: "#5c6a6e", animation: "null-breathe 2.4s ease-in-out infinite" }}
      >
        Assembling the world
      </p>
    </div>
  );
}

function probe(): { webgl: boolean; software: boolean } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return { webgl: false, software: false };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)).toLowerCase()
      : "";
    return {
      webgl: true,
      software: /swiftshader|llvmpipe|software|basic render|microsoft basic/.test(renderer),
    };
  } catch {
    return { webgl: false, software: false };
  }
}

/**
 * The game.
 *
 * No scroll. The page does not move; the character does. Everything the
 * previous build expressed as a function of scroll position — where you are,
 * what you are near, what the interface says — is now a function of where the
 * player has walked.
 */
export function Game({ fallback }: { fallback: React.ReactNode }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [touch, setTouch] = useState(false);
  /* TITLE → PLAYING, and back. The world runs behind the title so entering it
     is a curtain lifting rather than a load. */
  const [mode, setMode] = useState<"TITLE" | "PLAYING">("TITLE");
  const [mapOpen, setMapOpen] = useState(false);
  const [reading, setReading] = useState(false);
  /* What is in reach, what is open, and what has been opened before. */
  const [near, setNear] = useState<Interactable | null>(null);
  const [open, setOpen] = useState<Interactable | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [waypoint, setWaypoint] = useState<Waypoint | null>(null);

  const input = useRef<Input>(makeInput());
  const state = useRef<PlayerState>({
    position: new THREE.Vector3(ARRIVAL_POSE.position[0], 0, ARRIVAL_POSE.position[2]),
    velocity: new THREE.Vector3(),
    yaw: Math.PI,
    speed01: 0,
    grounded: true,
    camYaw: 0,
  });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const cap = probe();
    setTouch(coarse.matches);
    setQuality(cap.software || coarse.matches || window.innerWidth < 900 ? "low" : "high");
    setSupported(cap.webgl);
  }, []);

  /* The page itself never scrolls in game mode. */
  useEffect(() => {
    if (supported !== true) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [supported]);

  /* Input is live only while the player has the world. With the title, the
     map or the document up, keys belong to those. */
  const playing = mode === "PLAYING" && !mapOpen && !reading && !open;
  useKeyboardAndPointer(input, supported === true && playing);

  /* M opens the map, Escape hands the world back to the title. */
  useEffect(() => {
    if (supported !== true || mode !== "PLAYING") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyM") {
        e.preventDefault();
        setMapOpen((v) => !v);
      } else if (e.key === "Escape") {
        if (mapOpen) setMapOpen(false);
        else setMode("TITLE");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [supported, mode, mapOpen]);

  /* Proximity. Polled on its own frame rather than in the render loop: the
     panel and the prompt are React, and re-rendering them sixty times a
     second to move a diamond would cost more than the world does. State is
     only written when the answer changes. */
  useEffect(() => {
    if (supported !== true || mode !== "PLAYING") return;
    let raf = 0;
    const tick = () => {
      const s = state.current;
      const hx = -Math.sin(s.yaw);
      const hz = -Math.cos(s.yaw);
      const hit = nearestInteractable(s.position.x, s.position.z, hx, hz);
      setNear((prev) => (prev?.id === hit?.id ? prev : hit));
      // Arriving clears the marker. A waypoint you have reached and that is
      // still on the compass is just clutter.
      setWaypoint((w) =>
        w && Math.hypot(w.x - s.position.x, w.z - s.position.z) < 12 ? null : w,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [supported, mode]);

  /* E opens what is in reach. */
  useEffect(() => {
    if (!playing || !near) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyE") return;
      e.preventDefault();
      setOpen(near);
      setVisited((v) => (v.includes(near.id) ? v : [...v, near.id]));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, near]);

  /* Fast travel. Placed just short of the destination and turned to face it,
     so arriving reads as walking up to a thing rather than being inside it. */
  const travelTo = (x: number, z: number) => {
    const s = state.current;
    const d = Math.hypot(x, z) || 1;
    s.position.set(x - (x / d) * 26, 0, z - (z / d) * 26);
    s.velocity.set(0, 0, 0);
    s.yaw = Math.atan2(x - s.position.x, z - s.position.z);
    s.camYaw = Math.atan2(-(x - s.position.x), -(z - s.position.z));
  };

  if (supported === false) return <>{fallback}</>;
  if (supported === null)
    return (
      <div className="world-root fixed inset-0 z-0 bg-[#0d0f10]">
        <Booting />
      </div>
    );

  return (
    <>
      <div className="world-root fixed inset-0 z-0 bg-[#0d0f10]" aria-hidden="true">
        <GameCanvas
          input={input}
          state={state}
          quality={quality}
          enabled={playing}
          activeId={near?.id ?? null}
          visited={visited}
        />
      </div>

      <div className="sr-only">{fallback}</div>

      {/* What is in reach, in the DOM. Announced to a screen reader, and
          measurable from outside — the interaction loop is otherwise only
          observable as pixels. */}
      <div
        className="sr-only"
        aria-live="polite"
        data-near={near?.id ?? ""}
        data-near-title={near?.title ?? ""}
      >
        {near ? `${near.title}. ${near.kicker}. Press E to open.` : ""}
      </div>

      {mode === "TITLE" && !reading && (
        <TitleScreen
          onStart={() => setMode("PLAYING")}
          onRead={() => setReading(true)}
          touch={touch}
        />
      )}

      {reading && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
          style={{ background: "#0d0f10" }}
        >
          <button
            onClick={() => setReading(false)}
            className="u-mono fixed right-4 top-4 z-10 inline-flex min-h-[44px] items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em]"
            style={{ borderColor: "#2a2f32", color: "#9eaab0", background: "rgba(6,8,9,0.8)" }}
          >
            Back
          </button>
          {fallback}
        </div>
      )}

      {playing && touch && <Joystick input={input} />}

      {mode === "PLAYING" && !reading && (
        <>
          <Compass state={state} waypoint={waypoint} />
          <Minimap
            state={state}
            onOpenMap={() => setMapOpen(true)}
            waypoint={waypoint}
            visited={visited}
          />
        </>
      )}

      {mapOpen && (
        <WorldMap
          state={state}
          onClose={() => setMapOpen(false)}
          onTravel={travelTo}
          waypoint={waypoint}
          onWaypoint={setWaypoint}
          visited={visited}
        />
      )}

      {open && <InteractPanel target={open} onClose={() => setOpen(null)} />}

      {/* The prompt. Doubles as the tap target on touch, where there is no E
          key to press and a prompt you cannot act on is just a label. */}
      {playing && near && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-5 sm:bottom-20">
          <button
            onClick={() => {
              setOpen(near);
              setVisited((v) => (v.includes(near.id) ? v : [...v, near.id]));
            }}
            className="u-mono pointer-events-auto flex min-h-[52px] max-w-[92vw] items-center gap-3 border px-5 text-left"
            style={{
              borderColor: "rgba(226,232,240,0.34)",
              background: "rgba(6,8,9,0.82)",
            }}
          >
            <span
              className="u-mono shrink-0 border px-2 py-1 text-[0.58rem] uppercase tracking-[0.14em]"
              style={{ borderColor: "rgba(226,232,240,0.3)", color: "#cfd6d3" }}
            >
              {touch ? "Open" : "E"}
            </span>
            <span className="min-w-0">
              <span
                className="block truncate text-[0.82rem]"
                style={{ color: "#f2f6f7" }}
              >
                {near.title}
              </span>
              <span
                className="block truncate text-[0.66rem]"
                style={{ color: "#8b979c" }}
              >
                {near.kicker}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* A reminder, not an instruction sheet — the title screen already gave
          the full list. */}
      {playing && !touch && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-5">
          <p
            className="u-mono text-[0.6rem] uppercase tracking-[0.2em]"
            style={{ color: "#7d888d" }}
          >
            WASD · Shift to run · Space to jump · Drag to look · M for the map
          </p>
        </div>
      )}
    </>
  );
}

export { PLAYER };
