"use client";

import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Send, Mail, Linkedin, Github, Twitter, Instagram } from "lucide-react";

export function ContactSection() {
  const [message, setMessage] = useState("");
  // We'll treat the sender as "guest" or capture it if you want to add an email input field later. 
  // For now, sticking to the "terminal" feel where it's a direct message.
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update cursor position based on text content
  useEffect(() => {
    if (textareaRef.current && containerRef.current && isFocused) {
      const textarea = textareaRef.current;
      // const container = containerRef.current;

      // Create a temporary span to measure text width
      const measureSpan = document.createElement('span');
      measureSpan.style.font = window.getComputedStyle(textarea).font;
      measureSpan.style.visibility = 'hidden';
      measureSpan.style.position = 'absolute';
      measureSpan.style.whiteSpace = 'pre-wrap';
      measureSpan.style.wordWrap = 'break-word';
      measureSpan.style.width = `${textarea.clientWidth}px`;

      const textBeforeCursor = message.substring(0, textarea.selectionStart);
      measureSpan.textContent = textBeforeCursor || '\u200B'; // Zero-width space if empty

      document.body.appendChild(measureSpan);

      // Calculate position
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      const lineSpan = document.createElement('span');
      lineSpan.style.font = window.getComputedStyle(textarea).font;
      lineSpan.style.visibility = 'hidden';
      lineSpan.style.position = 'absolute';
      lineSpan.textContent = currentLine || '\u200B';
      document.body.appendChild(lineSpan);

      const x = lineSpan.offsetWidth;
      const y = (lines.length - 1) * 24; // Line height approximation

      document.body.removeChild(measureSpan);
      document.body.removeChild(lineSpan);

      setCursorPosition({ x, y });
    }
  }, [message, isFocused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || status !== "idle") return;

    setStatus("sending");

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        body: JSON.stringify({ message, senderEmail: "Portfolio Guest" }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("sent");
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to send:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // Handle Enter key to submit (like a real terminal)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && status === "idle") {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
    // Shift+Enter allows new lines
  };

  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span
            className="text-sm tracking-wider opacity-60 mb-4 block font-body"
            style={{
              color: "#00F0FF",
            }}
          >
            {"// TERMINAL INTERFACE"}
          </span>
          <h2
            className="text-4xl md:text-6xl tracking-wider font-heading"
            style={{
              background: "linear-gradient(to right, #00F0FF, #D946EF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            INITIATE CONTACT
          </h2>
        </motion.div>

        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 50px rgba(0, 240, 255, 0.2)",
          }}
        >
          {/* Terminal Header */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{
              background: "rgba(0, 240, 255, 0.1)",
              borderBottom: "1px solid rgba(0, 240, 255, 0.2)",
            }}
          >
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span
              className="ml-4 text-sm opacity-70 font-body"
            >
              user@guest:~$ ./contact_gaurav.sh
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 space-y-4 font-body">
            {/* Terminal Output */}
            <div className="space-y-2 text-sm">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#00F0FF]"
              >
                <span className="text-green-400">[OK]</span> Initializing secure connection...
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[#00F0FF]"
              >
                <span className="text-green-400">[OK]</span> Neural handshake complete.
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white"
              >
                Enter your inquiry below:
              </motion.div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative" ref={containerRef}>
                <div className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-2">&gt;</span>
                  <div className="flex-1 relative" style={{ cursor: isFocused ? 'none' : 'text' }}>
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Type your message here..."
                      rows={4}
                      disabled={status !== "idle"}
                      className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-gray-600 leading-6 font-body"
                      style={{
                        caretColor: 'transparent',
                        cursor: 'inherit',
                        paddingTop: '0px',
                        lineHeight: '24px',
                      }}
                    />
                    {/* Custom Terminal Cursor */}
                    {isFocused && (
                      <motion.div
                        className="absolute w-2 h-5 bg-[#00F0FF] pointer-events-none"
                        style={{
                          left: `${cursorPosition.x}px`,
                          top: `${cursorPosition.y + 8}px`,
                        }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={!message.trim() || status !== "idle"}
                className="flex items-center gap-2 px-6 py-3 rounded-lg cursor-hover disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  border: "1px solid #00F0FF",
                  background: "rgba(0, 240, 255, 0.1)",
                }}
                whileHover={{ scale: message.trim() && status === "idle" ? 1.05 : 1 }}
                whileTap={{ scale: message.trim() && status === "idle" ? 0.95 : 1 }}
              >
                <Send className="w-4 h-4" style={{ color: "#00F0FF" }} />
                <span style={{ color: "#00F0FF" }}>
                  {status === "idle" ? "TRANSMIT" : status === "sending" ? "SENDING..." : "SENT!"}
                </span>
                {status === "idle" && message.trim() && (
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"
                    style={{
                      boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)",
                    }}
                  />
                )}
              </motion.button>

              {/* Status Messages */}
              {status === "sending" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm space-y-1"
                >
                  <div className="text-yellow-400">
                    <span className="text-yellow-500">[INFO]</span> Encrypting message...
                  </div>
                  <div className="text-yellow-400">
                    <span className="text-yellow-500">[INFO]</span> Establishing quantum channel...
                  </div>
                </motion.div>
              )}

              {status === "sent" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm space-y-1"
                >
                  <div className="text-green-400">
                    <span className="text-green-500">[OK]</span> Connection established
                  </div>
                  <div className="text-green-400">
                    <span className="text-green-500">[OK]</span> Message queued
                  </div>
                  <div className="text-green-400">
                    <span className="text-green-500">[SUCCESS]</span> Transmission complete
                  </div>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm space-y-1"
                >
                  <div className="text-red-400">
                    <span className="text-red-500">[ERROR]</span> Connection failed
                  </div>
                  <div className="text-red-400">
                    <span className="text-red-500">[CRITICAL]</span> Transmission aborted. Check API Key.
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 flex justify-center gap-6"
        >
          {[
            { icon: Mail, href: "mailto:gaurav.vjadhav01@gmail.com", color: "#00F0FF" },
            { icon: Github, href: "https://github.com/jadhavgaurav", color: "#ffffff" },
            { icon: Linkedin, href: "https://www.linkedin.com/in/gauravjadhav007/", color: "#0077B5" },
            { icon: Instagram, href: "https://www.instagram.com/er.gaurav.jadhav/", color: "#E1306C" },
            { icon: Twitter, href: "https://x.com/gj14325", color: "#1DA1F2" },
          ].map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-hover group"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              whileHover={{
                scale: 1.1,
                borderColor: social.color,
                boxShadow: `0 0 20px ${social.color}40`,
              }}
            >
              <social.icon
                className="w-5 h-5 transition-colors duration-300"
                style={{ color: "#ffffff" }}
              />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}