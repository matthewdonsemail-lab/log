import { describe, expect, test } from "bun:test";
import { countsOf, prose, trackedSurfaceFiles } from "./checkAgentWording.ts";

describe("agent-facing wording (#255)", () => {
  test("risk words in prose are counted, by rule", () => {
    expect(countsOf("Never bypass the gate. We scrape nothing. Cold DMs stay few.")).toMatchObject({ bypass: 1, scrape: 1, coldOutreach: 1 });
  });
  test("code, links and urls are not prose", () => {
    expect(prose("run `log x --bypass` or see [the page](https://a.b/scrape) at https://c.d/captcha")).not.toMatch(/bypass|scrape|captcha/);
    expect(countsOf("```\nlog warmup --bypass\n```")).toMatchObject({ bypass: 0 });
  });
  test("only files git tracks under the agent-facing surfaces are read, so an ignored local skill folder never counts", () => {
    const listed = ["README.md", ".claude/skills/logPlay/SKILL.md", ".claude/skills/logPlay/run.ts", "docs/guides/a.md", "docs/guidesOld/b.md", "src/x.md", ""].join("\n");
    expect(trackedSurfaceFiles(listed, ["README.md", "docs/guides", ".claude/skills"])).toEqual(["README.md", ".claude/skills/logPlay/SKILL.md", "docs/guides/a.md"]);
  });
});
