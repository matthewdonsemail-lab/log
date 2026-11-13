import { afterEach, describe, expect, test } from "bun:test";
import { capabilityDeps } from "../../cli/capabilities/index.ts";
import { commandKey } from "../../cli/runner/helpers/platforms.ts";
import { COMMANDS, runCli } from "../../cli/runner/index.ts";
import type { Command } from "../../cli/runner/types.ts";
import { commandTools } from "../../mcp/server/helpers/toolsFromCommands.ts";
import { argvFor, CAPABILITIES, capabilityOf, capabilityRows, capabilityTool, choosePlatform, platformsWith } from "./index.ts";
import type { CapabilityAccount, CapabilityDefinition } from "./index.ts";

const ACCOUNTS: CapabilityAccount[] = [
  { name: "fakeBird", platform: "twitter" },
  { name: "fakeGuild", platform: "discord" },
  { name: "fakeTwin", platform: "slack" },
  { name: "fakeTwin", platform: "instagram" },
];

const chats = capabilityOf("chatsList")!;
const read = capabilityOf("messagesRead")!;

describe("the capability table", () => {
  test("every binding names a command, a form and flags that exist, and its effect is the definition's", () => {
    const rows = capabilityRows(COMMANDS);
    expect(rows.length).toBe(CAPABILITIES.reduce((n, d) => n + platformsWith(d).length, 0));
    for (const row of rows) expect(row.effect, `${row.tool} on ${row.platform}`).toBe(capabilityOf(row.tool)!.effect);
  });

  test("a binding to a flag the command doesn't take is caught", () => {
    const broken: CapabilityDefinition = { ...chats, platforms: { discord: { command: "discordChats", words: [], inputs: { limit: { flag: "notAFlag" } } } } };
    expect(() => capabilityRows(COMMANDS, [broken])).toThrow("notAFlag");
    const missing: CapabilityDefinition = { ...chats, platforms: { discord: { command: "discordNothing", words: [], inputs: {} } } };
    expect(() => capabilityRows(COMMANDS, [missing])).toThrow("discordNothing");
  });

  test("tool names are <noun><Verb>, never a platform word", () => {
    expect(CAPABILITIES.map(capabilityTool)).toEqual(["chatsList", "messagesRead"]);
  });

  test("each capability is listed as one shared tool, and the per-platform tools stay", () => {
    const tools = commandTools(COMMANDS).map((t) => t.tool);
    for (const definition of CAPABILITIES) expect(tools).toContain(capabilityTool(definition));
    for (const row of capabilityRows(COMMANDS)) expect(COMMANDS.some((c) => commandKey(c) === row.command)).toBe(true);
    const shared = commandTools(COMMANDS).filter((t) => CAPABILITIES.map(capabilityTool).includes(t.tool));
    expect(shared.every((t) => t.command.platform === "any" && t.effect === "read" && !t.live)).toBe(true);
  });
});

describe("the platform is an input, never a default", () => {
  test("one account by the name gives its platform", () => {
    expect(choosePlatform(ACCOUNTS, "@FakeBird")).toEqual({ ok: true, platform: "twitter", account: "fakeBird" });
  });

  test("two platforms keeping the name is ambiguous until the platform is given", () => {
    expect(choosePlatform(ACCOUNTS, "fakeTwin")).toMatchObject({ ok: false, code: "platformAmbiguous" });
    expect(choosePlatform(ACCOUNTS, "fakeTwin", "slack")).toEqual({ ok: true, platform: "slack", account: "fakeTwin" });
  });

  test("a platform the account isn't kept under is a mismatch that says where it is", () => {
    const wrong = choosePlatform(ACCOUNTS, "fakeGuild", "slack");
    expect(wrong).toMatchObject({ ok: false, code: "accountPlatformMismatch" });
    expect(wrong.ok ? "" : wrong.detail).toContain("Discord");
  });

  test("an unknown account with no platform is accountNotFound; with a platform, that platform's command looks it up", () => {
    expect(choosePlatform(ACCOUNTS, "nobody")).toMatchObject({ ok: false, code: "accountNotFound" });
    expect(choosePlatform(ACCOUNTS, "nobody", "facebook")).toEqual({ ok: true, platform: "facebook", account: "nobody" });
  });
});

