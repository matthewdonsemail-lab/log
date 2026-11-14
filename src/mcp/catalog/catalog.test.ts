import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { COMMANDS } from "../../cli/runner/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { guardCall } from "../server/helpers/guardCall.ts";
import { commandTools } from "../server/helpers/toolsFromCommands.ts";
import { createLogMcpServer } from "../server/index.ts";
import { catalog, didYouMean, exampleInputs, getAnswer, resolveCall, searchAnswer, searchCatalog } from "./index.ts";

const entries = catalog(COMMANDS);
const callable = entries.filter((e) => !e.terminalOnly);

async function connected() {
  const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false, readBrowsers: () => [] });
  const client = new Client({ name: "test", version: "0.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(b), client.connect(a)]);
  return client;
}

const textOf = (result: unknown) => (result as { content: { text: string }[] }).content[0].text;

describe("the command catalog", () => {
  test("every command tool is one entry with a unique id, its live twin folded in, and every terminal-only command is listed but not callable", () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    const plainTools = commandTools(COMMANDS).filter((t) => !t.live).map((t) => t.tool).sort();
    expect(callable.map((e) => e.tool).sort()).toEqual(plainTools);
    const liveTools = commandTools(COMMANDS).filter((t) => t.live).map((t) => t.tool).sort();
    expect(callable.flatMap((e) => (e.liveTool ? [e.liveTool] : [])).sort()).toEqual(liveTools);
    for (const command of COMMANDS.filter((c) => c.terminalOnly)) expect(entries.some((e) => e.command === command && e.terminalOnly === command.terminalOnly)).toBe(true);
    expect(entries.find((e) => e.id === "twitter.dm")?.liveTool).toBe("twitterDmLive");
  });

  test("every command's example passes the same checks a real call does, so the call logGet prints is one that works", () => {
    const failing = callable.flatMap((e) => {
      const guard = guardCall(e.tool, exampleInputs(e), COMMANDS);
      return guard.ok ? [] : [`${e.id}: ${guard.message}`];
    });
    expect(failing).toEqual([]);
  });

  test("required inputs come first", () => {
    for (const e of callable) {
      const firstOptional = e.inputs.findIndex((i) => !i.required);
      if (firstOptional >= 0) expect(e.inputs.slice(firstOptional).every((i) => !i.required)).toBe(true);
    }
  });
});

describe("logSearch", () => {
  test("a job in plain words finds its command first, with a strong verdict", () => {
    const sent = searchCatalog(entries, "send a dm on x", 8);
    expect(sent.verdict).toBe("strong");
    expect(sent.hits[0].entry.id).toBe("twitter.dm");
    expect(searchCatalog(entries, "check my discord session", 8).hits[0].entry.id).toBe("discord.session.check");
    expect(searchCatalog(entries, "react to a slack message", 8).hits[0].entry.id).toBe("slack.react");
  });

  test("naming a platform keeps the other platforms out", () => {
    const found = searchCatalog(entries, "save x cookies", 8);
    expect(found.hits.slice(0, 3).map((h) => h.entry.id)).toContain("twitter.cookies.save");
    for (const hit of found.hits) expect(["twitter", "any", "byArgument"]).toContain(hit.entry.platform);
  });

  test("nothing that fits says none, with no hits", () => {
    const answer = searchAnswer(entries, { query: "fly to the moon" });
    expect(answer.text).toContain("verdict: none");
    expect((answer.json as { results: unknown[] }).results).toEqual([]);
    expect(searchAnswer(entries, {}).ok).toBe(false);
  });

  test("results are a table, and the answer ends with the next call", () => {
    const text = searchAnswer(entries, { query: "send a dm on x" }).text;
    expect(text).toMatch(/^results\[\d+\]\{id,capability,summary,acts\}:$/m);
    expect(text).toContain('help[1]:\n  - logGet {"id":"twitter.dm"}');
  });
});

