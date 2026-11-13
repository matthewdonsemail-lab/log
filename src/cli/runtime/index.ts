import { consoleErrorCode, isConsoleOperation, redactConsoleArgs, redactConsoleResult, runConsoleOperation } from "../../console/operations/index.ts";
import type { ConsoleOperationDeps } from "../../console/operations/index.ts";
import { finishPairing, keepConnected, readBinding, startPairing } from "../../runtime/bridge/index.ts";
import type { ResultPayload, RunTool } from "../../runtime/bridge/index.ts";
import { defaultDbPath, openDatabase, SCHEMA_VERSION } from "../../storage/schema/index.ts";
import { readLocalAccounts } from "../../twenty/graphql/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const RUNTIME_USAGE = [
  "Usage: log runtime init --origin <https://app.log.listeningkit.com> [--json]   (makes this workspace's private pairing proof and prints the challenge hash to paste into the console)",
  "       log runtime pair --token <pairing token> [--json]   (redeems the console's one-time pairing token and saves the runtime credential privately)",
  "       log runtime connect   (keeps the outbound bridge open: runs each signed request from the team's console or AI client here, journals it in log.db, reconnects on its own)",
  "       log runtime status [--json]   (which workspace this runtime is paired to, never the credential)",
].join("\n");

export const RUNTIME_INPUT: CommandInput = {
  forms: [
    { words: ["init"], effect: "write", summary: "Make this workspace's pairing proof and print the challenge hash for the console", positionals: [], flags: [{ name: "origin", kind: "string", description: "The hosted log origin, https" }, JSON_FLAG] },
    { words: ["pair"], effect: "write", summary: "Redeem the console's one-time pairing token and save the runtime credential privately", positionals: [], flags: [{ name: "token", kind: "string", description: "The one-time pairing token the console showed" }, JSON_FLAG] },
    { words: ["connect"], effect: "write", summary: "Keep the outbound bridge to the hosted service open and run each signed request here", positionals: [], flags: [] },
    { words: ["status"], summary: "Which workspace this runtime is paired to", positionals: [], flags: [JSON_FLAG] },
  ],
};

type ToolCaller = (name: string, input: Record<string, unknown>) => Promise<{ isError?: boolean; structuredContent?: unknown; content?: unknown }>;

export const runtimeDeps: { callTool: () => Promise<ToolCaller>; connect: typeof keepConnected; dbPath: () => string } = {
  callTool: async () => {
    const { runToolCall } = await import("../../mcp/server/index.ts");
    const { settleLocation } = await import("../../mcp/apps/index.ts");
    settleLocation("remote");
    void import("../../mcp/apps/browserView/helpers/index.ts").then(({ widgetHtml }) => widgetHtml()).catch(() => {});
    return (name, input) => runToolCall(name, input) as Promise<{ isError?: boolean; structuredContent?: unknown }>;
  },
  connect: keepConnected,
  dbPath: () => defaultDbPath(),
};

export function accountsList(args: Record<string, unknown>): ResultPayload {
  const limit = Math.max(1, Math.min(Number(args.limit ?? 50) || 50, 200));
  const start = Math.max(0, Number(args.cursor ?? 0) || 0);
  const rows = readLocalAccounts();
  const accounts = rows.slice(start, start + limit).map((row) => ({
    id: String(row.id ?? ""),
    platform: String(row.platform ?? "").toLowerCase(),
    account: String(row.accountName ?? ""),
    displayName: row.name ? String(row.name) : null,
    status: String(row.status ?? "unknown"),
    sessionState: row.sessionState ? String(row.sessionState) : null,
    browserLocation: row.adsPowerProfileId ? "workspace" : null,
    revision: 1,
  }));
  return { state: "succeeded", result: { accounts, cursor: start + limit < rows.length ? String(start + limit) : null } };
}

export async function toolManifest(args: Record<string, unknown>): Promise<ResultPayload> {
  const names = new Set(Array.isArray(args.names) ? args.names.map(String) : []);
  const [{ COMMANDS }, { toolsFromCommands }] = await Promise.all([import("../runner/index.ts"), import("../../mcp/server/helpers/index.ts")]);
  const tools = toolsFromCommands(COMMANDS, { shell: false })
    .filter((tool) => names.has(tool.name))
    .map((tool) => ({ name: tool.name, title: tool.title, description: tool.description, inputSchema: tool.inputSchema, annotations: tool.annotations }));
  if (args.ui !== true) return { state: "succeeded", result: { tools } };
  const { appTools, withBrowserViewUi } = await import("../../mcp/apps/index.ts");
  return { state: "succeeded", result: { tools: [...tools.map((tool) => withBrowserViewUi(tool as typeof tool & { _meta?: Record<string, unknown> })), ...appTools()] } };
}

export async function uiResources(tool: string, args: Record<string, unknown>): Promise<ResultPayload> {
  const { BROWSER_VIEW_URI, browserViewResource, readBrowserViewResource } = await import("../../mcp/apps/index.ts");
  if (tool === "uiResourcesList") return { state: "succeeded", result: { resources: [browserViewResource()] } };
  if (args.uri !== BROWSER_VIEW_URI) return { state: "failed", error: { code: "resourceNotFound", message: "no such ui resource" } };
  return { state: "succeeded", result: await readBrowserViewResource() };
}

export function isolationRefusal(env: Record<string, string | undefined>): string | null {
  if (!env.LOG_RUNTIME_DIR || env.LOG_DB || env.LOG_INBOX_STATE) return null;
  return "a runtime paired under LOG_RUNTIME_DIR keeps its own log.db: set LOG_DB (or LOG_INBOX_STATE) to its own folder too, so it never journals into the default log.db";
}

