import { checkRefusal, inProcessToolCaller, sharedAccountChecker } from "../accountCheck/index.ts";
import { loadConnectionsView } from "../connections/index.ts";
import { readConsoleCredentials, saveConsoleCredentials } from "../credentials/index.ts";
import { loadConsoleEvents, MAX_PAGE_SIZE } from "../events/index.ts";
import { signInConsoleAccount } from "../signIn/index.ts";
import { loadConsoleUsage, usageDaysOf } from "../usage/index.ts";
import { actOnBrowser, browserCheckFrame, browserCheckView, browserErrorCode, closeBrowser, openBrowser, saveBrowserState, sendBrowserInput } from "../browserCheck/index.ts";
import type { ConnectionAccount } from "../connections/index.ts";
import { CONSOLE_OPERATIONS, CONSOLE_SAFE_ERRORS, FRAME_TOOLS, REDACTED, SECRET_ARGS, STREAM_TOOLS } from "./types.ts";
import type { ConsoleOperation, ConsoleOperationDeps } from "./types.ts";

export function isConsoleOperation(value: unknown): value is ConsoleOperation {
  return typeof value === "string" && (CONSOLE_OPERATIONS as readonly string[]).includes(value);
}

export function consoleErrorCode(error: unknown): string {
  const code = browserErrorCode(error) ?? (error instanceof Error ? error.message : "");
  return (CONSOLE_SAFE_ERRORS as readonly string[]).includes(code) ? code : "consoleWorkspaceUnavailable";
}

export function redactConsoleArgs(tool: string, args: Record<string, unknown>): Record<string, unknown> {
  const secret = isConsoleOperation(tool) ? SECRET_ARGS[tool] : undefined;
  if (!secret) return args;
  return Object.fromEntries(Object.entries(args).map(([name, value]) => [name, secret.includes(name) ? REDACTED : value]));
}

function redactedValue(value: unknown, frames: boolean): unknown {
  if (Array.isArray(value)) return value.map((item) => redactedValue(item, frames));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => {
    if (key === "stream" && item && typeof item === "object" && !Array.isArray(item)) return [key, { ...(item as Record<string, unknown>), url: REDACTED }];
    if (frames && key === "data" && typeof item === "string") return [key, REDACTED];
    return [key, redactedValue(item, frames)];
  }));
}

export function redactConsoleResult(tool: string, result: unknown): unknown {
  if (tool === "uiResourceRead" && result && typeof result === "object") return { ...(result as Record<string, unknown>), contents: REDACTED };
  if (!STREAM_TOOLS.includes(tool) && !FRAME_TOOLS.includes(tool)) return result;
  return redactedValue(result, FRAME_TOOLS.includes(tool));
}

function connectionOf(args: Record<string, unknown>): ConnectionAccount {
  const account = loadConnectionsView().accounts.find((item) => item.id === args.accountId);
  if (!account) throw new Error("accountNotFound");
  return account;
}

async function browserOperation(tool: string, args: Record<string, unknown>, deps: ConsoleOperationDeps): Promise<unknown> {
  const account = connectionOf(args);
  const callTool = deps.callTool ?? (await inProcessToolCaller());
  const at = { generation: args.generation, revision: args.revision };
  if (tool === "browserState") return { view: await browserCheckView(account) };
  if (tool === "browserOpen") return { view: await openBrowser(account, callTool) };
  if (tool === "browserFrame") return { frame: await browserCheckFrame(account, args.generation) };
  if (tool === "browserInput") return { view: await sendBrowserInput(account, { ...at, event: args.event }) };
  if (tool === "browserAction") return { view: await actOnBrowser(account, args.action, at, callTool) };
  if (tool === "browserSaveState") return { view: await saveBrowserState(account, at, callTool), connections: loadConnectionsView() };
  return { view: await closeBrowser(account, callTool), connections: loadConnectionsView() };
}

async function accountCheck(args: Record<string, unknown>, deps: ConsoleOperationDeps) {
  const view = loadConnectionsView();
  const account = view.accounts.find((item) => item.id === args.accountId);
  if (!account) throw new Error("accountNotFound");
  const refusal = checkRefusal(account);
  if (refusal) throw new Error(refusal);
  const checker = sharedAccountChecker(deps.callTool ?? (await inProcessToolCaller()));
  const result = await checker.check({ id: account.id, name: account.name, platform: account.platform });
  return { state: result.state, session: result.session ?? null, connections: loadConnectionsView() };
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
  if (tool.startsWith("browser")) return browserOperation(tool, args, deps);
  if (tool === "usage") {
    const days = usageDaysOf(String(args.days ?? "30"));
    if (!days) throw new Error("usageRangeInvalid");
    return loadConsoleUsage(days, deps.now?.() ?? Date.now(), true);
  }
  const { total: _total, page: _page, pageSize: _pageSize, pageCount: _pageCount, kinds: _kinds, ...page } = loadConsoleEvents({ pageSize: MAX_PAGE_SIZE });
  return page;
}
