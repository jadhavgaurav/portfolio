"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorColor, setColor] = useState("#00F0FF");
  const [isHidden, setIsHidden] = useState(false);

  // Ref flags to avoid redundant setState calls
  const hoverRef = useRef(false);
  const hiddenRef = useRef(false);

  // Motion values for raw mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Dot: very tight spring (near-instant follow)
  const dotX = useSpring(mouseX, { damping: 40, stiffness: 1500 });
  const dotY = useSpring(mouseY, { damping: 40, stiffness: 1500 });

  // Ring: slightly lagging spring
  const ringX = useSpring(mouseX, { damping: 25, stiffness: 300 });
  const ringY = useSpring(mouseY, { damping: 25, stiffness: 300 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;

      // Handle Input/Textarea hiding (use refs to avoid setState on every move)
      const shouldHide = target.tagName === "TEXTAREA" || target.tagName === "INPUT";
      if (shouldHide !== hiddenRef.current) {
        hiddenRef.current = shouldHide;
        setIsHidden(shouldHide);
      }

      if (shouldHide) return;

      // Detect hover state from mousemove target (avoid separate mouseover listener)
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        !!target.closest("a") ||
        !!target.closest("button") ||
        target.classList.contains("cursor-hover") ||
        !!target.closest(".cursor-hover");

      if (isInteractive !== hoverRef.current) {
        hoverRef.current = isInteractive;
        setIsHovering(isInteractive);
        if (isInteractive) {
          const isPurple =
            target.classList.contains("purple-context") ||
            !!target.closest(".purple-context");
          setColor(isPurple ? "#D946EF" : "#00F0FF");
        } else {
          setColor("#00F0FF");
        }
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        hiddenRef.current = true;
        setIsHidden(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        hiddenRef.current = false;
        setIsHidden(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("focusin", handleFocusIn, { passive: true });
    window.addEventListener("focusout", handleFocusOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, [mouseX, mouseY]);

  if (isHidden) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] mix-blend-screen overflow-hidden" aria-hidden="true">
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

      {/* Outer ring — fixed size 40px, scale transform only (no layout reflow) */}
      <motion.div
        className="absolute top-0 left-0 w-10 h-10 rounded-full border border-solid"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          borderColor: cursorColor,
        }}
        animate={{
          scale: isHovering ? 1.4 : 1,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
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