export async function consoleOperation(tool: string, args: Record<string, unknown>, callTool: ToolCaller, deps: Omit<ConsoleOperationDeps, "callTool"> = {}): Promise<ResultPayload> {
  try {
    return { state: "succeeded", result: await runConsoleOperation(tool, args, { ...deps, callTool }) };
  } catch (error) {
    const code = consoleErrorCode(error);
    return { state: "failed", error: { code, message: code } };
  }
}

export function toolRunner(callTool: ToolCaller): RunTool {
  return async (tool, args) => {
    if (tool === "accountsList") return accountsList(args);
    if (tool === "toolManifest") return toolManifest(args);
    if (tool === "uiResourcesList" || tool === "uiResourceRead") return uiResources(tool, args);
    if (isConsoleOperation(tool)) return consoleOperation(tool, args, callTool);
    const answer = await callTool(tool, args);
    const content = (answer.structuredContent ?? {}) as Record<string, unknown>;
    const { browsers: _browsers, next: _next, ...result } = content;
    return answer.isError ? { state: "failed", result, error: { code: typeof content.error === "string" && /^[a-zA-Z]{1,60}$/.test(content.error) ? content.error : "toolFailed", message: String(content.stderr ?? content.message ?? "the tool failed").slice(0, 2000) } } : { state: "succeeded", result };
  };
}

const SUBS = ["init", "pair", "connect", "status"] as const;

export const runtimeCommand: Command = {
  usage: RUNTIME_USAGE,
  platform: "any",
  name: "runtime",
  effect: "write",
  input: RUNTIME_INPUT,
  summary: "Pair this workspace with hosted log and keep its outbound bridge open, so the team's console and AI clients run their requests here",
  args: "init --origin <url>|pair --token <t>|connect|status [--json]",
  async run(context, argv) {
    const sub = SUBS.find((s) => s === argv[0]);
    if (!sub) return { code: 1, stderr: `log runtime: say init, pair, connect or status\n${RUNTIME_USAGE}` };
    const form = RUNTIME_INPUT.forms[SUBS.indexOf(sub)];
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log runtime ${sub}: ${parsed.error}\n${RUNTIME_USAGE}` };
    const json = Boolean(parsed.flags["json"]);
    if (sub === "init") {
      const origin = String(parsed.flags["origin"] ?? "");
      if (!origin) return { code: 1, stderr: `log runtime init: --origin is needed\n${RUNTIME_USAGE}` };
      let started: { challengeHash: string; installationId: string };
      try {
        started = startPairing(origin);
      } catch (error) {
        return { code: 1, stderr: `log runtime init: ${error instanceof Error ? error.message : String(error)}` };
      }
      if (json) return { code: 0, stdout: JSON.stringify(started) };
      return { code: 0, stdout: `log runtime init: installation ${started.installationId}\n  challenge hash: ${started.challengeHash}\n  Paste it into the console's workspace pairing, then run: log runtime pair --token <the token it shows>` };
    }
    if (sub === "pair") {
      const token = String(parsed.flags["token"] ?? "");
      if (!token) return { code: 1, stderr: `log runtime pair: --token is needed\n${RUNTIME_USAGE}` };
      const paired = await finishPairing(token);
      if ("code" in paired) return { code: 1, stderr: `log runtime pair: ${paired.code}: ${paired.message}` };
      const view = { workspaceId: paired.workspaceId, installationId: paired.installationId, generation: paired.generation, expiresAt: paired.expiresAt, bridgeUrl: paired.bridgeUrl };
      return { code: 0, stdout: json ? JSON.stringify(view) : `log runtime pair: paired to workspace ${paired.workspaceId} (credential generation ${paired.generation}, saved privately, expires ${paired.expiresAt}). Next: log runtime connect` };
    }
    const binding = readBinding();
    if (sub === "status") {
      const view = binding ? { paired: true, origin: binding.origin, workspaceId: binding.workspaceId, installationId: binding.installationId, generation: binding.generation, expiresAt: binding.expiresAt } : { paired: false };
      return { code: 0, stdout: json ? JSON.stringify(view) : binding ? `log runtime status: paired to workspace ${binding.workspaceId} at ${binding.origin} (generation ${binding.generation}, expires ${binding.expiresAt})` : "log runtime status: not paired (log runtime init, then log runtime pair)" };
    }
    if (!binding) return { code: 1, stderr: "log runtime connect: not paired yet (log runtime init --origin <url>, then log runtime pair --token <t>)" };
    const isolation = isolationRefusal(process.env);
    if (isolation) return { code: 1, stderr: `log runtime connect: ${isolation}` };
    const db = openDatabase(runtimeDeps.dbPath());
    const runTool = toolRunner(await runtimeDeps.callTool());
    const onLine = (line: string) => context.err?.(line);
    const closed = await runtimeDeps.connect({
      binding,
      db,
      runTool,
      isLive: (tool) => tool.endsWith("Live"),
      redact: redactConsoleArgs,
      redactResult: redactConsoleResult,
      hello: () => ({ runtimeVersion: "log", schemaVersion: SCHEMA_VERSION, capabilities: { persistentStorage: true, browserAvailable: Boolean(process.env.ADSPOWER_API_KEY || process.env.ADSPOWER_HOST), driver: process.env.ADSPOWER_API_KEY || process.env.ADSPOWER_HOST ? "adsPower" : "none", protocolVersion: 1, checkedAt: new Date().toISOString(), status: "passed" } }),
      onLine,
    });
    db.close();
    return closed.code === 1000 ? { code: 0, stdout: "log runtime connect: stopped" } : { code: 1, stderr: `log runtime connect: closed ${closed.code} ${closed.reason}` };
  },
};
