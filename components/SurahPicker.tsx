"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SurahMeta } from "@/lib/types";
import RandomVerseButton from "./RandomVerseButton";

export default function SurahPicker({ surahs }: { surahs: SurahMeta[] }) {
  const router = useRouter();
  const [surahId, setSurahId] = useState(1);
  const [ayah, setAyah] = useState(1);

  const currentSurah = surahs.find((s) => s.id === surahId);
  const maxAyah = currentSurah?.ayahCount ?? 7;

  function goToVerse() {
    router.push(`/surah/${surahId}#ayah-${Math.min(ayah, maxAyah)}`);
  }

  return (
    <div className="picker-card">
      <div className="picker-row">
        <select
          value={surahId}
          onChange={(e) => {
            setSurahId(Number(e.target.value));
            setAyah(1);
          }}
        >
          {surahs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}. {s.nameTransliteration} ({s.nameEnglish})
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={maxAyah}
          value={ayah}
          onChange={(e) => setAyah(Number(e.target.value))}
          aria-label="Ayah number"
        />
        <button onClick={goToVerse}>Go to verse</button>
        <RandomVerseButton surahs={surahs} />
      </div>
    </div>
  );
}
