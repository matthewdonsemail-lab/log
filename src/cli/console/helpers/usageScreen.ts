import { loadConsoleUsage, USAGE_DAYS, USAGE_KIND_LABELS } from "../../../console/usage/index.ts";
import type { UsageDays, UsageSummary } from "../../../console/usage/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";
import type { ConsoleUi } from "./ui.ts";
import { msText } from "./ui.ts";

export function renderUsage(data: UsageSummary, days: number): string {
  if (!data.totals.calls) return `No calls in the last ${days} day(s).`;
  const rows = data.kinds.map((kind) => [USAGE_KIND_LABELS[kind.kind], String(kind.calls), String(kind.succeeded), String(kind.failed), msText(kind.p50Ms), msText(kind.p95Ms)]);
  rows.push(["Total", String(data.totals.calls), String(data.totals.succeeded), String(data.totals.failed), msText(data.totals.p50Ms), msText(data.totals.p95Ms)]);
  return [`Calls in the last ${days} day(s):`, renderTable(["Kind", "Calls", "OK", "Failed", "p50", "p95"], rows)].join("\n");
}

export async function runUsageScreen(ui: ConsoleUi): Promise<void> {
  const picked = await ui.pick("Over how long?", USAGE_DAYS.map((days) => ({ value: String(days), label: days === 1 ? "Today (1 day)" : `${days} days` })));
  if (picked === null) return;
  const days = Number(picked) as UsageDays;
  ui.context.out(renderUsage(loadConsoleUsage(days), days));
}

export { loadConsoleUsage };
