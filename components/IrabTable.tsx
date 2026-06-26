import type { WordToken as WordTokenType } from "@/lib/types";

export default function IrabTable({ words }: { words: WordTokenType[] }) {
  return (
    <table className="irab-table">
      <thead>
        <tr>
          <th>Word</th>
          <th>Role (إعراب)</th>
          <th>Refers to</th>
        </tr>
      </thead>
      <tbody>
        {words.map((w) => (
          <tr key={w.id} className={w.isElided ? "elided" : ""}>
            <td className="arabic">{w.textUthmani ?? "(elided)"}</td>
            <td>
              {w.rel === "NonRel" ? (
                "attached particle"
              ) : w.rel ? (
                <>
                  <span className="rel-tag arabic">{w.relAr}</span> {w.rel}
                </>
              ) : (
                "—"
              )}
            </td>
            <td className="arabic">{w.headText ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
