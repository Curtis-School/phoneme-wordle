export type Difficulty = "easy" | "medium" | "hard";

export type Theme = "light" | "dark";

export type Phoneme = {
  ipa: string;
  label: string;
  example: string;
  english: string;
};

export type WordleConfig = {
  englishWord: string;
  word: Phoneme[];
  maxGuesses: number;
  difficulty: Difficulty;
};

export type PhonemeWord = {
  english: string;
  phonemes: Phoneme[];
};

export type WordSearchConfig = {
  phoneme: Phoneme;
  words: PhonemeWord[];
  size: number;
};

export type PhonemeWordList = {
  phonemeInventory: Phoneme[];
  wordleConfigs: WordleConfig[];
  wordSearchConfigs: WordSearchConfig[];
};
