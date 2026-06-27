export default function AboutPage() {
  return (
    <>
      <div className="hero">
        <h1>About</h1>
        <p>
          Quranic Arabic Explorer — word-by-word analysis for students of Classical /
          Fuṣḥā Arabic.
        </p>
      </div>

      <h2 className="section-title">What this is</h2>
      <p>
        Quranic Arabic Explorer lets you open any verse of the Quran and see it broken
        down word by word: each word&apos;s type, transliteration and meaning, root,
        morphology (verb form, aspect, mood, voice, case, person, gender, number), and
        the traditional إعراب (iʿrāb) — its grammatical role. The verse text itself
        stays true to the original Uthmani script; implied or elided words supplied by
        grammarians are not inserted into it.
      </p>
      <p>
        Click any word to see its full grammar and browse every other place in the
        Quran where the same root appears.
      </p>

      <h2 className="section-title">Data sources &amp; licensing</h2>
      <p>
        Morphological and syntactic (dependency treebank) data is from the{" "}
        <a
          href="https://github.com/NoorBayan/Quranic"
          target="_blank"
          rel="noreferrer"
        >
          NoorBayan/Quranic
        </a>{" "}
        corpus, licensed under the MIT License.
      </p>
      <p>
        Surah metadata (names, revelation type, ayah counts) is from{" "}
        <a
          href="https://github.com/risan/quran-json"
          target="_blank"
          rel="noreferrer"
        >
          risan/quran-json
        </a>
        .
      </p>
      <p>
        English word glosses are derived from the per-word translation field in
        the morphology corpus above.
      </p>

      <h2 className="section-title">Source code</h2>
      <p>
        This site is open source. Grammar terminology in the glossary follows
        traditional Arabic grammar (النحو) as used by the Quranic Arabic Corpus
        tradition.
      </p>
    </>
  );
}
