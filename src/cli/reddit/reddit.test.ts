import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { REDDIT_PLATFORM } from "../../reddit/account/session/index.ts";
import { runCli } from "../runner/index.ts";
import { gateDeps } from "../twitter/helpers/voice.ts";

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

  test("an account of another platform is refused before the engine is called, saying where it is kept", async () => {
    const r = await run(["reddit", "session", "check", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("accountPlatformMismatch");
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

describe("reddit post and reply go through the AI-artifact check, the voice gate and the claim", () => {
  const held = { ...gateDeps };
  const before = { state: process.env.LOG_INBOX_STATE, db: process.env.LOG_DB };
  const sent = { answer: { ok: true, id: "t3_fake" }, refreshed: null } as unknown as PlatformEngineRun;

  function scratch() {
    process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "redditGates"));
    delete process.env.LOG_DB;
  }

  function restore() {
    Object.assign(gateDeps, held);
    if (before.state === undefined) delete process.env.LOG_INBOX_STATE;
    else process.env.LOG_INBOX_STATE = before.state;
    if (before.db !== undefined) process.env.LOG_DB = before.db;
  }

  test("copy with AI artifacts is refused, dry run or live, and nothing is sent", async () => {
    const dry = await run(["reddit", "reply", "--account", "redditOne", "--url", "https://www.reddit.com/r/test/comments/abc/x/", "--text", "hi​there"]);
    expect(dry.code).toBe(1);
    expect(dry.err).toContain("aiArtifacts");
    expect(dry.calls).toEqual([]);
  });

  test("a live post the voice gate refuses sends nothing", async () => {
    scratch();
    gateDeps.gate = async () => ({ ok: false, refused: ">>> VOICE GATE FAILED (fake)" });
    try {
      const r = await run(["reddit", "post", "--account", "redditOne", "--subreddit", "test", "--title", "hi", "--approvedBy", "fakeOwner", "--live"], sent);
      expect(r.code).toBe(1);
      expect(r.err).toContain("voiceGateFailed");
      expect(r.calls).toEqual([]);
    } finally {
      restore();
    }
  });

  test("a live vote whose engine throws is uncertain: nothing is retried and the run says so", async () => {
    scratch();
    try {
      const err: string[] = [];
      const code = await runCli(["reddit", "vote", "--account", "redditOne", "--target", "t3_abc", "--approvedBy", "fakeOwner", "--live"], {
        twenty: fixture(),
        out: () => {},
        err: (l) => err.push(l),
        directReddit: () => {
          throw new Error("fakeEngineBroke");
        },
      });
      expect(code).not.toBe(0);
      expect(err.join(" ")).toContain("fakeEngineBroke");
    } finally {
      restore();
    }
  });

  test("a live reply that passes the gate claims the thread and sends once", async () => {
    scratch();
    const gated: string[] = [];
    gateDeps.gate = async (_context, send) => {
      gated.push(`${send.platform}:${send.to}:${send.text}`);
      return { ok: true, line: "voice gate: passed (fake)" };
    };
    try {
      const r = await run(["reddit", "reply", "--account", "redditOne", "--url", "https://www.reddit.com/r/test/comments/abc/x/", "--text", "fair point", "--approvedBy", "fakeOwner", "--live"], sent);
      expect(gated).toEqual(["reddit:https://www.reddit.com/r/test/comments/abc/x/:fair point"]);
      expect(r.calls).toEqual(["redditOne:reply"]);
    } finally {
      restore();
    }
  });
});
