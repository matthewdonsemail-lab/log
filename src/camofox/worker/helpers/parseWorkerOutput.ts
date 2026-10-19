import { toKnownCode } from "../../../errors/catalog/index.ts";
import type { WorkerFailure } from "../types.ts";

/**
 * The worker prints one JSON line last; take it, or explain what came back.
 * A failure's code is checked against the error catalog: one it doesn't know
 * becomes `uncatalogued`.
 */
export function parseWorkerOutput(stdout: string, exitCode: number): Record<string, unknown> | WorkerFailure {
  const last = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  if (!last) return { ok: false, code: "workerNoOutput", detail: `worker printed nothing (exit ${exitCode})` };
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(last);
  } catch {
    // reported below
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, code: "workerBadOutput", detail: `exit ${exitCode}: ${last.slice(0, 200)}` };
  }
  const result = parsed as Record<string, unknown>;
  // `doctor` answers ok:false with its checks: that's a result, not a failure.
  if (result.ok !== false || "checks" in result) return result;
  const { code, detail, ...rest } = result;
  return { ...rest, ok: false, ...toKnownCode(code, detail) };
}
