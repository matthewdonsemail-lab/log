import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { COMMANDS } from "../../cli/runner/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { createLogMcpServer, guardCall, parseEnvText, TERMINAL_ONLY, toolsFromCommands } from "./index.ts";

async function connected() {
  const server = createLogMcpServer({ twenty: marketplaceFixture() });
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
