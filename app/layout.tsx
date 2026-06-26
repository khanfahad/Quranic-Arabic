import type { Metadata } from "next";
import { Amiri, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const arabicFont = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const uiFont = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I'rab — Learn Quranic Arabic Grammar",
  description:
    "Explore the grammar, morphology, and meaning of any verse of the Quran, word by word.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${arabicFont.variable} ${uiFont.variable}`}>
        <header className="site-header">
          <Link href="/" className="site-title">
            إِعْرَاب <span className="site-title-en">I&apos;rab</span>
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
