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
import { createLogMcpServer, formatLogLine, guardCall, parseEnvText, runToolCall, TERMINAL_ONLY, toolsFromCommands } from "./index.ts";

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
  test("every command is a tool except the terminal-only ones", () => {
    const names = toolsFromCommands(COMMANDS).map((tool) => tool.name);
    for (const command of COMMANDS) expect(names.includes(command.name)).toBe(!(command.name in TERMINAL_ONLY));
    expect(names).toContain("publish");
    expect(names).toContain("connect");
    expect(names).not.toContain("launch");
  });
});

describe("guardCall", () => {
  test("--live needs confirmLive", () => {
    expect(guardCall("publish", { args: ["--listing", "a", "--live"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("campaign", { args: ["run", "--campaign", "c", "--live=true"] }, COMMANDS).ok).toBe(false);
    expect(guardCall("publish", { args: ["--listing", "a", "--live"], confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["publish", "--listing", "a", "--live"] });
  });

  test("connect always runs --noPrompt, so it never reads the MCP channel", () => {
    expect(guardCall("connect", { args: ["--account", "x"] }, COMMANDS)).toEqual({ ok: true, argv: ["connect", "--account", "x", "--noPrompt"] });
    expect(guardCall("connect", { args: ["--account", "x", "--noPrompt"] }, COMMANDS)).toEqual({ ok: true, argv: ["connect", "--account", "x", "--noPrompt"] });
  });

  test("terminal-only, unknown and malformed calls are refused", () => {
    expect(guardCall("launch", {}, COMMANDS).ok).toBe(false);
    expect(guardCall("bogus", {}, COMMANDS).ok).toBe(false);
    expect(guardCall("listings", { args: [1 as unknown as string] }, COMMANDS).ok).toBe(false);
    expect(guardCall("listings", undefined, COMMANDS)).toEqual({ ok: true, argv: ["listings"] });
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
    const result = await client.callTool({ name: "listings", arguments: { args: ["--json"] } });
    expect(result.isError).toBe(false);
    expect(JSON.parse(textOf(result).split("\n\nexit 0")[0]).listings).toHaveLength(8);
  });

  test("a failing command is an error result with its stderr", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "listings", arguments: { args: ["--status", "NOPE"] } });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain("exit 1");
  });

  test("a live publish without confirmLive never reaches the command", async () => {
    const client = await connected();
    const result = await client.callTool({ name: "publish", arguments: { args: ["--listing", "x", "--live"] } });
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
    expect(seen[0]).toBe("doctor out ▶ log doctor --json");
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
