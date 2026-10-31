import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { LogStream } from "./types.ts";

export type { LogStream } from "./types.ts";

export function formatLogLine(at: string, tool: string, stream: LogStream, line: string): string {
  return `${at} ${tool} ${stream.padEnd(7)}| ${line}`;
}

export function logFileName(at: string): string {
  return `${at.slice(0, 10)}.log`;
}

export function liveLogDir(): string {
  return process.env.LOG_MCP_DIR || join(homedir(), ".logCli", "mcp");
}

export function appendLiveLine(dir: string, tool: string, stream: LogStream, line: string, at = new Date().toISOString()): void {
  try {
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, logFileName(at)), `${formatLogLine(at, tool, stream, line)}\n`);
  } catch {
  }
}
