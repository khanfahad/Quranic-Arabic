export interface WordFeatures {
  segment: string | null;
  verbForm: string | null;
  verbAspect: string | null;
  verbMood: string | null;
  verbVoice: string | null;
  nominalState: string | null;
  nominalCase: string | null;
  derivedNoun: string | null;
  specialGroup: string | null;
  person: string | null;
  gender: string | null;
  number: string | null;
}

export interface WordToken {
  id: number;
  isElided: boolean;
  location: string | null;
  surah: number;
  ayah: number;
  textUthmani: string | null;
  textImlaai: string | null;
  transliteration: string | null;
  gloss: string | null;
  pos: string | null;
  posAr: string | null;
  lemma: string | null;
  lemmaAr: string | null;
  root: string | null;
  rootAr: string | null;
  features: WordFeatures;
  rel: string | null;
  relAr: string | null;
  headId: number | null;
  headSurah: number | null;
  headAyah: number | null;
  headText: string | null;
}

export interface Ayah {
  ayah: number;
  translation: string;
  words: WordToken[];
}

export type SurahFile = Ayah[];

export interface SurahMeta {
  id: number;
  nameArabic: string;
  nameTransliteration: string;
  nameEnglish: string;
  type: "meccan" | "medinan";
  ayahCount: number;
}

export interface RootOccurrence {
  surah: number;
  ayah: number;
  location: string;
  textUthmani: string;
  gloss: string | null;
  pos: string | null;
  lemma: string | null;
  lemmaAr: string | null;
}

export interface RootEntry {
  root: string;
  rootAr: string;
  occurrences: RootOccurrence[];
}

export type RootsIndex = Record<string, RootEntry>;

export interface GlossaryTerm {
  code: string;
  ar: string;
  en: string;
}

export interface Glossary {
  pos: GlossaryTerm[];
  rel: GlossaryTerm[];
}
