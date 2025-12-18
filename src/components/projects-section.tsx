"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";
import { useRef, MouseEvent, useState } from "react";
import { projects, Project } from "@/data/projects";
import { ProjectCaseStudyModal } from "@/components/project-case-study-modal";
import { twMerge } from "tailwind-merge";

export function ProjectsSection() {
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  const handleOpenModal = (index: number) => {
    if (projects[index].isGithub) {
      window.open(projects[index].links.github, "_blank");
      return;
    }
    setSelectedProjectIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedProjectIndex(null);
  };

  const handleNextProject = () => {
    if (selectedProjectIndex === null) return;
    let nextIndex = (selectedProjectIndex + 1) % projects.length;
    while (projects[nextIndex].isGithub) {
      nextIndex = (nextIndex + 1) % projects.length;
      // Prevent infinite loop if all are github (unlikely but safe)
      if (nextIndex === selectedProjectIndex) return;
    }
    setSelectedProjectIndex(nextIndex);
  };

  const handlePrevProject = () => {
    if (selectedProjectIndex === null) return;
    let prevIndex = (selectedProjectIndex - 1 + projects.length) % projects.length;
    while (projects[prevIndex].isGithub) {
      prevIndex = (prevIndex - 1 + projects.length) % projects.length;
      if (prevIndex === selectedProjectIndex) return;
    }
    setSelectedProjectIndex(prevIndex);
  };

  const selectedProject = selectedProjectIndex !== null ? projects[selectedProjectIndex] : null;

  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
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
            {"// HOLOGRAPHIC BENTO GRID"}
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
            SELECTED PROJECTS
          </h2>
        </motion.div>

        {/* Bento Grid - First row: 2+1, Rest: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              onClick={() => handleOpenModal(index)}
            />
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      {selectedProject && (
        <ProjectCaseStudyModal
          isOpen={!!selectedProject}
          onClose={handleCloseModal}
          project={selectedProject}
          onNext={handleNextProject}
          onPrev={handlePrevProject}
        />
      )}
    </section>
  );
}

function ProjectCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position relative to card
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth animation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  // Parallax effect for content
  const contentX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 100,
    damping: 15,
  });
  const contentY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), {
    stiffness: 100,
    damping: 15,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalize to -0.5 to 0.5
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      className={twMerge(project.gridSpan, "group cursor-pointer relative h-full")}
      onClick={onClick}
    >
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        className="h-full"
        style={{
          perspective: "1000px",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative h-full min-h-[320px] p-6 md:p-8 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(5, 5, 5, 0.6)",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            backdropFilter: "blur(20px)",
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Ambient Light Bloom on Hover */}
          <motion.div
            className="absolute inset-x-0 top-0 h-32 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top, ${project.color}, transparent 70%)`,
            }}
          />

          {/* Reactive Border Glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              border: `1px solid ${project.color}`,
              boxShadow: `0 0 40px ${project.color}60, inset 0 0 40px ${project.color}20`,
            }}
          />

          {/* Content with Parallax Lift */}
          <motion.div
            className="relative z-10 h-full flex flex-col"
            style={{
              x: contentX,
              y: contentY,
              transformStyle: "preserve-3d",
              transform: "translateZ(20px)",
            }}
          >
            {project.isGithub ? (
              // GitHub Card Special Layout
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <Github
                    className="w-20 h-20"
                    style={{ color: project.color, filter: `drop-shadow(0 0 20px ${project.color})` }}
                  />
                </motion.div>
                <div>
                  <h3
                    className="text-2xl mb-2 tracking-wider font-heading"
                    style={{
                      color: project.color,
                    }}
                  >
                    {project.title}
                  </h3>
                  <p
                    className="text-sm opacity-70 font-body"
                  >
                    {project.description}
                  </p>
                </div>
                <motion.button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono"
                  style={{
                    border: `1px solid ${project.color}`,
                    color: project.color,
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: `${project.color}20` }}
                  onTap={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  Open GitHub Profile <ExternalLink className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              // Regular Project Card
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <motion.div
                      className="inline-block px-3 py-1 rounded-full text-xs mb-3 font-mono"
                      style={{
                        background: `${project.color}20`,
                        color: project.color,
                        border: `1px solid ${project.color}40`,
                      }}
                    >
                      {project.tag}
                    </motion.div>
                    <h3
                      className="text-xl md:text-2xl mb-2 tracking-wider font-heading"
                      style={{
                        color: "#ffffff",
                      }}
                    >
                      {project.title}
                    </h3>
                    <p
                      className="text-xs opacity-60 mb-3 font-body"
                    >
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Reactive Arrow Icon */}
                  <motion.div
                    className="opacity-40 group-hover:opacity-100 transition-all duration-300"
                    style={{ color: project.color }}
                    animate={{
                      x: [0, 0],
                      y: [0, 0],
                    }}
                    whileHover={{
                      x: 4,
                      y: -4,
                    }}
                  >
                    <ArrowUpRight className="w-6 h-6" />
                  </motion.div>
                </div>

                <p className="flex-1 text-sm opacity-70 mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack Pills */}
                {project.tech.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-3 py-1 rounded-full text-xs font-mono"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Corner Accent Light */}
          <div
            className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top right, ${project.color}, transparent 60%)`,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}