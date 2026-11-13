import { describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { marketplaceFixture } from "../../../twenty/graphql/index.ts";
import { createLogMcpServer } from "../../server/index.ts";
import { MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "../browserView/index.ts";
import { bar, sparkline } from "./helpers/text.ts";
import { checkReport, readReportResource, REPORT_URI, reportInputSchema, reportText, runReport } from "./index.ts";
import type { ReportSpec } from "./index.ts";
import type { SendersReport } from "../../../inbox/senders/index.ts";

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

  test("the input schema offers code, data and the older blocks", () => {
    const schema = reportInputSchema() as unknown as { properties: Record<string, unknown> };
    expect(Object.keys(schema.properties).sort()).toEqual(["blocks", "code", "data", "subtitle", "title"]);
    expect(JSON.stringify(schema)).toContain("twitterDmsBySender");
    expect(JSON.stringify(schema)).not.toContain("$schema");
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

  test("blocks become the blocks starter view, and the text twin stays the markdown report", async () => {
    const plain = await runReport(SPEC, false);
    expect(plain.isError).toBeUndefined();
    const payload = plain.structuredContent as { compiled: string; data: { blocks: unknown[] } };
    expect(payload.compiled).toContain("require('log')");
    expect(payload.data.blocks).toHaveLength(8);
    expect((plain.content as { text: string }[])[0].text).toBe(reportText(SPEC));
    const drawn = await runReport(SPEC, true);
    expect((drawn.content as { text: string }[])[0].text).toContain('The view "Who messaged the test account" is shown to the person');
    const refused = await runReport({ title: "t", blocks: [{ type: "pie" }] }, false);
    expect(refused.isError).toBe(true);
    expect((refused.content as { text: string }[])[0].text).toMatch(/^reportBlockUnknown: /);
  });
});

const FAKE: SendersReport = {
  source: "twitterDmsBySender",
  readFrom: "log.db",
  account: "testAccount",
  accounts: ["testAccount"],
  since: null,
  messages: 12,
  people: 2,
  senders: [
    { handle: "fakeOne", name: "Fake One", account: "testAccount", count: 9, firstAt: "2026-11-01T10:00:00Z", lastAt: "2026-11-03T10:00:00Z", activity: [0, 4, 5], lastMessage: "see you then" },
    { handle: "fakeTwo", name: "Fake Two", account: "testAccount", count: 3, firstAt: "2026-11-02T10:00:00Z", lastAt: "2026-11-02T11:00:00Z", activity: [0, 3, 0], lastMessage: null },
  ],
  byDay: [
    { day: "2026-11-01", count: 4 },
    { day: "2026-11-02", count: 3 },
    { day: "2026-11-03", count: 5 },
  ],
};

describe("generative views", () => {
  test("data alone reads log.db and hands the starter view its numbers", async () => {
    const asked: unknown[] = [];
    const answer = await runReport({ title: "Who messaged me", data: { dms: { source: "twitterDmsBySender", since: "30d" } } }, false, { readSenders: (o) => (asked.push(o), FAKE) });
    expect(asked).toEqual([{ account: null, since: "30d", limit: undefined }]);
    const payload = answer.structuredContent as { compiled: string; data: { dms: SendersReport } };
    expect(payload.data.dms.people).toBe(2);
    expect(payload.compiled).toContain("Top 10 share");
    expect((answer.content as { text: string }[])[0].text).toContain("**People** 2");
  });

  test("a view the model writes is compiled, and hosts without widgets get it as text", async () => {
    const code = `import { Page, Stat, Table, fmt } from "log";\nexport default function App({ data, title }) {\n  return <Page title={title}><Stat label="People" value={fmt(data.dms.people)} /><Table rows={data.dms.senders} columns={[{ key: "name", title: "Person" }, { key: "count", title: "Messages" }]} /></Page>;\n}`;
    const answer = await runReport({ title: "Mine", code, data: { dms: { source: "twitterDmsBySender" } } }, false, { readSenders: () => FAKE });
    expect(answer.isError).toBeUndefined();
    const text = (answer.content as { text: string }[])[0].text;
    expect(text).toContain("# Mine");
    expect(text).toContain("People");
    expect(text).toContain("| Fake One | 9 |");
  });

  test("broken code, outside imports and a view with nothing to show are refused with the fix", async () => {
    const syntax = await runReport({ title: "x", code: "export default function App() { return <div> }" }, false);
    expect((syntax.content as { text: string }[])[0].text).toMatch(/^reportFieldInvalid: .*code: /);
    const outside = await runReport({ title: "x", code: 'import x from "node:fs";\nexport default function App() { return null }' }, false);
    expect((outside.content as { text: string }[])[0].text).toContain('imports only from "log" and "react"');
    const crash = await runReport({ title: "x", code: "export default function App({ data }) { return data.nope.length }" }, false);
    expect((crash.content as { text: string }[])[0].text).toContain("broke while drawing");
    expect((await runReport({ title: "Empty" }, false)).isError).toBe(true);
  });
});

describe("the view as an MCP App", () => {
  test("every host gets report; an MCP Apps host gets it pointing at the view, and the resource", async () => {
    const plain = await connected({});
    const tool = (await plain.listTools()).tools.find((t) => t.name === "report");
    expect(tool).toBeDefined();
    expect(tool?._meta?.ui).toBeUndefined();
    expect((await plain.listResources()).resources.some((r) => r.uri === REPORT_URI)).toBe(false);
    const ui = await connected(UI);
    expect((await ui.listTools()).tools.find((t) => t.name === "report")?._meta?.ui).toEqual({ resourceUri: REPORT_URI });
    expect((await ui.listResources()).resources.some((r) => r.uri === REPORT_URI && r.mimeType === MCP_APP_MIME_TYPE)).toBe(true);
  });

  test("the resource is one self-contained page: no outside scripts, styles or fonts", async () => {
    const content = (await readReportResource()).contents[0];
    expect(content.mimeType).toBe("text/html;profile=mcp-app");
    expect(content._meta.ui).toEqual({ csp: { connectDomains: [], resourceDomains: [] }, prefersBorder: false });
    expect(content.text.startsWith("<!doctype html>")).toBe(true);
    expect(content.text).toContain("--sb-surface");
    expect(content.text).not.toMatch(/<script[^>]+src=/);
    expect(content.text).not.toMatch(/<link[^>]+href=/);
    expect(content.text).not.toMatch(/Loading…/);
  }, 60_000);
});
