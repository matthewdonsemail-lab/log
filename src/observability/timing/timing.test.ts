import { describe, expect, test } from "bun:test";
import { harvestEngine, otlpBody, percentiles, readSpans, ROOT_SPAN, timeCall, timed, timedEngineSync, timedSync, toolStats, UNACCOUNTED, urlName, waterfallLines } from "./index.ts";
import type { Span } from "./index.ts";

function span(callId: string, name: string, ms: number, parentId: string | null, spanId: string, tool = "twitterDms"): Span {
  return { callId, traceId: `${callId}trace`, spanId, parentId, tool, name, source: "bun", pid: 1, startedAt: 1000, ms, ok: true, attrs: {} };
}

describe("timing", () => {
  test("outside a call, timed and timedSync only run the work", async () => {
    expect(await timed("x", async (s) => s.spanId)).toBeNull();
    expect(timedSync("y", (s) => s.spanId)).toBeNull();
  });

  test("a call stores its root and nested spans with their parents", async () => {
    const tool = `testTool${Date.now()}`;
    let callId = "";
    await timeCall(tool, async (call) => {
      callId = call.callId;
      await timed("outer", async () => {
        timedSync("inner", () => 1);
      }, { platform: "twitter" });
      call.attrs.exit = 0;
    });
    const spans = readSpans({ callId });
    const root = spans.find((s) => s.name === ROOT_SPAN)!;
    const outer = spans.find((s) => s.name === "outer")!;
    const inner = spans.find((s) => s.name === "inner")!;
    expect(root.parentId).toBeNull();
    expect(root.tool).toBe(tool);
    expect(root.attrs.exit).toBe(0);
    expect(outer.parentId).toBe(root.spanId);
    expect(outer.attrs.platform).toBe("twitter");
    expect(inner.parentId).toBe(outer.spanId);
  });

  test("a nested timeCall joins the outer call instead of starting another", async () => {
    let inner = "";
    let outer = "";
    await timeCall(`outerTool${Date.now()}`, async (call) => {
      outer = call.callId;
      await timeCall("innerTool", async (nested) => {
        inner = nested.callId;
      });
    });
    expect(inner).toBe(outer);
  });

  test("an engine's spans come back into the call under its engine span, with the Python start", async () => {
    let callId = "";
    const answer = await timeCall(`engineTool${Date.now()}`, async (call) => {
      callId = call.callId;
      return timedEngineSync("engine twitter inbox", {}, (trace) => {
        expect(trace?.traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
        return { answer: { ok: true, bootAt: Date.now() + 5, spans: [{ spanId: "py1", parentId: trace!.parentId, name: "governor", startedAt: Date.now(), ms: 12, attrs: { write: false } }] } as Record<string, unknown> };
      }, (run) => run.answer);
    });
    expect(answer.answer.spans).toBeUndefined();
    expect(answer.answer.bootAt).toBeUndefined();
    const spans = readSpans({ callId });
    const engine = spans.find((s) => s.name === "engine twitter inbox")!;
    expect(spans.find((s) => s.name === "governor")).toMatchObject({ source: "python", parentId: engine.spanId, ms: 12 });
    expect(spans.find((s) => s.name === "python.start")?.parentId).toBe(engine.spanId);
  });

  test("harvestEngine strips the spans out of an answer even outside a call", () => {
    const answer: Record<string, unknown> = { ok: true, spans: [], bootAt: 1 };
    harvestEngine(answer, { spanId: null, attrs: {} }, 0);
    expect(answer).toEqual({ ok: true });
  });

  test("fetch inside a call is a span named by its host and path", async () => {
    const server = Bun.serve({ port: 0, fetch: () => new Response("ok", { status: 201 }) });
    let callId = "";
    try {
      await timeCall(`fetchTool${Date.now()}`, async (call) => {
        callId = call.callId;
        await fetch(`http://127.0.0.1:${server.port}/api/v9/channels/1000000000000000001/messages`);
      });
    } finally {
      server.stop(true);
    }
    const fetched = readSpans({ callId }).find((s) => s.name.startsWith("fetch "))!;
    expect(fetched.name).toBe("fetch GET 127.0.0.1/api/v9/channels/:id/messages");
    expect(fetched.attrs.status).toBe(201);
  });

  test("urlName keeps GraphQL operations and hides ids and keys", () => {
    expect(urlName("https://x.com/i/api/graphql/abcDEF123/CreateTweet?variables=1")).toBe("x.com graphql CreateTweet");
    expect(urlName("https://api.subq.ai/v1/decisions")).toBe("api.subq.ai/v1/decisions");
    expect(urlName("https://ton.x.com/i/ton/data/xchat_media/123456-789012/abcdefghijklmnopqrstuvwxyz0123")).toBe("ton.x.com/i/ton/data/xchat_media/:id-:id/:key");
  });

  test("percentiles are nearest rank", () => {
    expect(percentiles([5, 1, 3, 2, 4])).toEqual({ n: 5, p50: 3, p95: 5, p99: 5 });
    expect(percentiles([])).toEqual({ n: 0, p50: 0, p95: 0, p99: 0 });
  });

  test("toolStats gives each stage its share and the call's own time as unaccounted", () => {
    const spans = [
      span("a", ROOT_SPAN, 1000, null, "ra"),
      span("a", "engine twitter inbox", 700, "ra", "ea"),
      span("a", "governor", 400, "ea", "ga"),
      span("b", ROOT_SPAN, 2000, null, "rb"),
      span("b", "engine twitter inbox", 1500, "rb", "eb"),
    ];
    const [stats] = toolStats(spans);
    expect(stats).toMatchObject({ tool: "twitterDms", n: 2, p50: 1000, p99: 2000 });
    const engine = stats.stages.find((s) => s.name === "engine twitter inbox")!;
    expect(engine.share).toBeCloseTo(2200 / 3000);
    expect(stats.stages.find((s) => s.name === UNACCOUNTED)).toMatchObject({ n: 2, p50: 300, p99: 500 });
    expect(stats.stages.find((s) => s.name === "governor")).toMatchObject({ calls: 1, p50: 400 });
  });

  test("a waterfall lists every stage under its parent", () => {
    const lines = waterfallLines([span("a", ROOT_SPAN, 1000, null, "ra"), span("a", "engine twitter inbox", 700, "ra", "ea"), span("a", "governor", 400, "ea", "ga")]);
    expect(lines[0]).toContain("call a · twitterDms · 1.00 s");
    expect(lines[1]).toContain("engine twitter inbox");
    expect(lines[2]).toMatch(/^ {4}\+/);
    expect(lines[2]).toContain("governor");
  });

  test("otlpBody is OTLP JSON with one resource per side", () => {
    const body = otlpBody([span("a", ROOT_SPAN, 1000, null, "ra"), { ...span("a", "governor", 400, "ra", "ga"), source: "python" }]) as { resourceSpans: { scopeSpans: { spans: { name: string; parentSpanId?: string; endTimeUnixNano: string }[] }[] }[] };
    expect(body.resourceSpans).toHaveLength(2);
    const root = body.resourceSpans[0].scopeSpans[0].spans[0];
    expect(root.name).toBe("call twitterDms");
    expect(root.endTimeUnixNano).toBe("2000000000");
    expect(body.resourceSpans[1].scopeSpans[0].spans[0].parentSpanId).toBe("ra");
  });
});