describe("canonical inputs become each platform's own flags", () => {
  test("chat is Discord's channel, Slack's chat, Instagram's with and X's with or conversation", () => {
    expect(argvFor(read, "discord", { account: "fakeGuild", chat: "general", limit: 5 })).toEqual({ ok: true, platform: "discord", command: "discordRead", argv: ["--account", "fakeGuild", "--channel", "general", "--limit", "5"] });
    expect(argvFor(read, "slack", { account: "fakeTwin", chat: "D1", space: "fakeTeam" })).toMatchObject({ argv: ["--account", "fakeTwin", "--chat", "D1", "--workspace", "fakeTeam"] });
    expect(argvFor(read, "instagram", { account: "fakeTwin", chat: "fakeFriend" })).toMatchObject({ command: "instagramDms", argv: ["--account", "fakeTwin", "--with", "fakeFriend"] });
    expect(argvFor(read, "twitter", { account: "fakeBird", chat: "fakeFriend" })).toMatchObject({ argv: ["--account", "fakeBird", "--with", "fakeFriend"] });
    expect(argvFor(read, "twitter", { account: "fakeBird", chat: "111-222" })).toMatchObject({ argv: ["--account", "fakeBird", "--conversation", "111-222"] });
    expect(argvFor(read, "facebook", { account: "fakePage", chat: "c1" })).toMatchObject({ command: "facebookConversation", argv: ["show", "c1"] });
  });

  test("an input the platform's command doesn't take is inputUnsupported, and a platform without the capability is capabilityMissing with where it is", () => {
    expect(argvFor(read, "discord", { account: "fakeGuild", chat: "general", space: "fakeServer" })).toMatchObject({ ok: false, code: "inputUnsupported" });
    expect(argvFor(chats, "discord", { account: "fakeGuild", limit: 3 })).toMatchObject({ ok: false, code: "inputUnsupported" });
    const missing = argvFor(chats, "reddit", { account: "fakeRedditor" });
    expect(missing).toMatchObject({ ok: false, code: "capabilityMissing", platformsWithIt: ["facebook", "twitter", "discord", "slack", "instagram"] });
  });
});

describe("log chats list and log messages read", () => {
  const original = { ...capabilityDeps };
  afterEach(() => Object.assign(capabilityDeps, original));

  function stub() {
    const calls: { command: string; argv: string[] }[] = [];
    const fake = (key: string): Command => {
      const real = COMMANDS.find((c) => commandKey(c) === key)!;
      return { ...real, run: (_context, argv) => (calls.push({ command: key, argv }), { code: 0, stdout: `${key} ran` }) };
    };
    capabilityDeps.accounts = () => ACCOUNTS;
    capabilityDeps.commands = async () => ["discordRead", "discordChats", "slackRead", "twitterDms", "instagramDms"].map(fake);
    return calls;
  }

  async function run(argv: string[]) {
    const out: string[] = [];
    const err: string[] = [];
    const code = await runCli(argv, { out: (l) => out.push(l), err: (l) => err.push(l) });
    return { code, out: out.join("\n"), err: err.join("\n") };
  }

  test("messages read runs the account's own platform command with its flags", async () => {
    const calls = stub();
    const r = await run(["messages", "read", "--account", "fakeGuild", "--chat", "general", "--limit", "10", "--json"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("discordRead ran");
    expect(calls).toEqual([{ command: "discordRead", argv: ["--account", "fakeGuild", "--channel", "general", "--limit", "10", "--json"] }]);
    expect(r.err).toContain("fakeGuild is on Discord");
  });

  test("chats list on an ambiguous name is refused until --platform, then runs that platform's command", async () => {
    const calls = stub();
    const ambiguous = await run(["chats", "list", "--account", "fakeTwin"]);
    expect(ambiguous.code).toBe(1);
    expect(ambiguous.err).toContain("platformAmbiguous");
    expect(calls).toEqual([]);
    const chosen = await run(["chats", "list", "--account", "fakeTwin", "--platform", "instagram", "--limit", "4"]);
    expect(chosen.code).toBe(0);
    expect(calls).toEqual([{ command: "instagramDms", argv: ["--account", "fakeTwin", "--limit", "4"] }]);
  });

  test("a capability the platform lacks, an input it doesn't take and a bad limit contact nothing", async () => {
    const calls = stub();
    capabilityDeps.accounts = () => [...ACCOUNTS, { name: "fakeRedditor", platform: "reddit" }];
    const missing = await run(["chats", "list", "--account", "fakeRedditor"]);
    expect(missing.err).toContain("capabilityMissing");
    const unsupported = await run(["messages", "read", "--account", "fakeGuild", "--chat", "general", "--space", "fakeServer"]);
    expect(unsupported.err).toContain("inputUnsupported");
    const badLimit = await run(["chats", "list", "--account", "fakeBird", "--limit", "0"]);
    expect(badLimit.code).toBe(1);
    const noChat = await run(["messages", "read", "--account", "fakeBird"]);
    expect(noChat.err).toContain("--chat is needed");
    expect(calls).toEqual([]);
  });
});
