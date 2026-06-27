import type { Metadata } from "next";
import { Amiri_Quran, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const arabicFont = Amiri_Quran({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-arabic",
  display: "swap",
});

const uiFont = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quranic Arabic Explorer",
  description:
    "Word-by-word analysis for Fuṣḥā Arabic students — the grammar, morphology, and iʿrāb of any verse of the Quran.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${arabicFont.variable} ${uiFont.variable}`}>
        <header className="site-header">
          <Link href="/" className="site-title">
            <span className="arabic">ٱلْقُرْآن</span>{" "}
            <span className="site-title-en">Quranic Arabic Explorer</span>
          </Link>
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/glossary">Glossary</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Built for students of Classical / Fus-ha Arabic. Grammar &amp; morphology data
            from the open Quranic Treebank. See the{" "}
            <Link href="/about">About</Link> page for data sources and licensing.
          </p>
        </footer>
      </body>
    </html>
  );
}
