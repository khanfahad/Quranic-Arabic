#!/usr/bin/env python3
"""
Builds public/data/*.json for the site from the NoorBayan/Quranic treebank
(MIT licensed, full-Quran morphological + syntactic dependency corpus) and
the risan/quran-json surah metadata.

Usage:
    python3 scripts/build-data.py

Requires the `unrar` binary on PATH (the source corpus ships as a .rar).
Downloads are cached under .cache/ so re-runs are fast.
"""
import csv
import json
import os
import subprocess
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, ".cache")
OUT_DATA = os.path.join(ROOT, "public", "data")
OUT_SURAH = os.path.join(OUT_DATA, "surah")

TREEBANK_RAR_URL = "https://raw.githubusercontent.com/NoorBayan/Quranic/main/corpus/Quranic.rar"
SURAH_META_URL = "https://raw.githubusercontent.com/risan/quran-json/main/dist/quran.json"

# Standard English surah titles (widely used reference names).
SURAH_EN_NAMES = {
    1: "The Opening", 2: "The Cow", 3: "The Family of Imran", 4: "The Women",
    5: "The Table Spread", 6: "The Cattle", 7: "The Heights", 8: "The Spoils of War",
    9: "The Repentance", 10: "Jonah", 11: "Hud", 12: "Joseph", 13: "The Thunder",
    14: "Abraham", 15: "The Rocky Tract", 16: "The Bee", 17: "The Night Journey",
    18: "The Cave", 19: "Mary", 20: "Ta-Ha", 21: "The Prophets", 22: "The Pilgrimage",
    23: "The Believers", 24: "The Light", 25: "The Criterion", 26: "The Poets",
    27: "The Ant", 28: "The Narration", 29: "The Spider", 30: "The Romans",
    31: "Luqman", 32: "The Prostration", 33: "The Combined Forces", 34: "Sheba",
    35: "The Originator", 36: "Ya-Sin", 37: "Those Ranged in Ranks",
    38: "The Letter Sad", 39: "The Crowds", 40: "The Forgiver", 41: "Clearly Explained",
    42: "The Consultation", 43: "The Ornaments of Gold", 44: "The Smoke",
    45: "The Kneeling", 46: "The Dunes", 47: "Muhammad", 48: "The Victory",
    49: "The Private Apartments", 50: "The Letter Qaf", 51: "The Winnowing Winds",
    52: "The Mount", 53: "The Star", 54: "The Moon", 55: "The Most Merciful",
    56: "The Inevitable", 57: "The Iron", 58: "The Pleading Woman", 59: "The Exile",
    60: "The Woman Examined", 61: "The Ranks", 62: "The Congregation Friday",
    63: "The Hypocrites", 64: "The Mutual Disillusion", 65: "The Divorce",
    66: "The Prohibition", 67: "The Sovereignty", 68: "The Pen", 69: "The Reality",
    70: "The Ascending Stairways", 71: "Noah", 72: "The Jinn", 73: "The Enshrouded One",
    74: "The Cloaked One", 75: "The Resurrection", 76: "Man", 77: "Those Sent Forth",
    78: "The Tidings", 79: "Those Who Drag Forth", 80: "He Frowned", 81: "The Overthrowing",
    82: "The Cleaving", 83: "The Defrauding", 84: "The Splitting Open",
    85: "The Mansions of the Stars", 86: "The Morning Star", 87: "The Most High",
    88: "The Overwhelming", 89: "The Dawn", 90: "The City", 91: "The Sun", 92: "The Night",
    93: "The Morning Hours", 94: "The Relief", 95: "The Fig", 96: "The Clot",
    97: "The Power", 98: "The Clear Proof", 99: "The Earthquake", 100: "The Coursers",
    101: "The Calamity", 102: "The Rivalry in Worldly Increase", 103: "The Declining Day",
    104: "The Slanderer", 105: "The Elephant", 106: "Quraysh", 107: "The Necessities",
    108: "The Abundance", 109: "The Disbelievers", 110: "The Divine Support",
    111: "The Palm Fiber", 112: "The Sincerity", 113: "The Daybreak", 114: "Mankind",
}

