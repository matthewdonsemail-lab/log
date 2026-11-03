export type RelayStatus = 'connecting' | 'streaming' | 'reconnecting' | 'error'

export interface RelaySession {
  platform: string
  account: string
  pid: number
  hostname: string
  startedAt: string
  lastHeartbeat: string
  status: RelayStatus
  port: number
  token: string
  subscribers: number
}

export interface Relay {
  port: number
  broadcast: (event: Record<string, unknown>) => void
  setStatus: (status: RelayStatus) => void
  subscribers: () => number
  close: () => Promise<void>
}

export interface AttachResult {
  ok: boolean
  reason: string
  events: number
}

export const HEARTBEAT_MS = 5_000
export const STALE_MS = 60_000
