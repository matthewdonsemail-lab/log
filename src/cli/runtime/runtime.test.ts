import { describe, expect, test } from "bun:test";
import { REPORT_URI } from "../../mcp/apps/index.ts";
import { guideOperation, reportOperation, toolManifest, toolRunner, uiResources } from "./index.ts";

const SPEC = { title: "Fake report", blocks: [{ type: "barChart", title: "Messages by person", data: [{ label: "Fake One", value: 3 }] }] };

describe("the hosted relay serves the report widget", () => {
  test("the manifest carries report, with the widget meta only for MCP Apps clients", async () => {
    const plain = await toolManifest({ names: ["report", "reportData"] });
    const plainTools = (plain.result as { tools: { name: string; _meta?: unknown }[] }).tools;
    expect(plainTools.map((tool) => tool.name).sort()).toEqual(["report", "reportData"]);
    expect(plainTools.find((tool) => tool.name === "report")?._meta).toBeUndefined();
    const ui = await toolManifest({ names: ["report"], ui: true });
    const report = (ui.result as { tools: { name: string; _meta?: { ui?: { resourceUri?: string } } }[] }).tools.find((tool) => tool.name === "report");
    expect(report?._meta?.ui?.resourceUri).toBe(REPORT_URI);
  });

  test("the report resource is listed and readable", async () => {
    const listed = await uiResources("uiResourcesList", {});
    expect((listed.result as { resources: { uri: string }[] }).resources.map((item) => item.uri)).toContain(REPORT_URI);
    const read = await uiResources("uiResourceRead", { uri: REPORT_URI });
    expect(read.state).toBe("succeeded");
    expect((await uiResources("uiResourceRead", { uri: "ui://log/nothing" })).state).toBe("failed");
  });

  test("a report returns markdown text and, for widget clients, its spec", async () => {
    const ui = await reportOperation({ ...SPEC, ui: true });
    expect(ui.state).toBe("succeeded");
    expect((ui.result as { text: string }).text).toContain("Fake report");
    expect((ui.result as { spec: { compiled: string } | null }).spec?.compiled).toContain("require('log')");
    const refused = await reportOperation({ title: "t", blocks: [{ type: "pie", data: [] }] });
    expect(refused.state).toBe("failed");
  });

  test("getGuide is served on the hosted path, and ask routes the owner's words", async () => {
    const manifest = await toolManifest({ names: ["getGuide"] });
    expect((manifest.result as { tools: { name: string }[] }).tools.map((t) => t.name)).toEqual(["getGuide"]);
    const routed = await guideOperation({ ask: "show me who has been messaging me" });
    expect((routed.result as { text: string }).text).toContain("(inbox/showMe)");
    expect((await guideOperation({ topic: "nope" })).state).toBe("failed");
  });
});

describe("the hosted runner keeps the play footer and next", () => {
  const authority = { teamId: "fakeTeam", actorUserId: "fakeActor", grantId: null } as unknown as Parameters<ReturnType<typeof toolRunner>>[2];
  const next = { tool: "inspectDo", input: { account: "fakeBird" } };
  const stub = async () => ({ content: [{ type: "text", text: "the inbox" }], structuredContent: { exit: 0, ok: true, stdout: "the inbox", browsers: [{ account: "fakeBird" }], next } });

  test("a call after getGuide carries the play footer and next, and drops browsers", async () => {
    const run = toolRunner(stub);
    const loaded = await run("getGuide", { useCase: "twitter/getTheAction" }, authority);
    expect((loaded.result as { play: { id: string } }).play.id).toBe("twitter/getTheAction");
    const answer = await run("twitterDms", { account: "fakeBird" }, authority);
    const result = answer.result as Record<string, unknown>;
    expect(result.next).toEqual(next);
    expect(result.browsers).toBeUndefined();
    expect((result.play as { id: string; footer: string }).id).toBe("twitter/getTheAction");
    expect((result.play as { footer: string }).footer).toContain("This call is step 1");
  });

  test("another actor in the same team has no play", async () => {
    const run = toolRunner(stub);
    await run("getGuide", { useCase: "twitter/getTheAction" }, authority);
    const other = await run("twitterDms", { account: "fakeBird" }, { ...authority, actorUserId: "fakeOther" } as typeof authority);
    expect((other.result as Record<string, unknown>).play).toBeUndefined();
  });
});
