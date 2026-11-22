import type { Database } from "bun:sqlite";
import type { MachinePlatform } from "../../../relate/machine/types.ts";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { rulesLine } from "../../server/helpers/agentRules.ts";
import { guideLine } from "../../server/helpers/guides.ts";
import { MCP_APP_MIME_TYPE } from "../browserView/types.ts";
import { appResourceMeta, appToolMeta } from "../meta.ts";
import { checkReport, hermesViewNote, readReportSource, REPORT_DEPS, ReportSourceRefusal, reportDataSource, reportText, saveHermesView, sourceBlocks, sourceStarter } from "./helpers/index.ts";
import type { ReportDataSource, ReportDeps } from "./helpers/index.ts";
import { REPORT_GUIDE, REPORT_LIMITS as L, REPORT_REFUSALS, REPORT_TOOL, REPORT_URI, REPORT_VIEW_META_KEY } from "./types.ts";

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

interface ViewServer {
  compileView: (code: string) => { ok: true; compiled: string } | { ok: false; error: string };
  starterCode: (name: string) => string;
  viewText: (compiled: string, data: Record<string, unknown>, title?: string, subtitle?: string) => string;
  viewMarkup: (compiled: string, data: Record<string, unknown>, title?: string, subtitle?: string) => string;
  viewHtml: () => Promise<string>;
  previewHtml: (baked: unknown) => Promise<string>;
}

const VIEW_SERVER = fileURLToPath(new URL("./view/server.tsx", import.meta.url));
let viewServer: Promise<ViewServer> | null = null;
export const loadViewServer = (): Promise<ViewServer> => (viewServer ??= import(VIEW_SERVER) as Promise<ViewServer>);

const line = (max: number) => z.string().trim().min(1).max(max);

export const reportInput = z.strictObject({
  title: line(L.title),
  subtitle: line(L.title).optional(),
  code: z.string().min(1).max(60_000).optional().describe('A React view: JSX that imports from "log" (and "react") and ends with export default function App({ data, title, subtitle }) { … }'),
  data: z.record(z.string().regex(/^[A-Za-z][A-Za-z0-9]{0,39}$/), reportDataSource).optional().describe("Named reads from log.db, handed to the view as data.<name> in the same call"),
  blocks: z.array(z.record(z.string(), z.unknown())).min(1).max(L.blocks).optional().describe("The older block list (heading, text, stat, barChart, lineChart, table, personList, callout, stateMachine)"),
});

const reportOutput = z.object({ title: z.string(), subtitle: z.string().optional(), shown: z.boolean().optional(), rows: z.record(z.string(), z.number()).optional(), compiled: z.string().optional(), data: z.record(z.string(), z.unknown()).optional(), hermesView: z.string().optional() });

const schemas: Partial<Record<"input" | "output", ObjectSchema>> = {};
const jsonSchema = (schema: z.ZodType, io: "input" | "output"): ObjectSchema => {
  const { $schema: _, ...rest } = z.toJSONSchema(schema, { io, unrepresentable: "any" }) as Record<string, unknown>;
  return rest as ObjectSchema;
};

export function reportInputSchema(): ObjectSchema {
  return (schemas.input ??= jsonSchema(reportInput, "input"));
}

export function reportOutputSchema(): ObjectSchema {
  return (schemas.output ??= jsonSchema(reportOutput, "output"));
}

