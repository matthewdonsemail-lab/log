export type SpanSource = "bun" | "python";

export type SpanAttrs = Record<string, string | number | boolean>;

export interface Span {
  callId: string;
  traceId: string;
  spanId: string;
  parentId: string | null;
  tool: string;
  name: string;
  source: SpanSource;
  pid: number;
  startedAt: number;
  ms: number;
  ok: boolean;
  attrs: SpanAttrs;
}

export interface RemoteSpan {
  spanId: string;
  parentId: string | null;
  name: string;
  startedAt: number;
  ms: number;
  ok?: boolean;
  pid?: number;
  attrs?: Record<string, unknown>;
}

export interface EngineTrace {
  callId: string;
  traceId: string;
  parentId: string;
  traceparent: string;
}

export interface ActiveCall {
  callId: string;
  traceId: string;
  tool: string;
  spanId: string;
  spans: Span[];
  attrs: SpanAttrs;
}

export interface Percentiles {
  n: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface StageStats extends Percentiles {
  name: string;
  calls: number;
  share: number;
}

export interface ToolStats extends Percentiles {
  tool: string;
  stages: StageStats[];
}

export interface TimingFilter {
  tool?: string;
  sinceMs?: number;
  callId?: string;
}
