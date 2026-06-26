export default function AboutPage() {
  return (
    <>
      <div className="hero">
        <h1>About I&apos;rab</h1>
        <p>A study tool for students of Classical / Fus-ha Arabic.</p>
      </div>

      <h2 className="section-title">What this is</h2>
      <p>
        I&apos;rab lets you open any verse of the Quran and see it broken down word by
        word: root, lemma, part of speech, full morphological features (verb form,
        aspect, mood, voice, case, person, gender, number), and the traditional
        إعراب (i&apos;rab) — each word&apos;s grammatical role and what it depends on,
        including dependencies that span across multiple verses within the same
        sentence.
      </p>
      <p>
        Click any word in a verse to see its full grammar, and browse every other
        place in the Quran where the same root appears.
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
