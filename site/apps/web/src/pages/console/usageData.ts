import type { UsageKind, UsageSummary, UsageTotals } from '../../../../../../src/observability/usage/types'

export const usageKindLabels: Record<UsageKind, string> = {
  platformRead: 'Platform reads',
  platformWrite: 'Platform actions',
  decision: 'Decision models',
  media: 'Media',
  background: 'Background jobs',
  control: 'Workspace operations',
  other: 'Other',
}

const dayMs = 86400000

export function exampleUsage(days: number): UsageSummary {
  const end = Math.floor(Date.now() / dayMs) * dayMs + dayMs
  const buckets = Array.from({ length: days }, (_, index) => {
    const calls = 64 + (index * 37 + 11) % 121
    const failed = 1 + index % 5
    return { start: new Date(end - (days - index) * dayMs).toISOString(), calls, failed, succeeded: calls - failed, p50Ms: 420 + index % 4 * 95, p95Ms: 1400 + index % 5 * 220 }
  })
  const calls = buckets.reduce((sum, bucket) => sum + bucket.calls, 0)
  const failed = buckets.reduce((sum, bucket) => sum + bucket.failed, 0)
  const weights = [0.42, 0.17, 0.16, 0.1, 0.08, 0.05, 0.02]
  let remainingCalls = calls
  let remainingFailures = failed
  const kinds = (Object.keys(usageKindLabels) as UsageKind[]).map((kind, index) => {
    const last = index === weights.length - 1
    const count = last ? remainingCalls : Math.floor(calls * weights[index])
    const failures = last ? remainingFailures : Math.floor(failed * weights[index])
    remainingCalls -= count
    remainingFailures -= failures
    return { kind, calls: count, failed: failures, succeeded: count - failures, p50Ms: 450 + index * 80, p95Ms: 1600 + index * 120 }
  })
  return { schemaVersion: 1, source: 'example', generatedAt: new Date().toISOString(), from: buckets[0].start, to: new Date(end).toISOString(), totals: { calls, failed, succeeded: calls - failed, p50Ms: 610, p95Ms: 2060 }, buckets, kinds }
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
  const response = await fetch(`/api/console/usage?days=${days}`, { signal, credentials: 'same-origin' })
  if (!response.ok) throw new Error('usageUnavailable')
  const body = record(await response.json())
  if (body.schemaVersion !== 1 || body.source !== 'workspace' || !Array.isArray(body.buckets) || !Array.isArray(body.kinds) || body.buckets.length > 32 || body.kinds.length > 7) throw new Error('usageResponseInvalid')
  return {
    schemaVersion: 1,
    source: 'workspace',
    generatedAt: date(body.generatedAt),
    from: date(body.from),
    to: date(body.to),
    totals: totals(body.totals),
    buckets: body.buckets.map((item) => ({ start: date(record(item).start), ...totals(item) })),
    kinds: body.kinds.map((item) => {
      const row = record(item)
      if (typeof row.kind !== 'string' || !Object.prototype.hasOwnProperty.call(usageKindLabels, row.kind)) throw new Error('usageResponseInvalid')
      return { kind: row.kind as UsageKind, ...totals(item) }
    }),
  }
}


