import type { BaselineMetrics, BaselineWrite, Comparison, Metric, MetricRow, Verdict } from "../types.ts";

function verdictOf(metric: Metric, baseline: number | undefined): Verdict {
  if (baseline === undefined) return "new";
  if (metric.value === baseline) return "same";
  if (metric.better === "info") return "changed";
  const lower = metric.value < baseline;
  return (metric.better === "lower") === lower ? "better" : "worse";
}

export function compareScorecard(metrics: readonly Metric[], baseline: BaselineMetrics): Comparison {
  const rows: MetricRow[] = metrics.map((m) => ({
    key: m.key,
    label: m.label,
    value: m.value,
    baseline: baseline[m.key] ?? null,
    better: m.better,
    verdict: verdictOf(m, baseline[m.key]),
    ...(m.details ? { details: m.details } : {}),
  }));
  const measured = new Set(metrics.map((m) => m.key));
  const gone: MetricRow[] = Object.keys(baseline)
    .filter((key) => !measured.has(key))
    .sort()
    .map((key) => ({ key, label: key, value: null, baseline: baseline[key], better: "info", verdict: "gone" }));
  const worse = rows.filter((r) => r.verdict === "worse");
  const missing = rows.filter((r) => r.verdict === "new");
  const toLower = rows.filter((r) => r.verdict === "better");
  return { rows: [...rows, ...gone], worse, toLower, missing, gone, ok: worse.length === 0 && missing.length === 0 };
}

export function writeBaseline(metrics: readonly Metric[], baseline: BaselineMetrics, allowWorse: boolean): BaselineWrite {
  const { worse } = compareScorecard(metrics, baseline);
  if (worse.length && !allowWorse) return { ok: false, refused: worse };
  const out: Record<string, number> = {};
  for (const m of [...metrics].sort((a, b) => a.key.localeCompare(b.key))) out[m.key] = m.value;
  return { ok: true, metrics: out, raised: worse };
}

const pad = (text: string, width: number): string => text + " ".repeat(Math.max(0, width - text.length));
const shown = (n: number | null): string => (n === null ? "-" : String(n));

export function renderScorecard(comparison: Comparison, machineRule: string): string {
  const head = ["Metric", "Now", "Baseline", "Verdict"];
  const body = comparison.rows.map((r) => [r.label, shown(r.value), shown(r.baseline), r.better === "info" && r.verdict !== "new" && r.verdict !== "gone" ? `${r.verdict} (info)` : r.verdict]);
  const widths = head.map((h, i) => Math.max(h.length, ...body.map((row) => row[i].length)));
  const line = (cells: string[]) => cells.map((c, i) => pad(c, widths[i])).join("  ").trimEnd();
  const out = [line(head), widths.map((w) => "-".repeat(w)).join("  "), ...body.map(line), "", `Machine rule: ${machineRule}`];
  for (const r of comparison.worse) out.push("", `WORSE: ${r.label} (${r.key}) is ${r.value}, the baseline is ${r.baseline}.`, ...(r.details ?? []).map((d) => `  - ${d}`));
  for (const r of comparison.missing) out.push("", `NOT IN THE BASELINE: ${r.label} (${r.key}) is ${r.value}. Run \`bun run check:agnostic --write\` to record it.`);
  if (comparison.toLower.length) out.push("", `Better than the baseline: ${comparison.toLower.map((r) => `${r.key} ${r.baseline} -> ${r.value}`).join(", ")}. Move the baseline to them in this change: \`bun run check:agnostic --write\`.`);
  if (comparison.gone.length) out.push("", `No longer measured: ${comparison.gone.map((r) => r.key).join(", ")}. \`bun run check:agnostic --write\` drops them.`);
  return out.join("\n");
}
