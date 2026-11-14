import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { dualEraTransport, META_KEYS } from "../../mcp/stateless/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { join } from "node:path";
import { capabilityDeps } from "../../cli/capabilities/index.ts";
import { COMMANDS, runCli } from "../../cli/runner/index.ts";
import { commandKey } from "../../cli/runner/helpers/index.ts";
import type { Command } from "../../cli/runner/types.ts";
import { actsAsOwner, capabilityLiveTools, clearActivePlay, createLogMcpServer, statelessLogHandlers, commandTools, gateDeps, guardCall, isLocalLiveTwin, listUseCases, PLAY_GATED_ON_MAIN, playRequiredTools, runToolCall, setActivePlay } from "../../mcp/server/index.ts";
import { actingTools } from "../../surface/scorecard/helpers/measure.ts";
import type { CapabilityAccount } from "../capability/index.ts";
import { CAPABILITIES, capabilityTool, platformsWith } from "../capability/index.ts";
import { gateCall, gateCli, gatedToolFor, isLongRunning, longRunningKeys, noPromptByKey, terminalOnlyByKey } from "./index.ts";
import type { GateCaller, GateSessionAccount } from "./index.ts";

const held = { ...gateDeps };
const heldCapability = { ...capabilityDeps };
let accounts: CapabilityAccount[] = [];
let session: GateSessionAccount | null = null;
const noBrowsers = () => [];

const OTHER_PLAY = "| n | Step | Tools | Done when |\n|---|---|---|---|\n| 1 | Like a post | `twitterLike` | liked |\n";

function codeOf(result: { structuredContent?: unknown }): string | null {
  return ((result.structuredContent ?? {}) as { code?: string | null }).code ?? null;
}

function call(caller: Exclude<GateCaller, "cli">, tool: string, input: Record<string, unknown>) {
  if (caller === "logCall") return runToolCall("logCall", { id: idOf(tool), inputs: withoutConfirm(input), live: tool.endsWith("Live"), ...(input.confirmLive === undefined ? {} : { confirmLive: input.confirmLive as boolean }) }, {}, undefined, noBrowsers, undefined, false, undefined, true, "mcp");
  return runToolCall(tool, input, {}, undefined, noBrowsers, undefined, false, undefined, true, caller);
}

function idOf(tool: string): string {
  const entry = commandTools(COMMANDS).find((t) => t.tool === tool)!;
  const head = entry.command.platform === "any" ? [entry.command.name] : [entry.command.platform, entry.command.name];
  return [...head, ...(entry.form?.words ?? [])].join(".");
}

function withoutConfirm(input: Record<string, unknown>): Record<string, unknown> {
  const { confirmLive: _, ...rest } = input;
  return rest;
}

beforeAll(() => {
  gateDeps.accounts = () => accounts;
  gateDeps.session = () => session;
  gateDeps.busy = () => null;
  capabilityDeps.accounts = () => accounts;
});

afterEach(() => {
  clearActivePlay();
  accounts = [];
  session = null;
});

afterAll(() => {
  Object.assign(gateDeps, held);
  Object.assign(capabilityDeps, heldCapability);
});

