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
import { nearestDistrictLanguage } from "@/world/mapdata";
import { styleFor } from "@/world/language";
import * as audio from "@/audio/engine";
import { computeProgress } from "@/world/progress";
import { Objectives } from "./objectives";
import { AchievementBanner } from "./achievement-banner";

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

/** The on-screen control reminder. Ordered by how soon a new player needs
 *  each one: move, then look, then the two things you do to the world, then
 *  the two panels. */
const CONTROLS: { keys: string[]; label: string }[] = [
  { keys: ["W", "A", "S", "D"], label: "Move" },
  { keys: ["Shift"], label: "Run" },
  { keys: ["Space"], label: "Jump" },
  { keys: ["Drag"], label: "Look" },
  { keys: ["E"], label: "Open" },
  { keys: ["I"], label: "Talk" },
  { keys: ["M"], label: "Map" },
  { keys: ["O"], label: "Log" },
];

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
  const [muted, setMuted] = useState(false);
  const [enteredDistricts, setEnteredDistricts] = useState<string[]>([]);
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  /* A queue, not a single slot. A category completing used to call
     setToast() directly, which meant two categories completing on the same
     tick — every category can already be complete the instant progress is
     first computed after loading a save with everything found — silently
     dropped every banner but the last one React happened to commit. Each
     banner now gets its own turn instead of racing the others out. */
  const [toastQueue, setToastQueue] = useState<{ id: number; key: string; label: string }[]>([]);
  const toastId = useRef(0);
  const pushToast = (key: string, label: string) => {
    toastId.current += 1;
    setToastQueue((q) => [...q, { id: toastId.current, key, label }]);
  };
  const lastDistrict = useRef<string | null>(null);
  const prevComplete = useRef<Record<string, boolean>>({});
  /* Kept in sync with `enteredDistricts` state but read from inside a
     requestAnimationFrame loop below whose effect never re-subscribes when
     districts change — a plain closure over the state array there would see
     whatever it was when the loop started, forever. */
  const enteredSet = useRef<Set<string>>(new Set());
  useEffect(() => {
    enteredSet.current = new Set(enteredDistricts);
  }, [enteredDistricts]);

  /* Who the player is currently talking to. Held as a ref and read inside
     the world's own frame loop, so opening someone's panel does not
     re-render forty NPCs to tell one of them to stand still. Written from
     an effect rather than during render: a render React discards must not
     leave the world holding someone in a conversation that never opened. */
  const engagedId = useRef<string | null>(null);

  const input = useRef<Input>(makeInput());
  const state = useRef<PlayerState>({
    position: new THREE.Vector3(ARRIVAL_POSE.position[0], 0, ARRIVAL_POSE.position[2]),
    velocity: new THREE.Vector3(),
    yaw: Math.PI,
    speed01: 0,
    grounded: true,
    camYaw: 0,
    camPitch: 0,
  });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("null:muted");
      if (saved === "1") {
        setMuted(true);
        audio.setMuted(true);
      }
      const v = window.localStorage.getItem("null:visited");
      if (v) setVisited(JSON.parse(v));
      const d = window.localStorage.getItem("null:districts");
      if (d) setEnteredDistricts(JSON.parse(d));
    } catch {
      // Private browsing can throw on localStorage access; progress just
      // does not persist, which is no worse than not tracking it at all.
    }
    const coarse = window.matchMedia("(pointer: coarse)");
    const cap = probe();
    setSupported(cap.webgl);

    /* The tier is re-derived whenever the inputs to it change, not once at
       mount. Two of the three are not fixed for the life of the session:
       a window can be widened past the small-screen threshold, and the
       pointer can go from coarse to fine when a tablet is docked to a
       mouse. Deciding once meant a window that happened to be narrow on
       the first frame stayed on the low tier forever — no shadow map,
       reduced resolution, the lighter post stack — on hardware with plenty
       of headroom for the high one. Only the GPU probe is genuinely
       fixed, so it is taken once and reused. */
    const settle = () => {
      setTouch(coarse.matches);
      setQuality(cap.software || coarse.matches || window.innerWidth < 900 ? "low" : "high");
    };
    settle();

    /* Debounced, so dragging a window across the threshold settles on one
       tier rather than rebuilding the shadow map at every width in between. */
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 200);
    };
    window.addEventListener("resize", onResize);
    coarse.addEventListener("change", settle);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      coarse.removeEventListener("change", settle);
    };
  }, []);

  useEffect(() => {
    engagedId.current = open?.kind === "NPC" ? open.id : null;
  }, [open]);

  /* The page itself never scrolls in game mode. */
  useEffect(() => {
    if (supported !== true) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [supported]);

  useEffect(() => {
    try {
      window.localStorage.setItem("null:visited", JSON.stringify(visited));
    } catch {
      // See above.
    }
  }, [visited]);

  useEffect(() => {
    try {
      window.localStorage.setItem("null:districts", JSON.stringify(enteredDistricts));
    } catch {
      // See above.
    }
  }, [enteredDistricts]);

  const progress = computeProgress(visited, enteredDistricts);

  /* A category closing out is announced once, the frame it happens, rather
     than every time the log is opened while it happens to be complete. */
  useEffect(() => {
    for (const c of progress.categories) {
      const was = prevComplete.current[c.key];
      if (c.complete && was === false) {
        audio.milestone();
        pushToast(c.key, `${c.label} — complete`);
      }
      prevComplete.current[c.key] = c.complete;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    if (!toastQueue.length) return;
    const id = setTimeout(() => setToastQueue((q) => q.slice(1)), 3600);
    return () => clearTimeout(id);
  }, [toastQueue]);

  /* Input is live only while the player has the world. With the title, the
     map or the document up, keys belong to those. */
  const playing = mode === "PLAYING" && !mapOpen && !reading && !open && !objectivesOpen;
  // Keyboard-and-mouse-drag only. On touch this ran alongside the Joystick,
  // both reading every pointerdown/pointermove on the same finger — the
  // stick still drove movement, but this hook's own `dragging` bookkeeping
  // and stray lookX/lookY writes had no reason to be live at the same time.
  useKeyboardAndPointer(input, supported === true && playing && !touch);

  /* M opens the map, O the log, Escape hands the world back to the title.
   *
   * Guarded on `open` and `reading` too, not just `mode`: without that, this
   * stayed attached under the interact panel, and its own Escape branch —
   * which does not know the panel exists — raced the panel's own close
   * handler. Escape then did two things on the same press: the panel closed,
   * and this sent the player straight back to the title screen. Confirmed by
   * driving it end to end rather than by reading the code: the automated
   * pass that opens a structure, closes it, then opens the log found the log
   * dialog missing, because by the time O was pressed the game had already
   * been kicked out of PLAYING. */
  useEffect(() => {
    if (supported !== true || mode !== "PLAYING" || open || reading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyM") {
        e.preventDefault();
        setMapOpen((v) => !v);
      } else if (e.code === "KeyO") {
        e.preventDefault();
        setObjectivesOpen((v) => !v);
      } else if (e.key === "Escape") {
        if (mapOpen) setMapOpen(false);
        else if (objectivesOpen) setObjectivesOpen(false);
        else setMode("TITLE");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [supported, mode, mapOpen, objectivesOpen, open, reading]);

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

  /* E opens what is in reach, and I does the same for a person.
   *
   * One key would have been tidier, but E for a building and I for a person
   * is what the prompt can actually say: walking up to someone and being
   * told to press "E" reads as operating them rather than talking to them,
   * and the greeting was landing with no visible way to answer it. Both are
   * live for both kinds, so neither is a dead key wherever it is pressed. */
  useEffect(() => {
    if (!playing || !near) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyE" && e.code !== "KeyI") return;
      e.preventDefault();
      audio.interactOpen();
      setOpen(near);
      setVisited((v) => (v.includes(near.id) ? v : [...v, near.id]));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, near]);

  /* Fast travel. Placed just short of the destination and turned to face it,
     so arriving reads as walking up to a thing rather than being inside it. */
  const toggleMute = () => {
    setMuted((v) => {
      const next = !v;
      audio.setMuted(next);
      try {
        window.localStorage.setItem("null:muted", next ? "1" : "0");
      } catch {
        // See the load above — persistence is a nicety, not a requirement.
      }
      return next;
    });
  };

  /* District and core arrival, announced with a short chime the first time
     each frame's nearest one changes — not on every frame, which is what
     driving this from the same proximity loop that already runs every
     frame would otherwise do. */
  useEffect(() => {
    if (supported !== true || mode !== "PLAYING") return;
    let raf = 0;
    const tick = () => {
      const s = state.current;
      const lang = nearestDistrictLanguage(s.position.x, s.position.z);
      if (lang !== lastDistrict.current) {
        if (lastDistrict.current !== null) {
          if (lang === "CORE") audio.coreArrival();
          else if (lastDistrict.current !== "CORE") audio.districtEnter(lang);
        }
        if (lang !== "CORE" && !enteredSet.current.has(lang)) {
          // First time in this district, specifically — not the chime that
          // plays on every re-entry. Crossing in used to be silent past that
          // one sound; nothing on screen ever said which district had just
          // been added to the log.
          pushToast("districts", `${styleFor(lang).label} district — entered`);
          setEnteredDistricts((prev) => (prev.includes(lang) ? prev : [...prev, lang]));
        }
        lastDistrict.current = lang;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [supported, mode]);

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
          engagedId={engagedId}
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
        {near
          ? `${near.title}. ${near.kicker}. ${
              near.kind === "NPC" ? "Press I to talk." : "Press E to open."
            }`
          : ""}
      </div>

      {mode === "TITLE" && !reading && (
        <TitleScreen
          onStart={() => {
            audio.unlock();
            setMode("PLAYING");
          }}
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
            className="u-btn u-mono fixed right-4 top-4 z-10 inline-flex min-h-[44px] items-center border px-5 text-[0.6rem] uppercase tracking-[0.18em]"
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
            onOpenLog={() => setObjectivesOpen(true)}
            waypoint={waypoint}
            visited={visited}
            muted={muted}
            onToggleMute={toggleMute}
            progress={progress}
          />
        </>
      )}

      {mapOpen && (
        <WorldMap
          state={state}
          onClose={() => setMapOpen(false)}
          onTravel={travelTo}
          waypoint={waypoint}
          onWaypoint={(w) => {
            setWaypoint(w);
            if (w) audio.waypointSet();
          }}
          visited={visited}
          progress={progress}
        />
      )}

      {objectivesOpen && (
        <Objectives progress={progress} onClose={() => setObjectivesOpen(false)} />
      )}

      {/* A category closing out, stated once and then gone — the log itself
          is where that state actually lives. */}
      {toastQueue[0] && (
        <AchievementBanner
          key={toastQueue[0].id}
          achievementKey={toastQueue[0].key}
          label={toastQueue[0].label}
        />
      )}

      {open && (
        <InteractPanel
          target={open}
          onClose={() => {
            audio.interactClose();
            setOpen(null);
          }}
        />
      )}

      {/* The prompt. Doubles as the tap target on touch, where there is no E
          key to press and a prompt you cannot act on is just a label. */}
      {playing && near && (
        <aside
          aria-label="Interact prompt"
          className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-5 sm:bottom-20"
        >
          <button
            onClick={() => {
              audio.interactOpen();
              setOpen(near);
              setVisited((v) => (v.includes(near.id) ? v : [...v, near.id]));
            }}
            className="u-btn u-mono pointer-events-auto flex min-h-[52px] max-w-[92vw] items-center gap-3 border px-5 text-left"
            style={{
              borderColor: "rgba(240,223,174,0.4)",
              background: "rgba(20,14,6,0.85)",
            }}
          >
            <span
              className="u-mono shrink-0 border px-2 py-1 text-[0.58rem] uppercase tracking-[0.14em]"
              style={{ borderColor: "rgba(240,223,174,0.35)", color: "#e8dcb8" }}
            >
              {touch ? (near.kind === "NPC" ? "Talk" : "Open") : near.kind === "NPC" ? "I" : "E"}
            </span>
            <span className="min-w-0">
              <span
                className="block truncate text-[0.82rem]"
                style={{ color: "#f6ecd4" }}
              >
                {near.title}
              </span>
              <span
                className="block truncate text-[0.66rem]"
                style={{ color: "#b8a678" }}
              >
                {near.kicker}
              </span>
            </span>
          </button>
        </aside>
      )}

      {/* A reminder, not an instruction sheet — the title screen already gave
          the full list. It used to be one line of faint 0.6rem text at the
          very bottom of the frame, the same weight as the ground it sat on,
          and it was reliably missed: nobody knew there was a log, a map or a
          way to talk to anyone. Keycaps on a solid ground read as controls
          rather than as a caption. */}
      {playing && !touch && (
        <aside
          aria-label="Controls"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-5"
        >
          <div
            className="flex max-w-[94vw] flex-wrap items-center justify-center gap-x-4 gap-y-2 border px-4 py-2.5"
            style={{
              borderColor: "rgba(240,223,174,0.22)",
              background: "rgba(20,14,6,0.82)",
            }}
          >
            {CONTROLS.map((c) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {c.keys.map((k) => (
                  <kbd
                    key={k}
                    className="u-mono inline-flex min-w-[1.5rem] justify-center border px-1.5 py-0.5 text-[0.6rem] uppercase"
                    style={{
                      borderColor: "rgba(240,223,174,0.45)",
                      color: "#f6ecd4",
                      background: "rgba(240,223,174,0.08)",
                    }}
                  >
                    {k}
                  </kbd>
                ))}
                <span
                  className="u-mono text-[0.62rem] uppercase tracking-[0.14em]"
                  style={{ color: "#d3c39a" }}
                >
                  {c.label}
                </span>
              </span>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}

export { PLAYER };
