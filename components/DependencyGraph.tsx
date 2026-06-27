"use client";

import type { WordToken } from "@/lib/types";
import { wordCategory } from "./WordBreakdown";

const CAT_COLOR: Record<string, string> = {
  verb: "#1f8b4c",
  noun: "#2273b5",
  particle: "#c9772a",
  pronoun: "#8245a8",
  other: "#6b7378",
};

const SLOT = 92; // horizontal space per word
const PAD_X = 28;

type Edge = {
  child: number;
  head: number;
  label: string;
  color: string;
  span: number;
};

// A dependency-arc diagram in the style of corpus.quran.com: words laid out
// right-to-left, each tagged with its part of speech, with labelled arcs from
// every word to its syntactic head. Elided/implied tokens are kept (shown as
// "(*)") because they are genuine nodes of the grammatical analysis.
export default function DependencyGraph({ words }: { words: WordToken[] }) {
  const n = words.length;
  const idToIndex = new Map<number, number>();
  words.forEach((w, i) => idToIndex.set(w.id, i));

  // Reading-order index i → x of the word's centre. First word sits rightmost.
  const cx = (i: number) => PAD_X + (n - 1 - i) * SLOT + SLOT / 2;
  const totalWidth = n * SLOT + PAD_X * 2;

  const edges: Edge[] = [];
  words.forEach((w, i) => {
    if (w.headId == null || w.rel === "NonRel" || !w.relAr) return;
    const head = idToIndex.get(w.headId);
    if (head === undefined || head === i) return;
    edges.push({
      child: i,
      head,
      label: w.relAr,
      color: CAT_COLOR[wordCategory(w.pos)] ?? CAT_COLOR.other,
      span: Math.abs(i - head),
    });
  });

  const arcHeight = (span: number) => 24 + span * 18;
  const maxH = edges.length ? Math.max(...edges.map((e) => arcHeight(e.span))) : 24;

  const topPad = 12;
  const wordBaseY = topPad + maxH + 18 + 22; // Arabic baseline
  const anchorY = wordBaseY - 20; // glyph top — where arcs attach
  const posY = wordBaseY + 20;
  const translitY = wordBaseY + 35;
  const svgH = translitY + 10;

  return (
    <div className="dep-graph-scroll">
      <svg
        className="dep-graph"
        width={totalWidth}
        height={svgH}
        role="img"
        aria-label="Dependency graph"
      >
        {edges.map((e, k) => {
          const xa = cx(e.child);
          const xb = cx(e.head);
          const h = arcHeight(e.span);
          const ctrlY = anchorY - h;
          const apexY = anchorY - h * 0.75;
          const midX = (xa + xb) / 2;
          const d = `M ${xa} ${anchorY} C ${xa} ${ctrlY} ${xb} ${ctrlY} ${xb} ${anchorY}`;
          return (
            <g key={k}>
              <path
                d={d}
                fill="none"
                stroke={e.color}
                strokeWidth={1.4}
                opacity={0.85}
              />
              {/* arrowhead points into the dependent (child) */}
              <polygon
                points={`${xa - 4},${anchorY - 8} ${xa + 4},${anchorY - 8} ${xa},${anchorY}`}
                fill={e.color}
              />
              <text
                x={midX}
                y={apexY - 4}
                textAnchor="middle"
                className="dep-label arabic"
                fill={e.color}
              >
                {e.label}
              </text>
            </g>
          );
        })}
        {words.map((w, i) => {
          const x = cx(i);
          const color = CAT_COLOR[wordCategory(w.pos)] ?? CAT_COLOR.other;
          return (
            <g key={w.id} className={w.isElided ? "dep-node elided" : "dep-node"}>
              <text x={x} y={wordBaseY} textAnchor="middle" className="dep-word arabic">
                {w.textUthmani ?? "(*)"}
              </text>
              <text x={x} y={posY} textAnchor="middle" className="dep-pos" fill={color}>
                {w.pos ?? ""}
              </text>
              {w.transliteration && (
                <text x={x} y={translitY} textAnchor="middle" className="dep-translit">
                  {w.transliteration}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
