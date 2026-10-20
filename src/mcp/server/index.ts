/**
 * The `log` MCP server. Every CLI command in `COMMANDS` is one tool, run
 * through `runCli` exactly as the terminal runs it, so the rules the commands
 * enforce (proxy gate, local hours, dry run) hold here too. The tool result is
 * the command's stdout, the Python processes' log and stderr; a non-zero exit
 * code is an error result.
 *
 * While a tool runs, every line (the command's output, and the worker's and
 * session's stderr through `observability/processLog`) also goes live to
 * `~/.logCli/mcp/<day>.log` and out as an MCP log notification, so a long
 * call like `connect` can be watched as it happens.
 */
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
import { FLOWS_DIR, listFlows, loadFlow, toolName } from "../../browser/flow/index.ts";
import type { FlowDefinition } from "../../browser/flow/index.ts";
import { appendLiveLine, liveLogDir } from "../../observability/liveLog/index.ts";
import { AGENTS_URI, flowArgv, guardCall, parseEnvText, SERVER_INSTRUCTIONS, toolsFromCommands, toolsFromFlows } from "./helpers/index.ts";
import type { LogStream } from "./helpers/index.ts";
import type { LogToolInput, ToolResult } from "./types.ts";

export * from "./helpers/index.ts";
export type { GuardResult, LogTool, LogToolInput } from "./types.ts";
export { NO_PROMPT, TERMINAL_ONLY, TOOL_RESULT_SCHEMA } from "./types.ts";

/** A refusal before the command runs, in the result shape every tool declares. */
function refused(message: string): CallToolResult {
  const result: ToolResult = { exit: 1, ok: false, stdout: "", stderr: message, log: [] };
  return { isError: true, content: [{ type: "text", text: message }], structuredContent: result as unknown as Record<string, unknown> };
}

/** stdout parsed, when the command printed one JSON document (`--json`). */
function jsonOf(stdout: string): unknown {
  const text = stdout.trim();
  if (!text.startsWith("{") && !text.startsWith("[")) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** The repo's AGENTS.md, served as the resource `log://agents`. */
export const AGENTS_MD = fileURLToPath(new URL("../../../AGENTS.md", import.meta.url));

/** Called for every line a tool call produces, as it happens. */
export type OnLogLine = (tool: string, stream: LogStream, line: string) => void;

/** Tool calls in flight: Python log lines go to each of them. */
const inFlight = new Set<(entry: LogLine) => void>();

/** Runs one tool call as `log <name> <args>`. Tests inject the context (fixture Twenty, no browser). */
/** The saved flows (`src/browser/flow/definitions`), each an MCP tool (rule 31). */
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
): Promise<CallToolResult> {
  // A flow tool (`flowProfileSetup`) is `log flow run <flow>` with its params by name; the same guard then applies.
  const flow = savedFlows().find((f) => toolName(f.name) === name);
  if (flow) {
    const built = flowArgv(flow, input as Record<string, unknown> | undefined);
    if (!built.ok) return refused(built.message);
    return runToolCall("flow", { args: built.argv.slice(1), confirmLive: input?.confirmLive, confirmBypass: (input as { confirmBypass?: boolean } | undefined)?.confirmBypass }, context, onLine);
  }
  const guard = guardCall(name, input, COMMANDS);
  if (!guard.ok) return refused(guard.message);
  const out: string[] = [];
  const err: string[] = [];
  const processLog: string[] = [];
  const fromProcess = (entry: LogLine) => {
    processLog.push(entry.line);
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
        onLine(name, "out", line);
      },
      err: (line) => {
        err.push(line);
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
  const result: ToolResult = { exit: code, ok: code === 0, stdout, stderr: err.join("\n"), log: processLog, ...(json === undefined ? {} : { json }) };
  return { isError: code !== 0, content: [{ type: "text", text }], structuredContent: result as unknown as Record<string, unknown> };
}

export interface LogMcpOptions {
  /** Folder for the live `<day>.log` files; null writes none (tests). Default `LOG_MCP_DIR` or `~/.logCli/mcp`. */
  logDir?: string | null;
  /** Watch the saved flows and send list_changed (default true; tests turn it off). */
  watchFlows?: boolean;
}

export function createLogMcpServer(context: Partial<CommandContext> = {}, options: LogMcpOptions = {}): Server {
  // listChanged: a saved flow is a tool of its own (rule 31), so a new or removed flow changes the list.
  // instructions: AGENTS.md's core, in the model's context before any call; the file itself is a resource.
  const server = new Server(
    { name: "log", version: "0.1.0" },
    { capabilities: { tools: { listChanged: true }, logging: {}, resources: {} }, instructions: SERVER_INSTRUCTIONS },
  );
  const logDir = options.logDir === undefined ? liveLogDir() : options.logDir;
  const onLine: OnLogLine = (tool, stream, line) => {
    // The same live log the terminal CLI writes (rule 26); the tool result still carries every line.
    if (logDir) appendLiveLine(logDir, tool, stream, line);
    server.sendLoggingMessage({ level: stream === "err" ? "warning" : "info", logger: `log.${tool}.${stream}`, data: line }).catch(() => {});
  };
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [...toolsFromCommands(COMMANDS), ...toolsFromFlows(savedFlows())] }));
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [{ uri: AGENTS_URI, name: "AGENTS.md", description: "matt's rules for log-cli, every one numbered and dated, the newest at the bottom. Every tool's description cites the ones it falls under.", mimeType: "text/markdown" }],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== AGENTS_URI) throw new Error(`No resource ${request.params.uri} (the one resource is ${AGENTS_URI})`);
    // Read on every request, so it is never older than the file.
    return { contents: [{ uri: AGENTS_URI, mimeType: "text/markdown", text: readFileSync(AGENTS_MD, "utf8") }] };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    runToolCall(request.params.name, request.params.arguments as LogToolInput | undefined, context, onLine),
  );
  // A flow saved, changed or removed → notifications/tools/list_changed, so clients re-list instead of keeping a stale catalog.
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
      // No watcher on this filesystem: the list still refreshes on every tools/list.
    }
  }
  return server;
}

