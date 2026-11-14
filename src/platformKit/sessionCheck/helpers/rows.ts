import type { Database } from "bun:sqlite";
import { consoleDb, processAlive } from "../../../console/store/index.ts";
import { db } from "../../../inbox/store/index.ts";
import { putState } from "../../../storage/state/index.ts";
import { CHECK_STATES, LEGACY_CHECK_STATES } from "../types.ts";
import type { CheckClaim, CheckState, CheckStore, StoredCheck } from "../types.ts";

export const CHECK_SCOPE = "consoleAccountCheck" as const;

type Alive = (pid: unknown) => boolean;

export function checkStateOfStored(value: unknown): CheckState | null {
  if ((CHECK_STATES as readonly unknown[]).includes(value)) return value as CheckState;
  return typeof value === "string" ? (LEGACY_CHECK_STATES[value] ?? null) : null;
}

function storedOf(body: string, updatedAt: number): StoredCheck | null {
  try {
    const parsed = JSON.parse(body) as { state?: unknown; code?: unknown; pid?: unknown; startedAt?: unknown };
    const state = checkStateOfStored(parsed.state);
    if (!state) return null;
    return {
      state,
      checkedAt: new Date(updatedAt).toISOString(),
      ...(typeof parsed.code === "string" ? { code: parsed.code } : {}),
      ...(typeof parsed.pid === "number" ? { pid: parsed.pid } : {}),
      ...(typeof parsed.startedAt === "string" ? { startedAt: parsed.startedAt } : {}),
    };
  } catch {
    return null;
  }
}

function bodyOf(check: StoredCheck): Record<string, unknown> {
  return { state: check.state, ...(check.code ? { code: check.code } : {}), ...(check.pid ? { pid: check.pid } : {}), ...(check.startedAt ? { startedAt: check.startedAt } : {}) };
}

export function writeCheck(accountId: string, check: StoredCheck, handle: Database = db()): void {
  putState(CHECK_SCOPE, accountId, bodyOf(check), Date.parse(check.checkedAt) || Date.now(), handle);
}

export function interrupted(check: StoredCheck, alive: Alive): boolean {
  return check.state === "checking" && !alive(check.pid);
}

export function reconcileChecks(handle: Database | null = consoleDb(), alive: Alive = processAlive, now: Date = new Date()): string[] {
  if (!handle) return [];
  const fixed: string[] = [];
  const rows = handle.prepare("SELECT key, body, updatedAt FROM state WHERE scope = ?").all(CHECK_SCOPE) as { key: string; body: string; updatedAt: number }[];
  for (const row of rows) {
    const check = storedOf(row.body, row.updatedAt);
    if (!check || !interrupted(check, alive)) continue;
    writeCheck(row.key, { state: "unknown", code: "checkInterrupted", checkedAt: now.toISOString() }, handle);
    fixed.push(row.key);
  }
  return fixed;
}

export function readStoredChecks(handle: Database | null = consoleDb(), alive: Alive = processAlive): Map<string, StoredCheck> {
  const checks = new Map<string, StoredCheck>();
  if (!handle) return checks;
  try {
    reconcileChecks(handle, alive);
    const rows = handle.prepare("SELECT key, body, updatedAt FROM state WHERE scope = ?").all(CHECK_SCOPE) as { key: string; body: string; updatedAt: number }[];
    for (const row of rows) {
      const check = storedOf(row.body, row.updatedAt);
      if (check) checks.set(row.key, check);
    }
  } catch {
    return checks;
  }
  return checks;
}

export function claimCheck(accountId: string, pid: number, now: Date, handle: Database = db(), alive: Alive = processAlive): CheckClaim {
  handle.exec("BEGIN IMMEDIATE");
  try {
    const row = handle.prepare("SELECT body, updatedAt FROM state WHERE scope = ? AND key = ?").get(CHECK_SCOPE, accountId) as { body: string; updatedAt: number } | null;
    const held = row ? storedOf(row.body, row.updatedAt) : null;
    if (held?.state === "checking" && alive(held.pid)) {
      handle.exec("COMMIT");
      return { claimed: false, holder: held.pid as number };
    }
    writeCheck(accountId, { state: "checking", pid, startedAt: now.toISOString(), checkedAt: now.toISOString() }, handle);
    handle.exec("COMMIT");
    return { claimed: true };
  } catch (error) {
    handle.exec("ROLLBACK");
    throw error;
  }
}

export function logDbCheckStore(handle?: () => Database, alive: Alive = processAlive): CheckStore {
  return {
    claim: (accountId, pid, now) => claimCheck(accountId, pid, now, handle?.() ?? db(), alive),
    record: (accountId, check) => writeCheck(accountId, check, handle?.() ?? db()),
  };
}
