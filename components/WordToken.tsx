"use client";

import type { WordToken as WordTokenType } from "@/lib/types";

function caseClass(nominalCase: string | null): string {
  if (!nominalCase) return "";
  if (nominalCase.startsWith("NOM")) return "case-nom";
  if (nominalCase.startsWith("ACC")) return "case-acc";
  if (nominalCase.startsWith("GEN")) return "case-gen";
  return "";
}

export default function WordToken({
  word,
  selected,
  onClick,
}: {
  word: WordTokenType;
  selected: boolean;
  onClick: () => void;
}) {
  const text = word.textUthmani ?? word.textImlaai ?? "";
  const classes = ["word-token", caseClass(word.features.nominalCase)];
  if (selected) classes.push("selected");

  return (
    <span
      className={classes.join(" ")}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      {text}
      {word.isElided && <sup className="tok-prefix-marker">∅</sup>}
    </span>
  );
}
