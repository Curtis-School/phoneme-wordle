import "server-only";

import type { Phoneme, PhonemeWord } from "@/lib/types";
import type {
  ActivitySummary,
  ActivityType,
  ApiErrorBody,
  ApiErrorCode,
  ApiPhoneme,
  ApiWord,
  ApiWordListDetail,
  GenerateResponse,
} from "./types";

const DEFAULT_BASE_URL = "http://localhost:3001";

function baseUrl(): string {
  return (process.env.API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  get isUnreachable(): boolean {
    return this.code === "UNREACHABLE";
  }
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${baseUrl()}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function toClientError(response: Response): Promise<ApiClientError> {
  let body: ApiErrorBody | undefined;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // A non-JSON body (a proxy error page, say) leaves the fallback below in place.
  }

  const error = body?.error;

  return new ApiClientError(
    response.status,
    error?.code ?? "INTERNAL_ERROR",
    error?.message ?? `The API responded with ${response.status} ${response.statusText}.`,
    error?.details,
  );
}

type RequestOptions = {
  query?: Record<string, string | number | undefined>;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, method = "GET", body } = options;

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      // Activities are drawn fresh on every request
      cache: "no-store",
    });
  } catch (cause) {
    throw new ApiClientError(
      0,
      "UNREACHABLE",
      `Could not reach the activity API at ${baseUrl()}.`,
      cause,
    );
  }

  if (!response.ok) {
    throw await toClientError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function toPhoneme({ ipa, label, example, english }: ApiPhoneme): Phoneme {
  return { ipa, label, example, english };
}

export function toPhonemeWord(word: ApiWord): PhonemeWord {
  return { english: word.english, phonemes: word.phonemes.map(toPhoneme) };
}

export async function getPhonemes(search?: string): Promise<Phoneme[]> {
  const phonemes = await request<ApiPhoneme[]>("/api/phonemes", { query: { search } });

  return phonemes.map(toPhoneme);
}

export async function getActivities(type?: ActivityType): Promise<ActivitySummary[]> {
  return request<ActivitySummary[]>("/api/activities", { query: { type } });
}

export async function generateActivity(
  id: number,
  opts: { wordId?: number; seed?: number } = {},
): Promise<GenerateResponse> {
  return request<GenerateResponse>(`/api/activities/${id}/generate`, { query: opts });
}

/**
 * Words with their ordered phonemes. `search` matches the spelling, `length` counts
 * phonemes rather than letters — "boil" is four letters but three sounds.
 */
export async function listWords(
  params: { search?: string; phoneme?: string; length?: number } = {},
): Promise<ApiWord[]> {
  return request<ApiWord[]>("/api/words", { query: params });
}

/**
 * Creates a word from IPA symbols.
 *
 * Symbols, never phoneme ids — that is the API's contract. `english` is globally unique,
 * so a spelling that already exists anywhere raises `CONFLICT` rather than a second row.
 * An unrecognised symbol raises `VALIDATION_ERROR` naming every offender at once.
 */
export async function createWord(input: {
  english: string;
  hint?: string | null;
  phonemes: string[];
}): Promise<ApiWord> {
  return request<ApiWord>("/api/words", { method: "POST", body: input });
}

export async function getWordList(id: number): Promise<ApiWordListDetail> {
  return request<ApiWordListDetail>(`/api/word-lists/${id}`);
}

/**
 * Replaces a list's entire membership, given as spellings in the order they should hold.
 *
 * There is no add-one endpoint: `WordListItem.position` is contiguous and unique per list,
 * so a partial change would leave gaps. Adding a word therefore means reading the current
 * membership, appending to it, and sending all of it back.
 */
export async function setWordListWords(
  id: number,
  words: string[],
): Promise<ApiWordListDetail> {
  return request<ApiWordListDetail>(`/api/word-lists/${id}`, {
    method: "PATCH",
    body: { words },
  });
}
