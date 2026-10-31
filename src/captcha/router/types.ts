import { solverDeadCodes } from '../../errors/catalog/index'
import type { CaptchaStopReason, ErrorCode } from '../../errors/catalog/index'

export type CaptchaKind =
  | 'recaptcha'
  | 'arkose'
  | 'textImage'
  | 'facebookChallenge'
  | 'unknown'

export type CaptchaSolverName = 'captchaKraken' | 'twoCaptcha'

export interface CaptchaDetection {
  kind: CaptchaKind
  enterprise?: boolean
  siteKey?: string | null
  frameUrl?: string | null
  detail?: string
}

export interface SolverAvailability {
  captchaKraken: boolean
  twoCaptcha: boolean
}

export interface CaptchaAttempt {
  at: string
  accountId: string
  kind: CaptchaKind
  solver: CaptchaSolverName
  solved: boolean
  accepted: boolean | null
  code?: ErrorCode
  detail?: string
}

export interface CaptchaPolicy {
  krakenAttempts: number
  twoCaptchaAttempts: number
  arkoseDailyCap: number
  maxRounds: number
}

export const DEFAULT_CAPTCHA_POLICY: CaptchaPolicy = {
  krakenAttempts: 2,
  twoCaptchaAttempts: 1,
  arkoseDailyCap: 3,
  maxRounds: 4
}

export const SOLVER_DEAD_CODES: ReadonlySet<ErrorCode> = solverDeadCodes()

export type CaptchaPlan =
  | { solver: CaptchaSolverName; reason: string }
  | {
      solver: null
      reason: CaptchaStopReason
      detail: string
    }