# English descriptions for the most common i'rab relation labels (Arabic
# grammatical role -> short English gloss). Rare labels fall back to their
# Arabic term plus the corpus's short English code.
REL_DESCRIPTIONS = {
    "فاعل": "subject / doer of the verb (fa'il)",
    "مفعول به": "direct object (maf'ul bih)",
    "مضاف إليه": "genitive complement of a construct (mudaf ilayh)",
    "خبر": "predicate of a nominal sentence (khabar)",
    "صلة": "relative clause complement (silat al-mawsul)",
    "صفة": "adjective / descriptive qualifier (sifah / na't)",
    "معطوف": "conjoined element (ma'tuf, joined by a conjunction)",
    "متعلق": "object of a preposition (muta'alliq)",
    "مجرور": "genitive-marked element after a preposition",
    "نفي": "negation particle",
    "حال": "adverbial of state/manner (hal)",
    "اسم إن": "subject of 'inna' (ism inna)",
    "خبر إن": "predicate of 'inna' (khabar inna)",
    "توكيد": "emphasis (tawkid)",
    "شرط": "conditional clause (shart)",
    "جواب الشرط": "apodosis / response to the condition (jawab al-shart)",
    "نائب فاعل": "deputy subject of a passive verb (na'ib al-fa'il)",
    "خبر كان": "predicate of 'kana' (khabar kana)",
    "اسم كان": "subject of 'kana' (ism kana)",
    "بدل": "substitute / apposition (badal)",
    "استفهام": "interrogative particle",
    "منادى": "vocative, the one being addressed (munada)",
    "تحقيق": "particle of verification/emphasis",
    "حصر": "restriction particle (hasr, e.g. only/just)",
    "مفعول مطلق": "absolute/cognate object (maf'ul mutlaq)",
    "نهي": "prohibition particle",
    "اسم أن": "subject of 'anna' (ism anna)",
    "خبر أن": "predicate of 'anna' (khabar anna)",
    "زائد": "extra/augmentative particle with no syntactic role",
    "تمييز": "specifier clarifying an ambiguous quantity (tamyiz)",
    "مستثني": "the excepted item (mustathna, after illa)",
    "كاف": "preventive/restraining particle (kaffah)",
    "استقبال": "particle indicating the future",
    "اسم لا": "subject of negating 'la' (ism la)",
    "خبر لعل": "predicate of 'la'alla' (khabar la'alla)",
    "اسم لعل": "subject of 'la'alla' (ism la'alla)",
    "خبر ما": "predicate of negating 'ma' (khabar ma)",
    "المفعول لأجله": "object of reason/purpose (maf'ul li-ajlih)",
    "root": "the syntactic root/anchor of the sentence",
    "NonRel": "attached particle with no independent syntactic relation",
    "link": "linking element (e.g. a preposition introducing its object)",
    "App": "apposition (badal)",
    "Poss": "possessive / genitive complement (mudaf ilayh)",
    "Adj": "adjective / descriptive qualifier",
    "Subj": "subject (fa'il)",
    "Obj": "direct object",
    "Pred": "predicate (khabar)",
    "gen": "genitive-marked element",
    "conj": "conjoined element",
}

POS_DESCRIPTIONS = {
    "اسم": "noun",
    "اسم علم": "proper noun",
    "صفة": "adjective",
    "ضمير": "pronoun",
    "اسم اشارة": "demonstrative pronoun",
    "اسم موصول": "relative pronoun",
    "ظرف زمان": "adverb of time",
    "ظرف مكان": "adverb of place",
    "فعل": "verb",
    "حرف جر": "preposition",
    "لام التوكيد": "emphatic lam particle",
    "لام الامر": "imperative lam particle",
    "لام التعليل": "purpose lam particle",
    "حرف عطف": "coordinating conjunction",
    "حرف مصدري": "subordinating particle",
    "حرف نصب": "accusative-governing particle",
    "ال التعريف": "definite article (al-)",
    "حرف استئنافية": "resumptive particle",
    "حرف نفي": "negative particle",
    "حرف نداء": "vocative particle",
    "حرف شرط": "conditional particle",
    "حرف استفهام": "interrogative particle",
    "حرف حال": "circumstantial particle",
    "حرف زائد": "augmentative/extra particle",
    "حرف تحقيق": "verification particle",
    "أداة حصر": "restriction particle",
    "اسم فعل أمر": "imperative verbal noun",
    "حروف مقطعة": "Quranic initial letters",
    "واو المعية": "comitative particle (wa al-ma'iyyah)",
    "حرف استدراك": "retraction particle",
    "حرف جواب": "answer particle",
    "حرف ردع": "deterrent particle",
    "حرف سببية": "causative particle",
    "حرف تسوية": "equalization particle",
    "حرف تحضيض": "exhortation particle",
    "حرف تفصيل": "detailing particle",
    "أداة استثناء": "exceptive particle",
    "حرف استقبال": "future particle",
    "حرف ابتداء": "inceptive particle",
    "حرف تفسير": "explanatory particle",
    "حرف كاف": "preventive particle",
    "حرف اضراب": "retraction particle",
    "حرف واقع في جواب الشرط": "result particle (response to a condition)",
    "حرف فجاءة": "surprise particle",
}

