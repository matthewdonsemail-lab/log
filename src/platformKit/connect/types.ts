import type { CaptchaAttempt, CaptchaDetection, CaptchaPlan, CaptchaPolicy, SolverAvailability } from '../../captcha/router/index'
import type { CodedFailure, ErrorCode } from '../../errors/catalog/index'

export type ConnectPageKind =
  | 'loggedIn'
  | 'loginForm'
  | 'wrongPassword'
  | 'findAccount'
  | 'twoStepCode'
  | 'twoStepMethod'
  | 'trustDevice'
  | 'saveLogin'
  | 'continueAs'
  | 'cookieBanner'
  | 'automatedBehaviour'
  | 'videoSelfie'
  | 'checkpoint'
  | 'captcha'
  | 'disabled'
  | 'unknown'

export interface ConnectPage {
  kind: ConnectPageKind
  path: string
  heading?: string
  buttons?: string[]
  captcha?: CaptchaDetection
  bodySample?: string
}

export type ReadOutput = ({ ok: true } & ConnectPage) | CodedFailure
export type ActOutput = { ok: true; path?: string } | CodedFailure
export type SaveOutput = { ok: true; loggedIn: boolean; bodySample?: string } | CodedFailure
export interface SolveOutput {
  solved: boolean
  code?: ErrorCode
  detail?: string
}

export interface ConnectActorInputs {
  open: undefined
  read: undefined
  submitCredentials: { attempt: number }
  chooseAuthApp: undefined
  submitCode: { attempt: number }
  dismiss: { kind: ConnectPageKind }
  solveCaptcha: { solver: 'captchaKraken' | 'twoCaptcha'; detection: CaptchaDetection }
  save: undefined
}

export interface ConnectTiming {
  deadlineMs: number
  pollMs: number
  codeWindowMs: number
}

export interface ConnectLimits {
  loginTries: number
  codeTries: number
  methodTries: number
  dismissTries: number
}

export const DEFAULT_CONNECT_LIMITS: ConnectLimits = { loginTries: 2, codeTries: 3, methodTries: 2, dismissTries: 6 }

export interface ConnectInput {
  accountId: string
  hasPassword: boolean
  hasTotp: boolean
  timing: ConnectTiming
  limits?: ConnectLimits
  availability: SolverAvailability
  policy?: CaptchaPolicy
  arkoseToday?: number
}

export type ConnectResultKind =
  | 'connected'
  | 'checkpointed'
  | 'disabled'
  | 'wrongPassword'
  | 'timedOut'
  | 'videoSelfie'
  | 'failed'

export interface ConnectFailure {
  state: string
  code: ErrorCode
  detail?: string
}

export interface ConnectContext {
  accountId: string
  hasPassword: boolean
  hasTotp: boolean
  timing: ConnectTiming
  limits: ConnectLimits
  startedAt: number
  page: ConnectPage | null
  pages: ConnectPageKind[]
  loginTries: number
  codeTries: number
  methodTries: number
  dismissTries: number
  findAccountTried: boolean
  availability: SolverAvailability
  policy: CaptchaPolicy
  arkoseToday: number
  plan: CaptchaPlan | null
  captchaAttempts: CaptchaAttempt[]
  bodySample: string | null
  lastCodeWindow: number | null
  checkpoint: string | null
  failure: ConnectFailure | null
  result: ConnectResultKind | null
  loggedIn: boolean
}

export interface ConnectOutput {
  accountId: string
  result: ConnectResultKind
  loggedIn: boolean
  page: ConnectPage | null
  pages: ConnectPageKind[]
  checkpoint: string | null
  failure: ConnectFailure | null
  loginTries: number
  codeTries: number
  captchaAttempts: CaptchaAttempt[]
  bodySample: string | null
}
