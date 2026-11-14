import type { ConsoleDatabase, ConsoleEvent, ConsoleEventPage } from '../types'

const eventKinds: Record<string, string> = {
  message: 'Message received', ownMessage: 'Message sent', messageEdited: 'Message edited', messageDeleted: 'Message deleted',
  reaction: 'Reaction', reactionAdded: 'Reaction added', reactionRemoved: 'Reaction removed',
  conversationSeen: 'Conversation observed', attachmentsSeen: 'Attachment observed', identityLearned: 'Identity observed', accountIdentified: 'Account identified', profileSeen: 'Profile observed',
  typing: 'Typing', presence: 'Presence changed', read: 'Read receipt', receipt: 'Delivery receipt',
}

function platformOf(value: string): ConsoleEvent['platform'] {
  if (value === 'x') return 'twitter'
  return ['facebook', 'twitter', 'discord', 'slack', 'instagram', 'reddit', 'linkedin'].includes(value) ? value as ConsoleEvent['platform'] : null
}

function metadata(value: string): Record<string, unknown> {
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {} } catch { return {} }
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

export function projectConsoleEvents(database: ConsoleDatabase): ConsoleEventPage {
  const tables = new Set((database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('events', 'spans', 'ledger')").all() as { name: string }[]).map((row) => row.name))
  const events: ConsoleEvent[] = []
  if (tables.has('events')) {
    const rows = database.prepare('SELECT seq, type, platform, known, receivedAt FROM events ORDER BY seq DESC LIMIT 500').all() as { seq: number; type: string; platform: string; known: number; receivedAt: string }[]
    for (const row of rows) {
      const time = Date.parse(row.receivedAt)
      if (!Number.isFinite(time)) continue
      events.push({ id: `event${row.seq}`, type: 'event', time, status: row.known ? 'recorded' : 'unknown', kind: eventKinds[row.type] ?? 'Other event', model: null, platform: platformOf(row.platform), durationMs: null, usage: null })
    }
  }
  const spans = tables.has('spans') ? database.prepare("SELECT spanId, startedAt, ms, ok, attrs FROM spans WHERE name = 'inference' AND json_valid(attrs) AND json_extract(attrs, '$.provider') IN ('subq', 'jev') ORDER BY startedAt DESC LIMIT 500").all() as { spanId: string; startedAt: number; ms: number; ok: number; attrs: string }[] : []
  const windows: { provider: string; start: number; end: number }[] = []
  for (const row of spans) {
    const attrs = metadata(row.attrs)
    const model = attrs.provider === 'subq' ? 'SubQ' : 'Jev'
    const input = number(attrs.inputTokens)
    const output = number(attrs.outputTokens)
    const balance = number(attrs.balance)
    const durationMs = number(row.ms)
    windows.push({ provider: String(attrs.provider), start: row.startedAt, end: row.startedAt + (durationMs ?? 0) + 1 })
    events.push({ id: `inference${row.spanId}`, type: 'inference', time: row.startedAt, status: row.ok ? 'succeeded' : 'failed', kind: 'Inference call', model, platform: null, durationMs, usage: input !== null && output !== null ? { type: 'tokens', input, output } : balance !== null ? { type: 'balance', amount: balance } : null })
  }
  if (tables.has('ledger')) {
    const rows = database.prepare("SELECT seq, provider, at, outcome FROM ledger WHERE kind = 'providerAnswer' AND provider IN ('subq', 'jev') ORDER BY seq DESC LIMIT 500").all() as { seq: number; provider: string; at: string; outcome: string }[]
    for (const row of rows) {
      const time = Date.parse(row.at)
      if (!Number.isFinite(time) || windows.some((window) => window.provider === row.provider && time >= window.start && time <= window.end)) continue
      events.push({ id: `provider${row.seq}`, type: 'inference', time, status: row.outcome === 'ok' ? 'succeeded' : row.outcome === 'failed' || row.outcome === 'outOfCredit' ? 'failed' : 'unknown', kind: 'Inference call', model: row.provider === 'subq' ? 'SubQ' : 'Jev', platform: null, durationMs: null, usage: null })
    }
  }
  return { schemaVersion: 1, source: 'workspace', generatedAt: new Date().toISOString(), events: events.sort((left, right) => right.time - left.time).slice(0, 1000) }
}
