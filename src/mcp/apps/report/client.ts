import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { rulesLine } from "../../server/helpers/agentRules.ts";
import { guideLine } from "../../server/helpers/guides.ts";
import { MCP_APP_MIME_TYPE } from "../browserView/types.ts";
import { checkReport, reportHtml, reportSchema, reportSummary, reportText } from "./helpers/index.ts";
import { REPORT_BLOCK_TYPES, REPORT_GUIDE, REPORT_TOOL, REPORT_URI } from "./types.ts";

export interface ReportToolDefinition {
  name: typeof REPORT_TOOL;
  title: string;
  description: string;
  inputSchema: { type: "object"; [key: string]: unknown };
  outputSchema: { type: "object"; [key: string]: unknown };
  annotations: { title: string; readOnlyHint: true; destructiveHint: false; idempotentHint: true; openWorldHint: false };
  _meta?: Record<string, unknown>;
}

type ObjectSchema = { type: "object"; [key: string]: unknown };
const schemas: Partial<Record<"input" | "output", ObjectSchema>> = {};

function jsonSchemaOf(io: "input" | "output"): ObjectSchema {
  const held = schemas[io];
  if (held) return held;
  const { $schema: _, ...rest } = z.toJSONSchema(reportSchema, { io, unrepresentable: "any" }) as Record<string, unknown>;
  return (schemas[io] = rest as ObjectSchema);
}

export function reportInputSchema(): ObjectSchema {
  return jsonSchemaOf("input");
}

export function reportOutputSchema(): ObjectSchema {
  return jsonSchemaOf("output");
}

export function reportTool(): ReportToolDefinition {
  return {
    name: REPORT_TOOL,
    title: "Show a report",
    description: [
      "Show data to the person as a report: KPI tiles, bar and line charts, tables, people lists and callouts, in log's own look.",
      "Send DATA and LAYOUT only, never code or HTML: { title, subtitle?, blocks: [...] }, each block one of " + REPORT_BLOCK_TYPES.join(", ") + ". Fetch the numbers first (reportData, or any log read), then call this once with the finished report.",
      "An MCP Apps host (Claude, ChatGPT, Cursor) draws it inline with a full-screen button; any other host (Claude Code, Codex) gets the same report as markdown with unicode bar charts, so show that text to the person as it is.",
      "Reads nothing and sends nothing; a spec that breaks the catalog is refused with reportBlockUnknown, reportFieldInvalid, reportTooLarge, reportSeriesMismatch or reportColumnUnknown and the paths to fix. The answer's structuredContent is the checked spec.",
      guideLine(REPORT_GUIDE),
      rulesLine(REPORT_TOOL),
    ].join("\n"),
    inputSchema: reportInputSchema(),
    outputSchema: reportOutputSchema(),
    annotations: { title: "Show a report", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  };
}

export function withReportUi(tool: ReportToolDefinition): ReportToolDefinition {
  return { ...tool, _meta: { ...(tool._meta ?? {}), ui: { resourceUri: REPORT_URI } } };
}

export function runReport(input: unknown, ui: boolean): CallToolResult {
  const checked = checkReport(input ?? {});
  if (!checked.ok) {
    const message = `The report breaks the block catalog (getGuide({ topic: "ui" })). Fix: ${checked.issues.join("; ")}`;
    return { isError: true, content: [{ type: "text", text: `${checked.code}: ${message}` }] };
  }
  return { content: [{ type: "text", text: ui ? reportSummary(checked.spec) : reportText(checked.spec) }], structuredContent: checked.spec as unknown as Record<string, unknown> };
}

export function reportResource() {
  return { uri: REPORT_URI, name: "Report", description: "A report the agent composed from log's block catalog: KPI tiles, charts, tables and people", mimeType: MCP_APP_MIME_TYPE };
}

export async function readReportResource() {
  return {
    contents: [{ uri: REPORT_URI, mimeType: MCP_APP_MIME_TYPE, text: await reportHtml(), _meta: { ui: { csp: { connectDomains: [], resourceDomains: [] }, prefersBorder: false } } }],
  };
}
