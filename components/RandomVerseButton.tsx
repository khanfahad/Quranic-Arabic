"use client";

import { useRouter } from "next/navigation";
import { basePath } from "@/lib/data";
import type { SurahMeta } from "@/lib/types";

export default function RandomVerseButton({ surahs }: { surahs: SurahMeta[] }) {
  const router = useRouter();

  function goRandom() {
    if (surahs.length === 0) return;
    const surah = surahs[Math.floor(Math.random() * surahs.length)];
    const ayah = 1 + Math.floor(Math.random() * surah.ayahCount);
    router.push(`${basePath}/surah/${surah.id}#ayah-${ayah}`);
  }

  return (
    <button className="secondary" onClick={goRandom}>
      Random verse
    </button>
  );
}
