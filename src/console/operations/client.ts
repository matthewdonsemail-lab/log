import { checkRefusal, inProcessToolCaller, sharedAccountChecker } from "../accountCheck/index.ts";
import { loadConnectionsView } from "../connections/index.ts";
import { readConsoleCredentials, saveConsoleCredentials } from "../credentials/index.ts";
import { loadConsoleEvents, MAX_PAGE_SIZE } from "../events/index.ts";
import { signInConsoleAccount } from "../signIn/index.ts";
import { loadConsoleUsage, usageDaysOf } from "../usage/index.ts";
import { CONSOLE_OPERATIONS, CONSOLE_SAFE_ERRORS, REDACTED, SECRET_ARGS } from "./types.ts";
import type { ConsoleOperation, ConsoleOperationDeps } from "./types.ts";

export function isConsoleOperation(value: unknown): value is ConsoleOperation {
  return typeof value === "string" && (CONSOLE_OPERATIONS as readonly string[]).includes(value);
}

export function consoleErrorCode(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  return (CONSOLE_SAFE_ERRORS as readonly string[]).includes(code) ? code : "consoleWorkspaceUnavailable";
}

export function redactConsoleArgs(tool: string, args: Record<string, unknown>): Record<string, unknown> {
  const secret = isConsoleOperation(tool) ? SECRET_ARGS[tool] : undefined;
  if (!secret) return args;
  return Object.fromEntries(Object.entries(args).map(([name, value]) => [name, secret.includes(name) ? REDACTED : value]));
}

async function accountCheck(args: Record<string, unknown>, deps: ConsoleOperationDeps) {
  const view = loadConnectionsView();
  const account = view.accounts.find((item) => item.id === args.accountId);
  if (!account) throw new Error("accountNotFound");
  const refusal = checkRefusal(account);
  if (refusal) throw new Error(refusal);
  const checker = sharedAccountChecker(deps.callTool ?? (await inProcessToolCaller()));
  const result = await checker.check({ id: account.id, name: account.name, platform: account.platform });
  return { state: result.state, connections: loadConnectionsView() };
}

export async function runConsoleOperation(tool: string, args: Record<string, unknown>, deps: ConsoleOperationDeps = {}): Promise<unknown> {
  if (!isConsoleOperation(tool)) throw new Error("consoleOperationUnknown");
  if (tool === "connectionsList") return loadConnectionsView();
  if (tool === "credentialsSave") {
    const saved = await saveConsoleCredentials({ provider: args.provider, values: args.values }, { fetcher: deps.fetcher });
    return { ...saved, connections: loadConnectionsView() };
  }
  if (tool === "credentialsRead") {
    if (args.provider !== "adsPower") throw new Error("credentialInputInvalid");
    return { values: readConsoleCredentials({ provider: args.provider }) };
  }
  if (tool === "accountCheck") return accountCheck(args, deps);
  if (tool === "accountSignIn") {
    const result = await signInConsoleAccount(args);
    return { ...result, connections: loadConnectionsView() };
  }
  if (tool === "usage") {
    const days = usageDaysOf(String(args.days ?? "30"));
    if (!days) throw new Error("usageRangeInvalid");
    return loadConsoleUsage(days, deps.now?.());
  }
  const { total: _total, page: _page, pageSize: _pageSize, pageCount: _pageCount, kinds: _kinds, ...page } = loadConsoleEvents({ pageSize: MAX_PAGE_SIZE });
  return page;
}
