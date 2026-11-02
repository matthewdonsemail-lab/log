import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { DISCORD_PLATFORM } from "../../discord/account/session/index.ts";
import { runCli } from "../runner/index.ts";
import { toInboxOf, watchLine } from "./index.ts";

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
  test("read shows the message replied to, with its image, above the reply", async () => {
    const reply = { id: "1565263868375207978", at: "2026-10-29T07:19:47Z", from: "Kennedy", text: "", attachments: [{ type: "image/png", name: "image.png", url: "https://cdn.discordapp.com/attachments/1/2/image.png" }], embeds: [], stickers: [] };
    const r = await run(["discord", "read", "--account", "discordOne", "--channel", "1547936265436012645"], { answer: { ok: true, channelId: "1547936265436012645", messages: [{ id: "1566728551179358239", at: "2026-11-02T08:19:55Z", from: "Kennedy", bot: false, fromMe: false, replyTo: reply.id, reply, text: "here", attachments: [], embeds: [] }] }, refreshed: null });
    expect(r.code).toBe(0);
    expect(r.out).toContain("Kennedy replying to 1565263868375207978 · 1566728551179358239\n    > Kennedy 2026-10-29T07:19:47Z\n    >   [image/png] image.png https://cdn.discordapp.com/attachments/1/2/image.png\n    here");
  });
  test("read shows a message's own attachments and a deleted reply", async () => {
    const r = await run(["discord", "read", "--account", "discordOne", "--channel", "1547936265436012645"], { answer: { ok: true, channelId: "1547936265436012645", messages: [{ id: "5", at: "t", from: "x", bot: false, fromMe: false, replyTo: null, reply: { id: null, deleted: true, text: "Deleted message" }, text: "", attachments: [{ type: "video/mp4", name: "clip.mp4", url: "https://cdn/clip.mp4" }], embeds: [], stickers: ["wave"] }] }, refreshed: null });
    expect(r.out).toContain("    > (the message replied to was deleted)\n    [video/mp4] clip.mp4 https://cdn/clip.mp4\n    [sticker] wave");
  });
  test("watch shows what a reply points at and the image attached to it", () => {
    const line = watchLine({ kind: "message", channelId: "1547936265436012645", id: "6", at: "t", from: "Kennedy", replyTo: "4", reply: { id: "4", from: "Kennedy", text: "", attachments: [{ type: "image/png", name: "image.png", url: "https://cdn/i.png" }] }, text: "here", attachments: [] });
    expect(line).toBe("t chat 1547936265436012645 · Kennedy replying to 4 (Kennedy: [image/png] image.png https://cdn/i.png) · 6: here");
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

const REPLY_SCRIPT = `
import json, sys
sys.path.insert(0, "python")
sys.path.insert(0, "vendor/endcord")
from endcord.message import prepare_message
from discordApi import engine

def author(i, name):
    return {"id": i, "username": name.lower(), "global_name": name, "avatar": None}

image = {"id": "a1", "filename": "image.png", "content_type": "image/png", "url": "https://cdn.discordapp.com/attachments/1/2/image.png", "proxy_url": "https://media.discordapp.net/attachments/1/2/image.png", "height": 600, "width": 800}
base = {"channel_id": "1547936265436012645", "mentions": [], "mention_roles": [], "mention_everyone": False, "embeds": [], "attachments": [], "edited_timestamp": None, "flags": 0, "type": 0}
pictured = {**base, "id": "4", "timestamp": "2026-10-29T07:19:47Z", "content": "", "author": author("7", "Kennedy"), "attachments": [image]}
reply = {**base, "id": "6", "timestamp": "2026-11-02T08:19:55Z", "content": "here", "author": author("7", "Kennedy"), "type": 19, "message_reference": {"message_id": "4"}, "referenced_message": pictured}
gone = {**base, "id": "8", "timestamp": "t", "content": "what was that", "author": author("9", "Matt"), "type": 19, "referenced_message": None}
print(json.dumps({"reply": engine.message_of(prepare_message(reply), "9"), "pictured": engine.message_of(prepare_message(pictured), "9"), "gone": engine.message_of(prepare_message(gone), "9")}))
`;

describe("the Discord engine carries what a reply points at, through endcord's own prepare_message", () => {
  const python = spawnSync(process.env.LOG_PYTHON || "python", ["-c", REPLY_SCRIPT], { encoding: "utf8" });
  const got = python.error || python.status !== 0 ? null : JSON.parse(python.stdout.trim().split("\n").pop()!);
  test("the script ran", () => {
    if (python.error) return;
    expect(python.stderr.includes("Traceback") ? python.stderr : "").toBe("");
    expect(got).not.toBeNull();
  });
  test("a reply to an image carries the image, its author and time", () => {
    if (!got) return;
    expect(got.reply).toMatchObject({ id: "6", from: "Kennedy", text: "here", replyTo: "4", reply: { id: "4", from: "Kennedy", at: "2026-10-29T07:19:47Z", text: "", attachments: [{ type: "image/png", name: "image.png", url: "https://cdn.discordapp.com/attachments/1/2/image.png" }] } });
  });
  test("an image sent on its own is an attachment, not an embed", () => {
    if (!got) return;
    expect(got.pictured).toMatchObject({ attachments: [{ type: "image/png", name: "image.png", proxyUrl: "https://media.discordapp.net/attachments/1/2/image.png" }], embeds: [] });
    expect(got.pictured.reply).toBeUndefined();
  });
  test("a reply to a deleted message says so", () => {
    if (!got) return;
    expect(got.gone).toMatchObject({ replyTo: null, reply: { id: null, deleted: true } });
  });
});