# Lookup tables for building a single combined English morphology tag per
# word, in the style of corpus.quran.com (e.g. "1st person plural imperfect
# verb", "genitive masculine singular noun") instead of itemizing every raw
# feature code separately.
PERSON_WORDS = {"1": "1st person", "2": "2nd person", "3": "3rd person"}
GENDER_WORDS = {"M": "masculine", "F": "feminine"}
NUMBER_WORDS = {"S": "singular", "D": "dual", "P": "plural"}
CASE_WORDS = {"NOM": "nominative", "ACC": "accusative", "GEN": "genitive"}
ASPECT_WORDS = {"PERF": "perfect", "IMPF": "imperfect", "IMPV": "imperative"}
VOICE_WORDS = {"PASS": "passive"}
STATE_WORDS = {"INDEF": "indefinite"}
DERIVED_WORDS = {
    "ACT_PCPL": "active participle",
    "PASS_PCPL": "passive participle",
    "VN": "verbal noun",
}
# POS codes whose nouns/adjectives/adverbs/pronouns can carry case/gender/
# number/state marking worth surfacing in the combined tag.
DECLINABLE_POS = {"N", "PN", "ADJ", "T", "LOC", "DEM", "REL"}


def build_tag(pos, pos_en, person, gender, number, case, aspect, voice, state, derived):
    person_w = PERSON_WORDS.get(person)
    gender_w = GENDER_WORDS.get(gender)
    number_w = NUMBER_WORDS.get(number)
    case_w = CASE_WORDS.get(case)
    aspect_w = ASPECT_WORDS.get(aspect)
    voice_w = VOICE_WORDS.get(voice)
    state_w = STATE_WORDS.get(state)
    derived_w = DERIVED_WORDS.get(derived)

    if pos == "V":
        parts = [p for p in (person_w, gender_w, number_w, voice_w, aspect_w) if p]
        return " ".join([*parts, "verb"]) if parts else "verb"
    if pos == "PRON":
        parts = [p for p in (person_w, gender_w, number_w) if p]
        return " ".join([*parts, "pronoun"]) if parts else "pronoun"
    if derived_w:
        parts = [p for p in (case_w, gender_w, number_w, state_w) if p]
        return " ".join([*parts, derived_w])
    if pos in DECLINABLE_POS:
        parts = [p for p in (case_w, gender_w, number_w, state_w) if p]
        return " ".join([*parts, pos_en]) if parts else pos_en
    return pos_en

FEATURE_LABELS = {
    "verb_form": {
        "(I)": "Form I", "(II)": "Form II", "(III)": "Form III", "(IV)": "Form IV",
        "(V)": "Form V", "(VI)": "Form VI", "(VII)": "Form VII", "(VIII)": "Form VIII",
        "(IX)": "Form IX", "(X)": "Form X", "(XI)": "Form XI", "(XII)": "Form XII",
    },
    "verb_aspect": {"PERF": "Past (perfect)", "IMPF": "Present (imperfect)", "IMPV": "Imperative"},
    "verb_mood": {"MOOD:JUS": "Jussive (مجزوم)", "MOOD:SUBJ": "Subjunctive (منصوب)"},
    "verb_voice": {"PASS": "Passive"},
    "nominal_state": {"INDEF": "Indefinite"},
    "nominal_case": {"GEN": "Genitive (مجرور)", "ACC": "Accusative (منصوب)", "NOM": "Nominative (مرفوع)"},
    "derived_nouns": {"ACT_PCPL": "Active participle", "PASS_PCPL": "Passive participle", "VN": "Verbal noun (masdar)"},
    "person": {"1": "1st person", "2": "2nd person", "3": "3rd person"},
    "gender": {"M": "Masculine", "F": "Feminine"},
    "number": {"S": "Singular", "D": "Dual", "P": "Plural"},
    "special_group": {"SP:<in~": "Inna and her sisters", "SP:kaAn": "Kana and her sisters", "SP:kaAd": "Kada and her sisters"},
}


def cached_download(url: str, filename: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, filename)
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return path
    print(f"Downloading {url} ...", file=sys.stderr)
    urllib.request.urlretrieve(url, path)
    return path


def get_treebank_csv() -> str:
    extracted = os.path.join(CACHE, "Quranic.csv")
    if os.path.exists(extracted):
        return extracted
    rar_path = cached_download(TREEBANK_RAR_URL, "Quranic.rar")
    subprocess.run(["unrar", "x", "-y", rar_path, CACHE + os.sep], check=True)
    if not os.path.exists(extracted):
        raise RuntimeError("Expected Quranic.csv after extraction, not found.")
    return extracted


