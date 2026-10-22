export interface LogToolInput {
  args?: string[];
  confirmLive?: boolean;
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
  outputSchema: typeof TOOL_RESULT_SCHEMA;
}

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

export interface ToolResult {
  exit: number;
  ok: boolean;
  stdout: string;
  stderr: string;
  log: string[];
  json?: unknown;
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
