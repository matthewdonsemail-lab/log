export type UsageKind = 'platformRead' | 'platformWrite' | 'decision' | 'media' | 'background' | 'control' | 'other'

export type UsageTotals = { calls: number; succeeded: number; failed: number; p50Ms: number; p95Ms: number }
export type UsageBucket = UsageTotals & { start: string }
export type UsageBreakdown = UsageTotals & { kind: UsageKind }
export type UsageCall = { id: string; time: number; kind: UsageKind; status: 'succeeded' | 'failed'; durationMs: number }

export type UsageSummary = {
  schemaVersion: 1
  source: 'workspace' | 'example'
  generatedAt: string
  from: string
  to: string
  totals: UsageTotals
  buckets: UsageBucket[]
  kinds: UsageBreakdown[]
  recentCalls: UsageCall[]
}
