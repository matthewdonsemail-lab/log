import { describe, expect, test } from "bun:test";
import { collectDeclarations, diffDeclarations, renderSummary } from "./astSummary.mjs";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { AST_HEADING, addedLines, astBlock, checkAdded, countEntries, dayFile, dayOf, devlogDir, entryLines, markCommitted, pendingFile, renderDay, renderEntry, renderIndex, replaceEntryAstBlock, replaceLastAstBlock, splitEntries } from "./commitLog.mjs";

describe("astSummary", () => {
  test("reports added, changed and removed declarations from the syntax tree", () => {
    const before = collectDeclarations(
      "export function a() { return 1 }\nexport const b = 2\nexport type C = 'x'\nexport * from './d.ts'",
      "x.ts",
    );
    const after = collectDeclarations(
      "export function a() { return 2 }\nexport type C = 'x'\nexport interface E { f: string }\nexport * from './d.ts'",
      "x.ts",
    );
    expect(diffDeclarations(before, after)).toEqual({ added: ["interface E"], removed: ["const b"], changed: ["function a"] });
  });

  test("whitespace and comment-only moves inside a declaration don't count as changes", () => {
    const one = collectDeclarations("function a() {\n  return 1\n}", "x.ts");
    const two = collectDeclarations("function a() { return 1 }", "x.ts");
    expect(diffDeclarations(one, two).changed).toEqual([]);
  });

  test("test files report test titles", () => {
    const decls = collectDeclarations('describe("x", () => { test("does y", () => {}) })', "x.test.ts");
    expect([...decls.keys()]).toEqual(['test "does y"']);
  });

  test("renders one line per file", () => {
    expect(
      renderSummary([
        { path: "src/a.ts", status: "modified", diff: { added: ["function x"], changed: [], removed: ["const y"] } },
        { path: "README.md", status: "modified", diff: null },
      ]),
    ).toEqual(["- `src/a.ts`: added function x · removed const y", "- `README.md`: edited"]);
  });
});

describe("commitLog", () => {
  const ast = ["- `src/a.ts`: added function x"];
  const template = renderEntry({ when: "2026-10-18 05:40Z", branch: "feat/x", ast });

  test("the template carries the AST block and three fields to write", () => {
    const lines = template.split("\n");
    expect(lines).toContain(AST_HEADING);
    expect(astBlock(lines)).toEqual(ast);
    expect(checkAdded(lines, ast)).toContain("still needs writing");
  });

  test("a written entry with a matching AST passes; a stale AST is caught", () => {
    const written = template.replaceAll("<fill in>", "done").split("\n");
    expect(checkAdded(written, ast)).toBeNull();
    expect(checkAdded(written, ["- `src/a.ts`: added function z"])).toBe("stale");
    expect(checkAdded(["Why: x"], ast)).toContain("no \"## \" heading");
  });

  test("replaceLastAstBlock swaps only the newest entry's block", () => {
    const text = `# log\n\n${template}\n${template}`;
    const next = replaceLastAstBlock(text, ["- `src/b.ts`: edited"]);
    expect(next.match(/src\/a\.ts/g)).toHaveLength(1);
    expect(next).toContain("- `src/b.ts`: edited");
  });

  test("addedLines reads only the + lines of a diff", () => {
    expect(addedLines("--- a/log.md\n+++ b/log.md\n@@ -1 +1,2 @@\n old\n+## new\n+Why: x")).toEqual(["## new", "Why: x"]);
  });

  test("the log is one file per day, indexed newest first", () => {
    const entry = (when: string) => renderEntry({ when, branch: "main", ast: ["- `a.ts`: added const x"] }).replace(/<fill in>/g, "done");
    const text = `# log

header

${entry("2026-10-18 04:01Z")}
${entry("2026-10-18 05:09Z")}
${entry("2026-10-19 01:00Z")}`;
    const days = splitEntries(text);
    expect([...days.keys()]).toEqual(["2026-10-18", "2026-10-19"]);
    expect(days.get("2026-10-18")).toHaveLength(2);
    const day = renderDay("2026-10-18", days.get("2026-10-18")!);
    expect(countEntries(day)).toBe(2);
    expect(day).toContain("[log.md](log.md)");
    const index = renderIndex(new Map([["2026-10-18", 2], ["2026-10-19", 1]]));
    expect(index.indexOf("2026-10-19")).toBeLessThan(index.indexOf("2026-10-18"));
    expect(index).toContain("| [2026-10-18](2026-10-18.md) | 2 |");
    expect(dayFile(dayOf("2026-11-02 03:12Z"))).toBe("2026-11-02.md");
  });

  test("day logs live in a private folder outside the repo, LOG_DEVLOG_DIR or ~/.logCli/devlog", () => {
    expect(devlogDir({ LOG_DEVLOG_DIR: "D:/private/devlog" })).toBe("D:/private/devlog");
    expect(devlogDir({})).toBe(join(homedir(), ".logCli", "devlog"));
  });

  test("the pending entry is found by its heading, even when another entry was added after it", () => {
    const mine = renderEntry({ when: "2026-11-02 04:47Z", branch: "b", ast: ["- `b.ts`: edited"] });
    const later = renderEntry({ when: "2026-11-02 04:50Z", branch: "c", ast: ["- `c.ts`: edited"] });
    const text = `# log\n\n${mine}\n${later}`;
    const lines = entryLines(text, "## 2026-11-02 04:47Z · b");
    expect(lines[0]).toBe("## 2026-11-02 04:47Z · b");
    expect(astBlock(lines)).toEqual(["- `b.ts`: edited"]);
    expect(entryLines(text, "## 2026-11-02 05:00Z · d")).toEqual([]);
    const next = replaceEntryAstBlock(text, "## 2026-11-02 04:47Z · b", ["- `b.ts`: added const x"]);
    expect(astBlock(entryLines(next, "## 2026-11-02 04:47Z · b"))).toEqual(["- `b.ts`: added const x"]);
    expect(astBlock(entryLines(next, "## 2026-11-02 04:50Z · c"))).toEqual(["- `c.ts`: edited"]);
    expect(next.endsWith(later)).toBe(true);
  });

  test("each checkout keeps its own pending entry, cleared once the commit lands", () => {
    const dir = mkdtempSync(join(tmpdir(), "devlogTest-"));
    const one = pendingFile(dir, "C:/repos/log");
    expect(one).not.toBe(pendingFile(dir, "C:/repos/log/.claude/worktrees/a"));
    expect(one.startsWith(join(dir, ".pending"))).toBe(true);
    mkdirSync(join(dir, ".pending"), { recursive: true });
    writeFileSync(one, "{}");
    expect(existsSync(one)).toBe(true);
    markCommitted(dir, "C:/repos/log");
    expect(existsSync(one)).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });

  test("a stale AST block is replaced on its own line, whatever the file's line endings", () => {
    const text = ["x", AST_HEADING, "- old", "", "What changed: y"].join("\r\n");
    expect(replaceLastAstBlock(text, ["- new"])).toBe(["x", AST_HEADING, "- new", "", "What changed: y"].join("\n"));
  });
});
