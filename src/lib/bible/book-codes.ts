/**
 * Format-aware Bible book_code resolution for the Faithfull/ARCLOG Supabase corpus.
 *
 * Import formats store different codes for the same book:
 * - osis (eng-kjv, OEB): JOHN, MATT, 1SAM, …
 * - zefania / usfx (ASV, WEB, …): JHN, MAT, 1SA, …
 *
 * Always resolve with the translation's `format` (from `bible_translation.format`)
 * before querying `bible_verse`.
 */

export type BibleFormat = "osis" | "zefania" | "usfx";

/** Verified formats for seeded English translations on gcbousxyszxgvmjoktuz. */
export const TRANSLATION_FORMAT_BY_SLUG: Readonly<Record<string, BibleFormat>> = {
  "eng-asv": "zefania",
  "eng-darby": "zefania",
  "eng-dra": "zefania",
  "eng-gb-oeb": "osis",
  "eng-gb-webbe": "usfx",
  "eng-kjv": "osis",
  "eng-us-oeb": "osis",
  "eng-web": "usfx",
  "eng-ylt": "zefania",
};

type FormatCodes = {
  osis: string;
  zefania: string;
  usfx: string;
};

type BookDef = {
  logical: string;
  name: string;
  codes: FormatCodes;
  /** Extra name / abbreviation aliases (lowercase). */
  aliases?: string[];
};

/**
 * Protestant + deuterocanonical books present in the seeded corpus.
 * zefania/usfx usually match; Nahum is the known usfx exception (NAM vs NAH).
 */
