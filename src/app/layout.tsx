import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains-mono",
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Gaurav Vijay Jadhav | AI Engineer",
    description: "Portfolio of Gaurav Vijay Jadhav - AI Engineer, Data Scientist, Full Stack Architect.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#050505] text-white font-sans`}>
                {children}
            </body>
        </html>
    );
}
