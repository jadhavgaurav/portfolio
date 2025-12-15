"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "./image-with-fallback";
const logo = "/logo/logo-512.png";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 55);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]"
      initial={{ opacity: 1 }}
      animate={{ opacity: progress >= 100 ? 0 : 1 }}
      transition={{ duration: 0.5, delay: progress >= 100 ? 0 : 0 }}
      style={{ pointerEvents: progress >= 100 ? "none" : "auto" }}
    >
      <div className="text-center space-y-8">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
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
          transition={{ delay: 0.5 }}
        >
          <div className="text-[#00F0FF] text-sm">
            {progress < 30 && "// Initializing neural interface..."}
            {progress >= 30 && progress < 60 && "// Loading AI systems..."}
            {progress >= 60 && progress < 90 && "// Establishing connection..."}
            {progress >= 90 && "// System ready."}
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00F0FF] to-[#D946EF]"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 20px rgba(0, 240, 255, 0.8)",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-white/60 text-xs">{progress}%</div>
        </motion.div>

        {/* Animated Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#00F0FF]"
            style={{
              left: `${50 + Math.cos((i / 8) * Math.PI * 2) * 20}%`,
              top: `${50 + Math.sin((i / 8) * Math.PI * 2) * 20}%`,
              boxShadow: "0 0 10px #00F0FF",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}