import { EVENT_STATUSES, filterConsoleEvents, loadConsoleEvents, MAX_PAGE_SIZE, readEventPage } from "../../../console/events/index.ts";
import type { ConsoleEvent, ConsoleEventFilter, ConsoleEventList, EventStatus } from "../../../console/events/index.ts";
import { renderTable } from "../../runner/helpers/index.ts";
import type { ConsoleUi } from "./ui.ts";
import { BACK, msText, utcText } from "./ui.ts";

const ALL = "all";

function usageText(event: ConsoleEvent): string {
  if (event.usage?.type === "tokens") return `${event.usage.input + event.usage.output} tokens`;
  if (event.usage?.type === "balance") return `$${event.usage.amount.toFixed(4)} balance`;
  return "-";
}

export function renderEvents(data: ConsoleEventList, filter: ConsoleEventFilter = {}): string {
  const scope = [filter.kind ? `kind ${filter.kind}` : "", filter.status ? `status ${filter.status}` : ""].filter(Boolean).join(", ");
  if (!data.total) return `No events${scope ? ` match ${scope}` : " in log.db yet"}.`;
  const rows = data.events.map((event) => [utcText(event.time), event.status, event.kind, event.model ?? "-", event.durationMs === null ? "-" : msText(event.durationMs), usageText(event)]);
  return [renderTable(["Time", "Status", "Kind", "Model", "Duration", "Usage"], rows), `Page ${data.page + 1} of ${data.pageCount}, ${data.total} event(s)${scope ? ` (${scope})` : ""}.`].join("\n");
}

export async function runEventsScreen(ui: ConsoleUi): Promise<void> {
  const all = readEventPage();
  const kinds = filterConsoleEvents(all, { pageSize: MAX_PAGE_SIZE }).kinds;
  const kind = await ui.pick("Which kind?", [{ value: ALL, label: "Every kind" }, ...kinds.map((value) => ({ value, label: value }))]);
  if (kind === null) return;
  const status = await ui.pick("Which status?", [{ value: ALL, label: "Any status" }, ...EVENT_STATUSES.map((value) => ({ value, label: value }))]);
  if (status === null) return;
  const filter: ConsoleEventFilter = { ...(kind === ALL ? {} : { kind }), ...(status === ALL ? {} : { status: status as EventStatus }), page: 0 };
  for (;;) {
    const data = filterConsoleEvents(all, filter);
    ui.context.out(renderEvents(data, filter));
    if (data.pageCount <= 1) return;
    const move = await ui.pick("Page", [
      ...(data.page + 1 < data.pageCount ? [{ value: "next", label: "Next page →" }] : []),
      ...(data.page > 0 ? [{ value: "previous", label: "← Previous page" }] : []),
      { value: BACK, label: "Back" },
    ]);
    if (move === "next") filter.page = data.page + 1;
    else if (move === "previous") filter.page = data.page - 1;
    else return;
  }
}

export { loadConsoleEvents };
