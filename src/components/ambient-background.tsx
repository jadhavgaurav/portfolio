"use client";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated grid — pure CSS animation, zero JS */}
      <div
        className="absolute inset-0 opacity-10 animate-grid-scroll"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating orbs — CSS keyframe animations, GPU compositor thread */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px] animate-orb-1"
        style={{
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[80px] animate-orb-2"
        style={{
          background: "radial-gradient(circle, rgba(217, 70, 239, 0.15) 0%, transparent 70%)",
          willChange: "transform",
        }}
      />

      {/* Scan lines — static, no animation (was barely visible at 0.03 opacity) */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.03) 2px, rgba(0, 240, 255, 0.03) 4px)",
        }}
      />
    </div>
  );
}