const BOOKS: readonly BookDef[] = [
  { logical: "genesis", name: "Genesis", codes: { osis: "GEN", zefania: "GEN", usfx: "GEN" }, aliases: ["gen"] },
  { logical: "exodus", name: "Exodus", codes: { osis: "EXOD", zefania: "EXO", usfx: "EXO" }, aliases: ["exo", "exod"] },
  { logical: "leviticus", name: "Leviticus", codes: { osis: "LEV", zefania: "LEV", usfx: "LEV" }, aliases: ["lev"] },
  { logical: "numbers", name: "Numbers", codes: { osis: "NUM", zefania: "NUM", usfx: "NUM" }, aliases: ["num"] },
  { logical: "deuteronomy", name: "Deuteronomy", codes: { osis: "DEUT", zefania: "DEU", usfx: "DEU" }, aliases: ["deut", "deu"] },
  { logical: "joshua", name: "Joshua", codes: { osis: "JOSH", zefania: "JOS", usfx: "JOS" }, aliases: ["josh", "jos"] },
  { logical: "judges", name: "Judges", codes: { osis: "JUDG", zefania: "JDG", usfx: "JDG" }, aliases: ["judg", "jdg"] },
  { logical: "ruth", name: "Ruth", codes: { osis: "RUTH", zefania: "RUT", usfx: "RUT" }, aliases: ["rut"] },
  { logical: "1_samuel", name: "1 Samuel", codes: { osis: "1SAM", zefania: "1SA", usfx: "1SA" }, aliases: ["1 samuel", "1 sam", "1sa", "1sam"] },
  { logical: "2_samuel", name: "2 Samuel", codes: { osis: "2SAM", zefania: "2SA", usfx: "2SA" }, aliases: ["2 samuel", "2 sam", "2sa", "2sam"] },
  { logical: "1_kings", name: "1 Kings", codes: { osis: "1KGS", zefania: "1KI", usfx: "1KI" }, aliases: ["1 kings", "1 kgs", "1ki", "1kgs"] },
  { logical: "2_kings", name: "2 Kings", codes: { osis: "2KGS", zefania: "2KI", usfx: "2KI" }, aliases: ["2 kings", "2 kgs", "2ki", "2kgs"] },
  { logical: "1_chronicles", name: "1 Chronicles", codes: { osis: "1CHR", zefania: "1CH", usfx: "1CH" }, aliases: ["1 chronicles", "1 chron", "1ch", "1chr"] },
  { logical: "2_chronicles", name: "2 Chronicles", codes: { osis: "2CHR", zefania: "2CH", usfx: "2CH" }, aliases: ["2 chronicles", "2 chron", "2ch", "2chr"] },
  { logical: "ezra", name: "Ezra", codes: { osis: "EZRA", zefania: "EZR", usfx: "EZR" }, aliases: ["ezr"] },
  { logical: "nehemiah", name: "Nehemiah", codes: { osis: "NEH", zefania: "NEH", usfx: "NEH" }, aliases: ["neh"] },
  { logical: "esther", name: "Esther", codes: { osis: "ESTH", zefania: "EST", usfx: "EST" }, aliases: ["est", "esth"] },
  { logical: "job", name: "Job", codes: { osis: "JOB", zefania: "JOB", usfx: "JOB" } },
  { logical: "psalms", name: "Psalms", codes: { osis: "PS", zefania: "PSA", usfx: "PSA" }, aliases: ["psalm", "psa", "ps"] },
  { logical: "proverbs", name: "Proverbs", codes: { osis: "PROV", zefania: "PRO", usfx: "PRO" }, aliases: ["prov", "pro"] },
  { logical: "ecclesiastes", name: "Ecclesiastes", codes: { osis: "ECCL", zefania: "ECC", usfx: "ECC" }, aliases: ["eccles", "ecc", "eccl"] },
  {
    logical: "song_of_solomon",
    name: "Song of Solomon",
    codes: { osis: "SONG", zefania: "SNG", usfx: "SNG" },
    aliases: ["song of songs", "song of solomon", "canticle of canticles", "sol", "sng", "song"],
  },
  { logical: "isaiah", name: "Isaiah", codes: { osis: "ISA", zefania: "ISA", usfx: "ISA" }, aliases: ["isa"] },
  { logical: "jeremiah", name: "Jeremiah", codes: { osis: "JER", zefania: "JER", usfx: "JER" }, aliases: ["jer"] },
  { logical: "lamentations", name: "Lamentations", codes: { osis: "LAM", zefania: "LAM", usfx: "LAM" }, aliases: ["lam"] },
  { logical: "ezekiel", name: "Ezekiel", codes: { osis: "EZEK", zefania: "EZK", usfx: "EZK" }, aliases: ["ezek", "ezk"] },
  { logical: "daniel", name: "Daniel", codes: { osis: "DAN", zefania: "DAN", usfx: "DAN" }, aliases: ["dan"] },
  { logical: "hosea", name: "Hosea", codes: { osis: "HOS", zefania: "HOS", usfx: "HOS" }, aliases: ["hos"] },
  { logical: "joel", name: "Joel", codes: { osis: "JOEL", zefania: "JOL", usfx: "JOL" }, aliases: ["jol"] },
  { logical: "amos", name: "Amos", codes: { osis: "AMOS", zefania: "AMO", usfx: "AMO" }, aliases: ["amo"] },
  { logical: "obadiah", name: "Obadiah", codes: { osis: "OBAD", zefania: "OBA", usfx: "OBA" }, aliases: ["obad", "oba"] },
  { logical: "jonah", name: "Jonah", codes: { osis: "JONAH", zefania: "JON", usfx: "JON" }, aliases: ["jon"] },
  { logical: "micah", name: "Micah", codes: { osis: "MIC", zefania: "MIC", usfx: "MIC" }, aliases: ["mic"] },
  { logical: "nahum", name: "Nahum", codes: { osis: "NAH", zefania: "NAH", usfx: "NAM" }, aliases: ["nah", "nam"] },
  { logical: "habakkuk", name: "Habakkuk", codes: { osis: "HAB", zefania: "HAB", usfx: "HAB" }, aliases: ["hab", "habak"] },
  { logical: "zephaniah", name: "Zephaniah", codes: { osis: "ZEPH", zefania: "ZEP", usfx: "ZEP" }, aliases: ["zeph", "zep"] },
  { logical: "haggai", name: "Haggai", codes: { osis: "HAG", zefania: "HAG", usfx: "HAG" }, aliases: ["hag"] },
  { logical: "zechariah", name: "Zechariah", codes: { osis: "ZECH", zefania: "ZEC", usfx: "ZEC" }, aliases: ["zech", "zec"] },
  { logical: "malachi", name: "Malachi", codes: { osis: "MAL", zefania: "MAL", usfx: "MAL" }, aliases: ["mal"] },
  { logical: "matthew", name: "Matthew", codes: { osis: "MATT", zefania: "MAT", usfx: "MAT" }, aliases: ["matt", "mat"] },
  { logical: "mark", name: "Mark", codes: { osis: "MARK", zefania: "MRK", usfx: "MRK" }, aliases: ["mrk"] },
  { logical: "luke", name: "Luke", codes: { osis: "LUKE", zefania: "LUK", usfx: "LUK" }, aliases: ["luk", "luc"] },
  { logical: "john", name: "John", codes: { osis: "JOHN", zefania: "JHN", usfx: "JHN" }, aliases: ["jhn", "jean"] },
  { logical: "acts", name: "Acts", codes: { osis: "ACTS", zefania: "ACT", usfx: "ACT" }, aliases: ["act"] },
  { logical: "romans", name: "Romans", codes: { osis: "ROM", zefania: "ROM", usfx: "ROM" }, aliases: ["rom"] },
  { logical: "1_corinthians", name: "1 Corinthians", codes: { osis: "1COR", zefania: "1CO", usfx: "1CO" }, aliases: ["1 corinthians", "1 cor", "1co", "1cor"] },
  { logical: "2_corinthians", name: "2 Corinthians", codes: { osis: "2COR", zefania: "2CO", usfx: "2CO" }, aliases: ["2 corinthians", "2 cor", "2co", "2cor"] },
  { logical: "galatians", name: "Galatians", codes: { osis: "GAL", zefania: "GAL", usfx: "GAL" }, aliases: ["gal"] },
  { logical: "ephesians", name: "Ephesians", codes: { osis: "EPH", zefania: "EPH", usfx: "EPH" }, aliases: ["eph"] },
  { logical: "philippians", name: "Philippians", codes: { osis: "PHIL", zefania: "PHP", usfx: "PHP" }, aliases: ["phil", "php"] },
  { logical: "colossians", name: "Colossians", codes: { osis: "COL", zefania: "COL", usfx: "COL" }, aliases: ["col"] },
  { logical: "1_thessalonians", name: "1 Thessalonians", codes: { osis: "1THESS", zefania: "1TH", usfx: "1TH" }, aliases: ["1 thessalonians", "1 thess", "1th", "1thess"] },
  { logical: "2_thessalonians", name: "2 Thessalonians", codes: { osis: "2THESS", zefania: "2TH", usfx: "2TH" }, aliases: ["2 thessalonians", "2 thess", "2th", "2thess"] },
  { logical: "1_timothy", name: "1 Timothy", codes: { osis: "1TIM", zefania: "1TI", usfx: "1TI" }, aliases: ["1 timothy", "1 tim", "1ti", "1tim"] },
  { logical: "2_timothy", name: "2 Timothy", codes: { osis: "2TIM", zefania: "2TI", usfx: "2TI" }, aliases: ["2 timothy", "2 tim", "2ti", "2tim"] },
  { logical: "titus", name: "Titus", codes: { osis: "TITUS", zefania: "TIT", usfx: "TIT" }, aliases: ["tit"] },
  { logical: "philemon", name: "Philemon", codes: { osis: "PHLM", zefania: "PHM", usfx: "PHM" }, aliases: ["phlm", "phm"] },
  { logical: "hebrews", name: "Hebrews", codes: { osis: "HEB", zefania: "HEB", usfx: "HEB" }, aliases: ["heb"] },
  { logical: "james", name: "James", codes: { osis: "JAS", zefania: "JAS", usfx: "JAS" }, aliases: ["jas"] },
  { logical: "1_peter", name: "1 Peter", codes: { osis: "1PET", zefania: "1PE", usfx: "1PE" }, aliases: ["1 peter", "1 pet", "1 pierre", "1pe", "1pet"] },
  { logical: "2_peter", name: "2 Peter", codes: { osis: "2PET", zefania: "2PE", usfx: "2PE" }, aliases: ["2 peter", "2 pet", "2pe", "2pet"] },
  { logical: "1_john", name: "1 John", codes: { osis: "1JOHN", zefania: "1JN", usfx: "1JN" }, aliases: ["1 john", "1 jn", "1jn", "1john"] },
  { logical: "2_john", name: "2 John", codes: { osis: "2JOHN", zefania: "2JN", usfx: "2JN" }, aliases: ["2 john", "2 jn", "2jn", "2john"] },
  { logical: "3_john", name: "3 John", codes: { osis: "3JOHN", zefania: "3JN", usfx: "3JN" }, aliases: ["3 john", "3 jn", "3jn", "3john"] },
  { logical: "jude", name: "Jude", codes: { osis: "JUDE", zefania: "JUD", usfx: "JUD" }, aliases: ["jud"] },
  { logical: "revelation", name: "Revelation", codes: { osis: "REV", zefania: "REV", usfx: "REV" }, aliases: ["rev"] },
  // Deuterocanonical / extras seen in eng-kjv (osis) and eng-web (usfx)
  { logical: "tobit", name: "Tobit", codes: { osis: "TOB", zefania: "TOB", usfx: "TOB" }, aliases: ["tob"] },
  { logical: "judith", name: "Judith", codes: { osis: "JDT", zefania: "JDT", usfx: "JDT" }, aliases: ["jdt"] },
  { logical: "wisdom", name: "Wisdom", codes: { osis: "WIS", zefania: "WIS", usfx: "WIS" }, aliases: ["wis", "wisdom of solomon"] },
  { logical: "sirach", name: "Sirach", codes: { osis: "SIR", zefania: "SIR", usfx: "SIR" }, aliases: ["sir", "ecclesiasticus"] },
  { logical: "baruch", name: "Baruch", codes: { osis: "BAR", zefania: "BAR", usfx: "BAR" }, aliases: ["bar"] },
  { logical: "1_maccabees", name: "1 Maccabees", codes: { osis: "1MACC", zefania: "1MA", usfx: "1MA" }, aliases: ["1 maccabees", "1 macc", "1ma", "1macc"] },
  { logical: "2_maccabees", name: "2 Maccabees", codes: { osis: "2MACC", zefania: "2MA", usfx: "2MA" }, aliases: ["2 maccabees", "2 macc", "2ma", "2macc"] },
  { logical: "1_esdras", name: "1 Esdras", codes: { osis: "1ESD", zefania: "1ES", usfx: "1ES" }, aliases: ["1 esdras", "1es", "1esd"] },
  { logical: "2_esdras", name: "2 Esdras", codes: { osis: "2ESD", zefania: "2ES", usfx: "2ES" }, aliases: ["2 esdras", "2es", "2esd"] },
  { logical: "prayer_of_manasseh", name: "Prayer of Manasseh", codes: { osis: "PRMAN", zefania: "MAN", usfx: "MAN" }, aliases: ["prayer of manasseh", "manasseh", "prman", "man"] },
  { logical: "bel_and_the_dragon", name: "Bel and the Dragon", codes: { osis: "BEL", zefania: "BEL", usfx: "BEL" }, aliases: ["bel", "bel and the dragon"] },
  { logical: "susanna", name: "Susanna", codes: { osis: "SUS", zefania: "SUS", usfx: "SUS" }, aliases: ["sus"] },
  { logical: "letter_of_jeremiah", name: "Letter of Jeremiah", codes: { osis: "EPJER", zefania: "LJE", usfx: "LJE" }, aliases: ["letter of jeremiah", "epistle of jeremiah", "epjer", "lje"] },
  { logical: "greek_esther", name: "Greek Esther", codes: { osis: "ESTHGR", zefania: "ESG", usfx: "ESG" }, aliases: ["greek esther", "esthgr", "esg"] },
  { logical: "prayer_of_azariah", name: "Prayer of Azariah", codes: { osis: "PRAZAR", zefania: "S3Y", usfx: "S3Y" }, aliases: ["prayer of azariah", "prazar", "s3y"] },
  { logical: "3_maccabees", name: "3 Maccabees", codes: { osis: "3MACC", zefania: "3MA", usfx: "3MA" }, aliases: ["3 maccabees", "3 macc", "3ma", "3macc"] },
  { logical: "4_maccabees", name: "4 Maccabees", codes: { osis: "4MACC", zefania: "4MA", usfx: "4MA" }, aliases: ["4 maccabees", "4 macc", "4ma", "4macc"] },
];

