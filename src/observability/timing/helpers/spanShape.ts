import type { ActiveCall, RemoteSpan, Span, SpanAttrs } from "../types.ts";

export const ROOT_SPAN = "call";

export function traceparentOf(traceId: string, spanId: string): string {
  return `00-${traceId}-${spanId}-01`;
}

export function cleanAttrs(attrs: Record<string, unknown> | undefined): SpanAttrs {
  const out: SpanAttrs = {};
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined) continue;
    out[key] = typeof value === "number" || typeof value === "boolean" ? value : String(value);
  }
  return out;
}

export function urlName(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "url";
  }
  const graphql = /\/graphql\/[^/]+\/([A-Za-z0-9_]+)/.exec(parsed.pathname);
  if (graphql) return `${parsed.hostname} graphql ${graphql[1]}`;
  const parts = parsed.pathname.split("/").map((part) => (part.length > 24 && /^[A-Za-z0-9_\-=.]+$/.test(part) ? ":key" : part.replace(/\d{4,}/g, ":id")));
  return `${parsed.hostname}${parts.join("/")}`;
}

export function fromRemote(remote: RemoteSpan, call: Pick<ActiveCall, "callId" | "traceId" | "tool">, fallbackParent: string): Span | null {
  if (!remote || typeof remote.spanId !== "string" || typeof remote.name !== "string") return null;
  const startedAt = Number(remote.startedAt);
  const ms = Number(remote.ms);
  if (!Number.isFinite(startedAt) || !Number.isFinite(ms)) return null;
  return {
    callId: call.callId,
    traceId: call.traceId,
    spanId: remote.spanId,
    parentId: typeof remote.parentId === "string" && remote.parentId ? remote.parentId : fallbackParent,
    tool: call.tool,
    name: remote.name,
    source: "python",
    pid: Number(remote.pid) || 0,
    startedAt,
    ms: Math.max(0, ms),
    ok: remote.ok !== false,
    attrs: cleanAttrs(remote.attrs),
  };
}
