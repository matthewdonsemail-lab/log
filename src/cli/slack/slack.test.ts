import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { SLACK_PLATFORM } from "../../slack/account/session/index.ts";
import { runCli } from "../runner/index.ts";
import { slackDeps, slackToInboxOf } from "./index.ts";
import { withD } from "./helpers/index.ts";
import { liveLogVerdict } from "../../agentHooks/liveLog/index.ts";
import { chatEvents } from "../../inbox/store/index.ts";
import { takePending } from "../../inbox/watch/index.ts";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "slackOne", accountName: "slackOne", platform: "SLACK", cookies: { "d": "x".repeat(20) }, proxy: null } as never);
  return twenty;
}

async function run(argv: string[], engine?: PlatformEngineRun | ((spec: Record<string, unknown>) => PlatformEngineRun), twenty = fixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: string[] = [];
  const code = await runCli(argv, {
    twenty,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    directSlack: (account, spec) => {
      calls.push(`${account.accountName}:${spec.action}`);
      if (typeof engine === "function") return engine(spec as Record<string, unknown>);
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  const row = twenty.rows.socialAccounts!.find((r) => r.accountName === "slackOne")!;
  return { code, out: out.join("\n"), err: err.join("\n"), calls, row };
}

describe("log slack session check", () => {
  test("loggedIn: the engine's answer goes to Twenty", async () => {
    const r = await run(["slack", "session", "check", "--account", "slackOne"], { answer: { ok: true, loginState: "loggedIn", screenName: "slackOne" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["slackOne:ping"]);
    expect(r.row.sessionState).toBe("loggedIn");
  });

  test("an account of another platform is refused before the engine is called", async () => {
    const r = await run(["slack", "session", "check", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("accountPlatformMismatch");
    expect(r.calls).toEqual([]);
  });

  test("the engine answers sessionDead without contacting Slack when the cookies have no d", () => {
    const dir = mkdtempSync(join(tmpdir(), "slackEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({ session: "x" }));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "ping", account: "slackOne", platform: "slack", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [SLACK_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error || !engine.stdout.trim()) return;
    expect(JSON.parse(engine.stdout.trim().split("\n").pop()!)).toMatchObject({ ok: false, code: "sessionDead", loginState: "loggedOut" });
  });
});

const CHATS: PlatformEngineRun = { answer: { ok: true, loginState: "loggedIn", chats: [{ id: "D0EXAMPLE01", kind: "dm", name: null, members: ["Sam"] }, { id: "D0OTHER123", kind: "dm", name: null, members: ["Bethany"] }] }, refreshed: null };

describe("log slack chats, read and send", () => {
  test("a chat is matched by who it is with, then read", async () => {
    const r = await run(["slack", "read", "--account", "slackOne", "--chat", "sam", "--workspace", "team"], (spec) => (spec.action === "chats" ? CHATS : { answer: { ok: true, loginState: "loggedIn", chat: spec.chat, messages: [{ ts: "1", at: "2026-11-03T00:00:00Z", from: "Sam", text: "fairs", threadTs: null, replies: null }] }, refreshed: null }));
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["slackOne:chats", "slackOne:read"]);
    expect(r.out).toContain("fairs");
  });

  test("what a read finds is stored in the .db as backfill, so the voice gate inside a send has the chat's history", async () => {
    const chat = `D${Date.now()}`;
    const messages = [{ ts: "1.1", at: "2026-11-03T00:00:00Z", from: "Sam", text: "sent u 20", threadTs: null, replies: null }, { ts: "1.2", at: "2026-11-03T00:01:00Z", from: "me", text: "thanks bro", threadTs: null, replies: null }];
    const read = () => run(["slack", "read", "--account", "slackOne", "--chat", chat, "--workspace", "team"], { answer: { ok: true, loginState: "loggedIn", chat, messages }, refreshed: null });
    await read();
    await read();
    const stored = chatEvents("slack", "slackOne", (id) => id === chat);
    expect(stored.map((e) => [e.type, e.text, e.source])).toEqual([["message", "sent u 20", "backfill"], ["ownMessage", "thanks bro", "backfill"]]);
    expect(takePending().filter((m) => m.conversationId === chat)).toEqual([]);
  });

  test("workspaceNeeded lists the workspaces to pick from", async () => {
    const r = await run(["slack", "chats", "--account", "slackOne"], { answer: { ok: false, code: "workspaceNeeded", detail: "give --workspace", workspaces: [{ domain: "one" }, { domain: "two" }] }, refreshed: null });
    expect(r.code).toBe(1);
    expect(r.out).toContain("workspaceNeeded");
    expect(r.out).toContain("  two");
  });

  test("send is a dry run without --live and never calls the engine to send", async () => {
    slackDeps.profiles = () => ({});
    const r = await run(["slack", "send", "--account", "slackOne", "--chat", "D0EXAMPLE01", "--text", "first line\nsecond line"]);
    expect(r.code).toBe(0);
    expect(r.calls).toEqual([]);
    expect(r.out).toContain("dry run");
    expect(r.out).toContain("2. second line");
  });

  test("send --live needs --approvedBy", async () => {
    const r = await run(["slack", "send", "--account", "slackOne", "--chat", "D0EXAMPLE01", "--text", "yo", "--live"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("notApproved");
    expect(r.calls).toEqual([]);
  });

  test("send --live sends one engine call per line and stops at the first refusal", async () => {
    slackDeps.profiles = () => ({});
    slackDeps.wait = async () => {};
    let n = 0;
    const r = await run(["slack", "send", "--account", "slackOne", "--chat", "D0EXAMPLE01", "--text", "one\ntwo\nthree", "--live", "--approvedBy", "matt"], () => (++n === 2 ? { answer: { ok: false, code: "slackRefused", detail: "chat.postMessage answered ratelimited" }, refreshed: null } : { answer: { ok: true, sent: [{ ts: String(n) }] }, refreshed: null }));
    expect(r.code).toBe(1);
    expect(r.calls).toEqual(["slackOne:send", "slackOne:send"]);
    expect(r.out).toContain("1 of 3 sent");
  });

  test("a multi-line send stops the moment they write back, and the rest is held", async () => {
    const saved = { ...slackDeps };
    slackDeps.profiles = () => ({});
    slackDeps.wait = async () => {};
    slackDeps.now = () => "2026-11-03T19:00:00.000Z";
    let checks = 0;
    slackDeps.incoming = (account, chat) => (++checks < 2 ? [] : [{ platform: "slack", account, conversationId: chat, with: "sam", text: "wait what", at: "2026-11-03T19:00:20.000Z", box: "dm", seenAt: "2026-11-03T19:00:20.500Z" }]);
    try {
      let n = 0;
      const r = await run(["slack", "send", "--account", "slackOne", "--chat", "D0EXAMPLE01", "--text", "one\ntwo\nthree", "--live", "--approvedBy", "matt"], () => ({ answer: { ok: true, sent: [{ ts: String(++n) }] }, refreshed: null }));
      expect(r.code).toBe(1);
      expect(r.calls).toEqual(["slackOne:send", "slackOne:send"]);
      expect(r.out).toContain(">>> INTERRUPTED");
      expect(r.out).toContain('"wait what"');
      expect(r.out).toContain("not sent: three");
    } finally {
      Object.assign(slackDeps, saved);
    }
  });
});

describe("the Slack watch and the d cookie", () => {
  test("only someone else's DM, group message or mention goes to the inbox", () => {
    expect(slackToInboxOf({ type: "message", channel: "D1", fromMe: false })).toBe(true);
    expect(slackToInboxOf({ type: "message", channel: "D1", fromMe: true })).toBe(false);
    expect(slackToInboxOf({ type: "message", channel: "C1", fromMe: false, mentionsMe: false })).toBe(false);
    expect(slackToInboxOf({ type: "message", channel: "C1", fromMe: false, mentionsMe: true })).toBe(true);
    expect(slackToInboxOf({ type: "message", channel: "D1", fromMe: false, subtype: "message_changed" })).toBe(false);
  });

  test("a saved d cookie replaces the old one and keeps the rest", () => {
    const saved = withD([{ name: "d", value: "old" }, { name: "lc", value: "1" }], "xoxdNew") as { name: string; value: string }[];
    expect(saved.filter((c) => c.name === "d").map((c) => c.value)).toEqual(["xoxdNew"]);
    expect(saved.some((c) => c.name === "lc")).toBe(true);
    expect(withD({ x: "1" }, "xoxdNew")).toEqual({ x: "1", d: "xoxdNew" });
  });
});

describe("the hooks on Slack", () => {
  test("a hand-run log slack command is refused and pointed at its MCP tool, the cookie prompt is not", () => {
    expect(liveLogVerdict("Bash", 'log slack send --account mattSlack --chat sam --text "yo"').deny).toContain("rule 163");
    expect(liveLogVerdict("Bash", "bun bin/log.ts slack read --account mattSlack --chat sam").deny).toContain("rule 163");
    expect(liveLogVerdict("Bash", "log slack cookies save --account mattSlack").deny).toBeNull();
  });
});
