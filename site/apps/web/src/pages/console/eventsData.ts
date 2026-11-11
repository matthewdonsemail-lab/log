export type ConsoleEvent = {
  id: string
  type: 'event' | 'inference'
  time: number
  status: 'recorded' | 'succeeded' | 'failed' | 'unknown'
  kind: string
  model: 'SubQ' | 'Jev' | null
  platform: 'facebook' | 'twitter' | 'discord' | 'slack' | 'instagram' | 'reddit' | 'linkedin' | null
  durationMs: number | null
  usage: { type: 'tokens'; input: number; output: number } | { type: 'balance'; amount: number } | null
}

type ConsoleEventPage = { schemaVersion: 1; source: 'workspace'; generatedAt: string; events: ConsoleEvent[] }


const kinds = new Set(['Message received', 'Message sent', 'Message edited', 'Message deleted', 'Reaction', 'Reaction added', 'Reaction removed', 'Conversation observed', 'Attachment observed', 'Identity observed', 'Account identified', 'Typing', 'Presence changed', 'Read receipt', 'Delivery receipt', 'Other event', 'Inference call'])

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('consoleResponseInvalid')
  return value as Record<string, unknown>
}

function numeric(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('consoleResponseInvalid')
  return value
}

export async function loadConsoleEvents(signal: AbortSignal): Promise<ConsoleEventPage> {
  const response = await fetch('/api/console/events', { signal, credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) throw new Error('consoleWorkspaceUnavailable')
  const body = record(await response.json())
  if (body.schemaVersion !== 1 || body.source !== 'workspace' || !Array.isArray(body.events) || body.events.length > 1000 || typeof body.generatedAt !== 'string' || !Number.isFinite(Date.parse(body.generatedAt))) throw new Error('consoleResponseInvalid')
  const events = body.events.map((value): ConsoleEvent => {
    const row = record(value)
    if (typeof row.id !== 'string' || !/^(event\d+|provider\d+|inference[a-f0-9]+)$/.test(row.id) || (row.type !== 'event' && row.type !== 'inference') || !['recorded', 'succeeded', 'failed', 'unknown'].includes(String(row.status)) || typeof row.kind !== 'string' || !kinds.has(row.kind) || (row.model !== null && row.model !== 'SubQ' && row.model !== 'Jev')) throw new Error('consoleResponseInvalid')
    if ((row.type === 'event' && row.model !== null) || (row.type === 'inference' && row.model === null)) throw new Error('consoleResponseInvalid')
    if (row.platform !== null && !['facebook', 'twitter', 'discord', 'slack', 'instagram', 'reddit', 'linkedin'].includes(String(row.platform))) throw new Error('consoleResponseInvalid')
    let usage: ConsoleEvent['usage'] = null
    if (row.usage !== null) {
      const source = record(row.usage)
      if (source.type === 'tokens') usage = { type: 'tokens', input: numeric(source.input), output: numeric(source.output) }
      else if (source.type === 'balance') usage = { type: 'balance', amount: numeric(source.amount) }
      else throw new Error('consoleResponseInvalid')
    }
    return { id: row.id, type: row.type, time: numeric(row.time), status: row.status as ConsoleEvent['status'], kind: row.kind, model: row.model, platform: row.platform as ConsoleEvent['platform'], durationMs: row.durationMs === null ? null : numeric(row.durationMs), usage }
  })
  return { schemaVersion: 1, source: 'workspace', generatedAt: body.generatedAt, events }
}

export const platformLabels = { facebook: 'Facebook', twitter: 'X', discord: 'Discord', slack: 'Slack', instagram: 'Instagram', reddit: 'Reddit', linkedin: 'LinkedIn' }

export const eventTime = (time: number) => new Date(time).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' })
export const eventDuration = (ms: number | null) => ms === null ? '—' : `${(ms / 1000).toFixed(2)} s`