export const REPORT_DESCRIPTION = [
  "Generative UI: show the person a view you build for their question, drawn in the chat. Plain by default, in the spirit of Lynx workspaces.",
  'One call: { title, data: { dms: { source: "twitterDmsBySender", since?: "30d", account?, limit? } } } reads log.db and draws a starter view (stats, messages per day, top senders, a people table).',
  "Sources, picked by source, all from log.db, no platform call: twitterDmsBySender (X one-to-one DMs by sender); dmsBySender { platform, account?, since?, limit? } (the same for any platform, reportSourceNoData when it has none); waitingOnYou { platform?, account?, since? } (who waits on the owner, with platform and account); identityProfile { platform, userId or handle } (one person's name, bio, follower count, verified flag and avatar, kept from session checks and follower reads, refused with identityProfileMissing when none is stored).",
  'Your own view: add code, a React component in JSX. import { Page, Card, Grid, Row, Stack, Stat, Badge, Table, Bars, BarChart, LineChart, Sparkline, Avatar, Quote, Icon, Tabs, Details, Empty, Query, Time, fmt, rel, useTool, useData } from "log". End with export default function App({ data, title, subtitle }) { return <Page title={title}>…</Page> }.',
  "Components: Page { title, subtitle, actions }, Card { title, actions, pad }, Grid { min }, Row/Stack { gap }, Stat { label, value, hint, tone }, Badge { tone: neutral|good|bad|warn|accent }, Table { rows, columns: [{ key, title, render, align, width }], limit }, Bars { data: [{ label, value }], unit } for ranked lists, BarChart { data: [{ label, value }] } for columns, LineChart { series: [{ name, values }], labels }, Sparkline { values, width }, Avatar { name, size, src }, Quote, Icon { name } (Font Awesome 6 names in camelCase: xTwitter, discord, message, users, clock, fire…), Time { value } (relative), fmt(n). Plain CSS works with the --sb-* variables (--sb-text, --sb-muted, --sb-accent, --sb-surface).",
  "Interaction (from Lynx): Routes { routes: { \"/\": Overview, \"/person/:handle\": Person } } with Link { to } and BackLink for list-to-detail pages; AskButton { prompt } and FollowUps { prompts } put a question into the chat; askAgent(text); Pointable { about } and tellAgent(text) tell the agent what the person is looking at; ErrorNote offers Ask the agent to fix it; Button, Input, Select, Textarea, Field, Modal, useAction(fn) for forms; Markdown; FullscreenButton; downloadCsv(name, rows); openExternal(url). End overviews with 2 or 3 FollowUps. A send never happens from the view: AskButton prompts go through the chat and its gates.",
  "Data: data.<name> from the data field is there at once. useTool(name, args) calls a log read tool live from the view and returns { data, loading, error, reload }; wrap it in Query. Only call read tools.",
  "Shown inline in MCP Apps hosts (Claude, ChatGPT, Cursor) and Hermes Desktop; elsewhere (Claude Code, Codex) as text. A view that doesn't compile is refused with reportFieldInvalid and the line to fix.",
  guideLine(REPORT_GUIDE),
  rulesLine(REPORT_TOOL),
].join("\n");

