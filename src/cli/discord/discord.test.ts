import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { DISCORD_PLATFORM } from "../../discord/account/session/index.ts";
import { runCli } from "../runner/index.ts";
import { discordDeps, toInboxOf } from "./index.ts";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "discordOne", accountName: "discordOne", platform: "DISCORD", cookies: [], storageOrigins: [{ origin: "https://discord.com", localStorage: [{ name: "token", value: JSON.stringify("x".repeat(30)) }] }], proxy: null } as never);
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
    directDiscord: (account, spec) => {
      calls.push(`${account.accountName}:${spec.action}`);
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  const row = twenty.rows.socialAccounts!.find((r) => r.accountName === "discordOne")!;
  return { code, out: out.join("\n"), err: err.join("\n"), calls, row };
}

describe("log discord session check", () => {
  test("loggedIn: the engine's answer goes to Twenty", async () => {
    const r = await run(["discord", "session", "check", "--account", "discordOne"], { answer: { ok: true, loginState: "loggedIn", screenName: "discordOne" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["discordOne:ping"]);
    expect(r.row.sessionState).toBe("loggedIn");
  });

  test("an account of another platform is refused before the engine is called", async () => {
    const r = await run(["discord", "session", "check", "--account", "galwayOne"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("accountNotFound");
    expect(r.calls).toEqual([]);
  });

  test("an account with no Discord token saved is refused before the engine is called", async () => {
    const twenty = fixture();
    (twenty.rows.socialAccounts!.find((r) => r.accountName === "discordOne") as unknown as { storageOrigins: unknown }).storageOrigins = [];
    const r = await run(["discord", "session", "check", "--account", "discordOne"], undefined, twenty);
    expect(r.code).toBe(1);
    expect(r.err).toContain("localStorage token");
    expect(r.calls).toEqual([]);
  });

  test("the engine runs on vendor/endcord and refuses an action it doesn't have, sending nothing", () => {
    const dir = mkdtempSync(join(tmpdir(), "discordEngine"));
    const cookiesPath = join(dir, "cookies.json");
    writeFileSync(cookiesPath, JSON.stringify({}));
    const spec = join(dir, "spec.json");
    writeFileSync(spec, JSON.stringify({ action: "vote", account: "discordOne", platform: "discord", stateRoot: join(dir, "state"), cookiesPath }));
    const engine = spawnSync(process.env.LOG_PYTHON || "python", [DISCORD_PLATFORM.engine, spec], { encoding: "utf8" });
    if (engine.error) return;
    expect(JSON.parse(engine.stdout.trim().split("\n").pop()!)).toMatchObject({ ok: false, code: "actionUnknown" });
    const loads = spawnSync(process.env.LOG_PYTHON || "python", ["-c", "import sys; sys.path.insert(0, 'vendor/endcord'); from endcord import discord, gateway; print(discord.Discord.__name__)"], { encoding: "utf8" });
    expect(loads.stdout.trim()).toBe("Discord");
  }, 20_000);
  test("chats lists the account's DMs and groups from the engine", async () => {
    const r = await run(["discord", "chats", "--account", "discordOne"], { answer: { ok: true, loginState: "loggedIn", chats: [{ id: "1547936265436012645", kind: "group", name: "log", members: ["QuadScorpion", "John"] }] }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["discordOne:chats"]);
    expect(r.out).toContain("1547936265436012645  group  log  (QuadScorpion, John)");
  });

  test("send without --live is a dry run and calls nothing", async () => {
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "1547936265436012645", "--text", "yo"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("dry run");
    expect(r.calls).toEqual([]);
  });

  test("send --live needs --approvedBy", async () => {
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "log", "--text", "yo", "--live"]);
    expect(r.code).toBe(1);
    expect(r.calls).toEqual([]);
  });

  test("send --live goes to the engine and Discord's message id decides", async () => {
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "1547936265436012645", "--text", "yo", "--approvedBy", "matt", "--live"], { answer: { ok: true, event: "sent", loginState: "loggedIn", messageId: "1564911647925997649", channelId: "1547936265436012645", timestamp: "2026-10-28T08:00:11Z" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["discordOne:send"]);
    expect(r.out).toContain("sent message 1564911647925997649");
  });
  test("a multi-line send stops the moment they write back, and the rest is held", async () => {
    const saved = { ...discordDeps };
    let checks = 0;
    discordDeps.wait = async () => {};
    discordDeps.now = () => "2026-11-03T19:23:36.000Z";
    discordDeps.incoming = (account, channel, since) => {
      checks++;
      expect([account, channel, since]).toEqual(["discordOne", "1481513072660185149", "2026-11-03T19:23:36.000Z"]);
      return checks < 2 ? [] : [{ platform: "discord", account, conversationId: channel, with: "x", text: "is this ai", at: "2026-11-03T19:24:13.300Z", box: "dm", seenAt: "2026-11-03T19:24:13.865Z" }];
    };
    try {
      const r = await run(["discord", "send", "--account", "discordOne", "--channel", "1481513072660185149", "--text", "one\ntwo\nthree\nfour", "--approvedBy", "matt", "--live"], { answer: { ok: true, event: "sent", messageId: "1", channelId: "1481513072660185149", timestamp: "t" }, refreshed: null });
      expect(r.code).toBe(1);
      expect(r.calls).toEqual(["discordOne:send", "discordOne:send"]);
      expect(r.out).toContain(">>> INTERRUPTED");
      expect(r.out).toContain('"is this ai"');
      expect(r.out).toContain("not sent: three");
      expect(r.out).toContain("not sent: four");
    } finally {
      Object.assign(discordDeps, saved);
    }
  });

  test("delete without --live reads the messages and deletes nothing", async () => {
    const r = await run(["discord", "delete", "--account", "discordOne", "--channel", "1434928149904228392", "--message", "1566872902840619151,1566872961531777095"], { answer: { ok: true, loginState: "loggedIn", messages: [{ id: "1566872902840619151", fromMe: true, text: "lad im skint again" }, { id: "1566872961531777095", fromMe: false, text: "theirs" }] }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["discordOne:read"]);
    expect(r.out).toContain("1566872902840619151  would delete: lad im skint again");
    expect(r.out).toContain("1566872961531777095  refused, someone else sent it");
    expect(r.out).toContain("Nothing was deleted");
  });

  test("delete --live needs --approvedBy and takes only message ids", async () => {
    expect((await run(["discord", "delete", "--account", "discordOne", "--channel", "1434928149904228392", "--message", "1566872902840619151", "--live"])).calls).toEqual([]);
    const bad = await run(["discord", "delete", "--account", "discordOne", "--channel", "1434928149904228392", "--message", "skint"]);
    expect(bad.code).not.toBe(0);
    expect(bad.err).toContain("messageInvalid");
    expect(bad.calls).toEqual([]);
  });

  test("delete --live deletes each id through the engine and stops at the first refusal", async () => {
    const twenty = fixture();
    const calls: string[] = [];
    const out: string[] = [];
    const answers: PlatformEngineRun["answer"][] = [{ ok: true, event: "deleted", loginState: "loggedIn", messageId: "1566872902840619151", content: "lad im skint again" }, { ok: false, code: "notOwnMessage", detail: "someone else's" }];
    const code = await runCli(["discord", "delete", "--account", "discordOne", "--channel", "1434928149904228392", "--message", "1566872902840619151,1566872961531777095,1566873006607966331", "--approvedBy", "matt", "--live"], {
      twenty,
      out: (l) => out.push(l),
      err: () => {},
      directDiscord: (_account, spec) => {
        calls.push(`${spec.action}:${spec.message}:${spec.live}`);
        return { answer: answers.shift() ?? { ok: false, code: "notExpected" }, refreshed: null };
      },
    });
    expect(code).toBe(1);
    expect(calls).toEqual(["delete:1566872902840619151:true", "delete:1566872961531777095:true"]);
    expect(out.join("\n")).toContain("1 of 3 deleted, then notOwnMessage");
  }, 20_000);

  test("send finds the chat the way matt says it, then sends by its id", async () => {
    const twenty = fixture();
    const sent: unknown[] = [];
    const code = await runCli(["discord", "send", "--account", "discordOne", "--channel", "the log community group chat", "--text", "yo", "--approvedBy", "matt", "--live"], {
      twenty,
      out: () => {},
      err: () => {},
      directDiscord: (_account, spec) => {
        sent.push(spec);
        if (spec.action === "chats") return { answer: { ok: true, chats: [{ id: "1547936265436012645", kind: "group", name: "log", members: ["John"] }, { id: "1555254123148873869", kind: "dm", name: null, members: ["Jilly"] }] }, refreshed: null };
        return { answer: { ok: true, event: "sent", messageId: "1", channelId: String(spec.channel), timestamp: "t" }, refreshed: null };
      },
    });
    expect(code).toBe(0);
    expect(sent).toMatchObject([{ action: "chats" }, { action: "send", channel: "1547936265436012645" }]);
  });
  test("watch prints each message Discord pushes, only the chat asked for, and polls nothing", async () => {
    const err: string[] = [];
    const out: string[] = [];
    const code = await runCli(["discord", "watch", "--account", "discordOne", "--channel", "1316963626611118161", "--seconds", "30"], {
      twenty: fixture(),
      out: (l) => out.push(l),
      err: (l) => err.push(l),
      directDiscord: () => ({ answer: { ok: false, code: "notExpected" }, refreshed: null }),
      directDiscordLive: async (_account, spec, onLive) => {
        expect(spec).toMatchObject({ action: "watch", seconds: 30 });
        onLive({ kind: "open", at: "08:41:44Z", detail: "open" });
        onLive({ kind: "message", channelId: "1316963626611118161", guildId: "1", id: "2", at: "08:43:11Z", from: "VIBE BOT", bot: true, fromMe: false, replyTo: "1", text: "qualified opportunities delivered" });
        onLive({ kind: "message", channelId: "999999999999999999", id: "3", from: "someone", text: "elsewhere" });
        return { answer: { ok: true, messages: 2, seconds: 30 }, refreshed: null };
      },
    });
    expect(code).toBe(0);
    expect(err.join("\n")).toContain("VIBE BOT [bot] replying to 1 · 2: qualified opportunities delivered");
    expect(err.join("\n")).not.toContain("elsewhere");
    expect(out.join("\n")).toContain("1 message(s) pushed in 30 s, nothing polled");
  });

  test("read shows a channel's messages after ours", async () => {
    const r = await run(["discord", "read", "--account", "discordOne", "--channel", "1316963626611118161", "--after", "1"], { answer: { ok: true, channelId: "1316963626611118161", messages: [{ id: "2", at: "08:37:46Z", from: "VIBE BOT", bot: true, fromMe: false, replyTo: "1", text: "you are building ListeningKit", embeds: [] }] }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["discordOne:read"]);
    expect(r.out).toContain("VIBE BOT [bot] replying to 1");
  });
  test("only DMs, groups, mentions and replies to the account go to the inbox, never a bot's Thinking...", () => {
    expect(toInboxOf({ kind: "message", channelId: "1", text: "hey" })).toBe(true);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", text: "weidian link" })).toBe(false);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", mentionsMe: true, text: "yo" })).toBe(true);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", repliesToMe: true, bot: true, text: "Thinking..." })).toBe(false);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", repliesToMe: true, bot: true, text: "look beyond x" })).toBe(true);
    expect(toInboxOf({ kind: "message", channelId: "1", fromMe: true, text: "mine" })).toBe(false);
  });
});

