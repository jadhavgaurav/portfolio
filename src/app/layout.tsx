import type { Metadata } from "next";
import { Syne, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-hero",
    weight: ["700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["400", "500"],
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Gaurav Jadhav | AI Engineer",
    description: "Portfolio of Gaurav Vijay Jadhav - AI Engineer, Data Scientist, Full Stack Architect.",
    icons: {
        icon: [
            { url: "/favicon/favicon.ico" },
            { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            { url: "/favicon/apple-touch-icon.png" },
        ],
    },
    manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${syne.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased bg-[#050505] text-white font-body`}>
                {children}
            </body>
        </html>
    );
}
