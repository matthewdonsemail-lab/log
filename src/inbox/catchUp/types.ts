import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec } from '../../platformKit/session/index'

export type PlatformRead = (account: PlatformAccount, spec: PlatformEngineSpec) => PlatformEngineRun

export interface ReadMessage {
  id?: string
  ts?: string
  at?: string
  from?: string | null
  fromMe?: boolean
  text?: string | null
}

export interface CatchUpResult {
  appended: number
  refused?: string
  detail?: string
}

export const READ_GAP_MS: readonly [number, number] = [800, 2500]

export const BEHIND_WAIT_MS = 90_000
