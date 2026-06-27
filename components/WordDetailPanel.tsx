"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchRoot } from "@/lib/data";
import type { RootEntry, WordToken } from "@/lib/types";

export default function WordDetailPanel({
  word,
  onClose,
}: {
  word: WordToken;
  onClose: () => void;
}) {
  const [root, setRoot] = useState<RootEntry | null>(null);

  useEffect(() => {
    setRoot(null);
    if (!word.root) return;
    let active = true;
    fetchRoot(word.root).then((r) => {
      if (active) setRoot(r);
    });
    return () => {
      active = false;
    };
  }, [word.root]);

  const otherOccurrences =
    root?.occurrences.filter(
      (o) => !(o.surah === word.surah && o.ayah === word.ayah && o.location === word.location)
    ) ?? [];

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <button className="drawer-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="drawer-word arabic">{word.textUthmani ?? "(elided)"}</div>
        {word.transliteration && (
          <div className="drawer-translit">{word.transliteration}</div>
        )}
        {word.gloss && <div className="drawer-gloss">{word.gloss}</div>}

        <dl className="fact-grid">
          {word.pos && (
            <>
              <dt>Part of speech</dt>
              <dd>
                {word.posAr && <span className="arabic">{word.posAr}</span>} {word.tag ?? word.pos}
              </dd>
            </>
          )}
          {word.lemma && (
            <>
              <dt>Lemma</dt>
              <dd className="arabic">{word.lemmaAr ?? word.lemma}</dd>
            </>
          )}
          {word.root && (
            <>
              <dt>Root</dt>
              <dd className="arabic">{word.rootAr ?? word.root}</dd>
            </>
          )}
          {word.rel && word.rel !== "NonRel" && (
            <>
              <dt>Grammatical role</dt>
              <dd>
                {word.relAr && <span className="rel-tag arabic">{word.relAr}</span>}{" "}
                {word.relEn ?? word.rel}
              </dd>
            </>
          )}
          {word.rel === "NonRel" && (
            <>
              <dt>Grammatical role</dt>
              <dd>Attached particle (no independent role)</dd>
            </>
          )}
          {word.headText && (
            <>
              <dt>Refers to</dt>
              <dd className="arabic">{word.headText}</dd>
            </>
          )}
        </dl>

        {root && otherOccurrences.length > 0 && (
          <>
            <div className="section-title">
              Other occurrences of this root ({otherOccurrences.length})
            </div>
            <ul className="occurrence-list">
              {otherOccurrences.slice(0, 25).map((o, i) => (
                <li key={i}>
                  <span className="arabic">{o.textUthmani}</span>
                  <span className="occ-gloss">{o.gloss}</span>
                  <Link
                    className="occ-loc"
                    href={`/surah/${o.surah}#ayah-${o.ayah}`}
                  >
                    {o.surah}:{o.ayah}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
