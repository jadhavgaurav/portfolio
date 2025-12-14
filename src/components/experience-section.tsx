"use client";

import { motion } from "motion/react";
import { Briefcase, GraduationCap } from "lucide-react";

const experiences = [
  {
    type: "work",
    title: "AI Research Intern",
    company: "Fynix Digital",
    period: "Sept 2025 - Present",
    description: "AI Agents, Research & Development, Advanced ML Systems",
    color: "#00F0FF",
  },
  {
    type: "work",
    title: "Data Science Intern",
    company: "Code B Solutions",
    period: "Apr 2025 - May 2025",
    description: "ML Phishing Detection, Data Analysis, Production Deployment",
    color: "#D946EF",
  },
  {
    type: "education",
    title: "Data Science & Analytics with AI",
    company: "IT Vedant Institute",
    period: "Jul 2024 - Aug 2025",
    description: "Advanced certification in Data Science, Analytics, and Artificial Intelligence.",
    color: "#00FF88",
  },
  {
    type: "education",
    title: "B.E. Computer Engineering",
    company: "University of Mumbai",
    period: "Jul 2020 - May 2024",
    description: "Specialized in AI/ML, Data Science, and Software Engineering",
    color: "#ef46caff",
  }

];

export function ExperienceSection() {
  return (
    <section id="experience" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span
            className="text-sm tracking-wider opacity-60 mb-4 block"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "#00F0FF",
            }}
          >
            // CODE LOG TIMELINE
          </span>
          <h2
            className="text-4xl md:text-6xl tracking-wider"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: "linear-gradient(to right, #00F0FF, #D946EF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            EXPERIENCE
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Central line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#00F0FF] via-[#D946EF] to-[#00FF88] opacity-30 hidden md:block" />

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <ExperienceCard key={index} experience={exp} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceCard({ experience, index }: { experience: any; index: number }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className={`relative flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
        } flex-col md:gap-12 gap-6`}
    >
      {/* Timeline node */}
      <div className="hidden md:block absolute left-1/2 top-8 -ml-6 z-10">
        <motion.div
          className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-hover group"
          style={{
            background: `${experience.color}20`,
            border: `2px solid ${experience.color}`,
          }}
          whileHover={{
            scale: 1.2,
            boxShadow: `0 0 30px ${experience.color}`,
          }}
        >
          {experience.type === "work" ? (
            <Briefcase className="w-5 h-5" style={{ color: experience.color }} />
          ) : (
            <GraduationCap className="w-5 h-5" style={{ color: experience.color }} />
          )}

          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid ${experience.color}`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Content card */}
      <div className={`w-full md:w-[calc(50%-3rem)] ${isLeft ? "md:text-right" : "md:text-left"} text-center md:text-left`}>
        <motion.div
          className="p-6 rounded-xl group cursor-hover"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${experience.color}40`,
            backdropFilter: "blur(10px)",
          }}
          whileHover={{
            scale: 1.02,
            borderColor: experience.color,
            boxShadow: `0 0 30px ${experience.color}40`,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Period badge */}
          <motion.span
            className="inline-block px-3 py-1 rounded-full text-xs mb-3"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: `${experience.color}20`,
              color: experience.color,
              border: `1px solid ${experience.color}40`,
            }}
          >
            {experience.period}
          </motion.span>

          <h3
            className="text-2xl mb-1 tracking-wide"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: experience.color,
            }}
          >
            {experience.title}
          </h3>

          <p
            className="text-lg mb-3 opacity-90"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {experience.company}
          </p>

          <p className="text-sm opacity-70 leading-relaxed">
            {experience.description}
          </p>

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 pointer-events-none"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      </div>

      {/* Spacer for mobile */}
      <div className="hidden md:block md:w-[calc(50%-3rem)]" />
    </motion.div>
  );
}
