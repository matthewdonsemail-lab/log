/**
 * The `log` MCP server. Every CLI command in `COMMANDS` is one tool, run
 * through `runCli` exactly as the terminal runs it, so the rules the commands
 * enforce (proxy gate, local hours, dry run) hold here too. The tool result is
 * the command's stdout and stderr; a non-zero exit code is an error result.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { COMMANDS, runCli } from "../../cli/runner/index.ts";
import type { CommandContext } from "../../cli/runner/types.ts";
import { guardCall, parseEnvText, toolsFromCommands } from "./helpers/index.ts";
import type { LogToolInput } from "./types.ts";

export * from "./helpers/index.ts";
export type { GuardResult, LogTool, LogToolInput } from "./types.ts";
export { TERMINAL_ONLY } from "./types.ts";

/** Runs one tool call as `log <name> <args>`. Tests inject the context (fixture Twenty, no browser). */
export async function runToolCall(name: string, input: LogToolInput | undefined, context: Partial<CommandContext> = {}): Promise<CallToolResult> {
  const guard = guardCall(name, input, COMMANDS);
  if (!guard.ok) return { isError: true, content: [{ type: "text", text: guard.message }] };
  const out: string[] = [];
  const err: string[] = [];
  let code: number;
  try {
    code = await runCli(guard.argv, { ...context, out: (line) => out.push(line), err: (line) => err.push(line) });
  } catch (error) {
    err.push(error instanceof Error ? error.message : String(error));
    code = 1;
  }
  const text = [out.join("\n"), err.length ? `stderr:\n${err.join("\n")}` : "", `exit ${code}`].filter(Boolean).join("\n\n");
  return { isError: code !== 0, content: [{ type: "text", text }] };
}

export function createLogMcpServer(context: Partial<CommandContext> = {}): Server {
  const server = new Server({ name: "log", version: "0.1.0" }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolsFromCommands(COMMANDS) }));
  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    runToolCall(request.params.name, request.params.arguments as LogToolInput | undefined, context),
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
