import type { Command, ToolEffect } from "../../cli/runner/types.ts";

export type Direction = "lower" | "higher" | "info";

export type Verdict = "better" | "same" | "worse" | "new" | "changed" | "gone";

export interface Metric {
  key: string;
  label: string;
  value: number;
  better: Direction;
  details?: string[];
}

export type BaselineMetrics = Readonly<Record<string, number>>;

export interface BaselineFile {
  metrics: Record<string, number>;
}

export interface MetricRow {
  key: string;
  label: string;
  value: number | null;
  baseline: number | null;
  better: Direction;
  verdict: Verdict;
  details?: string[];
}

export interface Comparison {
  rows: MetricRow[];
  worse: MetricRow[];
  toLower: MetricRow[];
  missing: MetricRow[];
  gone: MetricRow[];
  ok: boolean;
}

export type BaselineWrite = { ok: true; metrics: Record<string, number>; raised: MetricRow[] } | { ok: false; refused: MetricRow[] };

export type ScoredCommand = Pick<Command, "name" | "platform" | "summary" | "usage">;

export interface ScoredCommandTool {
  tool: string;
  command: ScoredCommand;
  live: boolean;
  effect: ToolEffect;
}

export interface ToolText {
  name: string;
  description: string;
  inputSchema?: { [key: string]: unknown };
}

export interface UseCaseText {
  id: string;
  asks: string;
  text: string;
  tools: string[];
}

export interface SourceText {
  path: string;
  text: string;
}

export interface ScorecardInput {
  commands: readonly ScoredCommand[];
  commandTools: readonly ScoredCommandTool[];
  flowTools: readonly string[];
  listedTools: readonly ToolText[];
  guideOf: (command: ScoredCommand) => string | null;
  notes: Readonly<Record<string, readonly string[]>>;
  playRequired: ReadonlySet<string>;
  actingNamedByNoUseCase: readonly string[];
  useCases: readonly UseCaseText[];
  guides: Readonly<Record<string, string>>;
  serverInstructions: string;
  hookTypes: string;
  ruleIds: ReadonlySet<number>;
  useCaseFiles: readonly SourceText[];
  skillFiles: readonly SourceText[];
  codeFiles: readonly SourceText[];
  hasMachine: (command: ScoredCommand) => boolean;
}

export const GUIDE_LIMIT = 50_000;

export const MACHINE_RULE =
  "A command has a machine when the file that declares its export (its module in COMMAND_INDEX, or the file under that module's folder that declares `export const <exportName>`) calls createMachine, or directly imports a file that calls createMachine or whose folder holds a machine.ts that calls it.";
