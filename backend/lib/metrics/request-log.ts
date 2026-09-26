import { prisma } from "@/lib/prisma";

export type RequestLogInput = {
  method: string;
  path: string;
  status: number;
  durationMs: number;
};

/** Records one handled request, and never throws — logging must not break the response. */
export async function recordRequest(entry: RequestLogInput): Promise<void> {
  try {
    await prisma.requestLog.create({ data: entry });
  } catch (error) {
    console.error(`Failed to log ${entry.method} ${entry.path}:`, error);
  }
}
