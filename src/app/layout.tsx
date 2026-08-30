import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Two families. Newsreader carries both the display and the prose; its
 * optical-size axis is deliberately not requested, which halves the font
 * payload. JetBrains Mono carries data only — SHAs, paths, dates, counts.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
  adjustFontFallback: false,
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const description =
  "An audited record of the engineering work of Gaurav Vijay Jadhav. Every claim carries its source; the claims the record cannot support are named and left unclaimed.";

export const metadata: Metadata = {
  metadataBase: new URL("https://iamgaurav.online"),
  title: "The Record — Gaurav Vijay Jadhav",
  description,
  authors: [{ name: "Gaurav Vijay Jadhav", url: "https://github.com/jadhavgaurav" }],
  openGraph: {
    title: "The Record — Gaurav Vijay Jadhav",
    description,
    type: "profile",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: "The Record — Gaurav Vijay Jadhav", description },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png" }],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${mono.variable}`}>
        <a
          href="#record"
          className="u-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:text-ink"
        >
          Skip to the written record
        </a>
        {children}
      </body>
    </html>
  );
}
