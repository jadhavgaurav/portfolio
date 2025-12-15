"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { capabilitiesData, Skill, CapabilityCategory } from "@/data/capabilities";
import { twMerge } from "tailwind-merge";

type FilterLevel = "core" | "core_proficient" | "all";

export function CapabilitiesSection() {
    const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <section className="relative py-24 px-6 overflow-hidden">
            {/* Background/Ambient touches - minimalist */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#00F0FF] opacity-[0.03] blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span
                            className="text-sm tracking-wider opacity-60 mb-2 block font-body"
                            style={{
                                color: "#00F0FF",
                            }}
                        >
                            {"// SKILL_MATRIX_V1.0"}
                        </span>
                        <div className="flex items-center gap-3">
                            <h2
                                className="text-3xl md:text-5xl tracking-wide font-heading"
                                style={{
                                    color: "#ffffff",
                                }}
                            >
                                CAPABILITIES
                            </h2>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-3 flex items-center gap-2 text-xs opacity-50 hover:opacity-100 transition-opacity font-body"
                        >
                            <Info className="w-3 h-3" />
                            View capability definitions
                        </button>
                    </motion.div>

                    {/* Filter Pills */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <FilterPills current={filterLevel} onChange={setFilterLevel} />
                    </motion.div>
                </div>

                {/* Desktop Matrix */}
                <div className="hidden md:block">
                    <SkillMatrixDesktop filterLevel={filterLevel} />
                </div>

                {/* Mobile Accordion */}
                <div className="md:hidden">
                    <SkillMatrixMobile filterLevel={filterLevel} />
                </div>
            </div>

            {/* Definitions Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <DefinitionsModal onClose={() => setIsModalOpen(false)} />
                )}
            </AnimatePresence>
        </section>
    );
}

// --- Components ---

function FilterPills({
    current,
    onChange,
}: {
    current: FilterLevel;
    onChange: (level: FilterLevel) => void;
}) {
    const options: { id: FilterLevel; label: string }[] = [
        { id: "core", label: "Show Core Only" },
        { id: "core_proficient", label: "Core + Proficient" },
        { id: "all", label: "Show All" },
    ];

    return (
        <div
            className="flex p-1 rounded-full bg-[#0A0A0A] border border-white/10 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            {options.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
                    className={twMerge(
                        "px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-300 font-body",
                        current === opt.id
                            ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                            : "text-white/40 hover:text-white/70"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function SkillMatrixDesktop({ filterLevel }: { filterLevel: FilterLevel }) {
    // Column Headers
    const columns = ["CORE", "PROFICIENT", "FAMILIAR"];

    return (
        <div className="w-full border border-[#00F0FF]/20 rounded-2xl overflow-hidden backdrop-blur-sm bg-black/20">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#00F0FF]/10 bg-white/[0.02]">
                <div className="col-span-3 text-xs tracking-wider opacity-40 font-bold font-body">
                    CATEGORY
                </div>
                <div className="col-span-9 grid grid-cols-3 gap-4">
                    {columns.map((col) => (
                        <div
                            key={col}
                            className={twMerge(
                                "text-xs tracking-wider opacity-40 font-bold px-2 font-body",
                                // Fade out columns based on filter? 
                                // Requirement says "Filter toggles change visible chips", 
                                // but usually columns remain to maintain structure or headers fade.
                                // We'll keep headers but maybe dim them if entire column is hidden (not requested).
                            )}
                        >
                            {col}
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-[#00F0FF]/10">
                {capabilitiesData.map((row, idx) => (
                    <MatrixRow key={row.category} data={row} filterLevel={filterLevel} index={idx} />
                ))}
            </div>
        </div>
    );
}

function MatrixRow({ data, filterLevel, index }: { data: CapabilityCategory; filterLevel: FilterLevel; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="grid grid-cols-12 gap-4 px-6 py-6 group hover:bg-[#00F0FF]/[0.02] transition-colors duration-300 min-h-[96px] items-start"
        >
            {/* Category Name */}
            <div className="col-span-3 flex flex-col gap-2">
                <span className="text-sm font-semibold text-white/90 font-heading">
                    {data.category}
                </span>
                {data.projectBadge && (
                    <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 w-fit border border-white/5 font-body"
                    >
                        {data.projectBadge}
                    </span>
                )}
            </div>

            {/* Skills Grid */}
            <div className="col-span-9 grid grid-cols-3 gap-4">
                {/* Core */}
                <SkillCell skills={data.core} isVisible={true} type="core" />

                {/* Proficient */}
                <SkillCell skills={data.proficient} isVisible={filterLevel !== "core"} type="proficient" />

                {/* Familiar */}
                <SkillCell skills={data.familiar} isVisible={filterLevel === "all"} type="familiar" />
            </div>
        </motion.div>
    );
}

function SkillCell({ skills, isVisible, type }: { skills: Skill[]; isVisible: boolean; type: "core" | "proficient" | "familiar" }) {
    const maxChips = 10;
    const displaySkills = skills.slice(0, maxChips);
    const remaining = skills.length - maxChips;

    return (
        <div className={twMerge("flex flex-wrap content-start gap-2", !isVisible && "opacity-10 blur-[1px] pointer-events-none grayscale")}>
            {displaySkills.map((skill) => (
                <SkillChip key={skill.name} skill={skill} type={type} />
            ))}
            {remaining > 0 && isVisible && (
                <span
                    className="text-[10px] opacity-40 px-2 flex items-center font-body"
                >
                    +{remaining} more
                </span>
            )}
        </div>
    );
}

function SkillChip({ skill, type }: { skill: Skill; type: "core" | "proficient" | "familiar" }) {
    // Determine color based on type for subtle border/glow diff if needed, 
    // but requirement says "Border: 1px neon stroke" for hover.
    // Base style:

    return (
        <div className="relative group/chip">
            <div
                className="px-3 py-1.5 rounded bg-[#0A0A0A] border border-[#00F0FF]/20 text-xs text-white/80 cursor-default transition-all duration-300 
                  hover:-translate-y-1 hover:border-[#00F0FF] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:text-white font-body"
            >
                {skill.name}
            </div>

            {/* Tooltip */}
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full px-3 py-2 bg-black/90 border border-[#00F0FF]/40 rounded backdrop-blur-md opacity-0 group-hover/chip:opacity-100 transition-all duration-200 pointer-events-none w-max max-w-[200px] z-50 shadow-xl">
                <p className="text-[10px] text-[#00F0FF] font-body">
                    {type.toUpperCase()}
                </p>

                {skill.description && (
                    <p className="text-xs text-white/80 mt-1">{skill.description}</p>
                )}

                {skill.projectId && (
                    <div className="mt-1 pt-1 border-t border-white/10 flex items-center gap-1">
                        <span className="text-[10px] opacity-50">Used in:</span>
                        <span className="text-[10px] text-white/90">{skill.projectId}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function SkillMatrixMobile({ filterLevel }: { filterLevel: FilterLevel }) {
    return (
        <div className="flex flex-col gap-4">
            {capabilitiesData.map((row, idx) => (
                <MobileAccordionRow key={row.category} data={row} filterLevel={filterLevel} index={idx} />
            ))}
        </div>
    );
}

function MobileAccordionRow({ data, filterLevel }: { data: CapabilityCategory; filterLevel: FilterLevel; index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-[#00F0FF]/20 rounded-lg overflow-hidden bg-white/[0.02]"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white/[0.01]"
            >
                <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold text-white/90 font-heading">
                        {data.category}
                    </span>
                    {data.projectBadge && (
                        <span className="text-[10px] opacity-50 font-mono">{data.projectBadge}</span>
                    )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#00F0FF]" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 flex flex-col gap-4">
                            {/* Core */}
                            <div className="mt-2">
                                <div className="text-[10px] text-[#00F0FF] mb-2 font-mono">CORE</div>
                                <SkillCell skills={data.core} isVisible={true} type="core" />
                            </div>

                            {/* Proficient */}
                            {filterLevel !== "core" && (
                                <div>
                                    <div className="text-[10px] text-[#00F0FF] mb-2 font-mono">PROFICIENT</div>
                                    <SkillCell skills={data.proficient} isVisible={true} type="proficient" />
                                </div>
                            )}

                            {/* Familiar */}
                            {filterLevel === "all" && (
                                <div>
                                    <div className="text-[10px] text-[#00F0FF] mb-2 font-mono">FAMILIAR</div>
                                    <SkillCell skills={data.familiar} isVisible={true} type="familiar" />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function DefinitionsModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0A0A0A] border border-[#00F0FF]/30 p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(0,240,255,0.1)]"
            >
                <h3 className="text-xl mb-6 text-white font-heading">
                    Capability Definitions
                </h3>

                <div className="space-y-6">
                    <div>
                        <div className="text-[#00F0FF] text-xs font-bold mb-1 font-body">CORE</div>
                        <p className="text-sm text-white/70">Shipped and owned end-to-end. Deep understanding of internals and best practices.</p>
                    </div>
                    <div>
                        <div className="text-[#00F0FF] text-xs font-bold mb-1 font-body">PROFICIENT</div>
                        <p className="text-sm text-white/70">Built production features and debugged independently. Comfortable contributing to complex codebases.</p>
                    </div>
                    <div>
                        <div className="text-[#00F0FF] text-xs font-bold mb-1 font-body">FAMILIAR</div>
                        <p className="text-sm text-white/70">Implemented in projects or labs. Can contribute with guidance or documentation lookup.</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full py-3 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 hover:bg-[#00F0FF]/20 transition-colors font-body"
                >
                    Close
                </button>
            </motion.div>
        </div>
    );
}
