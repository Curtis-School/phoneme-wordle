import type {
  Difficulty,
  Phoneme,
  PhonemeWord,
  PhonemeWordList,
  WordleConfig,
  WordSearchConfig,
} from "@/lib/types";
import raw from "./phoneme-word-list.json";

const data = raw as PhonemeWordList;

export const DIFFICULTY_WORD_COUNT: Record<Difficulty, number> = {
  easy: 3,
  medium: 5,
  hard: 8,
};

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomSample<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
}

export function getPhonemeInventory(): Phoneme[] {
  return data.phonemeInventory;
}

export function getWordleConfigs(difficulty?: Difficulty): WordleConfig[] {
  if (!difficulty) return data.wordleConfigs;
  return data.wordleConfigs.filter((c) => c.difficulty === difficulty);
}

export function getWordleConfig(difficulty: Difficulty): WordleConfig {
  return randomItem(getWordleConfigs(difficulty));
}

export function getWordSearchConfigs(): WordSearchConfig[] {
  return data.wordSearchConfigs;
}

export function getWordSearchConfig(ipa: string): WordSearchConfig | undefined {
  return data.wordSearchConfigs.find((c) => c.phoneme.ipa === ipa);
}

export function getWordSearchWords(ipa: string, count: number): PhonemeWord[] {
  const config = getWordSearchConfig(ipa);
  if (!config) return [];
  return randomSample(config.words, count);
}