export function reportTool(): ReportToolDefinition {
  return {
    name: REPORT_TOOL,
    title: "Show a view",
    description: REPORT_DESCRIPTION,
    inputSchema: reportInputSchema(),
    outputSchema: reportOutputSchema(),
    annotations: { title: "Show a view", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  };
}



const refused = (code: string, issues: string[]): CallToolResult => ({ isError: true, content: [{ type: "text", text: `${code}: The view can't be drawn (getGuide({ topic: "ui" })). Fix: ${issues.join("; ")}` }] });

function refusalCodeOf(error: unknown): string {
  const code = error instanceof ReportSourceRefusal ? error.code : (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && (REPORT_REFUSALS as readonly string[]).includes(code) ? code : "reportFieldInvalid";
}

const where = (path: readonly PropertyKey[]): string => path.reduce<string>((out, part) => (typeof part === "number" ? `${out}[${part}]` : out ? `${out}.${String(part)}` : String(part)), "") || "report";

export interface ReportHost {
  hermes?: boolean;
  db?: Database;
}

function hermesDrawn(view: ViewServer, compiled: string, data: Record<string, unknown>, head: { title: string; subtitle?: string }, text: string, host: ReportHost): string | null {
  if (!host.hermes) return null;
  try {
    const html = view.viewMarkup(compiled, data, head.title, head.subtitle);
    return saveHermesView({ ...head, html, text, compiled, data }, host.db) ?? saveHermesView({ ...head, html, text }, host.db);
  } catch {
    return null;
  }
}

export async function runReport(input: unknown, ui: boolean, given: Partial<ReportDeps> = {}, host: ReportHost = {}): Promise<CallToolResult> {
  const deps: ReportDeps = { ...REPORT_DEPS, ...given };
  const parsed = reportInput.safeParse(input ?? {});
  if (!parsed.success) return refused("reportFieldInvalid", parsed.error.issues.slice(0, 8).map((issue) => `${where(issue.path)}: ${issue.message}`));
  const spec = parsed.data;
  const head = { title: spec.title, ...(spec.subtitle ? { subtitle: spec.subtitle } : {}) };
  const data: Record<string, unknown> = {};
  const reads: { source: ReportDataSource; read: unknown }[] = [];
  try {
    for (const [name, source] of Object.entries(spec.data ?? {})) {
      const read = readReportSource(source, deps);
      data[name] = read;
      reads.push({ source, read });
    }
  } catch (error) {
    return refused(refusalCodeOf(error), [`data: ${error instanceof Error ? error.message : String(error)}`]);
  }
  let blocksText: string | null = null;
  if (spec.blocks) {
    const checked = checkReport({ ...head, blocks: spec.blocks });
    if (!checked.ok) return refused(checked.code, checked.issues);
    data.blocks = checked.spec.blocks;
    blocksText = reportText(checked.spec);
  }
  const view = await loadViewServer();
  const source = spec.code ?? (spec.blocks ? view.starterCode("blocks") : reads[0] ? view.starterCode(sourceStarter(reads[0].source)) : null);
  if (!source) return refused("reportFieldInvalid", ["report: send code, data or blocks"]);
  const compiled = view.compileView(source);
  if (!compiled.ok) return refused("reportFieldInvalid", [`code: ${compiled.error}`]);
  const payload = { ...head, compiled: compiled.compiled, data };
  if (ui && !host.hermes) return { content: [{ type: "text", text: `The view "${spec.title}" is shown to the person. It already carries the data, so reply with what it means in a sentence or two, not the numbers again.` }], structuredContent: { ...head, shown: true, rows: rowCounts(data) }, _meta: { [REPORT_VIEW_META_KEY]: payload } };
  let text: string;
  if (blocksText && !spec.code) text = blocksText;
  else if (reads[0] && !spec.code) text = reportText({ ...head, blocks: sourceBlocks(reads[0].source, reads[0].read) });
  else {
    try {
      text = view.viewText(compiled.compiled, data, spec.title, spec.subtitle);
    } catch (error) {
      return refused("reportFieldInvalid", [`code: it compiled but broke while drawing: ${error instanceof Error ? error.message : String(error)}`]);
    }
  }
  const drawn = hermesDrawn(view, compiled.compiled, data, head, text, host);
  return { content: [{ type: "text", text: drawn ? `${text}\n\n${hermesViewNote(drawn)}` : text }], structuredContent: drawn ? { ...payload, hermesView: drawn } : payload };
}

export const MACHINE_GENUI_NOTE = "The stateMachine block below goes into show_blocks unchanged, as one of its blocks, next to markdown, callouts or tables that explain it:";

export async function runMachine(input: unknown, ui: boolean, host: ReportHost = {}): Promise<CallToolResult> {
  const { relateMachine, machineGenuiBlock, MACHINE_FORMS, MACHINE_PLATFORMS } = await import("../../../relate/machine/index.ts");
  const ask = (input ?? {}) as Record<string, unknown>;
  const pick = (name: string) => (typeof ask[name] === "string" && (ask[name] as string).trim() ? (ask[name] as string) : undefined);
  const view = pick("view");
  if (view && !["person", "route", "network"].includes(view)) return refused("reportFieldInvalid", ["view: person, route or network"]);
  const platform = pick("platform");
  if (platform && !(MACHINE_PLATFORMS as readonly string[]).includes(platform)) return refused("reportFieldInvalid", [`platform: one of ${MACHINE_PLATFORMS.join(", ")}`]);
  const form = pick("form");
  if (form && !(MACHINE_FORMS as readonly string[]).includes(form)) return refused("reportFieldInvalid", [`form: one of ${MACHINE_FORMS.join(", ")}`]);
  const answer = await relateMachine({ view: view as "person" | "route" | "network" | undefined, person: pick("person"), to: pick("to"), platform: platform as MachinePlatform | undefined });
  if (!answer.ok) return { isError: true, content: [{ type: "text", text: `${answer.code}: ${answer.problem}` }], structuredContent: { error: answer.code, message: answer.problem } };
  const block = answer.block;
  if (form === "genui") {
    const genui = machineGenuiBlock(block);
    return { content: [{ type: "text", text: `${answer.text}\n\n${MACHINE_GENUI_NOTE}\n${JSON.stringify(genui)}` }], structuredContent: { block: genui, text: answer.text, throughSeq: answer.throughSeq } };
  }
  return runReport({ title: block.title ?? "Relationship state machine", subtitle: `Relate graph through event ${answer.throughSeq}`, blocks: [block] }, ui, {}, host);
}

export const REPORT_RESOURCE_DESCRIPTION = "A view the agent built for the question: stats, charts, tables and people, drawn from log's data";

function rowCounts(data: Record<string, unknown>): Record<string, number> {
  return Object.fromEntries(Object.entries(data).map(([name, value]) => [name, Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value).length : 1]));
}

export function reportResource() {
  return { uri: REPORT_URI, name: "View", description: REPORT_RESOURCE_DESCRIPTION, mimeType: MCP_APP_MIME_TYPE };
}

export async function readReportResource() {
  const view = await loadViewServer();
  return {
    contents: [{ uri: REPORT_URI, mimeType: MCP_APP_MIME_TYPE, text: await view.viewHtml(), _meta: appResourceMeta({ connectDomains: [], resourceDomains: [] }, false, REPORT_RESOURCE_DESCRIPTION) }],
  };
}
