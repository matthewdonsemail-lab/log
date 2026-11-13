import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { COMMANDS } from "../../cli/runner/index.ts";
import { isPlatform, toolBaseName } from "../../cli/runner/helpers/platforms.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { catalog, entryById, getAnswer, resolveCall } from "../catalog/index.ts";
import { commandTools, createLogMcpServer, currentToolName, guardCall, RENAMED_COMMAND_TOOLS, RENAMED_FLOW_TOOLS, RENAMED_TOOLS, runToolCall, savedFlows, toolsFromCommands, toolsFromFlows } from "./index.ts";

const toolNames = [...toolsFromCommands(COMMANDS), ...toolsFromFlows(savedFlows())].map((t) => t.name);

function textOf(result: unknown): string {
  return (((result as { content?: unknown }).content ?? []) as { type: string; text?: string }[]).map((part) => part.text ?? "").join("\n");
}

describe("every platform's tools carry the platform's name", () => {
  test("a platform-specific command's tool names all start with its platform", () => {
    const unprefixed = commandTools(COMMANDS)
      .filter((t) => isPlatform(t.command.platform))
      .filter((t) => !t.tool.startsWith(t.command.platform) || !/^[A-Z]/.test(t.tool.slice(t.command.platform.length)))
      .map((t) => `${t.command.platform} ${t.command.name}: ${t.tool}`);
    expect(unprefixed).toEqual([]);
  });

  test("a shared command's tool name is its own name", () => {
    for (const command of COMMANDS.filter((c) => !isPlatform(c.platform))) expect(toolBaseName(command)).toBe(command.name);
  });
});

describe("renamed Facebook tools keep their old names for one release", () => {
  test("the table names every Facebook tool by its old name, and nothing else", () => {
    const facebook = commandTools(COMMANDS).filter((t) => t.command.platform === "facebook").map((t) => t.tool);
    const old = Object.fromEntries(facebook.map((tool) => [tool[8].toLowerCase() + tool.slice(9), tool]));
    expect(RENAMED_COMMAND_TOOLS).toEqual(old);
  });

  test("every flow tool keeps its old flow<Name> as an alias of its platform's name", () => {
    const flows = savedFlows();
    const old = Object.fromEntries(flows.flatMap((f) => [false, true].map((live) => [`flow${f.name[0].toUpperCase()}${f.name.slice(1)}${live ? "Live" : ""}`, toolsFromFlows([f])[live ? 1 : 0].name])));
    expect(RENAMED_FLOW_TOOLS).toEqual(old);
    expect(RENAMED_FLOW_TOOLS.flowFacebookLanguageEnglish).toBe("facebookFlowLanguageEnglish");
    expect(currentToolName("flowPostCommentLive")).toBe("facebookFlowPostCommentLive");
  });

  test("every new name is a listed tool and no old name is", () => {
    for (const [old, current] of Object.entries(RENAMED_TOOLS)) {
      expect(toolNames).toContain(current);
      expect(toolNames).not.toContain(old);
    }
    expect(currentToolName("constructor")).toBe("constructor");
    expect(currentToolName("inspectStart")).toBe("inspectStart");
  });

  test("tools/list shows only the new names", async () => {
    const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
    const client = new Client({ name: "test", version: "0.0.0" });
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
    const listed = (await client.listTools()).tools.map((t) => t.name);
    expect(listed).toContain("facebookAccounts");
    for (const old of Object.keys(RENAMED_TOOLS)) expect(listed).not.toContain(old);
    const called = await client.callTool({ name: "listings", arguments: { json: true } });
    expect(called.isError).toBe(false);
    expect((called.structuredContent as { json: { listings: unknown[] } }).json.listings).toHaveLength(8);
    expect(textOf(called)).toContain("`listings` was renamed to `facebookListings`");
    await client.close();
  });

  test("an old name runs the new tool, through the same gates", async () => {
    const result = await runToolCall("accounts", {}, { twenty: marketplaceFixture() }, () => {}, () => []);
    const current = await runToolCall("facebookAccounts", {}, { twenty: marketplaceFixture() }, () => {}, () => []);
    expect(result.isError).toBe(current.isError);
    expect((result.structuredContent as { stdout: string }).stdout).toBe((current.structuredContent as { stdout: string }).stdout);
    expect(textOf(result)).toContain("`accounts` was renamed to `facebookAccounts`");
    expect(guardCall("publishLive", { listing: "a" }, COMMANDS).ok).toBe(false);
    expect(guardCall("publishLive", { listing: "a", confirmLive: true }, COMMANDS)).toEqual({ ok: true, argv: ["facebook", "publish", "--listing=a", "--live"] });
  });

  test("logGet and logCall take an old name too", () => {
    const entries = catalog(COMMANDS);
    expect(entryById(entries, "accountShow")?.tool).toBe("facebookAccountShow");
    expect(getAnswer(entries, { id: "check" }).ok).toBe(true);
    const target = resolveCall(entries, { id: "readMembers", inputs: { account: "a", group: "g", count: 30 } });
    expect(target).toMatchObject({ ok: true, tool: "facebookReadMembers" });
  });
});
