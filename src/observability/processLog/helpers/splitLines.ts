/** Complete lines from a stream chunk, and the unfinished rest to carry over. Pure. */
export function splitLines(buffer: string, chunk: string): { lines: string[]; rest: string } {
  const parts = (buffer + chunk).split(/\r?\n/);
  const rest = parts.pop() ?? "";
  return { lines: parts.filter((line) => line.trim() !== ""), rest };
}
