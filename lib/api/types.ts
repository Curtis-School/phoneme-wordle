import type {
  ActivitySettings,
  Difficulty,
  Phoneme,
  WordleConfig,
  WordSearchConfig,
} from "@/lib/types";

export type ActivityType = "wordle" | "word_search";

export type ApiPhoneme = Phoneme & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiWord = {
  id: number;
  english: string;
  hint: string | null;
  phonemes: ApiPhoneme[];
  createdAt: string;
  updatedAt: string;
};

/** `GET /api/word-lists/:id` — the list with its membership in the teacher's order. */
export type ApiWordListDetail = {
  id: number;
  name: string;
  description: string | null;
  targetPhoneme: ApiPhoneme | null;
  wordCount: number;
  activityCount: number;
  words: ApiWord[];
  createdAt: string;
  updatedAt: string;
};

type ActivityBase = {
  id: number;
  name: string;
  difficulty: Difficulty;
  wordList: { id: number; name: string; wordCount: number };
  createdAt: string;
  updatedAt: string;
} & ActivitySettings;

export type ActivitySummary =
  | (ActivityBase & {
      type: "wordle";
      maxGuesses: number;
      wordLength: number;
    })
  | (ActivityBase & {
      type: "word_search";
      targetPhoneme: ApiPhoneme;
      gridSize: number;
      seed: number | null;
      wordCount: number;
    });

export type GeneratedActivity = {
  id: number;
  name: string;
  type: ActivityType;
  difficulty: Difficulty;
  wordList: { id: number; name: string };
};

export type WordleGenerateResponse = {
  activity: GeneratedActivity & { type: "wordle" };
  settings: ActivitySettings;
  config: WordleConfig;
  wordId: number;
};

export type WordSearchGenerateResponse = {
  activity: GeneratedActivity & { type: "word_search" };
  settings: ActivitySettings;
  config: WordSearchConfig;
  seed: number;
};

export type GenerateResponse = WordleGenerateResponse | WordSearchGenerateResponse;

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_REFERENCE"
  | "IN_USE"
  | "UNSATISFIABLE"
  | "INTERNAL_ERROR"
  | "UNREACHABLE";

export type ApiErrorBody = {
  error: { code: ApiErrorCode; message: string; details?: unknown };
};
