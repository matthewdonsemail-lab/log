import { describe, expect, test } from "bun:test";
import { DIAGRAM_START, stepsDiagram, stepsOf, toolNames, withStepsDiagrams } from "./index.ts";

const page = [
  "## The steps",
  "",
  "| # | Step | Tool | Done when |",
  "| --- | --- | --- | --- |",
  "| 1 | Who liked the post. Then more | `twitterNotifications` { account } | the list |",
  "| 2 | Score them: bio and followers | treg's X profile read | ranked |",
  "",
].join("\n");

describe("every use case page shows its steps as a diagram (rule 56)", () => {
  test("the steps come from the page's own table, tools by name", () => {
    const steps = stepsOf(page.split("\n").slice(2, 6));
    expect(steps.map((s) => s.n)).toEqual(["1", "2"]);
    expect(toolNames(steps[0]!.tool)).toBe("twitterNotifications");
    const diagram = stepsDiagram(steps);
    expect(diagram).toContain('s0["1. Who liked the post<br/><i>twitterNotifications</i>"]');
    expect(diagram).toContain("s0 --> s1");
  });

  test("the diagram sits above its table and is rewritten, never doubled", () => {
    const once = withStepsDiagrams(page);
    expect(once.indexOf(DIAGRAM_START)).toBeLessThan(once.indexOf("| # | Step |"));
    expect(withStepsDiagrams(once)).toBe(once);
  });
});
