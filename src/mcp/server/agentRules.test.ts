import { commandKey } from "../../cli/runner/helpers/platforms.ts";
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { COMMANDS } from "../../cli/runner/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { AGENTS_MD, AGENTS_URI, citedRules, COMMAND_RULES, createLogMcpServer, GUIDES_DIR, RULES_REVIEWED_THROUGH, SERVER_INSTRUCTIONS, TERMINAL_ONLY } from "./index.ts";

const agents = readFileSync(AGENTS_MD, "utf8");
const rules = [...agents.matchAll(/^(\d+)\. 20\d\d-\d\d-\d\d/gm)].map((m) => Number(m[1]));

async function connected(name = "test") {
  const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
  const client = new Client({ name, version: "0.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(b), client.connect(a)]);
  return client;
}

describe("AGENTS.md in the MCP server", () => {
  test("every rule the instructions and tool descriptions cite is a rule in AGENTS.md (no drift)", () => {
    const missing = citedRules().filter((n) => !rules.includes(n));
    expect(missing).toEqual([]);
  });

  test("a rule added to AGENTS.md fails here until the MCP summary is reviewed against it", () => {
    expect(Math.max(...rules)).toBeLessThanOrEqual(RULES_REVIEWED_THROUGH);
  });

  test("every tool has its own AGENTS.md rules (a new command can't ship without them)", () => {
    const unmapped = COMMANDS.filter((c) => !(c.name in TERMINAL_ONLY)).map(commandKey).filter((key) => !(key in COMMAND_RULES));
    expect(unmapped).toEqual([]);
  });

  test("the instructions reach the client at initialize, rule one first and rule 30 second among the principles", async () => {
    const client = await connected();
    const instructions = client.getInstructions() ?? "";
    expect(instructions).toBe(SERVER_INSTRUCTIONS);
    const principles = instructions.split("\n").filter((l) => /^\d+\./.test(l));
    expect(principles[0]).toContain("if we don't know, we do this");
    expect(principles[0]).toContain("(rules 73-76)");
    expect(principles[1]).toContain("do it completely");
    expect(instructions).toContain(AGENTS_URI);
    await client.close();
  });

  test("every tool's description ends with its rules and points back to AGENTS.md", async () => {
    const client = await connected();
    const { tools } = await client.listTools();
    for (const tool of tools.filter((t) => t.name !== "getGuide")) expect((tool.description ?? "").split("\n").at(-1)).toMatch(/^AGENTS\.md \(log:\/\/agents\): rules [\d, ]+\. When matt says to do something, do it completely \(rule 30\)\.$/);
    expect(tools.find((t) => t.name === "join")?.description).toContain("rules 8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 73, 30, 38, 39, 40, 41");
    await client.close();
  });

  test("AGENTS.md itself is the resource log://agents, read from the file", async () => {
    const client = await connected();
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toEqual([AGENTS_URI]);
    const read = await client.readResource({ uri: AGENTS_URI });
    expect((read.contents[0] as { text: string }).text).toBe(agents);
    await client.close();
  });
});

describe("watching a long call live over MCP (rule 26)", () => {
  test("for a client with a shell (Claude Code, Codex), the instructions and every long tool say to start a Monitor on the day's log first", async () => {
    expect(SERVER_INSTRUCTIONS).toContain("start a Monitor on its live log, `tail -f ~/.logCli/mcp/<day>.log`");
    for (const name of ["claude-code", "codex-mcp-client"]) {
      const client = await connected(name);
      const { tools } = await client.listTools();
      for (const tool of ["inspectStart", "inspectDo", "join", "warmup", "publish", "capture", "flowProfileSetupLive"]) expect(tools.find((t) => t.name === tool)?.description).toContain("start a Monitor on `tail -f ~/.logCli/mcp/<day>.log`");
      expect(tools.find((t) => t.name === "accounts")?.description).not.toContain("Monitor");
      await client.close();
    }
  });

  test("for a client without a shell (a claude.ai connector, Duet), long tools say to read each result's progress and browsers instead", async () => {
    expect(SERVER_INSTRUCTIONS).toContain("A client without a shell");
    const client = await connected("claude-ai");
    const { tools } = await client.listTools();
    for (const tool of ["inspectStart", "publish", "flowProfileSetupLive"]) {
      const description = tools.find((t) => t.name === tool)!.description!;
      expect(description).not.toContain("Monitor");
      expect(description).toContain("`progress`");
      expect(description).toContain("`browsers`, `next`, `needsMatt`");
    }
    await client.close();
  });

  test("like Paper's MCP: short instructions that say to load the core guide first, never cut by the client", () => {
    expect(SERVER_INSTRUCTIONS.length).toBeLessThan(2000);
    expect(SERVER_INSTRUCTIONS).toContain('You MUST load the full guide before other log tools: getGuide({ topic: "logMcpInstructions" })');
  });

  test("every tool names its guide just before its rules, and getGuide serves that guide from docs/guides", async () => {
    const client = await connected();
    const { tools } = await client.listTools();
    expect(tools[0].name).toBe("getGuide");
    for (const tool of tools.filter((t) => t.name !== "getGuide")) {
      const topic = /getGuide\(\{ topic: "(\w+)" \}\)/.exec((tool.description ?? "").split("\n").at(-2) ?? "")?.[1];
      expect(topic).toBeDefined();
      expect(existsSync(join(GUIDES_DIR, `${topic}.md`))).toBe(true);
    }
    const core = await client.callTool({ name: "getGuide", arguments: { topic: "logMcpInstructions" } });
    const text = (core.content as { text: string }[])[0].text;
    expect(text).toContain("## Rule one: if we don't know, we do this");
    expect(text).toContain("## Which guide for which work");
    const missing = await client.callTool({ name: "getGuide", arguments: { topic: "nope" } });
    expect(missing.isError).toBe(true);
    await client.close();
  });

  test("no tool description carries the engine's internals: they give the agent nothing to act on", async () => {
    const client = await connected();
    const { tools } = await client.listTools();
    for (const tool of tools) expect(tool.description ?? "").not.toContain("Engine: the direct-API engine");
    await client.close();
  });
});
