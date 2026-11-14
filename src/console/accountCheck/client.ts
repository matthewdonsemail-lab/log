import type { Database } from "bun:sqlite";
import { readStoredChecks, runSessionCheck, sessionGate, writeCheck } from "../../platformKit/sessionCheck/index.ts";
import type { CheckState, CheckStore } from "../../platformKit/sessionCheck/index.ts";
import type { ConnectionAccount, LastCheck } from "../connections/types.ts";
import { consoleDb } from "../store/index.ts";
import type { AccountCheckError, CheckResult, CheckToolCaller } from "./types.ts";

export function recordCheck(accountId: string, state: CheckState, handle?: Database): void {
  writeCheck(accountId, { state, checkedAt: new Date().toISOString() }, handle);
}

export function readCheckRows(handle: Database | null = consoleDb()): Map<string, LastCheck> {
  return new Map([...readStoredChecks(handle)].map(([id, check]) => [id, { state: check.state, checkedAt: check.checkedAt }]));
}

export function checkRefusal(account: ConnectionAccount): AccountCheckError | null {
  if (account.platform === "facebook") return "browserCheckRequired";
  const gate = sessionGate(account);
  return gate.ok ? null : gate.code;
}

export async function inProcessToolCaller(): Promise<CheckToolCaller> {
  const { runToolCall } = await import("../../mcp/server/index.ts");
  return (name, input) => runToolCall(name, input, {}, undefined, undefined, undefined, undefined, undefined, true, "console") as Promise<{ isError?: boolean; structuredContent?: unknown }>;
}

export async function runAccountCheck(account: ConnectionAccount, callTool: CheckToolCaller, store?: CheckStore): Promise<CheckResult> {
  const refusal = checkRefusal(account);
  if (refusal) throw new Error(refusal);
  const run = await runSessionCheck({ id: account.id, name: account.name, platform: account.platform, status: account.status, state: account.state, checkedAt: account.checkedAt, lastCheck: account.lastCheck }, { callTool, store });
  if (run.outcome === "busy") throw new Error("accountCheckBusy");
  return { state: run.state, session: run.report };
}
