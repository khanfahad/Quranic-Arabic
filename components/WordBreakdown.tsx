"use client";

import type { WordToken } from "@/lib/types";

// Map the corpus POS codes onto the four broad word categories used by the
// breakdown (mirrors the colour-coded legend). أسماء such as the
// demonstrative/relative are grouped with pronouns since that is how they
// read in English ("demonstrative pronoun", "relative pronoun").
const CATEGORY: Record<string, "verb" | "noun" | "particle" | "pronoun"> = {
  V: "verb",
  IMPN: "verb",
  N: "noun",
  PN: "noun",
  ADJ: "noun",
  T: "noun",
  LOC: "noun",
  PRON: "pronoun",
  DEM: "pronoun",
  REL: "pronoun",
};

const CATEGORY_LABELS: Record<string, string> = {
  verb: "فعل Verb",
  noun: "اسم Noun",
  particle: "حرف Particle",
  pronoun: "ضمير Pronoun",
  other: "Other",
};

function categoryOf(word: WordToken): string {
  if (!word.pos) return "other";
  return CATEGORY[word.pos] ?? "particle";
}

export function BreakdownLegend() {
  return (
    <div className="bd-legend">
      {(["verb", "noun", "particle", "pronoun"] as const).map((cat) => (
        <span key={cat} className={`bd-chip cat-${cat}`}>
          <span className="arabic">{CATEGORY_LABELS[cat].split(" ")[0]}</span>{" "}
          {CATEGORY_LABELS[cat].split(" ")[1]}
        </span>
      ))}
    </div>
  );
}

export default function WordBreakdown({
  words,
  onWordClick,
}: {
  words: WordToken[];
  onWordClick?: (id: number) => void;
}) {
  return (
    <>
      <BreakdownLegend />
      <div className="word-cards">
        {words.map((w) => {
          const cat = categoryOf(w);
          return (
            <div
              key={w.id}
              className={`word-card cat-${cat}${onWordClick ? " clickable" : ""}`}
              onClick={onWordClick ? () => onWordClick(w.id) : undefined}
              role={onWordClick ? "button" : undefined}
              tabIndex={onWordClick ? 0 : undefined}
              onKeyDown={
                onWordClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") onWordClick(w.id);
                    }
                  : undefined
              }
            >
              <div className="word-card-head">
                <span className="arabic word-card-ar">{w.textUthmani}</span>
                <span className={`bd-badge cat-${cat}`}>{CATEGORY_LABELS[cat]}</span>
              </div>
              <div className="word-card-body">
                <div className="word-card-meaning">
                  {w.transliteration && (
                    <span className="wc-translit">{w.transliteration}</span>
                  )}
                  {w.transliteration && w.gloss && <span className="wc-dash">—</span>}
                  {w.gloss && <span className="wc-gloss">{w.gloss}</span>}
                </div>
                {w.root && (
                  <div className="wc-root">
                    <span className="wc-root-label arabic">جذر</span>
                    <span className="arabic wc-root-letters">
                      {(w.rootAr ?? w.root).split("").join(" ")}
                    </span>
                  </div>
                )}
                <div className="wc-grammar">
                  {w.tag && (
                    <div className="wc-line">
                      <span className="wc-key">Morphology</span>
                      <span className="wc-val">{w.tag}</span>
                    </div>
                  )}
                  {(w.relAr || w.relEn) && w.rel !== "NonRel" && (
                    <div className="wc-line">
                      <span className="wc-key">Iʿrāb</span>
                      <span className="wc-val">
                        {w.relAr && <span className="arabic wc-irab-ar">{w.relAr}</span>}
                        {w.relAr && w.relEn && " — "}
                        {w.relEn}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
