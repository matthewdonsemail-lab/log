import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { DISCORD_PLATFORM } from "../../discord/account/session/index.ts";
import { runCli } from "../runner/index.ts";

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
    const r = await run(["discord", "send", "--account", "discordOne", "--channel", "log", "--text", "yo"]);
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
});
