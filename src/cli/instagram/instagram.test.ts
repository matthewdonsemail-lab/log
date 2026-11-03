import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { INSTAGRAM_PLATFORM } from "../../instagram/account/session/index.ts";
import { runCli } from "../runner/index.ts";
import { inboxContext, takePending } from "../../inbox/watch/index.ts";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "instagramOne", accountName: "instagramOne", platform: "INSTAGRAM", cookies: { "sessionid": "x".repeat(20), "ds_user_id": "x".repeat(20), "csrftoken": "x".repeat(20) }, proxy: null } as never);
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
    directInstagram: (account, spec) => {
      calls.push(`${account.accountName}:${spec.action}`);
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  const row = twenty.rows.socialAccounts!.find((r) => r.accountName === "instagramOne")!;
  return { code, out: out.join("\n"), err: err.join("\n"), calls, row };
}

describe("log instagram session check", () => {
  test("loggedIn: the engine's answer goes to Twenty", async () => {
    const r = await run(["instagram", "session", "check", "--account", "instagramOne"], { answer: { ok: true, loginState: "loggedIn", screenName: "instagramOne" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["instagramOne:ping"]);
    expect(r.row.sessionState).toBe("loggedIn");
  });

  test("an account of another platform is refused before the engine is called", async () => {
    const r = await run(["instagram", "session", "check", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("accountNotFound");
    expect(r.calls).toEqual([]);
  });

  test("the engine refuses cookies with no sessionid before it calls Instagram", () => {
    const dir = mkdtempSync(join(tmpdir(), "instagramEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ session: "x" }));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "ping", account: "instagramOne", platform: "instagram", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [INSTAGRAM_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error) return;
    expect(JSON.parse(engine.stdout.trim().split("\n").pop()!)).toMatchObject({ ok: false, code: "sessionDead", loginState: "loggedOut" });
  });
});

describe("log instagram dms", () => {
  const thread = { id: "340282366841710301", title: "someone", group: false, with: ["someone"], lastActivity: "2026-11-03T18:00:00Z", unread: true, pending: false };

  test("without --with it lists the threads from the engine's inbox, sending nothing", async () => {
    const r = await run(["instagram", "dms", "--account", "instagramOne"], { answer: { ok: true, loginState: "loggedIn", screenName: "instagramOne", threads: [{ ...thread, last: { id: "m1", at: thread.lastActivity, from: "someone", fromMe: false, text: "hi", kind: "text" } }] }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["instagramOne:inbox"]);
    expect(r.out).toContain("1 thread(s)");
    expect(r.out).toContain("● @someone · hi");
  });

  test("with --with it reads that thread's messages, oldest first", async () => {
    const r = await run(["instagram", "dms", "--account", "instagramOne", "--with", "@someone"], { answer: { ok: true, loginState: "loggedIn", thread, messages: [{ id: "m1", at: "2026-11-03T18:00:00Z", from: "me", fromMe: true, text: "whats up", kind: "text" }, { id: "m2", at: "2026-11-03T18:01:00Z", from: "someone", fromMe: false, text: "(clip from @creator)", kind: "clip" }] }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["instagramOne:thread"]);
    expect(r.out).toContain("2 message(s) with @someone");
    expect(r.out).toContain("me: whats up");
    expect(r.out).toContain("@someone: (clip from @creator)");
  });

  test("a name that matches several threads lists them to pick from", async () => {
    const r = await run(["instagram", "dms", "--account", "instagramOne", "--with", "some"], { answer: { ok: false, code: "threadAmbiguous", detail: "some matches 2 threads: give one's id", candidates: [{ id: "1", title: "someone", with: ["someone"] }, { id: "2", title: "somebody", with: ["somebody"] }] }, refreshed: null });
    expect(r.code).toBe(1);
    expect(r.out).toContain("threadAmbiguous");
    expect(r.out).toContain("  2  somebody (@somebody)");
  });

  test("a limit out of range is refused before the engine is called", async () => {
    const r = await run(["instagram", "dms", "--account", "instagramOne", "--limit", "500"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("--limit must be 1 to 100");
    expect(r.calls).toEqual([]);
  });

  test("the engine refuses a thread read with no thread named, before it calls Instagram", () => {
    const dir = mkdtempSync(join(tmpdir(), "instagramEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ sessionid: "x".repeat(40) }));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "thread", account: "instagramOne", platform: "instagram", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [INSTAGRAM_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error) return;
    expect(JSON.parse(engine.stdout.trim().split("\n").pop()!)).toMatchObject({ ok: false, code: "threadNeeded" });
  });
});

describe("log instagram send", () => {
  test("without --live it is a dry run that calls nothing", async () => {
    const r = await run(["instagram", "send", "--account", "instagramOne", "--with", "someone", "--text", "yo\nwhats good", "--photo", "meme.jpg"]);
    expect(r.code).toBe(0);
    expect(r.calls).toEqual([]);
    expect(r.out).toContain("dry run");
    expect(r.out).toContain("1. (photo) meme.jpg");
    expect(r.out).toContain("3. whats good");
  });

  test("--live needs --approvedBy before anything is sent", async () => {
    const r = await run(["instagram", "send", "--account", "instagramOne", "--with", "someone", "--text", "yo", "--live"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("notApproved");
    expect(r.calls).toEqual([]);
  });

  test("--live sends through the engine and reports each message's id", async () => {
    const r = await run(["instagram", "send", "--account", "instagramOne", "--with", "someone", "--text", "yo", "--photo", "meme.jpg", "--live", "--approvedBy", "matt"], { answer: { ok: true, loginState: "loggedIn", sent: [{ id: "p1", kind: "photo" }, { id: "t1", kind: "text", text: "yo" }] }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["instagramOne:send"]);
    expect(r.out).toContain("sent 2 message(s)");
    expect(r.out).toContain("yo · t1");
  });
});

describe("log instagram watch", () => {
  test("new messages from others go to the inbox, the account's own don't", async () => {
    process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "inbox"));
    const lines: string[] = [];
    const code = await runCli(["instagram", "watch", "--account", "instagramOne", "--seconds", "5", "--inbox"], {
      twenty: fixture(),
      out: () => {},
      err: (l) => lines.push(l),
      directInstagramLive: async (_account, spec, onLive) => {
        expect(spec.action).toBe("watch");
        onLive({ type: "watching", host: "edge-mqtt.facebook.com" });
        onLive({ type: "message", thread: "111", title: "someone", from: "someone", fromMe: false, text: "yo", at: "2026-11-04T00:00:00Z" });
        onLive({ type: "message", thread: "111", title: "someone", from: "me", fromMe: true, text: "hey", at: "2026-11-04T00:00:01Z" });
        return { answer: { ok: true, loginState: "loggedIn", watchedSeconds: 5 }, refreshed: null };
      },
    });
    const pending = takePending();
    expect(code).toBe(0);
    expect(lines.join("\n")).toContain("@someone: yo");
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({ platform: "instagram", account: "instagramOne", conversationId: "111", with: "someone", text: "yo" });
  });

  test("the inbox hook tells the agent to answer on Instagram through the MCP, never the browser", () => {
    const text = inboxContext([{ platform: "instagram", account: "instagramOne", conversationId: "111", with: "someone", text: "yo", at: "2026-11-04T00:00:00Z", box: "dm", seenAt: "2026-11-04T00:00:01Z" }])!;
    expect(text).toContain("NEW INSTAGRAM MESSAGE");
    expect(text).toContain("never through the browser");
    expect(text).toContain("`instagramSendLive` { account: \"instagramOne\"");
  });

  test("the engine refuses a send with nothing in it, before it calls Instagram", () => {
    const dir = mkdtempSync(join(tmpdir(), "instagramEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ sessionid: "x".repeat(40) }));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "send", with: "someone", live: true, approvedBy: "matt", account: "instagramOne", platform: "instagram", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [INSTAGRAM_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error) return;
    expect(JSON.parse(engine.stdout.trim().split("\n").pop()!)).toMatchObject({ ok: false, code: "nothingToSend" });
  });
});
