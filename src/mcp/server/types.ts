import type { BrowserView } from "../../browser/inspect/types.ts";

export interface LogToolInput {
  args?: string[];
  confirmLive?: boolean;
  confirmBypass?: boolean;
  waitMs?: number;
  [field: string]: unknown;
}

export interface LogToolAnnotations {
  title: string;
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
}

export interface LogTool {
  name: string;
  title: string;
  description: string;
  annotations: LogToolAnnotations;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties: false;
  };
  outputSchema: typeof TOOL_RESULT_SCHEMA;
}

export const TOOL_RESULT_SCHEMA = {
  type: "object",
  properties: {
    exit: { type: "integer", description: "The command's exit code: 0 done, 1 refused or failed (the reason is in stderr), 2 runtime, -1 still running as a job (see job)" },
    ok: { type: "boolean", description: "exit is 0" },
    stdout: { type: "string", description: "What the command printed" },
    stderr: { type: "string", description: "Its errors and refusals, with the error catalog code" },
    log: { type: "array", items: { type: "string" }, description: "Its progress lines, in order (rule 26)" },
    json: { description: "stdout parsed, when the command printed JSON (pass --json)" },
    progress: {
      type: "array",
      items: { type: "object", properties: { at: { type: "string" }, source: { type: "string" }, line: { type: "string" } }, required: ["at", "source", "line"] },
      description: "Every line the run streamed as it happened, with its time (rule 26): what a client without a shell watches instead of the live log",
    },
    browsers: {
      type: "array",
      items: { type: "object" },
      description: "Every open browser after the call: account, step, url, the known page state it sits on (id, what, person), the failed step, its resolver call (next) and what only matt can clear (needsMatt) (rules 54-55)",
    },
    next: { description: "The tool call that resolves the first open browser's known state ({ tool, input }), or null: call it, do not stop (rule 54)" },
    needsMatt: { description: "What only matt can clear (a video selfie, an ID, a disabled account, a PIN not in Twenty), or null: stop that account and tell him" },
    job: {
      type: "object",
      properties: { id: { type: "string" }, status: { type: "string" }, afterLine: { type: "integer" } },
      description: "A long run is a job: its id, its status (running, completed, failed, cancelled, lost) and how many progress lines are in so far. exit -1 means it is still running: follow it with jobStatus { jobId, afterLine }",
    },
  },
  required: ["exit", "ok", "stdout", "stderr", "log", "progress", "browsers", "next", "needsMatt"],
} as const;

export interface ProgressLine {
  at: string;
  source: string;
  line: string;
}

export interface ToolResult {
  exit: number;
  ok: boolean;
  stdout: string;
  stderr: string;
  log: string[];
  json?: unknown;
  progress: ProgressLine[];
  browsers: BrowserView[];
  next: BrowserView["next"];
  needsMatt: string | null;
  job?: { id: string; status: string; afterLine: number };
}

export const TERMINAL_ONLY: Readonly<Record<string, string>> = {
  launch: "prompts in a terminal (Clack). Call the commands it wraps directly.",
  login: "opens a browser for Twenty OAuth and waits for it. Run `bun bin/log.ts login` in a terminal.",
  messenger: "asks matt for the Messenger PIN in a Clack prompt (masked). He runs `bun bin/log.ts facebook messenger pin --account <a>` in a terminal.",
};

export const NO_PROMPT: Readonly<Record<string, string>> = {
  connect: "--noPrompt",
};

export type GuardResult = { ok: true; argv: string[] } | { ok: false; message: string };
