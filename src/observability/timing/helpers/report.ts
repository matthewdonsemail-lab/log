import type { Percentiles, Span, StageStats, ToolStats } from "../types.ts";
import { ROOT_SPAN } from "./spanShape.ts";

export const UNACCOUNTED = "unaccounted";

export function percentiles(values: number[]): Percentiles {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return { n: 0, p50: 0, p95: 0, p99: 0 };
  const at = (p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))];
  return { n: sorted.length, p50: at(50), p95: at(95), p99: at(99) };
}

function byCall(spans: Span[]): Map<string, Span[]> {
  const calls = new Map<string, Span[]>();
  for (const span of spans) {
    const list = calls.get(span.callId);
    if (list) list.push(span);
    else calls.set(span.callId, [span]);
  }
  return calls;
}

export function rootOf(spans: Span[]): Span | null {
  return spans.find((s) => s.parentId === null && s.name === ROOT_SPAN) ?? null;
}

export function stageTotals(spans: Span[]): Map<string, number> {
  const root = rootOf(spans);
  const totals = new Map<string, number>();
  for (const span of spans) {
    if (span === root) continue;
    totals.set(span.name, (totals.get(span.name) ?? 0) + span.ms);
  }
  if (root) {
    const direct = spans.filter((s) => s.parentId === root.spanId).reduce((sum, s) => sum + s.ms, 0);
    totals.set(UNACCOUNTED, Math.max(0, root.ms - direct));
  }
  return totals;
}

export function toolStats(spans: Span[]): ToolStats[] {
  const tools = new Map<string, { roots: number[]; stages: Map<string, number[]> }>();
  for (const callSpans of byCall(spans).values()) {
    const root = rootOf(callSpans);
    if (!root) continue;
    const entry = tools.get(root.tool) ?? { roots: [], stages: new Map<string, number[]>() };
    entry.roots.push(root.ms);
    for (const [name, ms] of stageTotals(callSpans)) {
      const list = entry.stages.get(name);
      if (list) list.push(ms);
      else entry.stages.set(name, [ms]);
    }
    tools.set(root.tool, entry);
  }
  return [...tools.entries()]
    .map(([tool, entry]) => {
      const total = entry.roots.reduce((a, b) => a + b, 0) || 1;
      const stages: StageStats[] = [...entry.stages.entries()]
        .map(([name, values]) => ({ name, calls: values.length, share: values.reduce((a, b) => a + b, 0) / total, ...percentiles(values) }))
        .sort((a, b) => b.share - a.share);
      return { tool, ...percentiles(entry.roots), stages };
    })
    .sort((a, b) => b.n * b.p50 - a.n * a.p50);
}

export function msText(ms: number): string {
  if (ms >= 10000) return `${(ms / 1000).toFixed(1)} s`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`;
}

export function reportLines(stats: ToolStats[], options: { stages?: number } = {}): string[] {
  const top = options.stages ?? 8;
  const lines: string[] = [];
  for (const tool of stats) {
    lines.push(`${tool.tool}: ${tool.n} call${tool.n === 1 ? "" : "s"}, p50 ${msText(tool.p50)}, p95 ${msText(tool.p95)}, p99 ${msText(tool.p99)}`);
    for (const stage of tool.stages.slice(0, top)) {
      lines.push(`  ${stage.name.padEnd(44)} ${String(Math.round(stage.share * 100)).padStart(3)}% of the time  p50 ${msText(stage.p50).padStart(8)}  p95 ${msText(stage.p95).padStart(8)}  p99 ${msText(stage.p99).padStart(8)}  (in ${stage.calls})`);
    }
  }
  return lines;
}

export function waterfallLines(spans: Span[]): string[] {
  const root = rootOf(spans);
  if (!root) return [];
  const children = new Map<string, Span[]>();
  for (const span of spans) {
    if (!span.parentId) continue;
    const list = children.get(span.parentId);
    if (list) list.push(span);
    else children.set(span.parentId, [span]);
  }
  const known = new Set(spans.map((s) => s.spanId));
  const orphans = spans.filter((s) => s !== root && (!s.parentId || !known.has(s.parentId)));
  const lines: string[] = [`call ${root.callId} · ${root.tool} · ${msText(root.ms)} · ${new Date(root.startedAt).toISOString()}${root.ok ? "" : " · failed"}`];
  const walk = (span: Span, depth: number) => {
    const kids = (children.get(span.spanId) ?? []).sort((a, b) => a.startedAt - b.startedAt);
    for (const kid of kids) {
      const attrs = Object.entries(kid.attrs).map(([k, v]) => `${k}=${v}`).join(" ");
      lines.push(`${"  ".repeat(depth)}+${msText(Math.max(0, kid.startedAt - root.startedAt)).padStart(8)}  ${msText(kid.ms).padStart(8)}  ${kid.name}${kid.source === "python" ? " (python)" : ""}${attrs ? `  ${attrs}` : ""}${kid.ok ? "" : "  failed"}`);
      walk(kid, depth + 1);
    }
  };
  walk(root, 1);
  for (const orphan of orphans) lines.push(`  ?${msText(orphan.ms).padStart(8)}  ${orphan.name} (parent not recorded)`);
  return lines;
}
