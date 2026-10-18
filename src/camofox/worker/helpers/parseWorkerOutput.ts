import type { WorkerFailure } from "../types.ts";

/** The worker prints one JSON line last; take it, or explain what came back. */
export function parseWorkerOutput(stdout: string, exitCode: number): Record<string, unknown> | WorkerFailure {
  const last = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!last) return { ok: false, error: `worker printed nothing (exit ${exitCode})` };
  try {
    const parsed = JSON.parse(last);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // fall through
  }
  return { ok: false, error: `worker output was not JSON (exit ${exitCode}): ${last.slice(0, 200)}` };
}
