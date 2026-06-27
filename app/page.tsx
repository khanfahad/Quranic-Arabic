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
        <h1>Quranic Arabic Explorer</h1>
        <p>
          Word-by-word analysis for Fuṣḥā Arabic students. Pick a verse and see every
          word broken down by type, morphology, root, and iʿrāb.
        </p>
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
