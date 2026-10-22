import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { COMMANDS } from "../../cli/runner/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { AGENTS_MD, AGENTS_URI, citedRules, COMMAND_RULES, createLogMcpServer, RULES_REVIEWED_THROUGH, SERVER_INSTRUCTIONS, TERMINAL_ONLY } from "./index.ts";

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
    const unmapped = COMMANDS.map((c) => c.name).filter((name) => !(name in TERMINAL_ONLY) && !(name in COMMAND_RULES));
    expect(unmapped).toEqual([]);
  });

  test("the instructions reach the client at initialize, rule 30 first among the principles", async () => {
    const client = await connected();
    const instructions = client.getInstructions() ?? "";
    expect(instructions).toBe(SERVER_INSTRUCTIONS);
    expect(instructions.split("\n").find((l) => /^\d+\./.test(l))).toContain("do it completely");
    expect(instructions).toContain(AGENTS_URI);
    await client.close();
  });

  test("every tool's description ends with its rules and points back to AGENTS.md", async () => {
    const client = await connected();
    const { tools } = await client.listTools();
    for (const tool of tools) expect((tool.description ?? "").split("\n").at(-1)).toMatch(/^AGENTS\.md \(log:\/\/agents\): rules [\d, ]+\. When matt says to do something, do it completely \(rule 30\)\.$/);
    expect(tools.find((t) => t.name === "join")?.description).toContain("rules 8, 10, 18, 20, 25, 26, 29, 35, 45, 64, 30, 38, 39, 40, 41");
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
});
