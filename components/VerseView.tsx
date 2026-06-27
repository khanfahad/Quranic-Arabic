"use client";

import { useState } from "react";
import type { Ayah, WordToken as WordTokenType } from "@/lib/types";
import WordToken from "./WordToken";
import WordBreakdown from "./WordBreakdown";
import WordDetailPanel from "./WordDetailPanel";

// The treebank splits each orthographic word into morphological segments
// (e.g. the "ال" prefix and its noun are separate tokens). Group consecutive
// segments that belong to the same word (location's surah:ayah:word part) so
// they render as one joined unit instead of being torn apart by word-strip's
// flex gap.
function groupByWord(words: WordTokenType[]): WordTokenType[][] {
  const groups: WordTokenType[][] = [];
  let lastKey: string | null = null;
  for (const w of words) {
    const key = w.location ? w.location.split(":").slice(0, 3).join(":") : `_${w.id}`;
    if (key === lastKey && groups.length > 0) {
      groups[groups.length - 1].push(w);
    } else {
      groups.push([w]);
      lastKey = key;
    }
  }
  return groups;
}

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
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Elided tokens (implied subject pronouns, omitted predicates, etc.) are
  // supplied by the grammarians but are not part of the mushaf text — keep the
  // displayed verse and breakdown true to the original script by dropping them.
  const realWords = ayah.words.filter((w) => !w.isElided);
  const selectedWord = realWords.find((w) => w.id === selectedWordId) ?? null;

  return (
    <div
      id={`ayah-${ayah.ayah}`}
      className={`ayah-card${highlighted ? " highlighted" : ""}`}
    >
      <span className="ayah-number-badge">
        {surah}:{ayah.ayah}
      </span>
      <div className="word-strip">
        {groupByWord(realWords).map((group) => (
          <span className="word-group" key={group[0].id}>
            {group.map((w) => (
              <WordToken
                key={w.id}
                word={w}
                selected={w.id === selectedWordId}
                onClick={() => setSelectedWordId(w.id === selectedWordId ? null : w.id)}
              />
            ))}
          </span>
        ))}
      </div>
      {ayah.translation && <p className="translation">{ayah.translation}</p>}

      <div className="ayah-actions">
        <button onClick={() => setShowBreakdown((v) => !v)}>
          {showBreakdown ? "Hide breakdown" : "Word-by-word breakdown"}
        </button>
      </div>

      {showBreakdown && (
        <WordBreakdown words={realWords} onWordClick={setSelectedWordId} />
      )}

      {selectedWord && (
        <WordDetailPanel word={selectedWord} onClose={() => setSelectedWordId(null)} />
      )}
    </div>
  );
}
