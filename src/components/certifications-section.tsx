"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { certifications, Certification } from "@/data/certifications";
import { ExternalLink, ChevronDown, Award, X } from "lucide-react";
import { twMerge } from "tailwind-merge";

const FILTERS = ["ALL", "IBM", "DATABRICKS", "FORAGE", "IT VEDANT"];
const SORT_OPTIONS = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Issuer A-Z", value: "issuer" },
];

export function CertificationsSection() {
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [sortOption, setSortOption] = useState("newest");
    const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

    const filteredAndSortedCerts = useMemo(() => {
        let result = [...certifications];

        // Filter
        if (activeFilter !== "ALL") {
            result = result.filter((cert) =>
                cert.issuer.toUpperCase().includes(activeFilter)
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortOption === "newest") {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else if (sortOption === "oldest") {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortOption === "issuer") {
                return a.issuer.localeCompare(b.issuer);
            }
            return 0;
        });

        return result;
    }, [activeFilter, sortOption]);

    return (
        <section id="certifications" className="relative py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl md:text-5xl font-heading tracking-wide text-white">
                            CERTIFICATIONS
                        </h2>
                        <p className="text-[#a0a0a0] font-mono text-sm md:text-base max-w-xl">
                            Verified learning and skill badges across AI, ML, and analytics.
                        </p>
                    </motion.div>

                    {/* Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row gap-4 sm:items-center"
                    >
                        {/* Filter Pills */}
                        <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar mask-gradient-x sm:mask-none">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={twMerge(
                                        "px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-all duration-300 border",
                                        activeFilter === filter
                                            ? "bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative group min-w-[160px]">
                            <div className="absolute inset-0 bg-[#00F0FF]/10 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-black/90 border border-white/10 rounded-lg p-1 overflow-hidden">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full bg-transparent text-white/80 text-sm font-mono px-3 py-2 outline-none cursor-pointer appearance-none"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value} className="bg-black text-white">
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Certifications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredAndSortedCerts.map((cert) => (
                            <CertificationCard
                                key={cert.id}
                                cert={cert}
                                onClick={() => setSelectedCert(cert)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {selectedCert && (
                <CertificationModal
                    cert={selectedCert}
                    isOpen={!!selectedCert}
                    onClose={() => setSelectedCert(null)}
                />
            )}
        </section>
    );
}

function CertificationCard({
    cert,
    onClick,
}: {
    cert: Certification;
    onClick: () => void;
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative cursor-pointer"
            onClick={onClick}
        >
            <div className="relative h-full min-h-[180px] p-6 rounded-xl overflow-hidden glass border border-[#00F0FF]/20 group-hover:border-[#00F0FF]/50 transition-colors duration-300">
                {/* Glow Hover Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#00F0FF]/5 via-transparent to-[#D946EF]/5" />

                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Award className="w-4 h-4 text-[#00F0FF]" />
                            </div>
                            <span className="font-mono text-xs tracking-wider text-[#00F0FF] uppercase">
                                {cert.issuer}
                            </span>
                        </div>
                        <div className="text-xs font-mono text-white/40">{cert.displayDate}</div>
                    </div>

                    {/* Title */}
                    <div>
                        <h3 className="text-lg font-heading leading-tight text-white group-hover:text-[#00F0FF] transition-colors mb-2 line-clamp-2" title={cert.title}>
                            {cert.title}
                        </h3>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {cert.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-white/60 border border-white/5"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                        <button className="text-xs font-mono text-white/60 group-hover:text-white flex items-center gap-2 transition-colors">
                            VIEW CREDENTIAL
                        </button>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-3 h-3 text-[#00F0FF]" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CertificationModal({
    cert,
    isOpen,
    onClose,
}: {
    cert: Certification;
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#050505] border border-[#00F0FF]/30 rounded-2xl p-6 md:p-8 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)]"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-20"
                >
                    <X className="w-5 h-5 pointer-events-none" />
                </button>

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#00F0FF]/10 flex items-center justify-center border border-[#00F0FF]/20">
                            <Award className="w-6 h-6 text-[#00F0FF]" />
                        </div>
                        <div>
                            <div className="font-mono text-sm text-[#00F0FF] mb-1">
                                {cert.issuer}
                            </div>
                            <div className="font-mono text-xs text-white/40">
                                Issued {cert.displayDate}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-heading text-white">{cert.title}</h3>

                    {cert.skillsCovered && (
                        <div>
                            <h4 className="font-mono text-sm text-white/60 mb-3 border-b border-white/10 pb-2">
                                SKILLS COVERED
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {cert.skillsCovered.map((skill) => (
                                    <li key={skill} className="flex items-center gap-2 text-sm text-white/80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D946EF]" />
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pt-6">
                        <a
                            href={cert.credentialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={twMerge(
                                "flex items-center justify-center gap-2 w-full py-3 rounded-lg font-mono text-sm transition-all",
                                cert.credentialLink && cert.credentialLink !== "#"
                                    ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/50 hover:bg-[#00F0FF]/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                                    : "bg-white/5 text-white/40 cursor-not-allowed border border-white/10"
                            )}
                        >
                            <span>{cert.credentialLink && cert.credentialLink !== "#" ? "VERIFY CREDENTIAL" : "VERIFICATION PENDING"}</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
