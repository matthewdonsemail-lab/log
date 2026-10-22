import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

process.env.LOG_WARMUP_STAGE_LOG = join(mkdtempSync(join(tmpdir(), "logWarmupFeed")), "feed.jsonl");

async function run(argv: string[], overrides: Record<string, unknown> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty: marketplaceFixture(), out: (l) => out.push(l), err: (l) => err.push(l), ...overrides });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log facebook warmup", () => {
  test("plan lists each activity's recording script and whether its flow exists", async () => {
    const result = await run(["facebook", "warmup", "stages", "plan"]);
    expect(result.code).toBe(0);
    expect(result.out).toContain("feedBrowse → flow warmupFeedBrowse");
    expect(result.out).toContain("clickAny button ^Like$ 2-3  (live: only with --likes)");
    expect(result.out).toContain("openAny /marketplace/item/ 2-4");
  });

  test("run refuses an activity whose flow hasn't been recorded, before any browser opens", async () => {
    let opened = false;
    const result = await run(["facebook", "warmup", "stages", "run", "--account", "galwayOne", "--only", "messagesVisit"], { inspectSession: async () => ((opened = true), 0) });
    expect(result.code).toBe(1);
    expect(result.err).toContain("flowNotRecorded");
    expect(result.err).toContain("log facebook warmup stages record --account <a> --only messagesVisit");
    expect(opened).toBe(false);
  });

  test("unknown activities and subcommands are named", async () => {
    expect((await run(["facebook", "warmup", "stages", "run", "--account", "galwayOne", "--only", "dance"])).err).toContain("unknown activity dance");
    expect((await run(["warmup", "nap"])).err).toContain("pick a platform (facebook)");
    expect((await run(["facebook", "warmup", "stages", "nap"])).err).toContain("pick plan, record, run or log");
  });

  test("a form without the platform is refused with the one it became (rule 60)", async () => {
    expect((await run(["warmup", "plan"])).err).toContain("It is now: log facebook warmup stages plan");
    expect((await run(["warmup", "record", "--account", "galwayOne"])).err).toContain("log facebook warmup stages record");
    expect((await run(["warmup", "feed"])).err).toContain("log facebook warmup stages log");
    expect((await run(["warmup", "run"])).code).toBe(1);
  });

  test("the platform comes first: the old order is refused with the new one (rule 63)", async () => {
    const result = await run(["warmup", "facebook", "reel", "plan"]);
    expect(result.code).toBe(1);
    expect(result.err).toContain("the platform comes first (rule 63): log facebook warmup reel plan");
  });

  test("stages log shows the stage log, empty to start", async () => {
    expect((await run(["facebook", "warmup", "stages", "log"])).out).toBe("The stage log is empty.");
  });
});

describe("log facebook warmup reel (rule 49)", () => {
  test("plan draws a reel session from the activity's own steps; nothing opens", async () => {
    const { runCli } = await import("../runner/index.ts");
    const out: string[] = [];
    const code = await runCli(["facebook", "warmup", "reel", "plan", "--seed", "7"], { out: (l) => out.push(l), err: () => {} });
    expect(code).toBe(0);
    expect(out.join("\n")).toContain("Warm-up facebook reel, a session (seed 7)");
    expect(out.join("\n")).toContain("swipe — on to the next reel");
  });

  test("record runs every step in the open browser, checks each, and writes the outline", async () => {
    const { runCli } = await import("../runner/index.ts");
    const { writeCurrentInspect, clearCurrentInspect } = await import("../../browser/inspect/index.ts");
    const { marketplaceFixture } = await import("../../twenty/graphql/index.ts");
    const { mkdtempSync, readFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    process.env.LOG_INSPECT_CURRENT = join(mkdtempSync(join(tmpdir(), "logWarmupCurrent")), "current.json");
    const runDir = mkdtempSync(join(tmpdir(), "logWarmupRun"));
    writeCurrentInspect({ account: "galwayOne", runDir, commandsPath: join(runDir, "c"), repliesPath: join(runDir, "r"), startedAt: "2026-10-20T12:00:00.000Z" });
    const sent: string[] = [];
    try {
      const out: string[] = [];
      const code = await runCli(["facebook", "warmup", "reel", "--account", "galwayOne", "--live"], {
        twenty: marketplaceFixture(),
        // The URL never changes: as the wheel did on the first recording.
        sendInspect: async (_c, action) => (sent.push(action), { ok: true, url: "https://www.facebook.com/reel/1" }),
        out: (l) => out.push(l),
        err: () => {},
      });
      expect(code).toBe(1);
      expect(sent[0]).toBe("goto");
      expect(sent).not.toContain("press");
      const text = out.join("\n");
      expect(text).toContain("✗ swipe: the URL didn't change");
      expect(text).toContain("– like: skipped, a like acts on Facebook: --likes (rule 8)");
      const outline = JSON.parse(readFileSync(join(runDir, "warmup_facebook_reel.json"), "utf8"));
      expect(outline).toMatchObject({ platform: "facebook", activity: "reel", sub: "record", ok: false });
    } finally {
      clearCurrentInspect(undefined, "galwayOne");
    }
  });
});
