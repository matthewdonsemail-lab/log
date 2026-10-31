import { describe, expect, test } from "bun:test";
import { readReview, reviewQuestions, sessionDigest } from "./index.ts";

const line = (entry: unknown) => JSON.stringify(entry);

describe("the use cases are reviewed against what the session did", () => {
  test("the digest keeps the owner's asks and the tools called, and drops reminders, tool results and notifications", () => {
    const digest = sessionDigest([
      line({ type: "user", message: { role: "user", content: "summarise my twitter <system-reminder>noise</system-reminder>" } }),
      line({ type: "user", message: { role: "user", content: [{ type: "tool_result", content: "big output" }] } }),
      line({ type: "user", message: { role: "user", content: "<task-notification>done</task-notification>" } }),
      line({ type: "queue-operation", operation: "enqueue", content: "i opened paper now" }),
      line({ type: "assistant", message: { role: "assistant", content: [{ type: "tool_use", name: "mcp__log__twitterDms", input: { account: "a", with: "b" } }, { type: "tool_use", name: "Monitor", input: { command: "cd x && bun bin/log.ts twitter dms --account a 2>&1 | grep y" } }, { type: "text", text: "Read the inbox." }] } }),
      "not json",
    ]);
    expect(digest.asks).toEqual(["summarise my twitter", "i opened paper now"]);
    expect(digest.work).toEqual(['log__twitterDms {"account":"a","with":"b"}', "log twitter dms --account a 2"]);
    expect(digest.text).toContain("OWNER: summarise my twitter");
    expect(digest.text).toContain("said: Read the inbox.");
    expect(digest.text).not.toContain("big output");
  });

  test("a long session keeps its latest part", () => {
    const lines = Array.from({ length: 200 }, (_, i) => line({ type: "user", message: { role: "user", content: `ask number ${i} ${"x".repeat(50)}` } }));
    const digest = sessionDigest(lines, 2000);
    expect(digest.text.length).toBeLessThan(2100);
    expect(digest.text).toContain("ask number 199");
    expect(digest.text).not.toContain("ask number 0 ");
  });

  test("one choice question per page, and one for work no page covers", () => {
    const questions = reviewQuestions(["twitter/dmInbox", "twitter/followUps"]);
    expect(Object.keys(questions)).toEqual(["page0", "page1", "uncovered"]);
    expect(questions.page1.type).toBe("choice");
    expect(questions.page1.instructions).toContain('"twitter/followUps"');
  });

  test("a stale page blocks the commit unless it is updated in it, and uncovered work blocks unless a new page is added", () => {
    const answers = {
      page0: { type: "choice" as const, choice: "update", probabilities: { current: 0.1, update: 0.85, move: 0.05 }, confidence: 0.85 },
      page1: { type: "choice" as const, choice: "update", probabilities: { current: 0.4, update: 0.5, move: 0.1 }, confidence: 0.5 },
      uncovered: { type: "noul" as const, noul: 0.9 },
    };
    const ids = ["twitter/dmInbox", "twitter/followUps"];
    const blocked = readReview(ids, answers, new Set());
    expect(blocked.pages.map((p) => p.blocks)).toEqual([true, false]);
    expect(blocked.uncoveredBlocks).toBe(true);
    expect(blocked.blocked).toBe(true);
    const fixed = readReview(ids, answers, new Set(["docs/useCases/twitter/dmInbox.md"]), undefined, true);
    expect(fixed.blocked).toBe(false);
    expect(fixed.pages[0].staged).toBe(true);
  });
});
