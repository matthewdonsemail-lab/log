export interface GovernorState {
  day?: string
  hour_bucket?: string
  hour_count?: number
  day_count?: number
  mutation_count?: number
  last_request_ts?: number
  last_mutation_ts?: number
  cooldown_until?: number
  soft_blocks_seen?: number
}

export interface GovernorCount {
  platform: string
  account: string
  day: string | null
  requests: number
  writes: number
  hourRequests: number
  cooldownSeconds: number
  path: string
}

export interface GovernorResetResult {
  platform: string
  account: string
  before: GovernorCount
  after: GovernorCount
  ledgerSeq: number
  cooldownKept: boolean
}

export interface GovernorResetRequest {
  platform: string
  account: string
  by: string
  reason?: string
}

export const GOVERNOR_FILE = 'governor_state.json'
