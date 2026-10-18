import { describe, expect, test } from "bun:test";
// @ts-expect-error plain .mjs script, no types
import { addedLines, checkAdded, renderEntry } from "./commitLog.mjs";

describe("commitLog", () => {
  const template = renderEntry({ when: "2026-10-18 05:40Z", branch: "feat/x", files: ["src/a.ts"] });

  test("the template has three AST lines to fill in", () => {
    expect(template).toContain("## 2026-10-18 05:40Z · feat/x");
    expect(template.match(/^AST:/gm)).toHaveLength(3);
    expect(checkAdded(template.split("\n"))).toContain("<fill in>");
  });

  test("a filled entry passes, a missing or partial one fails", () => {
    const filled = template.replaceAll("<fill in>", "done");
    expect(checkAdded(filled.split("\n"))).toBeNull();
    expect(checkAdded(["AST: What changed: x"])).toContain("no new");
    expect(checkAdded(["## entry", "AST: What changed: x"])).toContain("AST:");
  });

  test("addedLines reads only the + lines of a diff", () => {
    const diff = "--- a/log.md\n+++ b/log.md\n@@ -1 +1,2 @@\n old\n+## new\n+AST: x";
    expect(addedLines(diff)).toEqual(["## new", "AST: x"]);
  });
});