describe("log discord send reads the copy for AI artifacts (rule 111)", () => {
  test("copy with a zero-width character is refused with aiArtifacts and nothing is called, even with --live", async () => {
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "1547936265436012645", "--text", "yo​ what's up", "--approvedBy", "matt", "--live"], { answer: { ok: true, event: "sent", messageId: "1", channelId: "1547936265436012645", timestamp: "t" }, refreshed: null });
    expect(r.code).toBe(1);
    expect(r.err).toContain("aiArtifacts");
    expect(r.calls).toEqual([]);
  });

  test("a dry run is refused the same way", async () => {
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "1547936265436012645", "--text", "yo​"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("aiArtifacts");
  });

  test("clean copy carries its reading in the dry run, its --json and the log line", async () => {
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "1547936265436012645", "--text", "yo", "--json"]);
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out)).toMatchObject({ dryRun: true, watermark: { level: "clean", statistical: "unknown" } });
    expect(r.err).toContain("discordOne: watermark clean");
    const plain = await run(["discord", "send", "--account", "discordOne", "--channel", "1547936265436012645", "--text", "yo"]);
    expect(plain.out).toContain("watermark clean");
  });

  test("a live send logs the reading and carries it in --json", async () => {
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "1547936265436012645", "--text", "yo", "--approvedBy", "matt", "--live", "--json"], { answer: { ok: true, event: "sent", messageId: "1", channelId: "1547936265436012645", timestamp: "t" }, refreshed: null });
    expect(r.code).toBe(0);
    expect(JSON.parse(r.out)).toMatchObject({ watermark: { level: "clean" } });
    expect(r.err).toContain("discordOne: watermark clean");
  });
});

