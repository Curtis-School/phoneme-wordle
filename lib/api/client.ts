import "server-only";

import type { Phoneme } from "@/lib/types";
import type {
  ActivitySummary,
  ActivityType,
  ApiErrorBody,
  ApiErrorCode,
  ApiPhoneme,
  ApiWord,
  ApiWordListDetail,
  ApiWordListSummary,
  CreateActivityInput,
  GenerateResponse,
  UpdateActivityInput,
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

export async function getPhonemes(search?: string): Promise<Phoneme[]> {
  const phonemes = await request<ApiPhoneme[]>("/api/phonemes", { query: { search } });

  return phonemes.map(toPhoneme);
}

export async function getActivities(type?: ActivityType): Promise<ActivitySummary[]> {
  return request<ActivitySummary[]>("/api/activities", { query: { type } });
}

/** Saves a new configuration. Duplicate `name` is a 409 — it is unique per type. */
export async function createActivity(
  input: CreateActivityInput,
): Promise<ActivitySummary> {
  return request<ActivitySummary>("/api/activities", { method: "POST", body: input });
}

export async function getActivity(id: number): Promise<ActivitySummary> {
  return request<ActivitySummary>(`/api/activities/${id}`);
}

/** Edits a saved activity in place. `type` cannot change; every other field can. */
export async function updateActivity(
  id: number,
  patch: UpdateActivityInput,
): Promise<ActivitySummary> {
  return request<ActivitySummary>(`/api/activities/${id}`, {
    method: "PATCH",
    body: patch,
  });
}

/** Deletes a saved activity. The word list it points at is left untouched. */
export async function deleteActivity(id: number): Promise<void> {
  await request<void>(`/api/activities/${id}`, { method: "DELETE" });
}

export async function generateActivity(
  id: number,
  opts: { wordId?: number; seed?: number } = {},
): Promise<GenerateResponse> {
  return request<GenerateResponse>(`/api/activities/${id}/generate`, { query: opts });
}

/** `length` counts phonemes, not letters: "boil" is four letters, three sounds. */
export async function listWords(
  params: { search?: string; phoneme?: string; length?: number } = {},
): Promise<ApiWord[]> {
  return request<ApiWord[]>("/api/words", { query: params });
}

/** `phonemes` are IPA symbols, never ids. Duplicate `english` is a 409 — it is globally unique. */
export async function createWord(input: {
  english: string;
  phonemes: string[];
}): Promise<ApiWord> {
  return request<ApiWord>("/api/words", { method: "POST", body: input });
}

/** Deletes a word outright — it cascades out of every word list that held it. */
export async function deleteWord(id: number): Promise<void> {
  await request<void>(`/api/words/${id}`, { method: "DELETE" });
}

/** Summaries only — `wordCount` without the words. `phoneme` is an IPA symbol. */
export async function listWordLists(
  params: { search?: string; phoneme?: string } = {},
): Promise<ApiWordListSummary[]> {
  return request<ApiWordListSummary[]>("/api/word-lists", { query: params });
}

/** `targetPhoneme` is an IPA symbol and `words` are spellings, both resolved by the API. */
export async function createWordList(input: {
  name: string;
  description?: string;
  targetPhoneme: string;
  words: string[];
}): Promise<ApiWordListDetail> {
  return request<ApiWordListDetail>("/api/word-lists", { method: "POST", body: input });
}

export async function getWordList(id: number): Promise<ApiWordListDetail> {
  return request<ApiWordListDetail>(`/api/word-lists/${id}`);
}

/** Replaces the whole membership; there is no add-one endpoint. Read, append, send it all back. */
export async function setWordListWords(
  id: number,
  words: string[],
): Promise<ApiWordListDetail> {
  return request<ApiWordListDetail>(`/api/word-lists/${id}`, {
    method: "PATCH",
    body: { words },
  });
}
