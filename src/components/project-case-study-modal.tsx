
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Link as LinkIcon, Github, ExternalLink, Activity, Shield, Layers } from "lucide-react";
import { Project } from "@/data/projects";
import dynamic from "next/dynamic";

const DiagramViewer = dynamic(
    () => import("./diagram-viewer").then((mod) => mod.DiagramViewer),
    {
        ssr: false,
        loading: () => (
            <div className="h-[400px] w-full bg-[#080808] border border-white/10 rounded-xl flex items-center justify-center text-white/20 font-mono text-sm">
                Loading Diagram...
            </div>
        )
    }
);

interface ProjectCaseStudyModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    onNext: () => void;
    onPrev: () => void;
}

export function ProjectCaseStudyModal({
    isOpen,
    onClose,
    project,
    onNext,
    onPrev,
}: ProjectCaseStudyModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            modalRef.current?.focus();

            // Push state so back button works
            window.history.pushState({ modalOpen: true }, "", window.location.href);
        } else {
            document.body.style.overflow = "auto";
        }

        const handlePopState = () => {
            if (isOpen) {
                onClose();
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isOpen, onClose]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev]);

    // Copy link
    const handleCopyLink = () => {
        const url = `${window.location.origin}/${project.slug}`;
        navigator.clipboard.writeText(url);
        // Could add toast here
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-[1100px] h-[92vh] md:h-[86vh] bg-[#050505]/90 overflow-hidden flex flex-col md:rounded-2xl border border-[#00F0FF]/30 shadow-[0_0_40px_rgba(0,240,255,0.15)] outline-none"
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <header className="flex-shrink-0 flex items-center justify-between px-6 pt-14 pb-4 md:py-4 border-b border-[#ffffff]/10 bg-[#050505]/50 relative overflow-hidden">
                            {/* Scanline accent */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00F0FF]/50 to-transparent opacity-50" />

                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl md:text-2xl tracking-wider text-white font-bold font-heading">
                                            {project.title}
                                        </h2>
                                        {project.statusPill && (
                                            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest text-black bg-[#00F0FF] rounded-sm font-mono">
                                                {project.statusPill}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-400 font-body">
                                        {project.subtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyLink}
                                    className="p-2 text-gray-400 hover:text-[#00F0FF] transition-colors rounded-full hover:bg-white/5"
                                    title="Copy Link"
                                >
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                                    title="Close"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </header>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">

                                {/* 1. Aim and Objective */}
                                {project.aim && project.aim.length > 0 && (
                                    <section>
                                        <h3 className="section-title">AIM & OBJECTIVE</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-gray-300 font-light leading-relaxed">
                                            {project.aim.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {/* 2. What I Built */}
                                {project.built && project.built.length > 0 && (
                                    <section>
                                        <h3 className="section-title">WHAT I BUILT</h3>
                                        <ul className="space-y-3">
                                            {project.built.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D946EF] flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {/* 3. Primary Media Placeholder */}
                                <section>
                                    <div className="w-full aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl border border-white/10 flex items-center justify-center group overflow-hidden relative">
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                        <div className="text-center z-10 transition-transform duration-700 group-hover:scale-105">
                                            <Layers className="w-16 h-16 text-[#00F0FF]/30 mx-auto mb-4" />
                                            <p className="text-gray-500 tracking-widest text-sm font-mono uppercase">Interactive Demo Preview</p>
                                        </div>
                                        {/* Hover glow */}
                                        <div className="absolute inset-0 bg-[#00F0FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                    {/* Optional thumbnails would go here */}
                                </section>

                                {/* 4. Tech Stack */}
                                {project.techStackDetailed && project.techStackDetailed.length > 0 && (
                                    <section>
                                        <h3 className="section-title">TECH STACK</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {project.techStackDetailed.map((group, i) => (
                                                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5">
                                                    <h4 className="text-xs uppercase tracking-widest text-[#00F0FF] mb-3 font-mono">{group.category}</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {group.stack.map(tech => (
                                                            <span key={tech} className="px-2 py-1 rounded bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-mono border border-[#00F0FF]/20">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 5. System Architecture */}
                                {(project.flowData || (project.architecture && project.architecture.length > 0)) && (
                                    <section>
                                        <h3 className="section-title">SYSTEM ARCHITECTURE</h3>

                                        {project.flowData ? (
                                            <div className="h-[400px] w-full bg-[#080808] border border-white/10 rounded-xl overflow-hidden relative group">
                                                <DiagramViewer
                                                    initialNodes={project.flowData.nodes}
                                                    initialEdges={project.flowData.edges}
                                                />
                                                {/* Overlay to indicate interactivity */}
                                                <div className="absolute top-4 right-4 z-10 pointers-events-none opacity-50 text-[10px] text-[#00F0FF] font-mono border border-[#00F0FF]/30 px-2 py-1 rounded bg-black/50 backdrop-blur">
                                                    INTERACTIVE DIAGRAM
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 rounded-xl bg-[#080808] border border-white/10 flex flex-wrap justify-center items-center gap-4 relative overflow-hidden">
                                                {/* Faux Data Flow Lines */}
                                                <div className="absolute inset-0 pointer-events-none opacity-20">
                                                    <svg width="100%" height="100%">
                                                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00F0FF" strokeWidth="0.5" />
                                                        </pattern>
                                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                                    </svg>
                                                </div>

                                                {project.architecture.map((node, i) => (
                                                    <div key={i} className="relative z-10 flex items-center">
                                                        <div className="px-4 py-2 rounded border border-[#D946EF]/50 bg-[#D946EF]/10 text-[#D946EF] text-xs md:text-sm font-mono tracking-wider shadow-[0_0_15px_rgba(217,70,239,0.15)]">
                                                            {node}
                                                        </div>
                                                        {i < project.architecture.length - 1 && (
                                                            <div className="hidden md:block w-8 h-[1px] bg-[#D946EF]/30 mx-2" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!project.flowData && (
                                            <div className="mt-3 text-right">
                                                <button className="text-xs text-[#00F0FF] hover:underline font-mono flex items-center justify-end gap-1 ml-auto">
                                                    View full diagram <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </section>
                                )}

                                {/* 6. Key Engineering Decisions */}
                                {project.engineeringDecisions && project.engineeringDecisions.length > 0 && (
                                    <section>
                                        <h3 className="section-title">KEY ENGINEERING DECISIONS</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {project.engineeringDecisions.map((item, i) => (
                                                <div key={i} className="border-l-2 border-[#00F0FF] pl-4 py-1">
                                                    <h4 className="text-white font-bold mb-1">{item.decision}</h4>
                                                    <p className="text-sm text-white/60 mb-2">Why: {item.why}</p>
                                                    <p className="text-sm text-[#00F0FF]/80">Impact: {item.impact}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 7. Security & Reliability */}
                                {project.security && project.security.length > 0 && (
                                    <section>
                                        <h3 className="section-title">SECURITY & RELIABILITY</h3>
                                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                                            {project.security.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                                                    <Shield className="w-4 h-4 text-[#D946EF]" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 8. Results */}
                                {project.results && project.results.length > 0 && (
                                    <section>
                                        <h3 className="section-title">RESULTS & METRICS</h3>
                                        <div className="flex flex-col gap-3">
                                            {project.results.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded bg-white/5 border-l-2 border-[#00ff9d]">
                                                    <Activity className="w-4 h-4 text-[#00ff9d]" />
                                                    <span className="text-sm text-white/90">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 9. Links */}
                                <section className="pt-6 border-t border-white/10">
                                    <h3 className="section-title mb-6">PROJECT RESOURCES</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <a
                                            href={project.links.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/20 transition-all group"
                                        >
                                            <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="font-mono text-sm uppercase tracking-wider">View GitHub Repo</span>
                                        </a>
                                        <a
                                            href={project.links.allRepos}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                                        >
                                            <Github className="w-5 h-5 opacity-60" />
                                            <span className="font-mono text-sm uppercase tracking-wider">View All Repos</span>
                                        </a>
                                        {project.links.demo && (
                                            <a
                                                href={project.links.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#D946EF]/10 border border-[#D946EF]/50 text-[#D946EF] hover:bg-[#D946EF]/20 transition-all"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                                <span className="font-mono text-sm uppercase tracking-wider">Live Demo</span>
                                            </a>
                                        )}
                                    </div>
                                </section>

                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="flex-shrink-0 p-4 border-t border-[#ffffff]/10 bg-[#050505] flex items-center justify-between z-20">
                            <div className="flex gap-2">
                                <button
                                    onClick={onPrev}
                                    className="flex items-center gap-2 px-4 py-2 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-mono uppercase tracking-wider"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden md:inline">Previous</span>
                                </button>
                                <button
                                    onClick={onNext}
                                    className="flex items-center gap-2 px-4 py-2 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-mono uppercase tracking-wider"
                                >
                                    <span className="hidden md:inline">Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href={project.links.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs md:text-sm text-[#00F0FF] hover:underline font-mono uppercase tracking-wider"
                                >
                                    View Repo
                                </a>
                            </div>
                        </footer>
                    </motion.div>

                    <style jsx global>{`
                .section-title {
                    font-family: var(--font-heading), sans-serif;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #555;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .section-title::after {
                    content: "";
                    height: 1px;
                    flex: 1;
                    background: rgba(255,255,255,0.1);
                }
            `}</style>
                </div>
            )}
        </AnimatePresence>
    );
}
