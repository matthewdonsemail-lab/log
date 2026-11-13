import { describe, expect, test } from "bun:test";
import { REPORT_URI } from "../../mcp/apps/index.ts";
import { reportOperation, toolManifest, uiResources } from "./index.ts";

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
    expect((ui.result as { spec: { title: string } | null }).spec?.title).toBe("Fake report");
    const refused = await reportOperation({ title: "t", blocks: [{ type: "pie", data: [] }] });
    expect(refused.state).toBe("failed");
  });
});