describe("logGet", () => {
  test("one command: its inputs, a ready call, the CLI form, its guide and rules", () => {
    const answer = getAnswer(entries, { id: "twitter.dm" });
    expect(answer.ok).toBe(true);
    expect(answer.text).toContain("inputs[");
    expect(answer.text).toContain('call: logCall {"id":"twitter.dm","inputs":{"account":"yourAccount","userId":"12345","text":"hello"}}');
    expect(answer.text).toContain('"live":true,"confirmLive":true');
    expect(answer.text).toContain("cli: log twitter dm --account yourAccount --userId 12345 --text hello");
    expect(answer.text).toContain('getGuide({ topic: "xSending" })');
    expect(answer.text).toContain("rules: rules ");
  });

  test("a terminal-only command says matt runs it in a terminal", () => {
    const answer = getAnswer(entries, { id: "twitter.cookies.save" });
    expect(answer.text).toContain("run by matt in a terminal");
    expect(answer.text).toContain("log twitter cookies save --account yourAccount");
  });

  test("a wrong id gets did-you-mean and runs nothing", () => {
    expect(didYouMean(entries, "twiter.dm")).toContain("twitter.dm");
    const answer = getAnswer(entries, { id: "twiter.dm" });
    expect(answer.ok).toBe(false);
    expect(answer.text).toContain("didYouMean: twitter.dm");
    expect(answer.text).toContain("nothing was run");
  });
});

describe("logCall", () => {
  test("an id resolves to its own tool, the live form only with live", () => {
    const plain = resolveCall(entries, { id: "twitter.dm", inputs: { account: "a", userId: "1", text: "hi" } });
    expect(plain.ok && plain.tool).toBe("twitterDm");
    const live = resolveCall(entries, { id: "twitter.dm", inputs: { account: "a", userId: "1", text: "hi" }, live: true, confirmLive: true });
    expect(live.ok && live.tool).toBe("twitterDmLive");
    expect(live.ok && live.input.confirmLive).toBe(true);
  });

  test("an unknown input is refused by name, with the inputs it takes, and nothing runs", () => {
    const refused = resolveCall(entries, { id: "twitter.dm", inputs: { account: "a", recipient: "b" } });
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.message).toContain("unknownInput recipient");
      expect(refused.message).toContain("twitter.dm takes account, userId, text");
      expect(refused.message).toContain("Nothing was run");
    }
  });

  test("live on a command that never acts, a terminal-only command and a wrong id are refused", () => {
    const readOnly = resolveCall(entries, { id: "twitter.dms", inputs: {}, live: true });
    expect(!readOnly.ok && readOnly.message).toContain("has no live run");
    const terminal = resolveCall(entries, { id: "twitter.cookies.save", inputs: {} });
    expect(!terminal.ok && terminal.message).toContain("is not a tool");
    const wrong = resolveCall(entries, { id: "nope.nothing" });
    expect(!wrong.ok && wrong.message).toContain("nothing was run");
  });
});

describe("the three tools over MCP", () => {
  test("they are listed right after getGuide", async () => {
    const client = await connected();
    const { tools } = await client.listTools();
    expect(tools.slice(0, 4).map((t) => t.name)).toEqual(["getGuide", "logSearch", "logGet", "logCall"]);
    await client.close();
  });

  test("search, get and call run end to end, and call goes through the command tool's own guard", async () => {
    const client = await connected();
    const searched = await client.callTool({ name: "logSearch", arguments: { query: "list facebook accounts" } });
    expect(textOf(searched)).toContain("facebook.accounts");
    const got = await client.callTool({ name: "logGet", arguments: { id: "facebook.accounts" } });
    expect(got.isError).toBeFalsy();
    const called = await client.callTool({ name: "logCall", arguments: { id: "facebook.accounts", inputs: {} } });
    expect(called.isError).toBeFalsy();
    expect(textOf(called)).toContain("galwayOne");
    const unconfirmed = await client.callTool({ name: "logCall", arguments: { id: "twitter.dm", inputs: { account: "a", userId: "1", text: "hi" }, live: true } });
    expect(unconfirmed.isError).toBe(true);
    expect(textOf(unconfirmed)).toContain("confirmLive: true");
    await client.close();
  });
});
