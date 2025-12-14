"use client";



import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorColor, setCursorColor] = useState("#00F0FF");
  const [isHidden, setIsHidden] = useState(false);

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorDotPos = useRef({ x: 0, y: 0 });
  const cursorRingPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let rafId: number;

    // Smooth cursor animation using RAF
    const animate = () => {
      // Lerp (linear interpolation) for smooth following
      const dotSpeed = 0.15;
      const ringSpeed = 0.08;

      // Update dot position
      cursorDotPos.current.x += (mousePos.current.x - cursorDotPos.current.x) * dotSpeed;
      cursorDotPos.current.y += (mousePos.current.y - cursorDotPos.current.y) * dotSpeed;

      // Update ring position
      cursorRingPos.current.x += (mousePos.current.x - cursorRingPos.current.x) * ringSpeed;
      cursorRingPos.current.y += (mousePos.current.y - cursorRingPos.current.y) * ringSpeed;

      // Apply transforms
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${cursorDotPos.current.x - 6}px, ${cursorDotPos.current.y - 6}px, 0)`;
      }

      if (cursorRingRef.current) {
        const offset = isHovering ? 24 : 16;
        cursorRingRef.current.style.transform = `translate3d(${cursorRingPos.current.x - offset}px, ${cursorRingPos.current.y - offset}px, 0) scale(${isHovering ? 1.5 : 1})`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    const updateMousePosition = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if hovering over textarea or input
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        setIsHidden(true);
        return;
      } else {
        setIsHidden(false);
      }

      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-hover")
      ) {
        setIsHovering(true);
        // Change color based on context
        if (target.classList.contains("purple-context")) {
          setCursorColor("#D946EF");
        } else {
          setCursorColor("#00F0FF");
        }
      } else {
        setIsHovering(false);
      }
    };

    // Hide cursor when input/textarea gains focus
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        setIsHidden(true);
      }
    };

    // Show cursor when input/textarea loses focus
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        setIsHidden(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, [isHovering]);

  // Hide cursor completely when typing in input fields
  if (isHidden) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
        style={{
          willChange: 'transform',
        }}
      >
        <div
          className="w-3 h-3 rounded-full transition-colors duration-300"
          style={{
            backgroundColor: cursorColor,
            boxShadow: `0 0 20px ${cursorColor}, 0 0 40px ${cursorColor}`,
          }}
        />
      </div>

      {/* Outer ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-screen"
        style={{
          willChange: 'transform',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: isHovering ? "48px" : "32px",
            height: isHovering ? "48px" : "32px",
            border: `1px solid ${cursorColor}`,
            boxShadow: isHovering
              ? `0 0 30px ${cursorColor}`
              : `0 0 15px ${cursorColor}`,
          }}
        >
          {isHovering && (
            <>
              <div
                className="absolute top-1/2 left-0 w-full h-[1px]"
                style={{ backgroundColor: cursorColor, opacity: 0.5 }}
              />
              <div
                className="absolute top-0 left-1/2 w-[1px] h-full"
                style={{ backgroundColor: cursorColor, opacity: 0.5 }}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}