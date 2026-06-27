"use client";

import { useState } from "react";
import type { Ayah, WordToken as WordTokenType } from "@/lib/types";
import WordBreakdown from "./WordBreakdown";
import WordDetailPanel from "./WordDetailPanel";

// The treebank splits each orthographic word into morphological segments
// (e.g. the "ال" prefix and its noun are separate tokens). Group consecutive
// segments that belong to the same word (location's surah:ayah:word part).
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

const CONTENT_POS = ["V", "N", "PN", "ADJ", "PRON", "DEM", "REL", "T", "LOC", "IMPN"];

// The "main" segment of a word — the one a click should reveal, and whose case
// drives the underline colour. Prefer the root-bearing stem, then a content
// word, else the last segment.
function mainSegment(group: WordTokenType[]): WordTokenType {
  return (
    group.find((w) => w.root) ??
    group.find((w) => CONTENT_POS.includes(w.pos ?? "")) ??
    group[group.length - 1]
  );
}

function caseClass(c: string | null): string {
  if (!c) return "";
  if (c.startsWith("Nom")) return "case-nom";
  if (c.startsWith("Acc")) return "case-acc";
  if (c.startsWith("Gen")) return "case-gen";
  return "";
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
  const groups = groupByWord(realWords);

  return (
    <div
      id={`ayah-${ayah.ayah}`}
      className={`ayah-card${highlighted ? " highlighted" : ""}`}
    >
      <span className="ayah-number-badge">
        {surah}:{ayah.ayah}
      </span>
      <div className="word-strip">
        {groups.map((group) => {
          // Render the whole word as ONE text run; Arabic letters do not join
          // across element boundaries, so per-segment spans break the script.
          const main = mainSegment(group);
          const text = group.map((w) => w.textUthmani ?? "").join("");
          const selected = main.id === selectedWordId;
          const classes = [
            "word-unit",
            caseClass(main.features.nominalCase),
            selected ? "selected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <span
              key={group[0].id}
              className={classes}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedWordId(selected ? null : main.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedWordId(selected ? null : main.id);
                }
              }}
            >
              {text}
            </span>
          );
        })}
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
