import { isPlatform, PLATFORM_LABELS } from "../../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../../cli/runner/helpers/platforms.ts";
import { commandKey } from "../../../cli/runner/helpers/platforms.ts";
import { rulesLine } from "../../server/helpers/agentRules.ts";
import { CALL_TOOL, GET_TOOL, SEARCH_TOOL } from "../types.ts";
import type { CatalogEntry, CatalogInput, SearchResult } from "../types.ts";
import { cliExample, exampleInputs } from "./examples.ts";
import { capabilityOfEntry } from "./search.ts";

function cell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]|^\s|\s$/.test(text) ? JSON.stringify(text) : text;
}

export function table(name: string, columns: readonly string[], rows: readonly unknown[][]): string[] {
  return [`${name}[${rows.length}]{${columns.join(",")}}:`, ...rows.map((row) => `  ${row.map(cell).join(",")}`)];
}

export function helpLines(lines: readonly string[]): string[] {
  return [`help[${lines.length}]:`, ...lines.map((line) => `  - ${line}`)];
}

export function actsOf(entry: CatalogEntry): string {
  if (entry.terminalOnly) return `run by matt in a terminal, not over MCP: it ${entry.terminalOnly}`;
  if (entry.liveTool) return `live run with live: true and confirmLive: true, only when matt asked (rules 8, 10)`;
  return entry.effect === "read" ? "no" : `changes ${entry.effect === "browser" ? "the account's browser" : "local or Twenty data"}`;
}

export function callLine(entry: CatalogEntry, inputs: Record<string, unknown>, live = false): string {
  return `${CALL_TOOL} ${JSON.stringify({ id: entry.id, inputs, ...(live ? { live: true, confirmLive: true } : {}) })}`;
}

export function renderSearch(result: SearchResult): string {
  if (result.verdict === "none") {
    return [
      `query: ${cell(result.query)}`,
      "verdict: none (no command does all of that)",
      ...(result.near.length ? table("near", ["id", "summary", "matched", "missed"], result.near.map((h) => [h.entry.id, h.entry.summary, h.matched.join(" "), h.missed.join(" ")])) : []),
      ...helpLines([`${SEARCH_TOOL} with fewer words, or say the job differently (what you want done, not a tool name)`, ...(result.near[0] ? [`${GET_TOOL} {"id":"${result.near[0].entry.id}"}`] : [])]),
    ].join("\n");
  }
  return [
    `query: ${cell(result.query)}`,
    `verdict: ${result.verdict}${result.verdict === "closest" ? " (none does every word; these do most)" : ""}`,
    ...table("results", ["id", "capability", "summary", "acts"], result.hits.map((h) => [h.entry.id, capabilityOfEntry(h.entry), h.entry.summary, h.entry.terminalOnly ? "terminal" : h.entry.liveTool ? "live" : h.entry.effect === "read" ? "no" : h.entry.effect])),
    ...helpLines([`${GET_TOOL} {"id":"${result.hits[0].entry.id}"}   (its inputs and a call that works)`]),
  ].join("\n");
}

function inputRows(inputs: readonly CatalogInput[]): unknown[][] {
  return inputs.map((i) => [i.name, i.type === "enum" ? i.values.join("|") : i.type, i.required, i.note]);
}

export function renderGet(entry: CatalogEntry): string {
  const inputs = exampleInputs(entry);
  if (entry.terminalOnly) {
    return [
      `id: ${entry.id}`,
      `summary: ${cell(entry.summary)}`,
      `acts: ${actsOf(entry)}`,
      `terminal: ${cliExample(entry, inputs)}`,
      ...helpLines([`tell matt to run \`${cliExample(entry, inputs)}\` in a terminal (rule 106)`]),
    ].join("\n");
  }
  const guide = entry.guide ? `getGuide({ topic: "${entry.guide}" })` : null;
  return [
    `id: ${entry.id}`,
    `summary: ${cell(entry.summary)}`,
    `platform: ${isPlatform(entry.platform) ? PLATFORM_LABELS[entry.platform as Platform] : entry.platform === "byArgument" ? "named in args, first" : "any"}`,
    `acts: ${actsOf(entry)}`,
    ...(entry.longRunning ? ["runs: seconds to minutes; watch `tail -f ~/.logCli/mcp/<day>.log` while it runs (rule 26), and a run past waitMs comes back as a job (jobStatus)"] : []),
    ...(entry.bypass ? ["bypass: outside the account's hours only when matt asked, with confirmBypass: true (rule 20)"] : []),
    ...table("inputs", ["name", "type", "required", "note"], inputRows(entry.inputs)),
    ...(entry.liveInputs.length ? table("liveInputs", ["name", "type", "required", "note"], inputRows(entry.liveInputs)) : []),
    `call: ${callLine(entry, inputs)}`,
    ...(entry.liveTool ? [`live: ${callLine(entry, inputs, true)}`] : []),
    `cli: ${cliExample(entry, inputs)}`,
    ...(guide ? [`guide: ${guide} before first using it`] : []),
    `rules: ${rulesLine(commandKey(entry.command)).replace(/^AGENTS\.md \(log:\/\/agents\): /, "")}`,
    ...helpLines([callLine(entry, inputs), ...(guide ? [guide] : [])]),
  ].join("\n");
}

export function renderUnknownId(id: string, suggestions: readonly string[]): string {
  return [
    `unknownId: no command "${id}", so nothing was run`,
    ...(suggestions.length ? [`didYouMean: ${suggestions.join(", ")}`] : []),
    ...helpLines([...(suggestions[0] ? [`${GET_TOOL} {"id":"${suggestions[0]}"}`] : []), `${SEARCH_TOOL} {"query":"<what you want to do>"}`]),
  ].join("\n");
}