NULL_SENTINELS = {"_", "", None, "ـ", "(*)", "-"}


def na(value):
    return None if value in NULL_SENTINELS else value


def feature_label(col: str, raw: str):
    raw = na(raw)
    if raw is None:
        return None
    return FEATURE_LABELS.get(col, {}).get(raw, raw)


def load_rows(csv_path: str):
    with open(csv_path, encoding="utf-16") as f:
        reader = csv.DictReader(f, delimiter="\t")
        return list(reader)


# Fixed field order for the compact per-word array encoding written to
# public/data/surah/{n}.json. Keep this in sync with lib/data.ts's decodeWord().
WORD_FIELD_ORDER = [
    "id", "isElided", "location", "textUthmani", "textImlaai", "transliteration",
    "gloss", "pos", "posAr", "tag", "lemma", "lemmaAr", "root", "rootAr",
    "segment", "verbForm", "verbAspect", "verbMood", "verbVoice", "nominalState",
    "nominalCase", "derivedNoun", "specialGroup", "person", "gender", "number",
    "rel", "relAr", "headId", "headAyah", "headText",
]


def to_word_array(t: dict) -> list:
    flat = {**t, **t["features"]}
    flat["isElided"] = 1 if t["isElided"] else 0
    return [flat.get(key) for key in WORD_FIELD_ORDER]


def build_token(row) -> dict:
    is_elided = row["location"] == "_"
    location = None if is_elided else row["location"].strip("()")
    surah, ayah = int(row["chapter_id"]), int(row["verse_id"])
    features = {
        "segment": na(row["segment"]),
        "verbForm": feature_label("verb_form", row["verb_form"]),
        "verbAspect": feature_label("verb_aspect", row["verb_aspect"]),
        "verbMood": feature_label("verb_mood", row["verb_mood"]),
        "verbVoice": feature_label("verb_voice", row["verb_voice"]),
        "nominalState": feature_label("nominal_state", row["nominal_state"]),
        "nominalCase": feature_label("nominal_case", row["nominal_case"]),
        "derivedNoun": feature_label("derived_nouns", row["derived_nouns"]),
        "specialGroup": feature_label("special_group", row["special_group"]),
        "person": feature_label("person", row["person"]),
        "gender": feature_label("gender", row["gender"]),
        "number": feature_label("number", row["number"]),
    }
    gloss = na(row["trans"])
    pos = na(row["pos"])
    pos_ar = na(row["pos_ar"])
    pos_en = POS_DESCRIPTIONS.get(pos_ar, pos) if pos_ar else pos
    tag = (
        build_tag(
            pos, pos_en,
            na(row["person"]), na(row["gender"]), na(row["number"]),
            na(row["nominal_case"]), na(row["verb_aspect"]), na(row["verb_voice"]),
            na(row["nominal_state"]), na(row["derived_nouns"]),
        )
        if pos
        else None
    )
    return {
        "id": int(row["tid"]),
        "isElided": is_elided,
        "location": location,
        "surah": surah,
        "ayah": ayah,
        "textUthmani": na(row["uthmani_token"]),
        "textImlaai": na(row["imlaai_token"]),
        "transliteration": na(row["phonetic"]),
        "gloss": gloss,
        "pos": pos,
        "posAr": pos_ar,
        "tag": tag,
        "lemma": na(row["lemma"]),
        "lemmaAr": na(row["lemma_ar"]),
        "root": na(row["root"]),
        "rootAr": na(row["root_ar"]),
        "features": features,
        "rel": na(row["rel_label"]),
        "relAr": na(row["rel_label_ar"]),
        # ref_token_id is scoped to (chapter_id, sentence_id) and refers to
        # another row's `token_id` (NOT the global `tid`) - resolved below.
        "_sentenceKey": (row["chapter_id"], row["sentence_id"]),
        "_tokenId": int(row["token_id"]),
        "_refTokenId": int(row["ref_token_id"]) if na(row["ref_token_id"]) else None,
    }


