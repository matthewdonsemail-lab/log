import type { ConsoleEvent, ConsoleEventPage } from "../../observability/console/index.ts";

export const EVENT_STATUSES = ["recorded", "succeeded", "failed", "unknown"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface ConsoleEventFilter {
  kind?: string;
  status?: EventStatus;
  page?: number;
  pageSize?: number;
}

export type ConsoleEventList = ConsoleEventPage & {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  kinds: string[];
};

export type { ConsoleEvent };
