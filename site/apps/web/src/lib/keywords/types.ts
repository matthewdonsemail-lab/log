import type { ConnectionPlatform } from '../connections'
import type { Platform } from '../platform'

/** Canonical platform alias — keywords speak the same union everywhere. */
export type KeywordPlatform = Platform

export type KeywordStatus = 'listening' | 'paused'

export interface Keyword {
  id: string
  phrase: string
  platform: ConnectionPlatform
  status: KeywordStatus
  signalsCount: number
  addedAt: string
  /**
   * The group this keyword listens in. Facebook and reddit keywords are
   * scoped to a joined community through this id; X keywords are free-form
   * (combinable words) and carry no group.
   */
  groupId: string | null
}

export interface KeywordsResponse {
  keywords: Keyword[]
}

export interface KeywordResponse {
  keyword: Keyword
  keywords: Keyword[]
}

export interface CreateKeywordInput {
  phrase: string
  platform: ConnectionPlatform
  groupId: string | null
}