const BOOK_BY_LOGICAL = new Map(BOOKS.map((b) => [b.logical, b]));

/** Any known stored code (any format) → logical id. */
const LOGICAL_BY_CODE = new Map<string, string>();
for (const book of BOOKS) {
  for (const code of Object.values(book.codes)) {
    LOGICAL_BY_CODE.set(code.toUpperCase(), book.logical);
  }
}

/** Normalized name / alias → logical id. */
const LOGICAL_BY_ALIAS = new Map<string, string>();
for (const book of BOOKS) {
  LOGICAL_BY_ALIAS.set(normalizeAliasKey(book.name), book.logical);
  LOGICAL_BY_ALIAS.set(normalizeAliasKey(book.logical.replaceAll("_", " ")), book.logical);
  for (const alias of book.aliases ?? []) {
    LOGICAL_BY_ALIAS.set(normalizeAliasKey(alias), book.logical);
  }
}

function normalizeAliasKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.]/g, "")
    .replace(/\biii\b/g, "3")
    .replace(/\bii\b/g, "2")
    .replace(/\bi\b/g, "1")
    .replace(/\s+/g, " ");
}

function isBibleFormat(value: string): value is BibleFormat {
  return value === "osis" || value === "zefania" || value === "usfx";
}

/** Resolve format from a translation slug, or null if unknown. */
export function formatForTranslationSlug(slug: string): BibleFormat | null {
  return TRANSLATION_FORMAT_BY_SLUG[slug] ?? null;
}

