export const REPORT_URI = "ui://log/report";
export const REPORT_TOOL = "report";
export const REPORT_GUIDE = "ui";
export const REPORT_BLOCK_TYPES = ["heading", "text", "stat", "barChart", "lineChart", "table", "personList", "callout"] as const;
export type ReportBlockType = (typeof REPORT_BLOCK_TYPES)[number];
export const REPORT_REFUSALS = ["reportBlockUnknown", "reportFieldInvalid", "reportTooLarge", "reportSeriesMismatch", "reportColumnUnknown"] as const;
export type ReportRefusal = (typeof REPORT_REFUSALS)[number];

export const REPORT_LIMITS = {
  blocks: 40,
  title: 120,
  text: 2000,
  label: 80,
  stats: 6,
  bars: 50,
  points: 366,
  series: 4,
  columns: 8,
  rows: 200,
  people: 100,
} as const;

export type Cell = string | number | null;

export interface HeadingBlock {
  type: "heading";
  text: string;
  level?: 2 | 3;
}

export interface TextBlock {
  type: "text";
  text: string;
}

export interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  hint?: string;
}

export interface StatBlock {
  type: "stat";
  items: StatItem[];
}

export interface BarDatum {
  label: string;
  value: number;
  hint?: string;
}

export interface BarChartBlock {
  type: "barChart";
  title?: string;
  unit?: string;
  orientation?: "horizontal" | "vertical";
  data: BarDatum[];
}

export interface LineSeries {
  name: string;
  values: number[];
}

export interface LineChartBlock {
  type: "lineChart";
  title?: string;
  unit?: string;
  x: string[];
  series: LineSeries[];
}

export interface TableColumn {
  key: string;
  label: string;
  align?: "left" | "right";
  format?: "text" | "number" | "date";
}

export interface TableBlock {
  type: "table";
  title?: string;
  columns: TableColumn[];
  rows: Record<string, Cell>[];
}

export interface Person {
  name: string;
  handle?: string;
  count?: number;
  note?: string;
}

export interface PersonListBlock {
  type: "personList";
  title?: string;
  unit?: string;
  people: Person[];
}

export interface CalloutBlock {
  type: "callout";
  tone?: "info" | "success" | "warning";
  title?: string;
  text: string;
}

export type ReportBlock = HeadingBlock | TextBlock | StatBlock | BarChartBlock | LineChartBlock | TableBlock | PersonListBlock | CalloutBlock;

export interface ReportSpec {
  title: string;
  subtitle?: string;
  blocks: ReportBlock[];
}

export type ReportCheck = { ok: true; spec: ReportSpec } | { ok: false; code: ReportRefusal; issues: string[] };
