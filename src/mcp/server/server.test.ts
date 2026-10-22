import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { COMMANDS } from "../../cli/runner/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { WorkerClient } from "../../camofox/worker/index.ts";
import { emitLog } from "../../observability/processLog/index.ts";
import { commandTools, createLogMcpServer, formatLogLine, guardCall, parseEnvText, runToolCall, savedFlows, TERMINAL_ONLY, toolsFromCommands, toolsFromFlows } from "./index.ts";

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
    expect(names).toEqual(expect.arrayContaining(["publish", "publishLive", "connect", "inspectStart", "inspectDo", "inspectDoLive", "hostStartLive", "joinLive", "warmupLive", "accountShow", "runsPrune", "listing", "listingCreate"]));
    expect(names).not.toContain("accountsLive");
    expect(names).not.toContain("connectLive");
    expect(names).not.toContain("launch");
    expect(names).not.toContain("inspect");
    expect(new Set(names).size).toBe(names.length);
  });

  test("a typed tool's schema has its fields, their kinds and what is required, and no args", () => {
    const tools = toolsFromCommands(COMMANDS);
    const start = tools.find((t) => t.name === "inspectStart")!;
    expect(start.inputSchema.required).toEqual(["account"]);
    expect(Object.keys(start.inputSchema.properties)).toEqual(["account", "url", "bypass", "now", "noIdleMouse", "detach", "proxyMs", "confirmBypass"]);
    const step = tools.find((t) => t.name === "inspectDo")!;
    expect((step.inputSchema.properties.action as { enum: string[] }).enum).toContain("setLocation");
    expect((step.inputSchema.properties.values as { type: string }).type).toBe("array");
    expect(step.inputSchema.properties).not.toHaveProperty("live");
    expect(step.inputSchema.properties).not.toHaveProperty("confirmLive");
    const stepLive = tools.find((t) => t.name === "inspectDoLive")!;
    expect(stepLive.inputSchema.properties).not.toHaveProperty("live");
    expect(stepLive.inputSchema.required).toEqual(["action", "confirmLive"]);
    const hostLive = tools.find((t) => t.name === "hostStartLive")!;
    expect(Object.keys(hostLive.inputSchema.properties)).toEqual(expect.arrayContaining(["live", "likes", "confirmLive"]));
    expect(tools.find((t) => t.name === "accounts")!.inputSchema.properties).not.toHaveProperty("confirmLive");
    for (const tool of tools.filter((t) => t.name !== "campaign" && "args" in t.inputSchema.properties)) expect(COMMANDS.find((c) => c.name === tool.name)?.input).toBeUndefined();
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
      expect(tool.annotations.destructiveHint || !live).toBe(true);
      if (live) expect(tool.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true, openWorldHint: true });
      if (live) expect(tool.inputSchema.required).toContain("confirmLive");
      if (!live) expect(tool.inputSchema.properties).not.toHaveProperty("confirmLive");
      if (!live) expect(tool.inputSchema.properties).not.toHaveProperty("live");
      if (live) expect(tools.some((t) => t.name === tool.name.slice(0, -4))).toBe(true);
    }
  });

  test("reads are read-only, a browser on Facebook is open-world, a prune is destructive", () => {
    const of = (name: string) => tools.find((t) => t.name === name)!.annotations;
    expect(of("accounts")).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: false });
    expect(of("accountShow")).toMatchObject({ readOnlyHint: true });
    expect(of("accountStatus")).toMatchObject({ readOnlyHint: false, destructiveHint: false, openWorldHint: false });
    expect(of("check")).toMatchObject({ readOnlyHint: false, destructiveHint: false, openWorldHint: true });
    expect(of("inspectDo")).toMatchObject({ readOnlyHint: false, destructiveHint: false, openWorldHint: true });
    expect(of("runsPrune")).toMatchObject({ readOnlyHint: false, destructiveHint: true });
    expect(of("runsList")).toMatchObject({ readOnlyHint: true });
  });
});

