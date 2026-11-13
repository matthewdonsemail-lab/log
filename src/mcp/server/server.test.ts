import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { COMMANDS } from "../../cli/runner/index.ts";
import { toolBaseName } from "../../cli/runner/helpers/platforms.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import { emitLog } from "../../observability/processLog/index.ts";
import { commandTools, createLogMcpServer, formatLogLine, guardCall, parseEnvText, runToolCall, savedFlows, TERMINAL_ONLY, toolsFromCommands, toolsFromFlows } from "./index.ts";
import { readJob } from "../jobs/index.ts";

async function connected() {
  const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return client;
}

function textOf(result: Awaited<ReturnType<Client["callTool"]>>): string {
  return (result.content as { type: string; text: string }[]).map((part) => part.text).join("\n");
}

describe("toolsFromCommands", () => {
  test("every command has a tool except the terminal-only ones, one per form when it declares its input", () => {
    const entries = commandTools(COMMANDS);
    for (const command of COMMANDS) expect(entries.some((t) => t.command === command)).toBe(!(command.name in TERMINAL_ONLY));
    const names = toolsFromCommands(COMMANDS).map((tool) => tool.name);
    expect(names).toEqual(expect.arrayContaining(["facebookPublish", "facebookPublishLive", "facebookConnect", "inspectStart", "inspectDo", "inspectDoLive", "facebookHostStartLive", "facebookJoinLive", "warmupLive", "facebookAccountShow", "runsPrune", "facebookListing", "facebookListingCreate"]));
    expect(names).not.toContain("facebookAccountsLive");
    expect(names).not.toContain("accounts");
    expect(names).not.toContain("check");
    expect(names).not.toContain("facebookConnectLive");
    expect(names).not.toContain("launch");
    expect(names).not.toContain("inspect");
    expect(new Set(names).size).toBe(names.length);
  });

  test("a typed tool's schema has its fields, their kinds and what is required, and no args", () => {
    const tools = toolsFromCommands(COMMANDS);
    const start = tools.find((t) => t.name === "inspectStart")!;
    expect(start.inputSchema.required).toEqual(["account"]);
    expect(Object.keys(start.inputSchema.properties)).toEqual(["account", "url", "bypass", "now", "noIdleMouse", "detach", "goal", "proxyMs", "confirmBypass", "waitMs"]);
    const step = tools.find((t) => t.name === "inspectDo")!;
    expect((step.inputSchema.properties.action as { enum: string[] }).enum).toContain("setLocation");
    expect((step.inputSchema.properties.values as { type: string }).type).toBe("array");
    expect(step.inputSchema.properties).not.toHaveProperty("live");
    expect(step.inputSchema.properties).not.toHaveProperty("confirmLive");
    const stepLive = tools.find((t) => t.name === "inspectDoLive")!;
    expect(stepLive.inputSchema.properties).not.toHaveProperty("live");
    expect(stepLive.inputSchema.required).toEqual(["action", "confirmLive"]);
    const hostLive = tools.find((t) => t.name === "facebookHostStartLive")!;
    expect(Object.keys(hostLive.inputSchema.properties)).toEqual(expect.arrayContaining(["live", "likes", "confirmLive"]));
    expect(tools.find((t) => t.name === "facebookAccounts")!.inputSchema.properties).not.toHaveProperty("confirmLive");
    for (const tool of tools.filter((t) => t.name !== "facebookCampaign" && "args" in t.inputSchema.properties)) expect(COMMANDS.find((c) => toolBaseName(c) === tool.name)?.input).toBeUndefined();
  });
});

