import type { DeclaredFlag, SourceText } from "../types.ts";

const RAW = String.raw`(?:parsed\.)?flags\[\s*"(\w+)"\s*\]|(?:parsed\.)?flags\.(\w+)|\bstr\("(\w+)"\)`;
const NUMBER_OF = new RegExp(String.raw`\b(?:Number|parseInt|parseFloat)\(\s*(?:String\()?\s*(?:${RAW})`, "g");
const SPLIT_OF = new RegExp(String.raw`(?:${RAW})\)?(?:\s*as string\))?\??\.split\(",\"\)`, "g");
const NAMED = /const (\w+) = (?:parsed\.)?flags\[\s*"(\w+)"\s*\]/;
const VIA = (name: string) => new RegExp(String.raw`\b(?:Number|parseInt|parseFloat)\(\s*(?:String\()?\s*${name}\b|\b${name}\)?(?:\s*as string\))?\??\.split\(",\"\)`);

function namesOn(line: string, pattern: RegExp): string[] {
  return [...line.matchAll(pattern)].map((m) => m[1] ?? m[2] ?? m[3]).filter(Boolean);
}

function reparsedOn(lines: readonly string[], i: number): string[] {
  const line = lines[i];
  const found = [...namesOn(line, NUMBER_OF), ...namesOn(line, SPLIT_OF)];
  for (let back = Math.max(0, i - 3); back < i; back++) {
    const named = NAMED.exec(lines[back]);
    if (named && VIA(named[1]).test(line)) found.push(named[2]);
  }
  return found;
}

export function stringFlagReparses(files: readonly SourceText[], declared: readonly DeclaredFlag[]): string[] {
  const out: string[] = [];
  for (const file of files) {
    if (!file.path.startsWith("src/cli/") || file.path.endsWith(".test.ts")) continue;
    const own = declared.filter((d) => file.path.startsWith(d.folder));
    if (!own.length) continue;
    const lines = file.text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const name of new Set(reparsedOn(lines, i))) {
        if (own.some((d) => d.name === name && d.kind === "string")) out.push(`${file.path}:${i + 1} (--${name})`);
      }
    }
  }
  return out;
}
