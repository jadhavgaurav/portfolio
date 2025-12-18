"use client";

import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Send, Mail, Linkedin, Github, Twitter, Instagram } from "lucide-react";

export function ContactSection() {
  const [step, setStep] = useState<"message" | "email" | "name">("message");
  const [history, setHistory] = useState<{ type: "question" | "answer"; content: string }[]>([]);
  const [formData, setFormData] = useState({ message: "", email: "", name: "" });
  const [currentInput, setCurrentInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on step change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [step, status]);

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    // Add answer to history
    setHistory(prev => [...prev, { type: "answer", content: currentInput }]);

    if (step === "message") {
      setFormData(prev => ({ ...prev, message: currentInput }));
      setHistory(prev => [...prev, { type: "question", content: "Please enter your email frequency:" }]);
      setStep("email");
      setCurrentInput("");
    } else if (step === "email") {
      // Basic validation
      if (!currentInput.includes("@")) {
        setHistory(prev => [...prev, { type: "question", content: "[ERROR] Invalid frequency format. Retry email:" }]);
        setCurrentInput("");
        return;
      }
      setFormData(prev => ({ ...prev, email: currentInput }));
      setHistory(prev => [...prev, { type: "question", content: "Identify yourself (Name):" }]);
      setStep("name");
      setCurrentInput("");
    } else if (step === "name") {
      const finalName = currentInput;
      const finalData = { ...formData, name: finalName };
      setFormData(finalData); // Update state for consistency
      setCurrentInput("");
      setStatus("sending");

      // Submit
      try {
        const response = await fetch('/api/send', {
          method: 'POST',
          body: JSON.stringify(finalData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("sent");
          setTimeout(() => {
            setStep("message");
            setHistory([]);
            setFormData({ message: "", email: "", name: "" });
            setStatus("idle");
            setCurrentInput("");
          }, 6000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Failed to send:", error);
        setStatus("error");
      }
    }
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
            className="text-sm tracking-wider opacity-60 mb-4 block font-mono"
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
              className="ml-4 text-sm opacity-70 font-mono"
            >
              user@guest:~$ ./contact_gaurav.sh
            </span>
          </div>

          {/* Terminal Body */}
          <div className="p-6 space-y-4 font-mono">
            {/* Terminal Output */}
            <div className="space-y-2 text-sm max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#00F0FF] mb-4"
              >
                <span className="text-green-400">[OK]</span> Secure connection established.
                <br />
                <span className="text-white/60">Initialize contact sequence...</span>
              </motion.div>

              {/* Chat History */}
              {history.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-1"
                >
                  {item.type === "question" ? (
                    <div className="text-[#00F0FF]">
                      <span className="text-yellow-500 mr-2">?</span>
                      {item.content}
                    </div>
                  ) : (
                    <div className="text-white ml-6 border-l border-white/20 pl-2 opacity-80">
                      {item.content}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Current Question */}
              {status !== "sent" && status !== "error" && status !== "sending" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#D946EF] mt-4"
                >
                  <span className="text-white mr-2">&gt;</span>
                  {step === 'message' && "Enter your inquiry below:"}
                  {step === 'email' && "Please enter your email frequency:"}
                  {step === 'name' && "Identify yourself (Name):"}
                </motion.div>
              )}

              {/* Sending Logs */}
              {status === "sending" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm space-y-1 mt-4"
                >
                  <div className="text-yellow-400">
                    <span className="text-yellow-500">[INFO]</span> Encrypting message...
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-yellow-400"
                  >
                    <span className="text-yellow-500">[INFO]</span> Establishing quantum channel...
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleNextStep} className="relative mt-4">
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded border border-green-500/30 bg-green-500/10 text-green-400 text-sm"
                >
                  <p>[SUCCESS] Transmission complete.</p>
                  <p className="text-xs opacity-70 mt-1">A confirmation signal has been sent to your frequency.</p>
                </motion.div>
              ) : status === "error" ? (
                <div className="text-red-400 p-2 text-sm">
                  [ERROR] Transmission failed. Please reboot (refresh) and retry.
                </div>
              ) : status === "sending" ? (
                null
              ) : (
                <div className="flex items-start gap-2">
                  <span className="text-[#00F0FF] mt-1 animate-pulse">_</span>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type={step === 'email' ? 'email' : 'text'}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder={
                        step === 'message' ? "Type message..." :
                          step === 'email' ? "user@example.com" :
                            "John Doe"
                      }
                      className="w-full bg-transparent border-none outline-none text-white placeholder-gray-700 font-mono text-sm py-1"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="text-[#00F0FF] hover:text-white transition-colors"
                    disabled={!currentInput.trim() || status === "sending"}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
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