describe("the gate lists come from each command, keyed by command key", () => {
  test("terminal-only, long-running and no-prompt are fields of the command", () => {
    expect(Object.keys(terminalOnlyByKey(COMMANDS)).sort()).toEqual(["facebookMessenger", "launch", "linkedinCookies", "login", "mcp", "runtime", "slackCookies", "twitterChat", "twitterCookies"]);
    expect(noPromptByKey(COMMANDS)).toEqual({ facebookConnect: "--noPrompt" });
    const long = longRunningKeys(COMMANDS);
    for (const key of ["facebookPublish", "inspect", "discordRead", "slackWatch", "twitterQueue", "sessions", "messages"]) expect(long.has(key)).toBe(true);
    for (const key of ["discordSend", "twitterDms", "chats", "voiceNotes"]) expect(long.has(key)).toBe(false);
  });

  test("a terminal-only platform command is refused by its own tool name, with its own words", () => {
    expect(guardCall("twitterChat", {}, COMMANDS)).toMatchObject({ ok: false, code: "terminalOnly", message: expect.stringContaining("log twitter chat is not a tool") });
    expect(guardCall("slackCookiesSave", {}, COMMANDS)).toMatchObject({ ok: false, code: "terminalOnly", message: expect.stringContaining("Slack") });
  });

  test("apply and write are live flags: the plain tool refuses them, the Live tool needs confirmLive", () => {
    for (const [tool, field] of [["adsPowerSync", "apply"], ["facebookPreflight", "apply"], ["facebookLifecycleStates", "write"], ["runsPrune", "apply"], ["storageRebuild", "apply"], ["newPlatform", "apply"], ["cloneVoice", "apply"], ["facebookListingSweep", "apply"]] as const) {
      const plain = guardCall(tool, { [field]: true }, COMMANDS);
      expect(plain).toMatchObject({ ok: false, code: "inputInvalid" });
      expect(guardCall(`${tool}Live`, {}, COMMANDS)).toMatchObject({ ok: false, code: "liveNotConfirmed" });
    }
  });

  test("the Facebook live browser tools act as the owner, local live flags don't", () => {
    const acting = new Set(commandTools(COMMANDS).filter((t) => t.live && ["write", "delete"].includes(t.effect)).map((t) => t.tool));
    for (const tool of ["facebookPublishLive", "facebookListingRemoveLive", "facebookJoinGroupLive", "facebookCampaignRunLive"]) expect(acting.has(tool)).toBe(true);
    const gate = gateCall("facebookListingSweepLive", { confirmLive: true }, "mcp", { commands: COMMANDS, flows: [], accounts: () => [], busy: () => null, play: (gated) => (gated.tool === "facebookListingSweepLive" ? null : "x") });
    expect(gate.ok).toBe(true);
  });
});

