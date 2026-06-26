"use client";

import { useState } from "react";
import type { Ayah } from "@/lib/types";
import WordToken from "./WordToken";
import IrabTable from "./IrabTable";
import WordDetailPanel from "./WordDetailPanel";

export default function VerseView({
  ayah,
  surah,
  highlighted,
}: {
  ayah: Ayah;
  surah: number;
  highlighted?: boolean;
}) {
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [showIrab, setShowIrab] = useState(false);

  const selectedWord = ayah.words.find((w) => w.id === selectedWordId) ?? null;

  return (
    <div
      id={`ayah-${ayah.ayah}`}
      className={`ayah-card${highlighted ? " highlighted" : ""}`}
    >
      <span className="ayah-number-badge">
        {surah}:{ayah.ayah}
      </span>
      <div className="word-strip">
        {ayah.words.map((w) => (
          <WordToken
            key={w.id}
            word={w}
            selected={w.id === selectedWordId}
            onClick={() => setSelectedWordId(w.id === selectedWordId ? null : w.id)}
          />
        ))}
      </div>
      {ayah.translation && <p className="translation">{ayah.translation}</p>}

      <div className="ayah-actions">
        <button onClick={() => setShowIrab((v) => !v)}>
          {showIrab ? "Hide i'rab" : "Show i'rab"}
        </button>
      </div>

      {showIrab && <IrabTable words={ayah.words} />}

      {selectedWord && (
        <WordDetailPanel word={selectedWord} onClose={() => setSelectedWordId(null)} />
      )}
    </div>
  );
}
