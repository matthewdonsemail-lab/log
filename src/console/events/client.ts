import { projectConsoleEvents } from "../../observability/console/helpers/index.ts";
import type { ConsoleEventPage } from "../../observability/console/index.ts";
import { consoleDb } from "../store/index.ts";
import { EVENT_STATUSES } from "./types.ts";
import type { ConsoleEventFilter, ConsoleEventList } from "./types.ts";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 1000;

function emptyPage(): ConsoleEventPage {
  return { schemaVersion: 1, source: "workspace", generatedAt: new Date().toISOString(), events: [] };
}

export function readEventPage(): ConsoleEventPage {
  const database = consoleDb();
  return database ? projectConsoleEvents(database) : emptyPage();
}

export function filterConsoleEvents(page: ConsoleEventPage, filter: ConsoleEventFilter = {}): ConsoleEventList {
  if (filter.status !== undefined && !EVENT_STATUSES.includes(filter.status)) throw new Error("consoleEventStatusInvalid");
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(filter.pageSize ?? DEFAULT_PAGE_SIZE)));
  const kinds = [...new Set(page.events.map((event) => event.kind))].sort();
  const kind = filter.kind?.trim().toLowerCase();
  const matched = page.events.filter((event) => (!kind || event.kind.toLowerCase() === kind) && (!filter.status || event.status === filter.status));
  const pageCount = Math.max(1, Math.ceil(matched.length / pageSize));
  const index = Math.min(pageCount - 1, Math.max(0, Math.floor(filter.page ?? 0)));
  return { ...page, events: matched.slice(index * pageSize, (index + 1) * pageSize), total: matched.length, page: index, pageSize, pageCount, kinds };
}

export function loadConsoleEvents(filter: ConsoleEventFilter = {}): ConsoleEventList {
  return filterConsoleEvents(readEventPage(), filter);
}