describe("one gate pipeline: the same live action gets the same refusal on every path", () => {
  const send = { account: "fakeBird", channel: "100", text: "hi", approvedBy: "fakeOwner", confirmLive: true };
  const callers: Exclude<GateCaller, "cli">[] = ["mcp", "logCall", "console", "runtime"];

  test("no confirmLive is liveNotConfirmed everywhere", async () => {
    for (const caller of callers) expect(codeOf(await call(caller, "discordSendLive", withoutConfirm(send)))).toBe("liveNotConfirmed");
    expect(codeOf(await runToolCall("publishLive", { listing: "fakeListing" }, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("liveNotConfirmed");
  });

  test("no approvedBy is notApproved everywhere, the CLI included", async () => {
    for (const caller of callers) expect(codeOf(await call(caller, "discordSendLive", { ...send, approvedBy: undefined }))).toBe("notApproved");
    const codes: string[] = [];
    await runCli(["discord", "send", "--account", "fakeBird", "--channel", "100", "--text", "hi", "--live"], { out: () => {}, err: () => {}, refused: (code) => codes.push(code) });
    expect(codes).toEqual(["notApproved"]);
  });

  test("no play is playMissing, a play that doesn't cover it is playNotCovering, everywhere", async () => {
    for (const caller of callers) expect(codeOf(await call(caller, "discordSendLive", send))).toBe("playMissing");
    setActivePlay("web/fakeOther", `# Fake other\n\n${OTHER_PLAY}`);
    for (const caller of callers) expect(codeOf(await call(caller, "discordSendLive", send))).toBe("playNotCovering");
    expect(codeOf(await runToolCall("publishLive", { listing: "fakeListing", confirmLive: true }, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playNotCovering");
  });

  test("the hosted runtime refuses a live run that passed every other gate", () => {
    const deps = { commands: COMMANDS, flows: [], accounts: () => [], busy: () => null, play: () => null };
    expect(gateCall("discordSendLive", { ...send }, "runtime", deps)).toMatchObject({ ok: false, step: "hosted", code: "approvalRequired" });
    expect(gateCall("discordSendLive", { ...send }, "console", deps)).toMatchObject({ ok: true, gated: { tool: "discordSendLive", platform: "discord" } });
  });

  test("a stopped session holds an acting call, and the busy gate holds a long run, on the CLI too", () => {
    const deps = { commands: COMMANDS, flows: [], accounts: () => [], busy: () => null, play: () => null, session: () => ({ name: "fakeBird", status: "active", state: "active", checkedAt: null, lastCheck: { state: "stopped" as const, checkedAt: "2026-11-01T00:00:00.000Z" } }) };
    expect(gateCall("discordSendLive", { ...send }, "mcp", deps)).toMatchObject({ ok: false, step: "session", code: "accountCheckStopped" });
    const holder = { id: "job_fake", tool: "facebookPublishLive", startedAt: "2026-11-01T00:00:00.000Z" };
    const publish = COMMANDS.find((c) => commandKey(c) === "facebookPublish")!;
    expect(isLongRunning(publish)).toBe(true);
    expect(gateCli(publish, ["--account", "fakeSeller", "--listing", "x"], { busy: () => holder })).toMatchObject({ code: "accountBusy" });
    expect(gateCli(COMMANDS.find((c) => commandKey(c) === "discordSend")!, ["--account", "fakeSeller"], { busy: () => holder })).toBeNull();
  });
});

const WRITE_CAPABILITIES = CAPABILITIES.filter((d) => d.live);

function inputsFor(tool: string, platform: string, live: boolean): Record<string, unknown> {
  const base: Record<string, unknown> = { account: `fake${platform}`, chat: "100", text: "hi", message: "200", emoji: "fakeEmoji", approvedBy: "fakeOwner" };
  if (tool.startsWith("voiceNotes") || tool.startsWith("messagesSend")) delete base.message;
  if (tool.startsWith("voiceNotes") || tool.startsWith("messagesSend")) delete base.emoji;
  if (tool.startsWith("messagesReact")) delete base.text;
  return live ? { ...base, confirmLive: true } : base;
}

describe("the write capabilities are gated as the platform tool they run", () => {
  for (const definition of WRITE_CAPABILITIES) {
    for (const platform of platformsWith(definition)) {
      const tool = `${capabilityTool(definition)}Live`;
      const binding = definition.platforms[platform]!;
      const platformTool = `${binding.command}Live`;
      test(`${tool} on ${platform} is ${platformTool}`, async () => {
        accounts = [{ name: `fake${platform}`, platform }];
        const input = inputsFor(tool, platform, true);
        expect(gatedToolFor(tool, input, { commands: COMMANDS, flows: [], accounts: () => accounts })).toEqual({ tool: platformTool, platform, capability: tool });
        const mapped: Record<string, unknown> = { confirmLive: true, approvedBy: "fakeOwner", account: `fake${platform}` };
        for (const [name, mapping] of Object.entries(binding.inputs)) if (name !== "account" && "flag" in mapping && input[name] !== undefined) mapped[mapping.flag] = input[name];
        const pairs: [Record<string, unknown>, Record<string, unknown>][] = [
          [withoutConfirm(input), withoutConfirm(mapped)],
          [{ ...input, approvedBy: undefined }, { ...mapped, approvedBy: undefined }],
        ];
        for (const [capabilityInput, platformInput] of pairs) {
          const viaCapability = codeOf(await runToolCall(tool, capabilityInput, {}, undefined, noBrowsers, undefined, false, undefined, true));
          const viaPlatform = codeOf(await runToolCall(platformTool, platformInput, {}, undefined, noBrowsers, undefined, false, undefined, true));
          expect(viaCapability).toBe(viaPlatform);
          expect(viaCapability).not.toBeNull();
        }
        expect(codeOf(await runToolCall(tool, input, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playMissing");
        if (PLAY_GATED_ON_MAIN.has(platformTool)) expect(codeOf(await runToolCall(platformTool, mapped, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playMissing");
        setActivePlay("web/fakeOther", `# Fake other\n\n${OTHER_PLAY}`);
        expect(codeOf(await runToolCall(tool, input, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playNotCovering");
        expect(codeOf(await runToolCall(platformTool, mapped, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playNotCovering");
        clearActivePlay();
        session = { name: `fake${platform}`, status: "active", state: "active", checkedAt: null, lastCheck: { state: "stopped", checkedAt: "2026-11-01T00:00:00.000Z" } };
        setActivePlay(`${platform}/fakePlay`, `# Fake play\n\n${OTHER_PLAY}`);
        expect(codeOf(await runToolCall(tool, input, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("accountCheckStopped");
        expect(codeOf(await runToolCall(platformTool, mapped, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("accountCheckStopped");
      });
    }
  }

  test("an account kept on no platform, or on two, is refused before any play or platform", async () => {
    accounts = [];
    expect(codeOf(await runToolCall("messagesSendLive", inputsFor("messagesSendLive", "discord", true), {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("accountNotFound");
    accounts = [{ name: "fakediscord", platform: "discord" }, { name: "fakediscord", platform: "slack" }];
    expect(codeOf(await runToolCall("messagesSendLive", inputsFor("messagesSendLive", "discord", true), {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("platformAmbiguous");
  });

  test("a shared Live tool takes the strictest rule: messagesReactLive and voiceNotesSendLive need a play where their platform tool does not", async () => {
    for (const [tool, platform] of [["messagesReactLive", "discord"], ["voiceNotesSendLive", "slack"], ["messagesReactLive", "instagram"]] as const) {
      accounts = [{ name: `fake${platform}`, platform }];
      const input = inputsFor(tool, platform, true);
      expect(PLAY_GATED_ON_MAIN.has((gatedToolFor(tool, input, { commands: COMMANDS, flows: [], accounts: () => accounts }) as { tool: string }).tool)).toBe(false);
      expect(codeOf(await runToolCall(tool, input, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playMissing");
      setActivePlay("web/fakeOther", `# Fake other

${OTHER_PLAY}`);
      expect(codeOf(await runToolCall(tool, input, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playNotCovering");
      session = { name: `fake${platform}`, status: "active", state: "active", checkedAt: null, lastCheck: { state: "stopped", checkedAt: "2026-11-01T00:00:00.000Z" } };
      setActivePlay(`${platform}/fakePlay`, `# Fake play

${OTHER_PLAY}`);
      expect(codeOf(await runToolCall(tool, input, {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("accountCheckStopped");
      clearActivePlay();
      session = null;
    }
  });

  test("a play that names the capability covers it only on its own platform or in a shared folder", async () => {
    accounts = [{ name: "fakediscord", platform: "discord" }];
    setActivePlay("twitter/fakeNamesIt", "# Fake\n\n| n | Step | Tools | Done when |\n|---|---|---|---|\n| 1 | Send | `messagesSendLive` | sent |\n");
    expect(codeOf(await runToolCall("messagesSendLive", inputsFor("messagesSendLive", "discord", true), {}, undefined, noBrowsers, undefined, false, undefined, true))).toBe("playNotCovering");
  });

  test("the CLI capability runs the platform command itself, live and approved, so its own governor, claim and voice gate decide", async () => {
    accounts = [{ name: "fakediscord", platform: "discord" }];
    const seen: { command: string; argv: string[] }[] = [];
    const platformCommand = COMMANDS.find((c) => commandKey(c) === "discordSend")!;
    const recorder: Command = { ...platformCommand, run: (_context, argv) => { seen.push({ command: commandKey(platformCommand), argv }); return { code: 0, stdout: "recorded" }; } };
    capabilityDeps.commands = async () => COMMANDS.map((c) => (c === platformCommand ? recorder : c));
    const codes: string[] = [];
    const lines: string[] = [];
    expect(await runCli(["messages", "send", "--account", "fakediscord", "--chat", "100", "--text", "hi", "--live"], { out: () => {}, err: (l) => lines.push(l), refused: (c) => codes.push(c) })).toBe(1);
    expect(codes).toEqual(["notApproved"]);
    expect(await runCli(["messages", "send", "--account", "fakediscord", "--chat", "100", "--text", "hi", "--asOne", "--approvedBy", "fakeOwner", "--live"], { out: () => {}, err: (l) => lines.push(l) })).toBe(0);
    expect(seen).toEqual([{ command: "discordSend", argv: ["--account", "fakediscord", "--channel", "100", "--text", "hi", "--asOne", "--approvedBy", "fakeOwner", "--live"] }]);
    capabilityDeps.commands = heldCapability.commands;
  });
});

describe("the hosted tool lists agree with the tools' own metadata", () => {
  const source = readFileSync(join(import.meta.dir, "..", "..", "..", "python", "controlService", "tools.py"), "utf8");
  const listOf = (name: string): string[] => [...(new RegExp(`${name} = frozenset\\(\\{([^}]*)\\}`).exec(source)?.[1] ?? "").matchAll(/"(\w+)"/g)].map((m) => m[1]);
  const tools = commandTools(COMMANDS);
  const HOSTED_OWN = new Set(["accountsList", "toolManifest", "getGuide", "report", "uiResourcesList", "uiResourceRead", "logSearch", "logGet", "logCall", "browserView", "reportData", "sessionsSignIn"]);

  test("every hosted read tool is a read, a catalog tool or a hosted operation, and never a Live tool", () => {
    const read = listOf("READ_TOOLS");
    expect(read).toContain("logCall");
    for (const name of read) {
      if (HOSTED_OWN.has(name)) continue;
      const entry = tools.find((t) => t.tool === name);
      expect(entry ? `${name}:${entry.effect}:${entry.live}` : `${name}:missing`).toBe(`${name}:read:false`);
    }
  });

  test("every hosted write tool is a Live tool that acts as the owner", () => {
    const acting = new Set(tools.filter((t) => t.live && ["write", "delete"].includes(t.effect)).map((t) => t.tool));
    for (const name of listOf("WRITE_TOOLS")) expect(acting.has(name)).toBe(true);
  });
});

describe("the play count sees what the gate sees", () => {
  test("every capability Live tool is play-required, as the gate requires it", () => {
    const required = playRequiredTools(COMMANDS, [], listUseCases());
    for (const capability of capabilityLiveTools(COMMANDS)) expect(required.has(capability.tool)).toBe(true);
    expect(required.has("messagesSendLive")).toBe(true);
    expect(required.has("messagesReactLive")).toBe(true);
    expect(required.has("voiceNotesSendLive")).toBe(true);
  });

  test("a Live twin of --apply or --write doesn't act as the owner, in the gate or in the count", () => {
    const tools = commandTools(COMMANDS);
    const acting = actingTools(tools, []);
    for (const entry of tools.filter((t) => isLocalLiveTwin(t))) {
      expect(actsAsOwner(entry)).toBe(false);
      expect(acting).not.toContain(entry.tool);
    }
    for (const tool of ["discordReactLive", "messagesReactLive", "warmupLive", "inspectDoLive"]) expect(acting).toContain(tool);
  });
});

describe("a 2026-07-28 tools/call goes through the same gate pipeline", () => {
  const META = { [META_KEYS.protocolVersion]: "2026-07-28", [META_KEYS.clientCapabilities]: {}, [META_KEYS.clientInfo]: { name: "fakeHost", version: "1" } };

  async function modern() {
    const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await server.connect(dualEraTransport(serverSide, statelessLogHandlers({ twenty: marketplaceFixture() }, { logDir: null })));
    const got = new Map<string | number, Record<string, unknown>>();
    clientSide.onmessage = (message) => {
      if ("id" in message && message.id !== undefined) got.set(message.id, message as unknown as Record<string, unknown>);
    };
    await clientSide.start();
    let id = 0;
    const callTool = async (name: string, args: Record<string, unknown>) => {
      const ask = ++id;
      await clientSide.send({ jsonrpc: "2.0", id: ask, method: "tools/call", params: { name, arguments: args, _meta: META } } as JSONRPCMessage);
      for (let i = 0; i < 400 && !got.has(ask); i++) await new Promise((resolve) => setTimeout(resolve, 25));
      return (got.get(ask) as { result: { structuredContent?: unknown } }).result;
    };
    return { callTool, close: () => server.close() };
  }

  test("no confirmLive, no approvedBy, no play and a stopped session each refuse as on the legacy path", async () => {
    const { callTool, close } = await modern();
    try {
      const send = { account: "fakeBird", channel: "100", text: "hi", approvedBy: "fakeOwner", confirmLive: true };
      const legacy = (input: Record<string, unknown>) => runToolCall("discordSendLive", input, {}, undefined, noBrowsers, undefined, false, undefined, true);
      const cases: [Record<string, unknown>, string][] = [
        [withoutConfirm(send), "liveNotConfirmed"],
        [{ ...send, approvedBy: undefined }, "notApproved"],
        [send, "playMissing"],
      ];
      for (const [input, code] of cases) {
        expect(codeOf(await callTool("discordSendLive", input))).toBe(code);
        expect(codeOf(await legacy(input))).toBe(code);
      }
      session = { name: "fakeBird", status: "active", state: "active", checkedAt: null, lastCheck: { state: "stopped", checkedAt: "2026-11-01T00:00:00.000Z" } };
      setActivePlay("discord/fakePlay", `# Fake play\n\n${OTHER_PLAY}`);
      expect(codeOf(await callTool("discordSendLive", send))).toBe("accountCheckStopped");
      expect(codeOf(await legacy(send))).toBe("accountCheckStopped");
    } finally {
      await close();
    }
  });
});
