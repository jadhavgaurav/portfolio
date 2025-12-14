"use client";

import { motion } from "motion/react";
import { 
  FileCode2, 
  BrainCircuit, 
  Zap, 
  Rocket, 
  Link2, 
  Container, 
  Database, 
  Eye, 
  Cloud, 
  Layout, 
  Code2, 
  FileJson, 
  Server, 
  Workflow, 
  Boxes,
  Network,
  GitBranch,
  Cpu,
  BarChart3
} from "lucide-react";

const technologies = [
  { name: "Python", icon: FileCode2 },
  { name: "TensorFlow", icon: BrainCircuit },
  { name: "PyTorch", icon: Zap },
  { name: "FastAPI", icon: Rocket },
  { name: "LangChain", icon: Link2 },
  { name: "Docker", icon: Container },
  { name: "Redis", icon: Database },
  { name: "OpenCV", icon: Eye },
  { name: "AWS", icon: Cloud },
  { name: "Next.js", icon: Layout },
  { name: "React", icon: Code2 },
  { name: "TypeScript", icon: FileJson },
  { name: "Node.js", icon: Server },
  { name: "PostgreSQL", icon: Database },
  { name: "MongoDB", icon: Database },
  { name: "Kubernetes", icon: Boxes },
  { name: "FAISS", icon: Network },
  { name: "Transformers", icon: GitBranch },
  { name: "Scikit-learn", icon: Cpu },
  { name: "MLflow", icon: BarChart3 },
];

export function TechStack() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Section divider line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-30" />
      
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <span
            className="text-sm tracking-wider opacity-60"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: "#00F0FF",
            }}
          >
            // CORE_DEPENDENCIES
          </span>
        </motion.div>

        {/* Infinite scrolling marquee */}
        <div className="relative">
          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-8 py-4"
              animate={{
                x: [0, -1920],
              }}
              transition={{
                x: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {[...technologies, ...technologies, ...technologies].map((tech, index) => (
                <TechBadge key={`${tech.name}-${index}`} name={tech.name} icon={tech.icon} />
              ))}
            </motion.div>
          </div>

          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Section divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D946EF] to-transparent opacity-30" />
    </section>
  );
}

function TechBadge({ name, icon: Icon }: { name: string, icon: any }) {
  return (
    <motion.div
      className="relative cursor-hover group px-6 py-3 rounded-lg whitespace-nowrap flex items-center gap-3"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(0, 240, 255, 0.2)",
        backdropFilter: "blur(10px)",
      }}
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(0, 240, 255, 0.1)",
        borderColor: "rgba(0, 240, 255, 0.6)",
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-0 group-hover:opacity-30"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      
      <Icon className="relative z-10 w-5 h-5 text-[#00F0FF] group-hover:text-white transition-colors duration-200" />
      
      <span className="relative z-10 text-white group-hover:text-[#00F0FF] transition-colors duration-200">
        {name}
      </span>

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{
          boxShadow: "0 0 20px rgba(0, 240, 255, 0.4)",
        }}
      />
    </motion.div>
  );
}