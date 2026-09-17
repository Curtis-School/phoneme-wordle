/**
 * Values that SQLite cannot enforce for us.
 *
 * Prisma has no enum support on SQLite.
 * These constants are the single source of truth for what those
 *  columns may contain — they drive both the TypeScript unions
 *  and the Zod schemas that guard every write.
 */

export const ACTIVITY_TYPES = ["wordle", "word_search"] as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const SYMBOL_DISPLAYS = ["ipa", "english"] as const;

export const THEMES = ["light", "dark"] as const;

export const EVENT_KINDS = [
  "activity_created",
  "activity_updated",
  "activity_deleted",
  "generation_succeeded",
  "generation_failed",
  "word_list_created",
  "word_list_updated",
  "word_list_deleted",
  "export",
] as const;
export type EventKind = (typeof EVENT_KINDS)[number];
