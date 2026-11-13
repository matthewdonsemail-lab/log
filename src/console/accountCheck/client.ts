import type { Database } from "bun:sqlite";
import { createActor } from "xstate";
import { putState } from "../../storage/state/index.ts";
import { CHECK_STATES } from "../connections/types.ts";
import type { CheckState, ConnectionAccount, LastCheck } from "../connections/types.ts";
import { consoleDb } from "../store/index.ts";
import { accountCheckMachine } from "./machine.ts";
import { STOPPED_SESSION_STATES } from "./types.ts";
import type { AccountCheckError, CheckAccount, CheckRecorder, CheckResult, CheckToolCaller } from "./types.ts";

export function recordCheck(accountId: string, state: CheckState, handle?: Database): void {
  if (handle) putState("consoleAccountCheck", accountId, { state }, Date.now(), handle);
  else putState("consoleAccountCheck", accountId, { state });
}

export function readCheckRows(handle: Database | null = consoleDb()): Map<string, LastCheck> {
  const checks = new Map<string, LastCheck>();
  if (!handle) return checks;
  try {
    const rows = handle.prepare("SELECT key, body, updatedAt FROM state WHERE scope = 'consoleAccountCheck'").all() as { key: string; body: string; updatedAt: number }[];
    for (const row of rows) {
      const body = JSON.parse(row.body) as { state?: unknown };
      if ((CHECK_STATES as readonly unknown[]).includes(body.state)) checks.set(row.key, { state: body.state as CheckState, checkedAt: new Date(row.updatedAt).toISOString() });
    }
  } catch {
    return checks;
  }
  return checks;
}

export function checkRefusal(account: ConnectionAccount): AccountCheckError | null {
  if (account.platform === "facebook") return "browserCheckRequired";
  if (account.status === "deactivated") return "accountDeactivated";
  if ((STOPPED_SESSION_STATES as readonly string[]).includes(account.state)) return "accountCheckStopped";
  const last = account.lastCheck;
  if (last && ["stopped", "unknown"].includes(last.state) && (!account.checkedAt || Date.parse(account.checkedAt) <= Date.parse(last.checkedAt))) return "accountCheckStopped";
  return null;
}

export interface AccountChecker {
  activeAccountId(): string | null;
  check(account: CheckAccount): Promise<CheckResult>;
  stop(): void;
}

export function createAccountChecker(callTool: CheckToolCaller, record: CheckRecorder = recordCheck): AccountChecker {
  const actor = createActor(accountCheckMachine(callTool, record)).start();
  return {
    activeAccountId: () => (actor.getSnapshot().matches("checking") ? (actor.getSnapshot().context.task?.account.id ?? null) : null),
    check(account) {
      if (!actor.getSnapshot().matches("idle")) return Promise.reject(new Error("accountCheckBusy"));
      return new Promise<CheckResult>((resolve) => actor.send({ type: "check", task: { account, resolve } }));
    },
    stop: () => actor.stop(),
  };
}

let shared: AccountChecker | null = null;

export async function inProcessToolCaller(): Promise<CheckToolCaller> {
  const { runToolCall } = await import("../../mcp/server/index.ts");
  return (name, input) => runToolCall(name, input) as Promise<{ isError?: boolean; structuredContent?: unknown }>;
}

export function sharedAccountChecker(callTool: CheckToolCaller): AccountChecker {
  shared ??= createAccountChecker(callTool);
  return shared;
}

export function activeCheckId(): string | null {
  return shared?.activeAccountId() ?? null;
}
