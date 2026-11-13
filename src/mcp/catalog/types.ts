import type { Command, InputForm, ToolEffect } from "../../cli/runner/types.ts";

export const SEARCH_TOOL = "logSearch";
export const GET_TOOL = "logGet";
export const CALL_TOOL = "logCall";
export const CATALOG_TOOLS = [SEARCH_TOOL, GET_TOOL, CALL_TOOL] as const;
export const CATALOG_GUIDE = "logCatalog";

export const SEARCH_LIMIT = 8;
export const SEARCH_LIMIT_MAX = 25;

export type InputType = "string" | "integer" | "number" | "boolean" | "enum" | "pairs" | "list";

export interface CatalogInput {
  name: string;
  type: InputType;
  required: boolean;
  note: string;
  values: readonly string[];
  positional: boolean;
}

export interface CatalogEntry {
  id: string;
  tool: string;
  liveTool: string | null;
  command: Command;
  form: InputForm | null;
  platform: string;
  summary: string;
  usage: string[];
  effect: ToolEffect;
  inputs: CatalogInput[];
  liveInputs: CatalogInput[];
  bypass: boolean;
  longRunning: boolean;
  guide: string | null;
  terminalOnly: string | null;
}

export type Verdict = "strong" | "closest" | "none";

export interface SearchHit {
  entry: CatalogEntry;
  score: number;
  matched: string[];
  missed: string[];
}

export interface SearchResult {
  query: string;
  verdict: Verdict;
  hits: SearchHit[];
  near: SearchHit[];
}

export interface CallTarget {
  ok: true;
  entry: CatalogEntry;
  tool: string;
  input: Record<string, unknown>;
}

export interface CallRefusal {
  ok: false;
  message: string;
}
