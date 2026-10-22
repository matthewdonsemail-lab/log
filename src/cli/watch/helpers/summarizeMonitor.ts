import type { MonitorContext, MonitorOutput } from "../../../marketplace/monitor/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";

export function summarizeMonitor(context: unknown): Record<string, unknown> {
  const c = context as MonitorContext | undefined;
  if (!c) return {};
  const detail: Record<string, unknown> = { checks: c.checks };
  if (c.failure) detail.failure = `${c.failure.code} x${c.failure.count}`;
  if (c.issue) detail.issue = c.issue;
  return detail;
}

export function renderMonitorOutput(output: MonitorOutput): string {
  const lines = [`Stopped: ${output.stopReason ?? "?"} after ${output.checks} check(s)${output.issue ? `, account issue: ${output.issue}` : ""}`];
  if (output.decisions.length > 0) {
    lines.push(
      "",
      renderTable(
        ["Listing ID", "Health", "Repost?", "Cooldown", "Reason"],
        output.decisions.map((d) => [
          d.listingId,
          d.health,
          d.shouldRepost ? `yes (#${d.nextGeneration})` : d.fatal ? "NEVER" : "no",
          d.cooldownMs ? `${Math.round(d.cooldownMs / 60000)} min` : "",
          d.reason,
        ]),
      ),
      "",
      "Decisions only. Nothing was posted.",
    );
  }
  return lines.join("\n");
}
