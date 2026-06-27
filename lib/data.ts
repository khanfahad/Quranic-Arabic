import type { Ayah, Glossary, RootEntry, RootsIndex, SurahFile, SurahMeta, WordToken } from "./types";

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Must match WORD_FIELD_ORDER in scripts/build-data.py exactly.
const WORD_FIELD_ORDER = [
  "id", "isElided", "location", "textUthmani", "textImlaai", "transliteration",
  "gloss", "pos", "posAr", "tag", "lemma", "lemmaAr", "root", "rootAr",
  "segment", "verbForm", "verbAspect", "verbMood", "verbVoice", "nominalState",
  "nominalCase", "derivedNoun", "specialGroup", "person", "gender", "number",
  "rel", "relAr", "relEn", "headId", "headAyah", "headText",
] as const;

const FEATURE_KEYS = [
  "segment", "verbForm", "verbAspect", "verbMood", "verbVoice", "nominalState",
  "nominalCase", "derivedNoun", "specialGroup", "person", "gender", "number",
] as const;

type RawWord = (string | number | null)[];
type RawAyah = [number, string, RawWord[]];

function decodeWord(raw: RawWord, surah: number, ayah: number): WordToken {
  const obj: Record<string, string | number | null> = {};
  WORD_FIELD_ORDER.forEach((key, i) => {
    obj[key] = raw[i] ?? null;
  });
  const features: Record<string, string | null> = {};
  for (const key of FEATURE_KEYS) {
    features[key] = (obj[key] as string | null) ?? null;
  }
  return {
    id: obj.id as number,
    isElided: obj.isElided === 1,
    location: obj.location as string | null,
    surah,
    ayah,
    textUthmani: obj.textUthmani as string | null,
    textImlaai: obj.textImlaai as string | null,
    transliteration: obj.transliteration as string | null,
    gloss: obj.gloss as string | null,
    pos: obj.pos as string | null,
    posAr: obj.posAr as string | null,
    tag: obj.tag as string | null,
    lemma: obj.lemma as string | null,
    lemmaAr: obj.lemmaAr as string | null,
    root: obj.root as string | null,
    rootAr: obj.rootAr as string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    features: features as any,
    rel: obj.rel as string | null,
    relAr: obj.relAr as string | null,
    relEn: obj.relEn as string | null,
    headId: obj.headId as number | null,
    headSurah: obj.headAyah !== null ? surah : null,
    headAyah: obj.headAyah as number | null,
    headText: obj.headText as string | null,
  };
}

function decodeAyah(raw: RawAyah, surah: number): Ayah {
  const [ayahNum, translation, words] = raw;
  return {
    ayah: ayahNum,
    translation,
    words: words.map((w) => decodeWord(w, surah, ayahNum)),
  };
}

export async function fetchSurahs(): Promise<SurahMeta[]> {
  const res = await fetch(`${basePath}/data/surahs.json`);
  return res.json();
}

export async function fetchSurah(id: number): Promise<SurahFile> {
  const res = await fetch(`${basePath}/data/surah/${id}.json`);
  const raw: RawAyah[] = await res.json();
  return raw.map((a) => decodeAyah(a, id));
}

let glossaryCache: Glossary | null = null;
export async function fetchGlossary(): Promise<Glossary> {
  if (glossaryCache) return glossaryCache;
  const res = await fetch(`${basePath}/data/glossary.json`);
  glossaryCache = await res.json();
  return glossaryCache!;
}

let rootsIndexCache: RootsIndex | null = null;
export async function fetchRootsIndex(): Promise<RootsIndex> {
  if (rootsIndexCache) return rootsIndexCache;
  const res = await fetch(`${basePath}/data/roots.json`);
  const raw: Record<string, [string, (string | number | null)[][]]> = await res.json();
  const out: RootsIndex = {};
  for (const [root, [rootAr, occurrences]] of Object.entries(raw)) {
    out[root] = {
      root,
      rootAr,
      occurrences: occurrences.map((o) => ({
        surah: o[0] as number,
        ayah: o[1] as number,
        location: o[2] as string,
        textUthmani: o[3] as string,
        gloss: o[4] as string | null,
        pos: o[5] as string | null,
        lemma: o[6] as string | null,
        lemmaAr: o[7] as string | null,
      })),
    };
  }
  rootsIndexCache = out;
  return out;
}

export async function fetchRoot(root: string): Promise<RootEntry | null> {
  const index = await fetchRootsIndex();
  return index[root] ?? null;
}