def main():
    os.makedirs(OUT_SURAH, exist_ok=True)

    csv_path = get_treebank_csv()
    print("Parsing treebank CSV ...", file=sys.stderr)
    rows = load_rows(csv_path)
    print(f"  {len(rows)} rows", file=sys.stderr)

    tokens = [build_token(r) for r in rows]
    by_id = {t["id"]: t for t in tokens}

    # ref_token_id values are scoped per (chapter, sentence) and reference
    # another row's `token_id`, not the global `tid` - build that lookup.
    sentence_token_to_tid: dict[tuple, dict[int, int]] = {}
    for t in tokens:
        sentence_token_to_tid.setdefault(t["_sentenceKey"], {})[t["_tokenId"]] = t["id"]

    for t in tokens:
        ref = t.pop("_refTokenId")
        sentence_key = t.pop("_sentenceKey")
        own_token_id = t.pop("_tokenId")
        head_tid = None
        if ref is not None and ref != 0 and ref != own_token_id:
            head_tid = sentence_token_to_tid.get(sentence_key, {}).get(ref)
        if head_tid is None or head_tid not in by_id:
            t["headId"] = None
            t["headAyah"] = None
            t["headText"] = None
        else:
            head = by_id[head_tid]
            t["headId"] = head["id"]
            t["headAyah"] = head["ayah"]
            t["headText"] = head["textUthmani"] or "(implied)"

    # Group into surah -> ayah -> [tokens]
    surahs: dict[int, dict[int, list]] = {}
    for t in tokens:
        surahs.setdefault(t["surah"], {}).setdefault(t["ayah"], []).append(t)

    print("Writing per-surah files ...", file=sys.stderr)
    surah_ayah_counts = {}
    for surah_id, ayahs in surahs.items():
        out_ayahs = []
        for ayah_num in sorted(ayahs.keys()):
            words = ayahs[ayah_num]
            translation = " ".join(w["gloss"] for w in words if w["gloss"]).strip()
            out_ayahs.append([ayah_num, translation, [to_word_array(w) for w in words]])
        surah_ayah_counts[surah_id] = len(out_ayahs)
        with open(os.path.join(OUT_SURAH, f"{surah_id}.json"), "w", encoding="utf-8") as f:
            json.dump(out_ayahs, f, ensure_ascii=False, separators=(",", ":"))

    # Surah metadata
    print("Fetching surah metadata ...", file=sys.stderr)
    meta_path = cached_download(SURAH_META_URL, "quran_meta.json")
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)
    surah_metas = []
    for m in meta:
        sid = m["id"]
        surah_metas.append({
            "id": sid,
            "nameArabic": m["name"],
            "nameTransliteration": m["transliteration"],
            "nameEnglish": SURAH_EN_NAMES.get(sid, m["transliteration"]),
            "type": m["type"],
            "ayahCount": surah_ayah_counts.get(sid, m["total_verses"]),
        })
    with open(os.path.join(OUT_DATA, "surahs.json"), "w", encoding="utf-8") as f:
        json.dump(surah_metas, f, ensure_ascii=False, separators=(",", ":"))

    # Root index: root -> [rootAr, [[surah, ayah, location, textUthmani, gloss, pos, lemma, lemmaAr], ...]]
    # Keep this array order in sync with lib/data.ts's decodeRootEntry().
    print("Building root index ...", file=sys.stderr)
    roots: dict[str, dict] = {}
    for t in tokens:
        if not t["root"] or t["isElided"]:
            continue
        entry = roots.setdefault(t["root"], {"rootAr": t["rootAr"], "occurrences": []})
        entry["occurrences"].append([
            t["surah"], t["ayah"], t["location"], t["textUthmani"],
            t["gloss"], t["pos"], t["lemma"], t["lemmaAr"],
        ])
    roots_out = {root: [v["rootAr"], v["occurrences"]] for root, v in roots.items()}
    with open(os.path.join(OUT_DATA, "roots.json"), "w", encoding="utf-8") as f:
        json.dump(roots_out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  {len(roots)} distinct roots", file=sys.stderr)

    # Glossary
    print("Building glossary ...", file=sys.stderr)
    pos_seen = {}
    rel_seen = {}
    for t in tokens:
        if t["pos"] and t["posAr"] and t["pos"] not in pos_seen:
            pos_seen[t["pos"]] = t["posAr"]
        if t["rel"] and t["relAr"] and t["rel"] not in rel_seen:
            rel_seen[t["rel"]] = t["relAr"]
    glossary = {
        "pos": [
            {"code": code, "ar": ar, "en": POS_DESCRIPTIONS.get(ar, code)}
            for code, ar in sorted(pos_seen.items())
        ],
        "rel": [
            {"code": code, "ar": ar, "en": REL_DESCRIPTIONS.get(ar, REL_DESCRIPTIONS.get(code, code))}
            for code, ar in sorted(rel_seen.items())
        ],
    }
    with open(os.path.join(OUT_DATA, "glossary.json"), "w", encoding="utf-8") as f:
        json.dump(glossary, f, ensure_ascii=False, separators=(",", ":"))

    print("Done.", file=sys.stderr)


if __name__ == "__main__":
    main()
