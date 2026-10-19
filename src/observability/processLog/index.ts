/**
 * One place every Python process's stderr goes. The worker and session
 * clients pipe their child's stderr through `pipeProcessLog`. In a terminal
 * the default sink prints each line to stderr live, as the inherited stderr
 * used to. The MCP server swaps in its own sink (`setLogSink`) so the lines
 * reach the tool result, a live log file and MCP log notifications instead of
 * being lost.
 */
import type { Readable } from "node:stream";
import { splitLines } from "./helpers/index.ts";
import type { LogLine, LogSink, LogSource } from "./types.ts";

export * from "./helpers/index.ts";
export type { LogLine, LogSink, LogSource } from "./types.ts";

const toStderr: LogSink = (entry) => process.stderr.write(`${entry.line}\n`);

let sink: LogSink = toStderr;

/** Replaces where lines go; `null` restores the default (stderr). */
export function setLogSink(next: LogSink | null): void {
  sink = next ?? toStderr;
}

export function emitLog(source: LogSource, line: string): void {
  try {
    sink({ source, line, at: new Date().toISOString() });
  } catch {
    // A broken sink must never break the run it is logging.
  }
}

/** Sends each line of `stream` to the sink as it arrives, and the last partial line at the end. */
export function pipeProcessLog(stream: Readable | null, source: LogSource): void {
  if (!stream) return;
  let rest = "";
  stream.on("data", (chunk: Buffer | string) => {
    const split = splitLines(rest, chunk.toString());
    rest = split.rest;
    for (const line of split.lines) emitLog(source, line);
  });
  stream.on("end", () => {
    if (rest.trim()) emitLog(source, rest);
    rest = "";
  });
}
