import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dir, "..", "..", "..");

function codeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "generated" ? [] : codeFiles(path);
    if (name === "templates.ts" && dir.endsWith(join("scaffold", "platform", "helpers"))) return [];
    return /\.ts$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : [];
  });
}

function callAt(text: string, at: number): string {
  let depth = 0;
  for (let i = text.indexOf("(", at); i < text.length; i++) {
    if (text[i] === "(") depth++;
    if (text[i] === ")" && --depth === 0) return text.slice(at, i + 1);
  }
  return text.slice(at);
}

describe("background processes never open a console window", () => {
  test("every process log starts passes windowsHide, so nothing pops up on matt's screen", () => {
    const open: string[] = [];
    for (const file of codeFiles(join(root, "src"))) {
      const text = readFileSync(file, "utf8");
      for (const match of text.matchAll(/\b(?:spawn|spawnSync|Bun\.spawn|Bun\.spawnSync)\(/g)) {
        const call = callAt(text, match.index!);
        if (!call.includes("windowsHide")) open.push(`${relative(root, file)}:${text.slice(0, match.index).split("\n").length}`);
      }
    }
    expect(open).toEqual([]);
  });

  test("the session hosts start with a hidden console, never a detached one", () => {
    for (const host of ["python/twitterApi/host.py", "python/instagramApi/host.py"]) {
      const text = readFileSync(join(root, host), "utf8");
      expect(text).toContain("0x08000000");
      expect(text).not.toContain("0x00000008 |");
    }
  });
});