describe("guardCall", () => {
  test("live needs confirmLive, on typed and args tools alike", () => {
    expect(guardCall("publish", { listing: "a", live: true }, COMMANDS)).toEqual({ ok: false, message: "publish never acts on Facebook: live is `publishLive`, only when matt asked (rule 8)" });
    expect(guardCall("publishLive", { listing: "a" }, COMMANDS).ok).toBe(false);
    expect(guardCall("campaign", { args: ["run", "--campaign", "c", "--live=true"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("publishLive", { listing: "a", confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "publish", "--listing=a", "--live"] });
    expect(guardCall("publishLive", { listing: "a", live: true, confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "publish", "--listing=a", "--live"] });
    expect(guardCall("inspectDoLive", { action: "click", values: ["e12"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("hostStartLive", { account: "a", confirmLive: true }, COMMANDS).ok).toBe(false);
    expect(guardCall("hostStartLive", { account: "a", likes: true, confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "host", "start", "--account=a", "--likes"] });
    expect(guardCall("warmup", { args: ["facebook", "reel", "run", "--account", "a", "--likes"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("warmupLive", { args: ["facebook", "reel", "run", "--account", "a"], confirmLive: true }, COMMANDS).ok).toBe(false);
    expect(guardCall("warmupLive", { args: ["facebook", "reel", "run", "--account", "a", "--likes"], confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "warmup", "reel", "run", "--account", "a", "--likes"] });
  });

  test("bypass needs confirmBypass", () => {
    expect(guardCall("check", { account: "a", bypass: true }, COMMANDS).ok).toBe(false);
    expect(guardCall("check", { account: "a", bypass: true, confirmBypass: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "check", "--account=a", "--bypass"] });
  });

  test("a typed call becomes the argv the terminal would run, each value whole", () => {
    expect(guardCall("inspectDoLive", { action: "type", values: ["e7", "Full house clear-out, \"everything\" = gone\nSame day"], confirmLive: true }, COMMANDS)).toEqual({
      ok: true,
      argv: ["inspect", "do", "type", "e7", "Full house clear-out, \"everything\" = gone\nSame day", "--live"],
    });
    expect(guardCall("accountStatus", { account: "bethlehem", status: "PAUSED", reason: "setByHand" }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "account", "status", "bethlehem", "PAUSED", "--reason=setByHand"] });
    expect(guardCall("runsPrune", { apply: true }, COMMANDS)).toEqual({ ok: true, argv: ["runs", "prune", "--apply"] });
    expect(guardCall("inspectStart", { account: "a", detach: true, proxyMs: 4000 }, COMMANDS)).toEqual({ ok: true, argv: ["inspect", "start", "--account=a", "--detach", "--proxyMs=4000"] });
  });

  test("a typed call with a missing, unknown or wrong field never runs", () => {
    expect(guardCall("check", {}, COMMANDS)).toEqual({ ok: false, message: "check: account is needed" });
    expect(guardCall("check", { account: "a", bogus: 1 }, COMMANDS)).toEqual({ ok: false, message: 'check: unknown field "bogus"' });
    expect(guardCall("accountStatus", { account: "a", status: "NOPE" }, COMMANDS).ok).toBe(false);
    expect(guardCall("inspectDo", { action: "teleport" }, COMMANDS).ok).toBe(false);
    expect(guardCall("hostStart", { account: "a", gapMinutes: "5" }, COMMANDS).ok).toBe(false);
    expect(guardCall("listings", { args: ["--json"] }, COMMANDS).ok).toBe(false);
  });

  test("connect always runs --noPrompt, so it never reads the MCP channel", () => {
    expect(guardCall("connect", { args: ["--account", "x"] }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "connect", "--account", "x", "--noPrompt"] });
    expect(guardCall("connect", { args: ["--account", "x", "--noPrompt"] }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "connect", "--account", "x", "--noPrompt"] });
  });

  test("terminal-only, unknown and malformed calls are refused", () => {
    expect(guardCall("launch", {}, COMMANDS).ok).toBe(false);
    expect(guardCall("bogus", {}, COMMANDS).ok).toBe(false);
    expect(guardCall("connect", { args: [1 as unknown as string] }, COMMANDS).ok).toBe(false);
    expect(guardCall("listings", undefined, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "listings"] });
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
    expect(tools.map((tool) => tool.name)).toContain("listings");
    expect(tools.find((tool) => tool.name === "publish")?.description).toContain("dry run unless --live");
  });

  test("runs a command against Twenty and returns its output", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "listings", arguments: { json: true } });
    expect(result.isError).toBe(false);
    expect(JSON.parse(textOf(result).split("\n\nexit 0")[0]).listings).toHaveLength(8);
  });

  test("a failing command is an error result with its stderr", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "listings", arguments: { campaign: "nope" } });
    expect(result.isError).toBe(false);
    const refused = await client.callTool({ name: "errors", arguments: { code: "notACode" } });
    expect(refused.isError).toBe(true);
    expect(textOf(refused)).toContain("exit 1");
  });

  test("a live publish without confirmLive never reaches the command", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "publishLive", arguments: { listing: "x" } });
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
    const result = await runToolCall("doctor", { args: ["--json"] }, { twenty: marketplaceFixture(), worker }, (tool, stream, line) => seen.push(`${tool} ${stream} ${line}`));
    const text = (result.content as { text: string }[])[0].text;
    expect(text).toContain("log:\nOpening Camoufox through the proxy\nAuto-login: typed the email and password (try 1).");
    expect(seen[0]).toBe("doctor out ▶ log facebook doctor --json");
    expect(seen).toContain("doctor worker Auto-login: typed the email and password (try 1).");
    expect(seen.at(-1)).toBe("doctor out ■ exit 0");
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
      await client.callTool({ name: "doctor", arguments: { args: ["--json"] } });
      const [file] = readdirSync(dir);
      expect(file).toMatch(/^\d{4}-\d{2}-\d{2}\.log$/);
      const lines = readFileSync(join(dir, file), "utf8");
      expect(lines).toContain("doctor worker | Logged in.");
      expect(lines).toContain("doctor out    | ■ exit 0");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("formatLogLine", () => {
    expect(formatLogLine("2026-10-19T07:00:00.000Z", "connect", "session", "x")).toBe("2026-10-19T07:00:00.000Z connect session| x");
  });
});
