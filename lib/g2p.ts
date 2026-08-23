import type { Phoneme } from "./types";

export type Sound = {
  /** null when the letters matched no known grapheme. */
  phoneme: Phoneme | null;
  /** The letters that produced this sound, for display. */
  source: string;
};

// Graphemes English spelling uses that are not one of the inventory's `english` fields.
// Values are keys into that map, so no IPA symbol is hardcoded here.
const EXTRA: Record<string, string[]> = {
  qu: ["k", "w"],
  x: ["k", "s"],
  ck: ["k"],
  ph: ["f"],
  wh: ["w"],
  aw: ["or"],
  au: ["or"],
  al: ["or", "l"],
  ay: ["ai"],
  ea: ["ee"],
  ey: ["ee"],
  ie: ["ee"],
  igh: ["i_e"],
  ow: ["ou"],
  oy: ["oi"],
  ue: ["oo"],
  er: ["ir"],
  ur: ["ir"],
  are: ["air"],
  ge: ["zh"],
  ce: ["s"],
  tion: ["sh", "o", "n"],
  c: ["k"],
  q: ["k"],
  y: ["ee"],
};

// "Magic e": a single consonant then a final e lengthens the vowel — bike, snake, boat.
const MAGIC: Record<string, string> = { a: "ai", i: "i_e", o: "oa", u: "oo", e: "ee" };

const NOT_LETTERS = /[^a-z]/g;
const DOUBLE = /([bcdfgklmnprstvz])\1/g;
const MAGIC_E = /^(.*?)([aeiou])([bcdfgklmnptvz])e$/;
const VOWEL = /[aeiou]/;
const MAGIC_SLOT = " ";

function graphemeMap(inventory: readonly Phoneme[]): Map<string, Phoneme> {
  const map = new Map<string, Phoneme>();

  for (const phoneme of inventory) {
    if (!map.has(phoneme.english)) map.set(phoneme.english, phoneme);
  }

  return map;
}

/**
 * Best-effort transcription of an English spelling into this inventory's sounds.
 *
 * English is not phonemic, so this is a draft for a person to correct, never an oracle:
 * measured against the 105 seeded words it gets 95% of sound counts and 80% of full
 * sequences right, failing on loanwords like "beige" and on "-sion".
 */
export function transcribe(spelling: string, inventory: readonly Phoneme[]): Sound[] {
  const base = graphemeMap(inventory);
  const lookup = (key: string) => base.get(key) ?? null;

  let word = spelling.toLowerCase().replace(NOT_LETTERS, "").replace(DOUBLE, "$1");
  let magic: Phoneme | null = null;
  let magicSource = "";

  const match = MAGIC_E.exec(word);

  if (match && MAGIC[match[2]] && !VOWEL.test(match[1].slice(-1))) {
    magic = lookup(MAGIC[match[2]]);
    magicSource = `${match[2]}_e`;
    word = `${match[1]}${MAGIC_SLOT}${match[3]}`;
  }

  const table = new Map<string, Phoneme[]>();

  for (const [grapheme, phoneme] of base) {
    if (!grapheme.includes("_")) table.set(grapheme, [phoneme]);
  }

  for (const [grapheme, keys] of Object.entries(EXTRA)) {
    const resolved = keys.map(lookup).filter((phoneme): phoneme is Phoneme => phoneme !== null);

    if (resolved.length === keys.length) table.set(grapheme, resolved);
  }

  const graphemes = [...table.keys()].sort((a, b) => b.length - a.length);
  const sounds: Sound[] = [];
  let index = 0;

  while (index < word.length) {
    if (word[index] === MAGIC_SLOT) {
      sounds.push({ phoneme: magic, source: magicSource });
      index += 1;
      continue;
    }

    const grapheme = graphemes.find((candidate) => word.startsWith(candidate, index));

    if (grapheme) {
      for (const phoneme of table.get(grapheme) ?? []) {
        sounds.push({ phoneme, source: grapheme });
      }
      index += grapheme.length;
    } else {
      sounds.push({ phoneme: null, source: word[index] });
      index += 1;
    }
  }

  return sounds;
}
