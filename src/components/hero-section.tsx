"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
const profileImage = "/images/profile.png";

export function HeroSection() {
  // Optimization: Use MotionValues for all mouse-driven animations to avoid re-renders
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const [hasScrolled, setHasScrolled] = useState(false);

  // Smooth springs for 3D tilt
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  // Smooth springs for background parallax (lighter damping for "floaty" feel)
  const bgX = useSpring(rawMouseX, { damping: 40, stiffness: 40 });
  const bgY = useSpring(rawMouseY, { damping: 40, stiffness: 40 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById("hero")?.getBoundingClientRect();
      if (rect) {
        // Calculate normalized position for 3D tilt
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        mouseX.set(x);
        mouseY.set(y);

        // Update raw pixel values for background translation
        rawMouseX.set(e.clientX * 0.02);
        rawMouseY.set(e.clientY * 0.02);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, rawMouseX, rawMouseY]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            x: bgX,
            y: bgY,
          }}
        />
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 2 === 0 ? "#00F0FF" : "#D946EF",
              boxShadow: `0 0 10px ${i % 2 === 0 ? "#00F0FF" : "#D946EF"}`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center gap-12">
          {/* Neural Core / Profile Image */}
          <motion.div
            className="relative cursor-hover"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Outer glow rings */}
            <motion.div
              className="absolute inset-0 -m-12 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute inset-0 -m-8 rounded-full border-2"
              style={{
                borderColor: "#00F0FF",
                boxShadow: "0 0 30px rgba(0, 240, 255, 0.5)",
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-[#00F0FF]"
                style={{ boxShadow: "0 0 10px #00F0FF" }}
              />
            </motion.div>

            {/* Profile Image with glass effect */}
            <div className="relative w-64 h-64 rounded-full overflow-hidden group"
              style={{
                border: "2px solid rgba(0, 240, 255, 0.3)",
                boxShadow: "0 0 60px rgba(0, 240, 255, 0.4), inset 0 0 30px rgba(0, 240, 255, 0.1)",
              }}
            >
              <motion.img
                src={profileImage}
                alt="Gaurav Vijay Jadhav"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />

              {/* Dual-tone gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 via-transparent to-[#D946EF]/10" />

              {/* Scanline effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.03) 0px, transparent 1px, transparent 2px, rgba(0, 240, 255, 0.03) 3px)",
                }}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Chromatic aberration on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen pointer-events-none"
                style={{
                  backgroundImage: `url(${profileImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(2px)",
                  transform: "translate(2px, -2px)",
                }}
              />

              {/* Glitch effect overlay */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.3) 50%, transparent 100%)",
                }}
                animate={{
                  x: [-300, 300],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "linear",
                }}
              />

              {/* Neural network pattern overlay */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, #00F0FF 1px, transparent 1px),
                                    radial-gradient(circle at 60% 80%, #D946EF 1px, transparent 1px),
                                    radial-gradient(circle at 80% 20%, #00F0FF 1px, transparent 1px),
                                    radial-gradient(circle at 40% 30%, #D946EF 1px, transparent 1px)`,
                  backgroundSize: "100% 100%",
                }}
              />
            </div>

            {/* Holographic overlay */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(45deg, transparent 30%, rgba(0, 240, 255, 0.15) 50%, transparent 70%)",
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Purple accent ring on opposite side */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(225deg, transparent 30%, rgba(217, 70, 239, 0.15) 50%, transparent 70%)",
              }}
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-6"
          >
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl tracking-wider"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: "linear-gradient(to right, #ffffff, #00F0FF, #ffffff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 80px rgba(0, 240, 255, 0.3)",
              }}
            >
              ARCHITECTING
              <br />
              INTELLIGENCE.
            </motion.h1>

            <motion.div
              className="text-lg md:text-xl space-y-2"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#a0a0a0",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-white">Gaurav Vijay Jadhav</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[#00F0FF]">AI Engineer</span>
                <span>•</span>
                <span className="text-[#D946EF]">Data Scientist</span>
                <span>•</span>
                <span className="text-[#00FF88]">Full Stack Architect</span>
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: "rgba(0, 240, 255, 0.05)",
                border: "1px solid rgba(0, 240, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-[#00FF88]"
                style={{
                  boxShadow: "0 0 10px #00FF88",
                }}
                animate={{
                  opacity: [1, 0.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-sm">System Status: ONLINE // Mumbai, IN</span>
            </motion.div>

            {/* Resume Download Button */}
            <motion.a
              href="/resume/resume.pdf"
              download="Gaurav_Jadhav_Resume.pdf"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg group cursor-hover relative overflow-hidden"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                border: "1px solid #00F0FF",
                background: "rgba(0, 240, 255, 0.05)",
              }}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className="absolute inset-0 bg-[#00F0FF] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <span className="text-[#00F0FF] group-hover:text-white transition-colors">DOWNLOAD_RESUME</span>
              <ChevronDown className="w-4 h-4 text-[#00F0FF] group-hover:text-white transition-colors" />
            </motion.a>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -ml-6 cursor-hover"
            initial={{ opacity: 0 }}
            animate={{ opacity: hasScrolled ? 0 : 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <motion.div
              className="flex flex-col items-center gap-2"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#00F0FF",
              }}
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-xs tracking-wider">SCROLL TO DECRYPT</span>
              <ChevronDown className="w-6 h-6" />
              <motion.div
                className="w-[1px] h-12 bg-gradient-to-b from-[#00F0FF] to-transparent"
                style={{
                  boxShadow: "0 0 10px #00F0FF",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}