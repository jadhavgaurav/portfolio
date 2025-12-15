"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ImageWithFallback } from "./image-with-fallback";
const logo = "/logo/logo-128.png";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-xl bg-black/30" : "backdrop-blur-md bg-black/10"
        }`}
      style={{
        borderBottom: "1px solid rgba(0, 240, 255, 0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="cursor-hover"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection("home")}
          >
            <ImageWithFallback
              src={logo}
              alt="Logo"
              className="w-10 h-10"
              style={{
                filter: "drop-shadow(0 0 20px rgba(0, 240, 255, 0.5))",
              }}
            />
          </motion.div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "// HOME", id: "home" },
              { label: "// PROJECTS", id: "projects" },
              { label: "// EXPERIENCE", id: "experience" },
              { label: "// TERMINAL", id: "contact" },
            ].map((link) => (
              <NavLink
                key={link.id}
                label={link.label}
                onClick={() => scrollToSection(link.id)}
              />
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            className="hidden md:block relative cursor-hover group overflow-hidden px-6 py-2 rounded-lg font-body"
            style={{
              border: "1px solid #00F0FF",
              background: "rgba(0, 240, 255, 0.05)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection("contact")}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-0 group-hover:opacity-30"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 text-[#00F0FF]">INITIATE_CHAT</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow: "0 0 30px rgba(0, 240, 255, 0.6)",
              }}
            />
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden cursor-hover font-body"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              color: "#00F0FF",
              border: "1px solid #00F0FF",
              padding: "8px",
              borderRadius: "4px",
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Animated scan line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent"
        initial={{ width: "0%", opacity: 0 }}
        animate={{
          width: scrolled ? "100%" : "0%",
          opacity: scrolled ? 0.5 : 0,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <motion.div
                  className="cursor-hover"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => scrollToSection("home")}
                >
                  <ImageWithFallback
                    src={logo}
                    alt="Logo"
                    className="w-10 h-10"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(0, 240, 255, 0.5))",
                    }}
                  />
                </motion.div>

                {/* Close Button */}
                <button
                  className="md:hidden font-body"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  style={{
                    color: "#00F0FF",
                    border: "1px solid #00F0FF",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="mt-8 space-y-4">
                {[
                  { label: "// HOME", id: "home" },
                  { label: "// PROJECTS", id: "projects" },
                  { label: "// EXPERIENCE", id: "experience" },
                  { label: "// TERMINAL", id: "contact" },
                ].map((link, index) => (
                  <motion.button
                    key={link.id}
                    className="block w-full text-left px-4 py-3 rounded-lg cursor-hover font-body"
                    style={{
                      color: "#00F0FF",
                      border: "1px solid rgba(0, 240, 255, 0.3)",
                      background: "rgba(0, 240, 255, 0.05)",
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      scrollToSection(link.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className="relative cursor-hover group font-body"
      style={{
        color: "#a0a0a0",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ color: "#00F0FF" }}
      onClick={onClick}
    >
      {label}
      {isHovered && (
        <motion.div
          className="absolute -bottom-1 left-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, #00F0FF, transparent)",
            boxShadow: "0 0 10px #00F0FF",
          }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}