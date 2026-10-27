import type { TwitterEngineSpec } from '../../account/session/index'

export type SendAction = 'reply' | 'quote' | 'like' | 'dm'

export interface SendRequest {
  action: SendAction
  tweetUrl?: string
  userId?: string
  text?: string
  approvedBy?: string
  skipStyleCheck?: boolean
  style?: string | null
  live: boolean
}

export type SendProblemCode = 'targetMissing' | 'tweetUrlInvalid' | 'userIdInvalid' | 'textMissing' | 'notApproved' | 'styleFailed'

export interface SendProblem {
  code: SendProblemCode
  detail: string
}

export type SendPlan = { ok: true; spec: TwitterEngineSpec; target: string } | { ok: false; problem: SendProblem }
