import type { SourceText } from "../types.ts";

const PLAIN_REFUSAL = /\{\s*code:\s*[12],\s*stderr:/g;

export function uncodedRefusals(files: readonly SourceText[]): string[] {
  const out: string[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/cli/") || file.path.endsWith(".test.ts")) continue;
    file.text.split("\n").forEach((line, i) => {
      for (const _ of line.matchAll(PLAIN_REFUSAL)) out.push(`${file.path}:${i + 1}`);
    });
  }
  return out;
}
