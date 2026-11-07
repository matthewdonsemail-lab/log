import type { Span } from "../types.ts";

function nanos(ms: number): string {
  return (BigInt(Math.round(ms * 1000)) * 1000n).toString();
}

function attribute(key: string, value: string | number | boolean): Record<string, unknown> {
  if (typeof value === "boolean") return { key, value: { boolValue: value } };
  if (typeof value === "number") return Number.isInteger(value) ? { key, value: { intValue: String(value) } } : { key, value: { doubleValue: value } };
  return { key, value: { stringValue: value } };
}

export function otlpBody(spans: Span[]): Record<string, unknown> {
  const bySource = new Map<string, Span[]>();
  for (const span of spans) bySource.set(span.source, [...(bySource.get(span.source) ?? []), span]);
  return {
    resourceSpans: [...bySource.entries()].map(([source, list]) => ({
      resource: { attributes: [attribute("service.name", source === "python" ? "logEngine" : "log")] },
      scopeSpans: [
        {
          scope: { name: "log.timing" },
          spans: list.map((span) => ({
            traceId: span.traceId,
            spanId: span.spanId,
            ...(span.parentId ? { parentSpanId: span.parentId } : {}),
            name: span.name === "call" ? `call ${span.tool}` : span.name,
            kind: 1,
            startTimeUnixNano: nanos(span.startedAt),
            endTimeUnixNano: nanos(span.startedAt + span.ms),
            attributes: [attribute("log.tool", span.tool), attribute("log.callId", span.callId), attribute("process.pid", span.pid), ...Object.entries(span.attrs).map(([k, v]) => attribute(`log.${k}`, v))],
            status: { code: span.ok ? 1 : 2 },
          })),
        },
      ],
    })),
  };
}
