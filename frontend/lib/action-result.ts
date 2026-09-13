import { ApiClientError } from "@/lib/api/client";
import type { ActionError } from "@/lib/types";

export function actionError(error: unknown, fallback: string): ActionError {
  return {
    ok: false,
    message: error instanceof ApiClientError ? error.message : fallback,
  };
}
