import type { BarChartBlock, CalloutBlock, Cell, LineChartBlock, PersonListBlock, ReportBlock, ReportSpec, StatBlock, TableBlock } from "../types.ts";

export const BAR_WIDTH = 24;
const EIGHTHS = ["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"];
const SPARKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
const TONES: Record<NonNullable<CalloutBlock["tone"]>, string> = { info: "Note", success: "Good", warning: "Watch out" };

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

const withUnit = (value: number | string, unit?: string): string => `${typeof value === "number" ? formatNumber(value) : value}${unit ? ` ${unit}` : ""}`;

export function bar(value: number, max: number, width: number = BAR_WIDTH): string {
  if (max <= 0 || value <= 0) return "";
  const eighths = Math.max(1, Math.round((value / max) * width * 8));
  return `${"█".repeat(Math.floor(eighths / 8))}${EIGHTHS[eighths % 8]}`;
}

export function sparkline(values: readonly number[]): string {
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  return values.map((v) => SPARKS[span === 0 ? 3 : Math.round(((v - min) / span) * (SPARKS.length - 1))]).join("");
}

const flat = (text: string): string => text.replace(/\s+/g, " ").trim();
const escapeCell = (text: string): string => flat(text).replace(/\|/g, "\\|");
const pad = (text: string, width: number): string => text + " ".repeat(Math.max(0, width - [...text].length));

function cellText(value: Cell | undefined, format?: "text" | "number" | "date"): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return formatNumber(value);
  if (format === "date" && !Number.isNaN(Date.parse(value))) return value.slice(0, 16).replace("T", " ");
  return value;
}

function statText(block: StatBlock): string {
  return block.items.map((s) => `**${flat(s.label)}** ${withUnit(s.value, s.unit)}${s.delta ? ` (${s.delta})` : ""}`).join(" · ");
}

function barText(block: BarChartBlock): string {
  const max = Math.max(...block.data.map((d) => d.value));
  const labels = block.data.map((d) => flat(d.label));
  const width = Math.min(28, Math.max(...labels.map((l) => [...l].length)));
  const cut = (l: string) => ([...l].length > width ? `${[...l].slice(0, width - 1).join("")}…` : l);
  const rows = block.data.map((d, i) => `${pad(cut(labels[i]), width)}  ${pad(bar(d.value, max), BAR_WIDTH)} ${withUnit(d.value, block.unit)}`);
  return [...(block.title ? [`**${flat(block.title)}**`, ""] : []), "```text", ...rows, "```"].join("\n");
}

function lineText(block: LineChartBlock): string {
  const range = `${block.x[0]} → ${block.x.at(-1)}`;
  const rows = block.series.map((s) => {
    const total = s.values.reduce((sum, v) => sum + v, 0);
    return `${pad(flat(s.name), 16)} ${sparkline(s.values)}  min ${withUnit(Math.min(...s.values), block.unit)}, max ${withUnit(Math.max(...s.values), block.unit)}, total ${withUnit(total, block.unit)}`;
  });
  return [...(block.title ? [`**${flat(block.title)}** (${range})`, ""] : [`${range}`, ""]), "```text", ...rows, "```"].join("\n");
}

function tableText(block: TableBlock): string {
  const head = `| ${block.columns.map((c) => escapeCell(c.label)).join(" | ")} |`;
  const rule = `|${block.columns.map((c) => (c.align === "right" || c.format === "number" ? "---:" : "---")).join("|")}|`;
  const rows = block.rows.map((row) => `| ${block.columns.map((c) => escapeCell(cellText(row[c.key], c.format))).join(" | ")} |`);
  return [...(block.title ? [`**${flat(block.title)}**`, ""] : []), head, rule, ...(rows.length ? rows : [`| ${block.columns.map(() => "").join(" | ")} |`])].join("\n");
}

function personText(block: PersonListBlock): string {
  const rows = block.people.map((p, i) => `${i + 1}. **${flat(p.name)}**${p.handle ? ` @${p.handle.replace(/^@/, "")}` : ""}${p.count !== undefined ? ` · ${withUnit(p.count, block.unit)}` : ""}${p.note ? ` · ${flat(p.note)}` : ""}`);
  return [...(block.title ? [`**${flat(block.title)}**`, ""] : []), ...rows].join("\n");
}

function calloutText(block: CalloutBlock): string {
  const label = block.title ? flat(block.title) : TONES[block.tone ?? "info"];
  return block.text.split("\n").map((l, i) => `> ${i === 0 ? `**${label}:** ` : ""}${l}`).join("\n");
}

export function blockText(block: ReportBlock): string {
  if (block.type === "heading") return `${block.level === 3 ? "###" : "##"} ${flat(block.text)}`;
  if (block.type === "text") return block.text;
  if (block.type === "stat") return statText(block);
  if (block.type === "barChart") return barText(block);
  if (block.type === "lineChart") return lineText(block);
  if (block.type === "table") return tableText(block);
  if (block.type === "personList") return personText(block);
  return calloutText(block);
}

export function reportText(spec: ReportSpec): string {
  return [`# ${flat(spec.title)}`, ...(spec.subtitle ? [`_${flat(spec.subtitle)}_`] : []), ...spec.blocks.map(blockText)].join("\n\n");
}

export function reportSummary(spec: ReportSpec): string {
  const kinds = [...new Set(spec.blocks.map((b) => b.type))].join(", ");
  return `The report "${flat(spec.title)}" is shown to the person in the report view: ${spec.blocks.length} block${spec.blocks.length === 1 ? "" : "s"} (${kinds}). It already carries the data, so reply with what it means in a sentence or two, not the numbers again.`;
}
