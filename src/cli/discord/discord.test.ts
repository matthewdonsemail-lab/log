import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { DISCORD_PLATFORM } from "../../discord/account/session/index.ts";
import { runCli } from "../runner/index.ts";
import { toInboxOf } from "./index.ts";

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
  });
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
  test("only DMs, groups, mentions and replies to the account go to the inbox, never a bot's Thinking...", () => {
    expect(toInboxOf({ kind: "message", channelId: "1", text: "hey" })).toBe(true);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", text: "weidian link" })).toBe(false);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", mentionsMe: true, text: "yo" })).toBe(true);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", repliesToMe: true, bot: true, text: "Thinking..." })).toBe(false);
    expect(toInboxOf({ kind: "message", channelId: "1", guildId: "9", repliesToMe: true, bot: true, text: "look beyond x" })).toBe(true);
    expect(toInboxOf({ kind: "message", channelId: "1", fromMe: true, text: "mine" })).toBe(false);
  });
});
