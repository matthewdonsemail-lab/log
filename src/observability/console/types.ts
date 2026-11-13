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

export type ConsoleEventPage = { schemaVersion: 1; source: 'workspace'; generatedAt: string; events: ConsoleEvent[] }

export type ConsoleDatabase = { prepare: (sql: string) => { all: (...params: (string | number)[]) => unknown[] } }
