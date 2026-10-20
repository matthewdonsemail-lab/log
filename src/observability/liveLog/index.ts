/**
 * The one live log (rule 26): `~/.logCli/mcp/<UTC day>.log`, one line per
 * stage as it happens. The MCP server writes every tool call's lines here, and
 * the terminal CLI (`bin/log.ts`) writes its own here too, so one Monitor on
 * `tail -f ~/.logCli/mcp/<day>.log` shows a run however it was started: a
 * Bash call, a PowerShell call or an MCP tool. `LOG_MCP_DIR` moves it.
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { LogStream } from "./types.ts";

export type { LogStream } from "./types.ts";

/** One line of the live log: `<time> <tool> <stream> | <line>`. Pure. */
export function formatLogLine(at: string, tool: string, stream: LogStream, line: string): string {
  return `${at} ${tool} ${stream.padEnd(7)}| ${line}`;
}

/** `2026-10-19.log`: one file per UTC day. Pure. */
export function logFileName(at: string): string {
  return `${at.slice(0, 10)}.log`;
}

/** The live log's folder: `LOG_MCP_DIR` or `~/.logCli/mcp`. */
export function liveLogDir(): string {
  return process.env.LOG_MCP_DIR || join(homedir(), ".logCli", "mcp");
}

/** Appends one line to today's live log in `dir`. Never throws: the log is a convenience, the run is what matters. */
export function appendLiveLine(dir: string, tool: string, stream: LogStream, line: string, at = new Date().toISOString()): void {
  try {
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, logFileName(at)), `${formatLogLine(at, tool, stream, line)}\n`);
  } catch {
    // A full disk or a locked file must never break the run it is logging.
  }
}
