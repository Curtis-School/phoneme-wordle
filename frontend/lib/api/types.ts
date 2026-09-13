import type {
  ActivitySettings,
  Difficulty,
  Phoneme,
  PhonemeWord,
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
  phonemes: ApiPhoneme[];
  createdAt: string;
  updatedAt: string;
};

export type ApiWordListSummary = {
  id: number;
  name: string;
  description: string | null;
  targetPhoneme: ApiPhoneme | null;
  wordCount: number;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiWordListDetail = ApiWordListSummary & { words: ApiWord[] };

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
      /** The pinned target word, if one has been saved for this activity. */
      word: PhonemeWord | null;
    })
  | (ActivityBase & {
      type: "word_search";
      targetPhoneme: ApiPhoneme;
      gridSize: number;
      seed: number | null;
      wordCount: number;
    });

type CreateActivityBase = {
  name: string;
  difficulty: Difficulty;
  wordListId: number;
  symbolDisplay?: ActivitySettings["symbolDisplay"];
  showTooltips?: boolean;
  theme?: ActivitySettings["theme"];
};

export type CreateWordleActivityInput = CreateActivityBase & {
  type: "wordle";
  maxGuesses: number;
  wordLength: number;
  wordId?: number;
};

export type CreateWordSearchActivityInput = CreateActivityBase & {
  type: "word_search";
  /** IPA symbol of the sound being practised. */
  targetPhoneme: string;
  gridSize: number;
  wordCount: number;
  seed?: number;
};

export type CreateActivityInput =
  | CreateWordleActivityInput
  | CreateWordSearchActivityInput;

/**
 * A partial activity. `type` is immutable, so it is absent here; the API merges the patch
 * onto the stored row and revalidates the result as a whole.
 */
export type UpdateActivityInput = Partial<
  Omit<CreateWordleActivityInput, "type"> & Omit<CreateWordSearchActivityInput, "type">
>;

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
