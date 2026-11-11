export type UsageKind = 'platformRead' | 'platformWrite' | 'decision' | 'media' | 'background' | 'control' | 'other'

export type UsageTotals = { calls: number; succeeded: number; failed: number; p50Ms: number; p95Ms: number }
export type UsageBucket = UsageTotals & { start: string }
export type UsageBreakdown = UsageTotals & { kind: UsageKind }
export type UsageCall = { id: string; time: number; kind: UsageKind; status: 'succeeded' | 'failed'; durationMs: number }

export type UsageSummary = {
  schemaVersion: 1
  source: 'workspace'
  generatedAt: string
  from: string
  to: string
  totals: UsageTotals
  buckets: UsageBucket[]
  kinds: UsageBreakdown[]
  recentCalls: UsageCall[]
}


export const usageKindLabels: Record<UsageKind, string> = {
  platformRead: 'Platform reads',
  platformWrite: 'Platform actions',
  decision: 'Decision models',
  media: 'Media',
  background: 'Background jobs',
  control: 'Workspace operations',
  other: 'Other',
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('usageResponseInvalid')
  return value as Record<string, unknown>
}

function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('usageResponseInvalid')
  return value
}

function date(value: unknown): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('usageResponseInvalid')
  return new Date(value).toISOString()
}

function totals(value: unknown): UsageTotals {
  const row = record(value)
  const result = { calls: number(row.calls), succeeded: number(row.succeeded), failed: number(row.failed), p50Ms: number(row.p50Ms), p95Ms: number(row.p95Ms) }
  if (![result.calls, result.succeeded, result.failed].every(Number.isInteger) || result.succeeded + result.failed !== result.calls) throw new Error('usageResponseInvalid')
  return result
}

export async function loadUsageSummary(days: number, signal?: AbortSignal): Promise<UsageSummary> {
  const response = await fetch(`/api/console/usage?days=${days}`, { signal, credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) throw new Error('usageUnavailable')
  const body = record(await response.json())
  if (body.schemaVersion !== 1 || body.source !== 'workspace' || !Array.isArray(body.buckets) || !Array.isArray(body.kinds) || body.buckets.length > 32 || body.kinds.length > 7 || !Array.isArray(body.recentCalls) || body.recentCalls.length > 40) throw new Error('usageResponseInvalid')
  return {
    schemaVersion: 1,
    source: 'workspace',
    generatedAt: date(body.generatedAt),
    from: date(body.from),
    to: date(body.to),
    totals: totals(body.totals),
    buckets: body.buckets.map((item) => ({ start: date(record(item).start), ...totals(item) })),
    recentCalls: body.recentCalls.map((item) => {
      const row = record(item)
      if (typeof row.id !== 'string' || !/^[a-f0-9]{16}$/.test(row.id) || typeof row.kind !== 'string' || !Object.prototype.hasOwnProperty.call(usageKindLabels, row.kind) || (row.status !== 'failed' && row.status !== 'succeeded')) throw new Error('usageResponseInvalid')
      return { id: row.id, time: number(row.time), kind: row.kind as UsageKind, status: row.status, durationMs: number(row.durationMs) }
    }),
    kinds: body.kinds.map((item) => {
      const row = record(item)
      if (typeof row.kind !== 'string' || !Object.prototype.hasOwnProperty.call(usageKindLabels, row.kind)) throw new Error('usageResponseInvalid')
      return { kind: row.kind as UsageKind, ...totals(item) }
    }),
  }
}