/**
 * Serves over stdio from the repo root, with `.env.local` loaded the way Bun
 * loads it for `bin/log.ts`. Anything printed to stdout would break the
 * protocol, so `console.log` goes to stderr.
 */
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
  /** Where it listens. Default 127.0.0.1; any other address needs a token. */
  host?: string;
  port?: number;
  /** The bearer token every request must carry (`LOG_MCP_TOKEN`). Required off loopback. */
  token?: string | null;
  /** The command context and server options, for tests. */
  context?: Partial<CommandContext>;
  server?: LogMcpOptions;
}

const LOOPBACK = new Set(["127.0.0.1", "localhost", "::1"]);

/** Whether a request carries the token, compared in constant time. */
function authorized(request: Request, token: string | null): boolean {
  if (!token) return true;
  const given = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * The same server over Streamable HTTP, for a client that isn't on this
 * machine: the browser server (rule 43, docs/deployment.md) reached over the
 * private network (Tailscale or an SSH tunnel). One session per client, each
 * its own server, so progress lines (logging notifications) stream to the
 * caller as they happen. Every guard is the same as over stdio: --live still
 * needs confirmLive (rule 10). Off loopback a token is required, and Host
 * headers are checked (DNS rebinding).
 */
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

/** `bin/logMcp.ts --http [--host <h>] [--port <p>]`: the env loaded, then served until stopped. */
export async function startLogMcpHttp(root: string, options: { host?: string; port?: number }): Promise<void> {
  loadEnv(root);
  const served = serveLogMcpHttp({ ...options, token: process.env.LOG_MCP_TOKEN || null });
  console.error(`log MCP over HTTP: ${served.url}${process.env.LOG_MCP_TOKEN ? " (bearer token required)" : " (loopback, no token)"}`);
  await new Promise(() => {});
}
