import { readUsageSummary, summarizeUsage } from "../../observability/usage/index.ts";
import type { UsageSummary } from "../../observability/usage/index.ts";
import { consoleDbFound } from "../store/index.ts";
import { USAGE_DAYS } from "./types.ts";
import type { UsageDays } from "./types.ts";

const dayMs = 86400000;

export function usageDaysOf(value: unknown): UsageDays | null {
  const days = typeof value === "string" ? Number(value) : value;
  return USAGE_DAYS.find((allowed) => allowed === days) ?? null;
}

export function loadConsoleUsage(days: UsageDays = 7, now: number = Date.now()): UsageSummary {
  if (!usageDaysOf(days)) throw new Error("usageRangeInvalid");
  const from = now - days * dayMs;
  return consoleDbFound() ? readUsageSummary(from, now) : summarizeUsage([], from, now);
}
