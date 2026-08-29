import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/** Narration, field observations, specimen prose. Italic carries annotation. */
const newsreader = Newsreader({
    subsets: ["latin"],
    variable: "--font-newsreader",
    weight: ["300", "400", "500"],
    style: ["normal", "italic"],
    display: "swap",
});

/** The entire instrument layer: depths, dates, labels, byte counts. */
const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    variable: "--font-plex-mono",
    weight: ["400", "500"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Strata — Gaurav Vijay Jadhav",
    description:
        "A core sample drilled through 46 public repositories, May 2023 to August 2026. Depth is time; the deeper you go, the older the work.",
    icons: {
        icon: [
            { url: "/favicon/favicon.ico" },
            { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [{ url: "/favicon/apple-touch-icon.png" }],
    },
    manifest: "/favicon/site.webmanifest",
    openGraph: {
        title: "Strata — Gaurav Vijay Jadhav",
        description:
            "A core sample drilled through 46 public repositories. Depth is time.",
        type: "profile",
    },
};

export const viewport = {
    themeColor: "#E7E2D6",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${newsreader.variable} ${plexMono.variable}`}>
            <body className="grain">{children}</body>
        </html>
    );
}
