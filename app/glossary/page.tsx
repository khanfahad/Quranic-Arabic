import glossary from "@/public/data/glossary.json";
import type { Glossary } from "@/lib/types";

const data = glossary as Glossary;

export default function GlossaryPage() {
  return (
    <>
      <div className="hero">
        <h1>Grammar glossary</h1>
        <p>Part-of-speech tags and i&apos;rab (grammatical role) terms used throughout the site.</p>
      </div>

      <h2 className="section-title">Parts of speech</h2>
      <table className="glossary-table">
        <thead>
          <tr>
            <th>Arabic</th>
            <th>Code</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {data.pos.map((t) => (
            <tr key={t.code}>
              <td className="arabic">{t.ar}</td>
              <td>{t.code}</td>
              <td>{t.en}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section-title">Grammatical roles (i&apos;rab)</h2>
      <table className="glossary-table">
        <thead>
          <tr>
            <th>Arabic</th>
            <th>Code</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {data.rel.map((t) => (
            <tr key={t.code}>
              <td className="arabic">{t.ar}</td>
              <td>{t.code}</td>
              <td>{t.en}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