describe("annotations and live tools", () => {
  const tools = [...toolsFromCommands(COMMANDS), ...toolsFromFlows(savedFlows())];

  test("every tool has a short title and all four hints", () => {
    for (const tool of tools) {
      expect(tool.title.length).toBeGreaterThan(3);
      expect(tool.title.length).toBeLessThanOrEqual(90);
      expect(tool.annotations.title).toBe(tool.title);
      for (const hint of ["readOnlyHint", "destructiveHint", "idempotentHint", "openWorldHint"] as const) expect(typeof tool.annotations[hint]).toBe("boolean");
    }
  });

  test("every live tool is destructive, open-world and needs confirmLive; no other tool takes live or confirmLive", () => {
    for (const tool of tools) {
      const live = tool.name.endsWith("Live");
      const spends = live && tool.description.includes("Live spends money");
      if (spends) expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: true });
      else expect(tool.annotations.destructiveHint || !live).toBe(true);
      if (live && !spends) expect(tool.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true, openWorldHint: true });
      if (live) expect(tool.inputSchema.required).toContain("confirmLive");
      if (!live) expect(tool.inputSchema.properties).not.toHaveProperty("confirmLive");
      if (!live) expect(tool.inputSchema.properties).not.toHaveProperty("live");
      if (live) expect(tools.some((t) => t.name === tool.name.slice(0, -4))).toBe(true);
    }
  });

  test("a priced lookup is read-only even live, so Claude Code can run it alongside other calls, and it still needs confirmLive", () => {
    const tregLive = tools.find((t) => t.name === "tregCallLive")!;
    expect(tregLive.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
    expect(tregLive.inputSchema.required).toContain("confirmLive");
    expect(tregLive.description).toContain("Live spends money");
  });

  test("reads are read-only, a browser on Facebook is open-world, a prune is destructive", () => {
    const of = (name: string) => tools.find((t) => t.name === name)!.annotations;
    expect(of("facebookAccounts")).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: false });
    expect(of("facebookAccountShow")).toMatchObject({ readOnlyHint: true });
    expect(of("facebookAccountStatus")).toMatchObject({ readOnlyHint: false, destructiveHint: false, openWorldHint: false });
    expect(of("facebookCheck")).toMatchObject({ readOnlyHint: false, destructiveHint: false, openWorldHint: true });
    expect(of("inspectDo")).toMatchObject({ readOnlyHint: false, destructiveHint: false, openWorldHint: true });
    expect(of("runsPrune")).toMatchObject({ readOnlyHint: false, destructiveHint: true });
    expect(of("runsList")).toMatchObject({ readOnlyHint: true });
  });
});