const REFUSAL_SCRIPT = `
import json, sys, types
sys.path.insert(0, "python")
fake = types.ModuleType("endcord.message")
fake.prepare_messages = lambda raw: raw
sys.modules["endcord"] = types.ModuleType("endcord")
sys.modules["endcord.message"] = fake
from discordApi import engine
engine.time.sleep = lambda s: None

def msg(i):
    return {"id": str(i), "timestamp": "t", "username": "u", "global_name": "U", "user_id": "2", "content": "m" + str(i)}

class Fake:
    my_id = "1"
    header = {}
    def __init__(self, answers):
        self.answers = answers
        self.calls = []
    def request(self, method, path, body, header):
        self.calls.append(path)
        return self.answers.pop(0)

DMS = json.dumps([{"id": c, "type": 1, "name": None, "recipients": [{"id": "9", "username": "p" + c, "global_name": None}]} for c in ("10", "20", "30")]).encode()

def run(answers, call):
    client = Fake(answers)
    engine.open_client = lambda token: (client, None)
    return {"answer": call(), "calls": client.calls}

out = {
    "export429": run([(DMS, 200), (json.dumps([msg(1)]).encode(), 200), (b'{"message": "You are being rate limited.", "retry_after": 3}', 429)], lambda: engine.export_of("t", 200, 0)),
    "exportDrop": run([(DMS, 200), (None, None), (json.dumps([msg(2)]).encode(), 200), (json.dumps([msg(3)]).encode(), 200)], lambda: engine.export_of("t", 200, 0)),
    "export403": run([(DMS, 200), (b'{"message": "Missing Access"}', 403)], lambda: engine.export_of("t", 200, 0)),
    "chats429": run([(b"{}", 429)], lambda: engine.chats_of("t")),
    "send429": run([(b"{}", 429)], lambda: engine.send_of("t", "jilly", "yo")),
    "read429": run([(json.dumps([msg(i) for i in range(100)]).encode(), 200), (b"{}", 429)], lambda: engine.read_of("t", "10", 300, None)),
}
print(json.dumps(out))
`;

