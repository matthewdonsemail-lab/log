import type { GapRow } from '../store/index'
import type { WatcherState } from '../../platformKit/watcher/types.ts'

export type RelayStatus = WatcherState | 'streaming' | 'error'

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
export const STALE_CONFIRM_MS = 10_000
export const HEARTBEAT_RETRIES = 3
export const HEARTBEAT_RETRY_MS = 250
export const MAX_BUFFERED_BYTES = 1_000_000

export type CatchUp = (gap: GapRow) => Promise<{ appended: number; refused?: string; detail?: string }>

export const NETWORK_FAILURE = /could not resolve host|curl: \((6|7|28|35|52|55|56)\)|operation timed out|timed out|timeout|connection (reset|refused|aborted|closed)|failed to connect|network is unreachable|getaddrinfo|econnreset|econnrefused|etimedout|enotfound/i

export const PLATFORM_REFUSAL = /\b(429|226|344)\b|soft.?block|rate.?limit|too many requests|governorBlocked|suspended|locked/i

export const CHAT_ACCESS_REFUSAL = /Missing Access|Missing Permissions|Unknown Channel|\b(?:50001|10003|50013)\b|\b403\b[^:]*\bchannel\b/i

export const OWN_FAILURE = /xSessionHostError|instagramSessionHostError|NameError|is not defined|Traceback|AttributeError|TypeError/
