import { readSpans } from "./client.ts";
import { reportLines, toolStats, waterfallLines } from "./helpers/index.ts";
import type { TimingFilter, ToolStats } from "./types.ts";

export * from "./client.ts";
export * from "./helpers/index.ts";
export type * from "./types.ts";

export function timingStats(filter: TimingFilter = {}): ToolStats[] {
  return toolStats(readSpans({ tool: filter.tool, sinceMs: filter.sinceMs }));
}

export function timingReport(filter: TimingFilter = {}, stages = 8): string[] {
  return reportLines(timingStats(filter), { stages });
}

export function callWaterfall(callId: string): string[] {
  return waterfallLines(readSpans({ callId }));
}
