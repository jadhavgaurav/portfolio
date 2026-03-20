"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "./image-with-fallback";
const logo = "/logo/logo-512.png";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let rafId: number;
    const startTime = performance.now();
    const duration = 2000; // 2 seconds total

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const next = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(next);

      if (next < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => onCompleteRef.current(), 400);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const statusText =
    progress < 30
      ? "// Initializing neural interface..."
      : progress < 60
      ? "// Loading AI systems..."
      : progress < 90
      ? "// Establishing connection..."
      : "// System ready.";

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]"
      initial={{ opacity: 1 }}
      animate={{ opacity: progress >= 100 ? 0 : 1 }}
      transition={{ duration: 0.4, delay: progress >= 100 ? 0 : 0 }}
      style={{ pointerEvents: progress >= 100 ? "none" : "auto" }}
    >
      <div className="text-center space-y-8">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <ImageWithFallback
            src={logo}
            alt="Logo"
            className="w-32 h-32 md:w-48 md:h-48"
            style={{
              filter: "drop-shadow(0 0 40px rgba(0, 240, 255, 0.8))",
            }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className="space-y-2 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-[#00F0FF] text-sm">{statusText}</div>

          {/* Progress Bar — CSS transition only, no Framer Motion width updates */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] to-[#D946EF] rounded-full"
              style={{
                width: `${progress}%`,
                transition: "width 0.05s linear",
                boxShadow: "0 0 20px rgba(0, 240, 255, 0.8)",
              }}
            />
          </div>

          <div className="text-white/60 text-xs">{progress}%</div>
        </motion.div>

        {/* 4 Particles (reduced from 8) */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#00F0FF]"
            style={{
              left: `${50 + Math.cos((i / 4) * Math.PI * 2) * 20}%`,
              top: `${50 + Math.sin((i / 4) * Math.PI * 2) * 20}%`,
              boxShadow: "0 0 10px #00F0FF",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
