"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorColor, setCursorColor] = useState("#00F0FF");
  const [isHidden, setIsHidden] = useState(false);

  // Motion values for raw mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Optimized springs: Tighter stiffness for less lag, but keeping the smooth "cinematic" feel
  // Dot: Very fast (stiffness 1500)
  const dotX = useSpring(mouseX, { damping: 40, stiffness: 1500 });
  const dotY = useSpring(mouseY, { damping: 40, stiffness: 1500 });

  // Ring: Fast follow (stiffness 300), slightly behind dot
  const ringX = useSpring(mouseX, { damping: 25, stiffness: 300 });
  const ringY = useSpring(mouseY, { damping: 25, stiffness: 300 });

  useEffect(() => {
    // Optimization: Use standard loop just to update motion values, 
    // letting Framer handle the animation frame efficiently only when changed.
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle Input/Textarea hiding
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        setIsHidden(true);
        return;
      } else {
        setIsHidden(false);
      }

      // Handle Hover States
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-hover")
      ) {
        setIsHovering(true);
        // Context-aware colors
        const isPurple = target.classList.contains("purple-context") || target.closest(".purple-context");
        setCursorColor(isPurple ? "#D946EF" : "#00F0FF");
      } else {
        setIsHovering(false);
        setCursorColor("#00F0FF");
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") setIsHidden(true);
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") setIsHidden(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    // Using mouseover on window to catch all elements
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []); // Empty dependency array ensures listeners are attached only once

  if (isHidden) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-screen overflow-hidden">
      {/* Main cursor dot */}
      <motion.div
        className="absolute top-0 left-0 w-3 h-3 rounded-full"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: cursorColor,
          boxShadow: `0 0 20px ${cursorColor}, 0 0 40px ${cursorColor}`,
        }}
      />

      {/* Outer ring */}
      <motion.div
        className="absolute top-0 left-0 rounded-full border border-solid"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          borderColor: cursorColor,
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          boxShadow: isHovering ? `0 0 30px ${cursorColor}` : `0 0 15px ${cursorColor}`,
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300
        }}
      >
        {isHovering && (
          <>
            <div className="absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2 opacity-50" style={{ backgroundColor: cursorColor }} />
            <div className="absolute top-0 left-1/2 w-[1px] h-full -translate-x-1/2 opacity-50" style={{ backgroundColor: cursorColor }} />
          </>
        )}
      </motion.div>
    </div>
  );
}