/** Look up logical book id from a name or any-format code. */
export function logicalBookFromToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase().replace(/\./g, "");
  const fromCode = LOGICAL_BY_CODE.get(upper);
  if (fromCode) return fromCode;

  return LOGICAL_BY_ALIAS.get(normalizeAliasKey(trimmed)) ?? null;
}

/**
 * Resolve a human book name or any-format code to the `book_code` stored
 * for the given import format.
 */
export function resolveBookCode(token: string, format: BibleFormat): string | null {
  const logical = logicalBookFromToken(token);
  if (!logical) return null;
  const book = BOOK_BY_LOGICAL.get(logical);
  return book?.codes[format] ?? null;
}

/**
 * Same as `resolveBookCode`, but accepts a translation slug when the format
 * is already known from `TRANSLATION_FORMAT_BY_SLUG`.
 */
export function resolveBookCodeForSlug(token: string, slug: string): string | null {
  const format = formatForTranslationSlug(slug);
  if (!format) return null;
  return resolveBookCode(token, format);
}

/** Convert a stored code from any format into the code for `targetFormat`. */
export function convertBookCode(code: string, targetFormat: BibleFormat): string | null {
  return resolveBookCode(code, targetFormat);
}

/** Display name for a stored book_code (any format). */
export function canonicalBookNameFromCode(code: string): string | null {
  const logical = LOGICAL_BY_CODE.get(code.trim().toUpperCase().replace(/\./g, ""));
  if (!logical) return null;
  return BOOK_BY_LOGICAL.get(logical)?.name ?? null;
}

/** All format codes for a logical book (debug / tests). */
export function codesForLogicalBook(logical: string): FormatCodes | null {
  return BOOK_BY_LOGICAL.get(logical)?.codes ?? null;
}

export function assertBibleFormat(format: string): BibleFormat {
  if (!isBibleFormat(format)) {
    throw new Error(`Unknown Bible format: ${format}`);
  }
  return format;
}
