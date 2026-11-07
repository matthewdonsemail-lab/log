import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { REDDIT_PLATFORM } from "../../reddit/account/session/index.ts";
import { runCli } from "../runner/index.ts";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "redditOne", accountName: "redditOne", platform: "REDDIT", cookies: { "reddit_session": "x".repeat(20) }, proxy: null } as never);
  return twenty;
}

async function run(argv: string[], engine?: PlatformEngineRun, twenty = fixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: string[] = [];
  const code = await runCli(argv, {
    twenty,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    directReddit: (account, spec) => {
      calls.push(`${account.accountName}:${spec.action}`);
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  const row = twenty.rows.socialAccounts!.find((r) => r.accountName === "redditOne")!;
  return { code, out: out.join("\n"), err: err.join("\n"), calls, row };
}

describe("log reddit session check", () => {
  test("loggedIn: the engine's answer goes to Twenty", async () => {
    const r = await run(["reddit", "session", "check", "--account", "redditOne"], { answer: { ok: true, loginState: "loggedIn", screenName: "redditOne" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["redditOne:ping"]);
    expect(r.row.sessionState).toBe("loggedIn");
  });

  test("an account of another platform is refused before the engine is called", async () => {
    const r = await run(["reddit", "session", "check", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("accountNotFound");
    expect(r.calls).toEqual([]);
  });

  test("the engine runs on vendor/reverseChud and refuses an action it doesn't have, sending nothing", () => {
    const dir = mkdtempSync(join(tmpdir(), "redditEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ session: "x" }));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "dance", account: "redditOne", platform: "reddit", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [REDDIT_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error) return;
    expect(JSON.parse(engine.stdout.trim().split("\n").pop()!)).toMatchObject({ ok: false, code: "actionUnknown" });
    expect(readFileSync(join("vendor", "reverseChud", "src", "session.ts"), "utf8")).toContain('DEFAULT_REDDIT_BROWSER_PROFILE = "chrome_140"');
  });

  test("the engine refuses a post, reply or vote without live and who approved it, sending nothing (rule 8)", () => {
    const dir = mkdtempSync(join(tmpdir(), "redditEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ session: "x" }));
    for (const [action, extra, code] of [["create", {}, "notLive"], ["reply", {}, "notLive"], ["vote", { live: true }, "notApproved"]] as const) {
      const spec = join(dir, `${action}.json`);
      writeFileSync(spec, JSON.stringify({ action, account: "redditOne", platform: "reddit", stateRoot: join(dir, "state"), cookiesPath, ...extra }));
      const engine = spawnSync(process.env.LOG_PYTHON || "python", [REDDIT_PLATFORM.engine, spec], { encoding: "utf8" });
      if (engine.error) return;
      expect(JSON.parse(engine.stdout.trim().split("\n").pop()!)).toMatchObject({ ok: false, code });
    }
  });

  test("a write is a dry run without --live, and --live needs --approvedBy", async () => {
    const dry = await run(["reddit", "vote", "--account", "redditOne", "--target", "t3_abc"]);
    expect(dry.code).toBe(0);
    expect(dry.out).toContain("dry run");
    expect(dry.calls).toEqual([]);
    const unapproved = await run(["reddit", "post", "--account", "redditOne", "--subreddit", "test", "--title", "hi", "--live"]);
    expect(unapproved.code).toBe(1);
    expect(unapproved.err).toContain("notApproved");
    expect(unapproved.calls).toEqual([]);
  });
});
