"use client";

import { useEffect, useState } from "react";
import { fetchSurah, fetchSurahs } from "@/lib/data";
import type { Ayah, SurahMeta } from "@/lib/types";
import VerseView from "./VerseView";

export default function SurahPageClient({ surahId }: { surahId: number }) {
  const [meta, setMeta] = useState<SurahMeta | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);

  useEffect(() => {
    fetchSurahs().then((all) => setMeta(all.find((s) => s.id === surahId) ?? null));
    fetchSurah(surahId).then(setAyahs);
  }, [surahId]);

  useEffect(() => {
    if (!ayahs) return;
    const hash = window.location.hash;
    const match = hash.match(/^#ayah-(\d+)/);
    if (match) {
      const n = Number(match[1]);
      setHighlightedAyah(n);
      requestAnimationFrame(() => {
        document.getElementById(`ayah-${n}`)?.scrollIntoView({ block: "center" });
      });
    }
  }, [ayahs]);

  if (!ayahs) {
    return <p className="loading">Loading surah…</p>;
  }

  return (
    <>
      <div className="surah-heading">
        {meta && (
          <>
            <div className="arabic">{meta.nameArabic}</div>
            <div className="meta">
              {meta.nameTransliteration} — {meta.nameEnglish} · {meta.type} ·{" "}
              {meta.ayahCount} verses
            </div>
          </>
        )}
      </div>
      {ayahs.map((a) => (
        <VerseView
          key={a.ayah}
          ayah={a}
          surah={surahId}
          highlighted={a.ayah === highlightedAyah}
        />
      ))}
    </>
  );
}
