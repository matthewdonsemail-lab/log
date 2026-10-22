import { timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, watch } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { COMMANDS, runCli } from "../../cli/runner/index.ts";
import type { CommandContext } from "../../cli/runner/types.ts";
import { setLogSink } from "../../observability/processLog/index.ts";
import type { LogLine } from "../../observability/processLog/index.ts";
import { FLOWS_DIR, listFlows, loadFlow } from "../../browser/flow/index.ts";
import { browserViews } from "../../browser/inspect/index.ts";
import type { BrowserView } from "../../browser/inspect/index.ts";
import type { FlowDefinition } from "../../browser/flow/index.ts";
import { appendLiveLine, liveLogDir } from "../../observability/liveLog/index.ts";
import { AGENTS_URI, flowArgv, flowOfTool, guardCall, hasShell, parseEnvText, SERVER_INSTRUCTIONS, toolsFromCommands, toolsFromFlows } from "./helpers/index.ts";
import type { LogStream } from "./helpers/index.ts";
import type { LogToolInput, ProgressLine, ToolResult } from "./types.ts";

export * from "./helpers/index.ts";
export type { GuardResult, LogTool, LogToolInput } from "./types.ts";
export { NO_PROMPT, TERMINAL_ONLY, TOOL_RESULT_SCHEMA } from "./types.ts";

export type ReadBrowsers = () => BrowserView[];

function safeViews(read: ReadBrowsers): BrowserView[] {
  try {
    return read();
  } catch {
    return [];
  }
}

export function browserLines(views: BrowserView[]): string[] {
  const where = views.length
    ? `Browsers: ${views.map((v) => `${v.account} on ${v.url || "a page"} (step ${v.step})${v.state ? `, page state ${v.state.id}: ${v.state.what}` : v.failed ? ", its last step failed" : ", no known blocking state"}`).join("; ")}.`
    : "Browsers: none open.";
  const matt = views.find((v) => v.needsMatt)?.needsMatt;
  const next = views.find((v) => v.next)?.next;
  return [where, ...(matt ? [`Needs matt: ${matt}`] : []), ...(next ? [`Next: call \`${next.tool}\` ${JSON.stringify(next.input)} (rule 54: a known state is resolved, never a reason to stop).`] : [])];
}

function withBrowsers(base: Omit<ToolResult, "browsers" | "next" | "needsMatt">, body: string, isError: boolean, read: ReadBrowsers): CallToolResult {
  const views = safeViews(read);
  const result: ToolResult = { ...base, browsers: views, next: views.find((v) => v.next)?.next ?? null, needsMatt: views.find((v) => v.needsMatt)?.needsMatt ?? null };
  return { isError, content: [{ type: "text", text: [...browserLines(views), "", body].join("\n") }], structuredContent: result as unknown as Record<string, unknown> };
}

function refused(message: string, read: ReadBrowsers): CallToolResult {
  return withBrowsers({ exit: 1, ok: false, stdout: "", stderr: message, log: [], progress: [] }, message, true, read);
}

