import type { Readable } from "node:stream";
import { splitLines } from "./helpers/index.ts";
import type { LogLine, LogSink, LogSource } from "./types.ts";

export * from "./helpers/index.ts";
export type { LogLine, LogSink, LogSource } from "./types.ts";

const toStderr: LogSink = (entry) => process.stderr.write(`${entry.line}\n`);

let sink: LogSink = toStderr;

export function setLogSink(next: LogSink | null): void {
  sink = next ?? toStderr;
}

export function emitLog(source: LogSource, line: string): void {
  try {
    sink({ source, line, at: new Date().toISOString() });
  } catch {
  }
}

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
