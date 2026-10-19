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
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { COMMANDS, runCli } from "../../cli/runner/index.ts";
import type { CommandContext } from "../../cli/runner/types.ts";
import { setLogSink } from "../../observability/processLog/index.ts";
import type { LogLine } from "../../observability/processLog/index.ts";
import { formatLogLine, guardCall, logFileName, parseEnvText, toolsFromCommands } from "./helpers/index.ts";
import type { LogStream } from "./helpers/index.ts";
import type { LogToolInput } from "./types.ts";

export * from "./helpers/index.ts";
export type { GuardResult, LogTool, LogToolInput } from "./types.ts";
export { NO_PROMPT, TERMINAL_ONLY } from "./types.ts";

/** Called for every line a tool call produces, as it happens. */
export type OnLogLine = (tool: string, stream: LogStream, line: string) => void;

/** Tool calls in flight: Python log lines go to each of them. */
const inFlight = new Set<(entry: LogLine) => void>();

/** Runs one tool call as `log <name> <args>`. Tests inject the context (fixture Twenty, no browser). */
export async function runToolCall(
  name: string,
  input: LogToolInput | undefined,
  context: Partial<CommandContext> = {},
  onLine: OnLogLine = () => {},
): Promise<CallToolResult> {
  const guard = guardCall(name, input, COMMANDS);
  if (!guard.ok) return { isError: true, content: [{ type: "text", text: guard.message }] };
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
  return { isError: code !== 0, content: [{ type: "text", text }] };
}

export interface LogMcpOptions {
  /** Folder for the live `<day>.log` files; null writes none (tests). Default `LOG_MCP_DIR` or `~/.logCli/mcp`. */
  logDir?: string | null;
}

export function createLogMcpServer(context: Partial<CommandContext> = {}, options: LogMcpOptions = {}): Server {
  const server = new Server({ name: "log", version: "0.1.0" }, { capabilities: { tools: {}, logging: {} } });
  const logDir = options.logDir === undefined ? process.env.LOG_MCP_DIR || join(homedir(), ".logCli", "mcp") : options.logDir;
  if (logDir) mkdirSync(logDir, { recursive: true });
  const onLine: OnLogLine = (tool, stream, line) => {
    const at = new Date().toISOString();
    if (logDir) {
      try {
        appendFileSync(join(logDir, logFileName(at)), `${formatLogLine(at, tool, stream, line)}\n`);
      } catch {
        // The log file is a convenience; the tool result still carries every line.
      }
    }
    server.sendLoggingMessage({ level: stream === "err" ? "warning" : "info", logger: `log.${tool}.${stream}`, data: line }).catch(() => {});
  };
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolsFromCommands(COMMANDS) }));
  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    runToolCall(request.params.name, request.params.arguments as LogToolInput | undefined, context, onLine),
  );
  return server;
}

/**
 * Serves over stdio from the repo root, with `.env.local` loaded the way Bun
 * loads it for `bin/log.ts`. Anything printed to stdout would break the
 * protocol, so `console.log` goes to stderr.
 */
export async function startLogMcpServer(root: string): Promise<void> {
  process.chdir(root);
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    for (const [key, value] of Object.entries(parseEnvText(readFileSync(envPath, "utf8")))) process.env[key] ??= value;
  }
  console.log = console.error;
  console.info = console.error;
  await createLogMcpServer().connect(new StdioServerTransport());
}
