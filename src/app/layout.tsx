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

/* This described the written record that no longer exists. What is at this
   address now is a 3D world generated from the commit history, so that is
   what the link says when someone shares it. */
const title = "NULL — Gaurav Vijay Jadhav";
const description =
  "A world generated from a real commit history: forty repositories, four hundred and thirty-three commits, walked first commit to last. Every structure is a repository, its mass is its commit count, its decay is the time since it was last touched.";

export const metadata: Metadata = {
  metadataBase: new URL("https://iamgaurav.online"),
  title,
  description,
  authors: [{ name: "Gaurav Vijay Jadhav", url: "https://github.com/jadhavgaurav" }],
  openGraph: { title, description, type: "profile", locale: "en_IN" },
  /* summary_large_image was declared with no image, which renders as a blank
     card rather than as no card. The image is generated in opengraph-image. */
  twitter: { card: "summary_large_image", title, description },
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