describe("guardCall", () => {
  test("live needs confirmLive, on typed and args tools alike", () => {
    expect(guardCall("facebookPublish", { listing: "a", live: true }, COMMANDS)).toEqual({ ok: false, message: "facebookPublish never acts on Facebook: live is `facebookPublishLive`, only when matt asked (rule 8)" });
    expect(guardCall("facebookPublishLive", { listing: "a" }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookCampaign", { args: ["run", "--campaign", "c", "--live=true"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookPublishLive", { listing: "a", confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "publish", "--listing=a", "--live"] });
    expect(guardCall("facebookPublishLive", { listing: "a", live: true, confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "publish", "--listing=a", "--live"] });
    expect(guardCall("inspectDoLive", { action: "click", values: ["e12"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookHostStartLive", { account: "a", confirmLive: true }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookHostStartLive", { account: "a", likes: true, confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "host", "start", "--account=a", "--likes"] });
    expect(guardCall("warmup", { args: ["facebook", "reel", "run", "--account", "a", "--likes"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("warmupLive", { args: ["facebook", "reel", "run", "--account", "a"], confirmLive: true }, COMMANDS).ok).toBe(false);
    expect(guardCall("warmupLive", { args: ["facebook", "reel", "run", "--account", "a", "--likes"], confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "warmup", "reel", "run", "--account", "a", "--likes"] });
  });

  test("bypass needs confirmBypass", () => {
    expect(guardCall("facebookCheck", { account: "a", bypass: true }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookCheck", { account: "a", bypass: true, confirmBypass: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "check", "--account=a", "--bypass"] });
  });

  test("a typed call becomes the argv the terminal would run, each value whole", () => {
    expect(guardCall("inspectDoLive", { action: "type", values: ["e7", "Full house clear-out, \"everything\" = gone\nSame day"], confirmLive: true }, COMMANDS)).toEqual({
      ok: true,
      argv: ["inspect", "do", "type", "e7", "Full house clear-out, \"everything\" = gone\nSame day", "--live"],
    });
    expect(guardCall("facebookAccountStatus", { account: "bethlehem", status: "PAUSED", reason: "setByHand" }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "account", "status", "bethlehem", "PAUSED", "--reason=setByHand"] });
    expect(guardCall("runsPrune", { apply: true }, COMMANDS)).toEqual({ ok: true, argv: ["runs", "prune", "--apply"] });
    expect(guardCall("inspectStart", { account: "a", detach: true, proxyMs: 4000 }, COMMANDS)).toEqual({ ok: true, argv: ["inspect", "start", "--account=a", "--detach", "--proxyMs=4000"] });
  });

  test("a typed call with a missing, unknown or wrong field never runs", () => {
    expect(guardCall("facebookCheck", {}, COMMANDS)).toEqual({ ok: false, message: "facebookCheck: account is needed" });
    expect(guardCall("facebookCheck", { account: "a", bogus: 1 }, COMMANDS)).toEqual({ ok: false, message: 'facebookCheck: unknown field "bogus"' });
    expect(guardCall("facebookAccountStatus", { account: "a", status: "NOPE" }, COMMANDS).ok).toBe(false);
    expect(guardCall("inspectDo", { action: "teleport" }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookHostStart", { account: "a", gapSeconds: "5" }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookListings", { args: ["--json"] }, COMMANDS).ok).toBe(false);
  });

  test("connect always runs --noPrompt, so it never reads the MCP channel", () => {
    expect(guardCall("facebookConnect", { args: ["--account", "x"] }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "connect", "--account", "x", "--noPrompt"] });
    expect(guardCall("facebookConnect", { args: ["--account", "x", "--noPrompt"] }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "connect", "--account", "x", "--noPrompt"] });
  });

  test("terminal-only, unknown and malformed calls are refused", () => {
    expect(guardCall("launch", {}, COMMANDS).ok).toBe(false);
    expect(guardCall("bogus", {}, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookConnect", { args: [1 as unknown as string] }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookListings", undefined, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "listings"] });
  });
});

describe("parseEnvText", () => {
  test("keeps keys and values, drops comments and quotes", () => {
    expect(parseEnvText('# note\nA=1\nexport B="two words"\n\nC=\'x=y\'\nbad line')).toEqual({ A: "1", B: "two words", C: "x=y" });
  });
});

describe("log MCP server", () => {
  test("lists the tools over MCP", async () => {
    const client = await connected();
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toContain("facebookListings");
    expect(tools.find((tool) => tool.name === "facebookPublish")?.description).toContain("dry run unless --live");
  });

  test("runs a command against Twenty and returns its output", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "facebookListings", arguments: { json: true } });
    expect(result.isError).toBe(false);
    expect((result.structuredContent as { json: { listings: unknown[] } }).json.listings).toHaveLength(8);
    expect(textOf(result).startsWith("Browsers: none open.\n")).toBe(true);
    expect(result.structuredContent).toMatchObject({ browsers: [], next: null, needsMatt: null });
  });

  test("a failing command is an error result with its stderr", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "facebookListings", arguments: { campaign: "nope" } });
    expect(result.isError).toBe(false);
    const refused = await client.callTool({ name: "errors", arguments: { code: "notACode" } });
    expect(refused.isError).toBe(true);
    expect(textOf(refused)).toContain("exit 1");
  });

  test("a live publish without confirmLive never reaches the command", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "facebookPublishLive", arguments: { listing: "x" } });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain("confirmLive");
  });
});

