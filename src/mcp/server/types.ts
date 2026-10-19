/** The `log` MCP server: every CLI command as one tool. */

/** What a tool call takes: the same arguments the command takes after `log <name>`. */
export interface LogToolInput {
  args?: string[];
  /** Must be true for any call with `--live` (AGENTS.md rule 10: posting only when matt asks). */
  confirmLive?: boolean;
}

export interface LogTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    additionalProperties: false;
  };
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
