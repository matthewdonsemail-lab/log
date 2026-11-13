import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { marketplaceFixture } from "../../../twenty/graphql/index.ts";
import { createLogMcpServer } from "../../server/index.ts";
import { MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "../browserView/index.ts";
import { bar, sparkline } from "./helpers/text.ts";
import { checkReport, readReportResource, REPORT_URI, reportInputSchema, reportText, runReport } from "./index.ts";
import type { ReportSpec } from "./index.ts";
import { blockHtml, esc, initials, reportBodyHtml } from "./widget/render.ts";

const UI = { extensions: { [UI_EXTENSION_ID]: { mimeTypes: [MCP_APP_MIME_TYPE] } } };

const SPEC: ReportSpec = {
  title: "Who messaged the test account",
  subtitle: "Fake data, last 30 days",
  blocks: [
    { type: "stat", items: [{ label: "Messages in", value: 120 }, { label: "People", value: 3 }, { label: "Top", value: "@fakeOne", delta: "+12%" }] },
    { type: "barChart", title: "Messages by person", unit: "msgs", data: [{ label: "Fake One", value: 64 }, { label: "Fake Two", value: 41 }, { label: "Fake Three", value: 15 }] },
    { type: "lineChart", title: "Per day", x: ["2026-11-01", "2026-11-02", "2026-11-03"], series: [{ name: "Messages", values: [4, 9, 2] }] },
    { type: "table", title: "Everyone", columns: [{ key: "name", label: "Person" }, { key: "count", label: "Messages", format: "number" }], rows: [{ name: "Fake | One", count: 64 }, { name: "Fake Two", count: null }] },
    { type: "personList", people: [{ name: "Fake One", handle: "fakeOne", count: 64 }, { name: "Fake Two", count: 41 }] },
    { type: "callout", tone: "warning", text: "2 people are waiting on a reply" },
    { type: "heading", text: "Notes" },
    { type: "text", text: "<script>alert(1)</script>" },
  ],
};

async function connected(capabilities: Record<string, unknown>) {
  const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
  const client = new Client({ name: "test", version: "0.0.0" }, { capabilities });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return client;
}

describe("the report spec", () => {
  test("a spec made only of catalog blocks passes whole", () => {
    const checked = checkReport(SPEC);
    expect(checked.ok).toBe(true);
    if (checked.ok) expect(checked.spec.blocks.map((b) => b.type)).toEqual(["stat", "barChart", "lineChart", "table", "personList", "callout", "heading", "text"]);
  });

  test("each refusal names its code and the path to fix", () => {
    const refused = (spec: unknown) => checkReport(spec) as { ok: false; code: string; issues: string[] };
    expect(refused({ title: "t", blocks: [{ type: "pie", data: [] }] })).toMatchObject({ code: "reportBlockUnknown", issues: [expect.stringContaining("blocks[0].type")] });
    expect(refused({ title: "t", blocks: [{ type: "barChart", data: [{ label: "a", value: "many" }] }] })).toMatchObject({ code: "reportFieldInvalid", issues: [expect.stringContaining("blocks[0].data[0].value")] });
    expect(refused({ title: "t", blocks: [{ type: "text", text: "a", html: "<b>" }] }).code).toBe("reportFieldInvalid");
    expect(refused({ title: "t", blocks: Array.from({ length: 41 }, () => ({ type: "text", text: "a" })) }).code).toBe("reportTooLarge");
    expect(refused({ title: "t", blocks: [{ type: "lineChart", x: ["a", "b"], series: [{ name: "s", values: [1, 2, 3] }] }] })).toMatchObject({ code: "reportSeriesMismatch", issues: ["blocks[0].series[0].values: has 3 values for 2 x labels"] });
    expect(refused({ title: "t", blocks: [{ type: "table", columns: [{ key: "a", label: "A" }], rows: [{ b: 1 }] }] }).code).toBe("reportColumnUnknown");
    expect(refused({ blocks: [] }).code).toBe("reportFieldInvalid");
  });

  test("the input schema the model sees is the catalog", () => {
    const schema = JSON.stringify(reportInputSchema());
    for (const type of ["heading", "text", "stat", "barChart", "lineChart", "table", "personList", "callout"]) expect(schema).toContain(`"const":"${type}"`);
    expect(schema).not.toContain("$schema");
  });
});

describe("the text a host without MCP Apps gets", () => {
  test("bars are eighth blocks scaled to the largest, sparklines span the range", () => {
    expect(bar(64, 64, 8)).toBe("████████");
    expect(bar(36, 64, 8)).toBe("████▌");
    expect(bar(0, 64)).toBe("");
    expect(sparkline([1, 5, 9])).toBe("▁▅█");
  });

  test("the report is markdown: title, KPI line, bar block, sparkline, table, people and callout", () => {
    const text = reportText(SPEC);
    expect(text.startsWith("# Who messaged the test account\n\n_Fake data, last 30 days_")).toBe(true);
    expect(text).toContain("**Messages in** 120 · **People** 3 · **Top** @fakeOne (+12%)");
    expect(text).toContain("Fake One    ████████████████████████ 64 msgs");
    expect(text).toContain("Fake Three  █████▋                   15 msgs");
    expect(text).toContain("Messages         ▃█▁  min 2, max 9, total 15");
    expect(text).toContain("| Person | Messages |\n|---|---:|\n| Fake \\| One | 64 |\n| Fake Two |  |");
    expect(text).toContain("1. **Fake One** @fakeOne · 64");
    expect(text).toContain("> **Watch out:** 2 people are waiting on a reply");
  });

  test("runReport answers the spec as structuredContent, the markdown without a view and one line with it", () => {
    const plain = runReport(SPEC, false);
    expect(plain.isError).toBeUndefined();
    expect(plain.structuredContent).toEqual(SPEC as unknown as Record<string, unknown>);
    expect((plain.content as { text: string }[])[0].text).toBe(reportText(SPEC));
    const drawn = runReport(SPEC, true);
    expect((drawn.content as { text: string }[])[0].text).toContain('The report "Who messaged the test account" is shown to the person');
    const refused = runReport({ title: "t", blocks: [{ type: "pie" }] }, false);
    expect(refused.isError).toBe(true);
    expect(refused.structuredContent).toBeUndefined();
    expect((refused.content as { text: string }[])[0].text).toMatch(/^reportBlockUnknown: /);
  });
});

describe("the view's drawing", () => {
  test("every block becomes its element, and text is escaped, never run", async () => {
    const { JSDOM } = await import("jsdom" as string);
    const dom = new JSDOM(`<main>${reportBodyHtml(SPEC)}</main>`);
    const doc = dom.window.document;
    expect(doc.querySelectorAll(".stat")).toHaveLength(3);
    expect(doc.querySelector(".stat.lead .statValue")?.textContent).toBe("120");
    const fills = [...doc.querySelectorAll(".barFill")].map((el: { getAttribute(name: string): string | null }) => el.getAttribute("style"));
    expect(fills).toEqual(["width:100.00%", "width:64.06%", "width:23.44%"]);
    expect(doc.querySelector("[data-block=lineChart] polyline")?.getAttribute("points")?.split(" ")).toHaveLength(3);
    expect([...doc.querySelectorAll("th")].map((th: { textContent: string }) => th.textContent)).toEqual(["Person", "Messages"]);
    expect(doc.querySelector("td.num")?.textContent).toBe("64");
    expect(doc.querySelector(".avatar")?.textContent).toBe("FO");
    expect(doc.querySelector(".callout")?.dataset.tone).toBe("warning");
    expect(doc.querySelector("script")).toBeNull();
    expect(doc.querySelector(".prose")?.textContent).toBe("<script>alert(1)</script>");
  });

  test("vertical bars are SVG rects, escaping covers attributes, initials read names and handles", () => {
    expect(blockHtml({ type: "barChart", orientation: "vertical", data: [{ label: "Mon", value: 3 }, { label: "Tue", value: 6 }] }).match(/<rect class="vbar"/g)).toHaveLength(2);
    expect(esc(`"><img src=x>`)).toBe("&quot;&gt;&lt;img src=x&gt;");
    expect(initials("fake_one")).toBe("FO");
    expect(initials("@solo")).toBe("SO");
  });
});

describe("the report as an MCP App", () => {
  test("every host gets report; an MCP Apps host gets it pointing at the view, and the resource", async () => {
    const plain = await connected({});
    const tool = (await plain.listTools()).tools.find((t) => t.name === "report");
    expect(tool).toBeDefined();
    expect(tool?._meta?.ui).toBeUndefined();
    expect((await plain.listResources()).resources.some((r) => r.uri === REPORT_URI)).toBe(false);
    const text = await plain.callTool({ name: "report", arguments: SPEC as unknown as Record<string, unknown> });
    expect((text.content as { text: string }[])[0].text).toContain("████");
    const refused = await plain.callTool({ name: "report", arguments: { title: "x", blocks: [{ type: "pie" }] } });
    expect(refused.isError).toBe(true);
    expect((refused.content as { text: string }[])[0].text).toContain("reportBlockUnknown: ");
    const ui = await connected(UI);
    expect((await ui.listTools()).tools.find((t) => t.name === "report")?._meta?.ui).toEqual({ resourceUri: REPORT_URI });
    expect((await ui.listResources()).resources.some((r) => r.uri === REPORT_URI && r.mimeType === MCP_APP_MIME_TYPE)).toBe(true);
    const drawn = await ui.callTool({ name: "report", arguments: SPEC as unknown as Record<string, unknown> });
    expect(drawn.structuredContent).toEqual(SPEC as unknown as Record<string, unknown>);
    expect((drawn.content as { text: string }[])[0].text).not.toContain("████");
  });

  test("the resource is one inline HTML page with the app mime type and an empty CSP", async () => {
    const content = (await readReportResource()).contents[0];
    expect(content.mimeType).toBe("text/html;profile=mcp-app");
    expect(content._meta.ui).toEqual({ csp: { connectDomains: [], resourceDomains: [] }, prefersBorder: false });
    expect(content.text.startsWith("<!doctype html>")).toBe(true);
    expect(content.text).toContain("ui/initialize");
    expect(content.text).toContain("--lk-blue:#2A8CFF");
    expect(content.text).not.toMatch(/<script[^>]+src=/);
    expect(content.text).not.toMatch(/Loading…/);
  }, 30_000);
});
