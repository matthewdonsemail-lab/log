import type { WatermarkReading } from '../../copy/watermark/types'
import type { TwitterEngineSpec } from '../../account/session/index'

export type SendAction = 'reply' | 'quote' | 'like' | 'repost' | 'dm' | 'follow' | 'post'

export interface SendRequest {
  action: SendAction
  tweetUrl?: string
  userId?: string
  text?: string
  media?: string[]
  approvedBy?: string
  skipStyleCheck?: boolean
  style?: string | null
  live: boolean
}

export type SendProblemCode = 'targetMissing' | 'tweetUrlInvalid' | 'userIdInvalid' | 'textMissing' | 'notApproved' | 'styleFailed' | 'mediaInvalid' | 'aiArtifacts'

export interface SendProblem {
  code: SendProblemCode
  detail: string
}

export type SendPlan = { ok: true; spec: TwitterEngineSpec; target: string; watermark?: WatermarkReading } | { ok: false; problem: SendProblem }