describe("the Discord engine stops the whole read on a refusal (rule 94)", () => {
  const python = spawnSync(process.env.LOG_PYTHON || "python", ["-c", REFUSAL_SCRIPT], { encoding: "utf8" });
  const got = python.error || python.status !== 0 ? null : JSON.parse(python.stdout.trim().split("\n").pop()!);
  test("the script ran", () => {
    if (python.error) return;
    expect(python.stderr.includes("Traceback")).toBe(false);
    expect(got).not.toBeNull();
  });

  test("a 429 on one conversation stops the export there, keeps what was read and reads nothing more", () => {
    if (!got) return;
    const { answer, calls } = got.export429;
    expect(calls).toHaveLength(3);
    expect(answer).toMatchObject({ ok: false, code: "rateLimited", httpStatus: 429, event: "throttled", stopped: { conversationId: "20", httpStatus: 429, read: 0, conversationsLeft: 1 } });
    expect(answer.detail).toContain("channel 20");
    expect(answer.stopped.answer).toContain("rate limited");
    expect(answer.conversations.map((c: { id: string }) => c.id)).toEqual(["10", "20"]);
    expect(answer.conversations[0].messages).toHaveLength(1);
  });

  test("any other refusal stops it the same way", () => {
    if (!got) return;
    expect(got.export403.calls).toHaveLength(2);
    expect(got.export403.answer).toMatchObject({ ok: false, code: "platformError", httpStatus: 403, stopped: { conversationId: "10" } });
  });

  test("a network drop is not a refusal: that conversation is noted and the next is read", () => {
    if (!got) return;
    expect(got.exportDrop.calls).toHaveLength(4);
    expect(got.exportDrop.answer).toMatchObject({ ok: true, problems: [{ id: "10" }] });
    expect(got.exportDrop.answer.conversations).toHaveLength(3);
  });

  test("a 429 on the chat list stops chats and send before anything else", () => {
    if (!got) return;
    expect(got.chats429).toMatchObject({ calls: [expect.any(String)], answer: { ok: false, code: "rateLimited", event: "throttled" } });
    expect(got.send429).toMatchObject({ calls: [expect.any(String)], answer: { ok: false, code: "rateLimited", event: "throttled" } });
  });

  test("a 429 while paging a read keeps the page read, pauses the account and asks for nothing more", () => {
    if (!got) return;
    expect(got.read429.calls).toHaveLength(2);
    expect(got.read429.answer).toMatchObject({ ok: true, httpStatus: 429, event: "throttled" });
    expect(got.read429.answer.messages).toHaveLength(100);
  });
});
