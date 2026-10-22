import type { CodeOfLayer } from '../../errors/catalog/index'

export type AccountIssue = CodeOfLayer<'account'>

export interface RawSignal {
  status?: number
  code?: number
  subcode?: number
  type?: string
  marker?: string
  url?: string
}

export interface ConnectionRecord {
  id: string
  platform: 'facebook'
  label: string
  connectedAt: string | null
  lastIssue?: AccountIssue | null
  rawSignal?: RawSignal | null
  lastCheckedAt?: string | null
  retryAfter?: number | null
}

