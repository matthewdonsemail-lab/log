import type { ToolEffect } from "../../../cli/runner/types.ts";
import type { LogToolAnnotations } from "../types.ts";

export const LIVE_SUFFIX = "Live";

export function annotationsOf(effect: ToolEffect, live: boolean, title: string): LogToolAnnotations {
  if (live) return { title, readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };
  switch (effect) {
    case "read":
      return { title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
    case "delete":
      return { title, readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };
    case "browser":
      return { title, readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
    default:
      return { title, readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
  }
}

export function titleOf(summary: string, live = false): string {
  const parts = summary.split(/:\s|;\s|\s\(|\.\s|\s—\s/);
  const first = (parts[0].length < 12 && parts[1] ? `${parts[0]}: ${parts[1]}` : parts[0]).replace(/\.$/, "").trim();
  const limit = live ? 54 : 70;
  const short = first.length <= limit ? first : `${first.slice(0, limit).replace(/[\s,]+\S*$/, "")}…`;
  return live ? `${short}, live on Facebook` : short;
}