describe("live logs", () => {
  const doctorReply = { ok: true, checks: { python: "3.12", facebookCamofoxClient: "/fcc", camoufoxBrowser: "/c.exe", camoufoxVersion: "1" } };

  test("the worker's stderr lines reach the tool result and the live callback, in order", async () => {
    const worker = (async () => {
      emitLog("worker", "Opening Camoufox through the proxy");
      emitLog("worker", "Auto-login: typed the email and password (try 1).");
      return doctorReply;
    }) as unknown as WorkerClient;
    const seen: string[] = [];
    const result = await runToolCall("facebookDoctor", { args: ["--json"] }, { twenty: marketplaceFixture(), worker }, (tool, stream, line) => seen.push(`${tool} ${stream} ${line}`));
    const text = (result.content as { text: string }[])[0].text;
    expect(text).toContain("log:\nOpening Camoufox through the proxy\nAuto-login: typed the email and password (try 1).");
    expect(seen[0]).toMatch(/^facebookDoctor out ▶ log facebook doctor --json  \(job job\w+\)  \(call [0-9a-f]{12}\)$/);
    expect(seen).toContain("facebookDoctor worker Auto-login: typed the email and password (try 1).");
    expect(seen.at(-1)).toMatch(/^facebookDoctor out ■ exit 0 in [\d.]+ m?s \(call [0-9a-f]{12}: timing \{ call: "[0-9a-f]{12}" \} shows where the time went\)$/);
  });

  test("a call the client cancelled runs to its end, says so, and keeps its answer as a job", async () => {
    const stop = new AbortController();
    stop.abort();
    const seen: string[] = [];
    await runToolCall("governorShow", {}, {}, (tool, stream, line) => seen.push(`${tool} ${stream} ${line}`), undefined, stop.signal);
    const said = seen.find((l) => l.includes("✕ the client cancelled call")) ?? "";
    expect(said).toContain("its answer is kept as job");
    const id = /job (job\w+)/.exec(said)?.[1] ?? "";
    expect(seen.at(-1)).toContain(`the client had cancelled it, so its answer is job ${id}`);
    const kept = readJob(id);
    expect(kept?.status).toBe("completed");
    expect(kept?.result).toMatchObject({ exit: 0, cancelledByClient: true });
  });

  test("the server writes every line to the day's log file as it happens", async () => {
    const dir = mkdtempSync(join(tmpdir(), "logMcp"));
    try {
      const worker = (async () => {
        emitLog("worker", "Logged in.");
        return doctorReply;
      }) as unknown as WorkerClient;
      const server = createLogMcpServer({ twenty: marketplaceFixture(), worker }, { logDir: dir });
      const client = new Client({ name: "test", version: "0.0.0" });
      const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
      await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
      await client.callTool({ name: "facebookDoctor", arguments: { args: ["--json"] } });
      const [file] = readdirSync(dir);
      expect(file).toMatch(/^\d{4}-\d{2}-\d{2}\.log$/);
      const lines = readFileSync(join(dir, file), "utf8");
      expect(lines).toContain("facebookDoctor worker | Logged in.");
      expect(lines).toContain("facebookDoctor out    | ■ exit 0 in ");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("formatLogLine", () => {
    expect(formatLogLine("2026-10-19T07:00:00.000Z", "connect", "session", "x")).toBe("2026-10-19T07:00:00.000Z connect session| x");
  });
});

describe("readMembers", () => {
  test("is its own tool with named fields, no live twin, and bypass needs confirmBypass", () => {
    const names = toolsFromCommands(COMMANDS).map((t) => t.name);
    expect(names).toContain("facebookReadMembers");
    expect(names).toContain("facebookReadGroup");
    expect(names).toContain("facebookReadGroupLive");
    expect(names).not.toContain("readMembersLive");
    const tool = toolsFromCommands(COMMANDS).find((t) => t.name === "facebookReadMembers")!;
    expect(tool.inputSchema.required).toEqual(["account", "group", "count"]);
    expect(Object.keys(tool.inputSchema.properties)).toEqual(expect.arrayContaining(["secondsPerScroll", "maxScrolls", "owners", "bypass", "confirmBypass", "waitMs"]));
    expect(guardCall("facebookReadMembers", { account: "a", group: "junkremovalwinners", count: 30, secondsPerScroll: 10 }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "read", "members", "--account=a", "--group=junkremovalwinners", "--count=30", "--secondsPerScroll=10"] });
    expect(guardCall("facebookReadMembers", { account: "a", group: "g", count: 30, bypass: true }, COMMANDS).ok).toBe(false);
    expect(guardCall("facebookReadMembers", { account: "a", group: "g", count: 30, bypass: true, confirmBypass: true }, COMMANDS).ok).toBe(true);
    expect(guardCall("facebookReadMembers", { account: "a", group: "g", count: 30, live: true }, COMMANDS).ok).toBe(false);
  });
});