function jsonOf(stdout: string): unknown {
  const text = stdout.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export const AGENTS_MD = fileURLToPath(new URL("../../../AGENTS.md", import.meta.url));

export type OnLogLine = (tool: string, stream: LogStream, line: string) => void;

const inFlight = new Set<(entry: LogLine) => void>();

export function savedFlows(): FlowDefinition[] {
  return listFlows().flatMap((name) => {
    const flow = loadFlow(name);
    return flow ? [flow] : [];
  });
}

export async function runToolCall(
  name: string,
  input: LogToolInput | undefined,
  context: Partial<CommandContext> = {},
  onLine: OnLogLine = () => {},
  readBrowsers: ReadBrowsers = browserViews,
): Promise<CallToolResult> {
  const flowCall = flowOfTool(savedFlows(), name);
  if (flowCall) {
    const built = flowArgv(flowCall.flow, input as Record<string, unknown> | undefined, flowCall.live);
    if (!built.ok) return refused(built.message, readBrowsers);
    return runToolCall(flowCall.live ? "flowLive" : "flow", { args: built.argv.slice(1), confirmLive: input?.confirmLive, confirmBypass: (input as { confirmBypass?: boolean } | undefined)?.confirmBypass }, context, onLine, readBrowsers);
  }
  const guard = guardCall(name, input, COMMANDS);
  if (!guard.ok) return refused(guard.message, readBrowsers);
  const out: string[] = [];
  const err: string[] = [];
  const processLog: string[] = [];
  const progress: ProgressLine[] = [];
  const note = (source: string, line: string) => progress.push({ at: new Date().toISOString(), source, line });
  const fromProcess = (entry: LogLine) => {
    processLog.push(entry.line);
    note(entry.source, entry.line);
    onLine(name, entry.source, entry.line);
  };
  setLogSink((entry) => inFlight.forEach((listener) => listener(entry)));
  inFlight.add(fromProcess);
  onLine(name, "out", `▶ log ${guard.argv.join(" ")}`);
  let code: number;
  try {
    code = await runCli(guard.argv, {
      ...context,
      out: (line) => {
        out.push(line);
        note("out", line);
        onLine(name, "out", line);
      },
      err: (line) => {
        err.push(line);
        note("err", line);
        onLine(name, "err", line);
      },
    });
  } catch (error) {
    err.push(error instanceof Error ? error.message : String(error));
    code = 1;
  } finally {
    inFlight.delete(fromProcess);
    if (inFlight.size === 0) setLogSink(null);
  }
  onLine(name, "out", `■ exit ${code}`);
  const text = [
    out.join("\n"),
    processLog.length ? `log:\n${processLog.join("\n")}` : "",
    err.length ? `stderr:\n${err.join("\n")}` : "",
    `exit ${code}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  const stdout = out.join("\n");
  const json = jsonOf(stdout);
  return withBrowsers({ exit: code, ok: code === 0, stdout, stderr: err.join("\n"), log: processLog, progress, ...(json === undefined ? {} : { json }) }, text, code !== 0, readBrowsers);
}

export interface LogMcpOptions {
  logDir?: string | null;
  watchFlows?: boolean;
  readBrowsers?: ReadBrowsers;
}

export function createLogMcpServer(context: Partial<CommandContext> = {}, options: LogMcpOptions = {}): Server {
  const server = new Server(
    { name: "log", version: "0.1.0" },
    { capabilities: { tools: { listChanged: true }, logging: {}, resources: {} }, instructions: SERVER_INSTRUCTIONS },
  );
  const logDir = options.logDir === undefined ? liveLogDir() : options.logDir;
  const onLine: OnLogLine = (tool, stream, line) => {
    if (logDir) appendLiveLine(logDir, tool, stream, line);
    server.sendLoggingMessage({ level: stream === "err" ? "warning" : "info", logger: `log.${tool}.${stream}`, data: line }).catch(() => {});
  };
  server.oninitialized = () => {
    const client = server.getClientVersion();
    onLine("mcp", "out", `client ${client?.name ?? "unknown"} ${client?.version ?? ""}: ${hasShell(client?.name) ? "has a shell, so long tools say to Monitor the live log" : "no shell, so long tools say to read each result's progress and browsers"}`);
  };
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const shell = hasShell(server.getClientVersion()?.name);
    return { tools: [...toolsFromCommands(COMMANDS, { shell }), ...toolsFromFlows(savedFlows(), { shell })] };
  });
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [{ uri: AGENTS_URI, name: "AGENTS.md", description: "matt's rules for log-cli, every one numbered and dated, the newest at the bottom. Every tool's description cites the ones it falls under.", mimeType: "text/markdown" }],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== AGENTS_URI) throw new Error(`No resource ${request.params.uri} (the one resource is ${AGENTS_URI})`);
    return { contents: [{ uri: AGENTS_URI, mimeType: "text/markdown", text: readFileSync(AGENTS_MD, "utf8") }] };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    runToolCall(request.params.name, request.params.arguments as LogToolInput | undefined, context, onLine, options.readBrowsers ?? browserViews),
  );
  if (options.watchFlows !== false && existsSync(FLOWS_DIR)) {
    let pending: ReturnType<typeof setTimeout> | null = null;
    try {
      const watcher = watch(FLOWS_DIR, () => {
        if (pending) clearTimeout(pending);
        pending = setTimeout(() => server.sendToolListChanged().catch(() => {}), 300);
      });
      const close = server.onclose;
      server.onclose = () => {
        watcher.close();
        close?.();
      };
    } catch {
    }
  }
  return server;
}

function loadEnv(root: string): void {
  process.chdir(root);
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    for (const [key, value] of Object.entries(parseEnvText(readFileSync(envPath, "utf8")))) process.env[key] ??= value;
  }
}

export async function startLogMcpServer(root: string): Promise<void> {
  loadEnv(root);
  console.log = console.error;
  console.info = console.error;
  await createLogMcpServer().connect(new StdioServerTransport());
}

export interface LogMcpHttpOptions {
  host?: string;
  port?: number;
  token?: string | null;
  context?: Partial<CommandContext>;
  server?: LogMcpOptions;
}

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

function authorized(request: Request, token: string | null): boolean {
  if (!token) return true;
  const given = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function serveLogMcpHttp(options: LogMcpHttpOptions = {}): { url: string; stop: () => void } {
  const host = options.host ?? "127.0.0.1";
  const token = options.token ?? null;
  if (!LOOPBACK.has(host) && !token) throw new Error(`log MCP over HTTP on ${host} needs a token: set LOG_MCP_TOKEN (only loopback runs without one)`);
  const sessions = new Map<string, WebStandardStreamableHTTPServerTransport>();
  const server = Bun.serve({
    hostname: host,
    port: options.port ?? 7337,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname !== "/mcp") return new Response("Not found: the MCP endpoint is /mcp", { status: 404 });
      if (!authorized(request, token)) return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
      const id = request.headers.get("mcp-session-id");
      let transport = id ? sessions.get(id) : undefined;
      if (id && !transport) return Response.json({ jsonrpc: "2.0", error: { code: -32001, message: "Session not found: initialize again" }, id: null }, { status: 404 });
      if (!transport) {
        const fresh: WebStandardStreamableHTTPServerTransport = new WebStandardStreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (sessionId) => void sessions.set(sessionId, fresh),
          onsessionclosed: (sessionId) => void sessions.delete(sessionId),
          enableDnsRebindingProtection: !LOOPBACK.has(host),
          allowedHosts: LOOPBACK.has(host) ? undefined : [host, `${host}:${server.port}`],
        });
        await createLogMcpServer(options.context ?? {}, options.server ?? {}).connect(fresh);
        transport = fresh;
      }
      return transport.handleRequest(request);
    },
  });
  return { url: `http://${host}:${server.port}/mcp`, stop: () => server.stop(true) };
}

export async function startLogMcpHttp(root: string, options: { host?: string; port?: number }): Promise<void> {
  loadEnv(root);
  const served = serveLogMcpHttp({ ...options, token: process.env.LOG_MCP_TOKEN || null });
  console.error(`log MCP over HTTP: ${served.url}${process.env.LOG_MCP_TOKEN ? " (bearer token required)" : " (loopback, no token)"}`);
  await new Promise(() => {});
}
