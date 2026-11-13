import { z } from "zod";
import { REPORT_BLOCK_TYPES, REPORT_LIMITS as L } from "../types.ts";
import type { ReportCheck, ReportRefusal, ReportSpec } from "../types.ts";

const line = (max: number = L.label) => z.string().trim().min(1).max(max);
const finite = z.number().finite();

const heading = z.strictObject({ type: z.literal("heading"), text: line(L.title), level: z.union([z.literal(2), z.literal(3)]).optional() });
const text = z.strictObject({ type: z.literal("text"), text: line(L.text) });
const stat = z.strictObject({
  type: z.literal("stat"),
  items: z.array(z.strictObject({ label: line(), value: z.union([finite, line()]), unit: line(12).optional(), delta: line(24).optional(), hint: line().optional() })).min(1).max(L.stats),
});
const barChart = z.strictObject({
  type: z.literal("barChart"),
  title: line(L.title).optional(),
  unit: line(24).optional(),
  orientation: z.enum(["horizontal", "vertical"]).optional(),
  data: z.array(z.strictObject({ label: line(), value: finite.min(0), hint: line().optional() })).min(1).max(L.bars),
});
const lineChart = z
  .strictObject({
    type: z.literal("lineChart"),
    title: line(L.title).optional(),
    unit: line(24).optional(),
    x: z.array(line(24)).min(2).max(L.points),
    series: z.array(z.strictObject({ name: line(), values: z.array(finite).min(2).max(L.points) })).min(1).max(L.series),
  })
  .superRefine((block, ctx) => {
    block.series.forEach((s, i) => {
      if (s.values.length !== block.x.length) ctx.addIssue({ code: "custom", path: ["series", i, "values"], message: `has ${s.values.length} values for ${block.x.length} x labels`, params: { refusal: "reportSeriesMismatch" } });
    });
  });
const cell = z.union([finite, z.string().max(L.text), z.null()]);
const table = z
  .strictObject({
    type: z.literal("table"),
    title: line(L.title).optional(),
    columns: z.array(z.strictObject({ key: line(40), label: line(), align: z.enum(["left", "right"]).optional(), format: z.enum(["text", "number", "date"]).optional() })).min(1).max(L.columns),
    rows: z.array(z.record(z.string(), cell)).max(L.rows),
  })
  .superRefine((block, ctx) => {
    const keys = new Set(block.columns.map((c) => c.key));
    if (keys.size !== block.columns.length) ctx.addIssue({ code: "custom", path: ["columns"], message: "column keys repeat", params: { refusal: "reportColumnUnknown" } });
    block.rows.forEach((row, i) => {
      for (const key of Object.keys(row)) if (!keys.has(key)) ctx.addIssue({ code: "custom", path: ["rows", i, key], message: `no column has key "${key}"`, params: { refusal: "reportColumnUnknown" } });
    });
  });
const personList = z.strictObject({
  type: z.literal("personList"),
  title: line(L.title).optional(),
  unit: line(24).optional(),
  people: z.array(z.strictObject({ name: line(), handle: line(60).optional(), count: finite.min(0).optional(), note: line(L.title).optional() })).min(1).max(L.people),
});
const callout = z.strictObject({ type: z.literal("callout"), tone: z.enum(["info", "success", "warning"]).optional(), title: line().optional(), text: line(L.text) });

const block = z.discriminatedUnion("type", [heading, text, stat, barChart, lineChart, table, personList, callout]);

export const reportSchema = z.strictObject({
  title: line(L.title),
  subtitle: line(L.title).optional(),
  blocks: z.array(block).min(1).max(L.blocks),
});

const where = (path: readonly PropertyKey[]): string =>
  path.reduce<string>((out, part) => (typeof part === "number" ? `${out}[${part}]` : out ? `${out}.${String(part)}` : String(part)), "") || "report";

function refusalOf(issue: z.core.$ZodIssue): ReportRefusal {
  const named = (issue as { params?: { refusal?: ReportRefusal } }).params?.refusal;
  if (named) return named;
  if (issue.code === "invalid_union" && (issue as { discriminator?: string }).discriminator === "type") return "reportBlockUnknown";
  if (issue.code === "too_big" && (issue.origin === "array" || issue.origin === "string")) return "reportTooLarge";
  return "reportFieldInvalid";
}

function messageOf(issue: z.core.$ZodIssue, code: ReportRefusal): string {
  if (code === "reportBlockUnknown") return `is not a block type: use one of ${REPORT_BLOCK_TYPES.join(", ")}`;
  return issue.message;
}

export function checkReport(input: unknown): ReportCheck {
  const parsed = reportSchema.safeParse(input);
  if (parsed.success) return { ok: true, spec: parsed.data as ReportSpec };
  const coded = parsed.error.issues.map((issue) => ({ issue, code: refusalOf(issue) }));
  const first = coded.find((c) => c.code !== "reportFieldInvalid") ?? coded[0];
  return { ok: false, code: first.code, issues: coded.slice(0, 8).map(({ issue, code }) => `${where(issue.path)}: ${messageOf(issue, code)}`) };
}
