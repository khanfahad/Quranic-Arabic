"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSurahs } from "@/lib/data";
import type { SurahMeta } from "@/lib/types";
import SurahPicker from "@/components/SurahPicker";

export default function HomePage() {
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

  return (
    <>
      <div className="hero">
        <h1>Learn Quranic Arabic, verse by verse</h1>
        <p>Pick a verse, see its full i&apos;rab, and click any word for its grammar.</p>
      </div>

      <SurahPicker surahs={surahs} />

      {surahs.length === 0 ? (
        <p className="loading">Loading surahs…</p>
      ) : (
        <div className="surah-grid">
          {surahs.map((s) => (
            <Link key={s.id} href={`/surah/${s.id}`}>
              <span className="num">{s.id}</span>
              <span className="arabic">{s.nameArabic}</span> {s.nameTransliteration}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
