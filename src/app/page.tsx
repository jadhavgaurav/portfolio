"use client";

import { useEffect, useState } from "react";
import { CustomCursor } from "@/components/custom-cursor";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { TechStack } from "@/components/tech-stack";
import { ProjectsSection } from "@/components/projects-section";
import { ExperienceSection } from "@/components/experience-section";
import { ContactSection } from "@/components/contact-section";
import { AmbientBackground } from "@/components/ambient-background";
import { LoadingScreen } from "@/components/loading-screen";

export default function PortfolioPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Hide default cursor
        document.body.style.cursor = "none";

        // Add smooth scrolling
        document.documentElement.style.scrollBehavior = "smooth";

        // Apply font family to body
        // Note: Fonts should ideally be handled by Next.js font optimization in layout/globals, 
        // but keeping strict fidelity to original logic for now.
        document.body.style.fontFamily = "'Space Grotesk', sans-serif";

        return () => {
            document.body.style.cursor = "auto";
        };
    }, []);

    if (isLoading) {
        return <LoadingScreen onComplete={() => setIsLoading(false)} />;
    }

    return (
        <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden">
            {/* Custom Cursor */}
            <CustomCursor />

            {/* Ambient Background Effects */}
            <AmbientBackground />
            <div className="fixed inset-0 pointer-events-none">
                {/* Animated noise texture */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="relative z-10">
                <HeroSection />
                <TechStack />
                <ProjectsSection />
                <ExperienceSection />
                <ContactSection />
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-6 border-t border-[#00F0FF]/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div
                            className="text-sm opacity-60"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            © 2024 Gaurav Vijay Jadhav. All systems operational.
                        </div>
                        <div
                            className="text-sm opacity-60"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            Designed & Engineered with{" "}
                            <span className="text-[#00F0FF]">◆</span> Neural Intelligence
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
