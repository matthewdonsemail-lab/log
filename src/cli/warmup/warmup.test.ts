import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";

process.env.LOG_WARMUP_FEED = join(mkdtempSync(join(tmpdir(), "logWarmupFeed")), "feed.jsonl");

async function run(argv: string[], overrides: Record<string, unknown> = {}) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty: marketplaceFixture(), out: (l) => out.push(l), err: (l) => err.push(l), ...overrides });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log warmup", () => {
  test("plan lists each activity's recording script and whether its flow exists", async () => {
    const result = await run(["warmup", "plan"]);
    expect(result.code).toBe(0);
    expect(result.out).toContain("feedBrowse → flow warmupFeedBrowse");
    expect(result.out).toContain("clickAny button ^Like$ 2-3  (live: only with --likes)");
    expect(result.out).toContain("openAny /marketplace/item/ 2-4");
  });

  test("run refuses an activity whose flow hasn't been recorded, before any browser opens", async () => {
    let opened = false;
    const result = await run(["warmup", "run", "--account", "galwayOne", "--only", "messagesVisit"], { inspectSession: async () => ((opened = true), 0) });
    expect(result.code).toBe(1);
    expect(result.err).toContain("flowNotRecorded");
    expect(result.err).toContain("log warmup record --account <a> --only messagesVisit");
    expect(opened).toBe(false);
  });

  test("unknown activities and subcommands are named", async () => {
    expect((await run(["warmup", "run", "--account", "galwayOne", "--only", "dance"])).err).toContain("unknown activity dance");
    expect((await run(["warmup", "nap"])).err).toContain("pick plan, record, run or feed");
  });

  test("feed shows the activity feed, empty to start", async () => {
    expect((await run(["warmup", "feed"])).out).toBe("The warm-up feed is empty.");
  });
});
