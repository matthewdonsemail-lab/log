/** The `log` MCP server: every CLI command as one tool. */

/** What a tool call takes: the same arguments the command takes after `log <name>`. */
export interface LogToolInput {
  args?: string[];
  /** Must be true for any call with `--live` (AGENTS.md rule 10: posting only when matt asks). */
  confirmLive?: boolean;
  /** Must be true for any call with `--bypass` (rule 20: outside the account's hours only when matt asks). */
  confirmBypass?: boolean;
}

export interface LogTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    additionalProperties: false;
  };
  /** Every tool's structured result (`structuredContent`), the same shape for each: see `TOOL_RESULT_SCHEMA`. */
  outputSchema: typeof TOOL_RESULT_SCHEMA;
}

/**
 * What every tool call returns as `structuredContent`, beside the text: the
 * command's exit code, its output, its progress lines, and its output parsed
 * when the command printed JSON (`--json`). One shape, so code that calls the
 * tools (MCP's programmatic tool calling) gets a typed result.
 */
export const TOOL_RESULT_SCHEMA = {
  type: "object",
  properties: {
    exit: { type: "integer", description: "The command's exit code: 0 done, 1 refused or failed (the reason is in stderr), 2 runtime" },
    ok: { type: "boolean", description: "exit is 0" },
    stdout: { type: "string", description: "What the command printed" },
    stderr: { type: "string", description: "Its errors and refusals, with the error catalog code" },
    log: { type: "array", items: { type: "string" }, description: "Its progress lines, in order (rule 26)" },
    json: { description: "stdout parsed, when the command printed JSON (pass --json)" },
  },
  required: ["exit", "ok", "stdout", "stderr", "log"],
} as const;

/** The structured result of one call. */
export interface ToolResult {
  exit: number;
  ok: boolean;
  stdout: string;
  stderr: string;
  log: string[];
  json?: unknown;
}

/**
 * Commands that need a person at the terminal, so they are not tools. Over
 * stdio, stdin carries the MCP messages, and `launch` prompts with Clack.
 * `connect` is a tool because it always runs `--noPrompt` here (`NO_PROMPT`).
 */
export const TERMINAL_ONLY: Readonly<Record<string, string>> = {
  launch: "prompts in a terminal (Clack). Call the commands it wraps directly.",
  login: "opens a browser for Twenty OAuth and waits for it. Run `bun bin/log.ts login` in a terminal.",
};

/** Flags added to a command's args so it never reads stdin. */
export const NO_PROMPT: Readonly<Record<string, string>> = {
  connect: "--noPrompt",
};

export type GuardResult = { ok: true; argv: string[] } | { ok: false; message: string };
