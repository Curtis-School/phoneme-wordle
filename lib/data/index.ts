import type {
  Phoneme,
  PhonemeWord,
  PhonemeWordList,
  WordleConfig,
  WordSearchConfig,
} from "@/lib/types";
import raw from "./phoneme-word-list.json";

const data = raw as PhonemeWordList;

export function getPhonemeInventory(): Phoneme[] {
  return data.phonemeInventory;
}

export function getFixedWordleConfig(): WordleConfig {
  return data.wordleConfigs.filter((c) => c.difficulty === "easy")[0];
}

export function getFixedWordSearchConfig(): WordSearchConfig {
  return data.wordSearchConfigs[0];
}

export function getFixedWordSearchWords(count = 5): PhonemeWord[] {
  return getFixedWordSearchConfig().words.slice(0, count);
}
