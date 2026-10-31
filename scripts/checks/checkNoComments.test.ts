import { describe, expect, test } from "bun:test";
import { commentRanges, stripComments } from "./checkNoComments.ts";

describe("noComments", () => {
  const text = String.raw`/** doc */
export const url = "http://x.y/z"; // trailing
const pattern = /\/\/notAComment/;
/* block
   spans */
function f(/* inline */ x: number) {
  // full line

  return x / 2; /* end */
}
const t = ` + "`// in a template`" + String.raw`;
`;

  test("finds every comment and nothing inside strings, regexes or templates", () => {
    expect(commentRanges("t.ts", text).map((r) => text.slice(r.pos, r.end))).toEqual(["/** doc */", "// trailing", "/* block\n   spans */", "/* inline */", "// full line", "/* end */"]);
  });

  test("strips them and leaves the code as it was", () => {
    const stripped = stripComments(text, commentRanges("t.ts", text));
    expect(commentRanges("t.ts", stripped)).toEqual([]);
    expect(stripped).toContain('export const url = "http://x.y/z";\n');
    expect(stripped).toContain(String.raw`const pattern = /\/\/notAComment/;`);
    expect(stripped).toContain("function f( x: number) {");
    expect(stripped).toContain("  return x / 2;\n}");
    expect(stripped).toContain("`// in a template`");
  });
});
