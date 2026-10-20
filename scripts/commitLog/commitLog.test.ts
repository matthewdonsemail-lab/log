import { describe, expect, test } from "bun:test";
// @ts-expect-error plain .mjs script, no types
import { collectDeclarations, diffDeclarations, renderSummary } from "./astSummary.mjs";
// @ts-expect-error plain .mjs script, no types
import { AST_HEADING, addedLines, astBlock, checkAdded, renderEntry, replaceLastAstBlock } from "./commitLog.mjs";

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
    expect(checkAdded(["Why: x"], ast)).toContain("no new");
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
});
