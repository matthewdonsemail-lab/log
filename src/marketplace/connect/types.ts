/**
 * Signing one Facebook account in (`log facebook connect`), as an XState machine.
 *
 * Facebook's sign-in is not one page: after the password it can show the
 * two-step code page, an "approve on another device" screen, a "trust this
 * device" prompt, or a checkpoint of its own (automated behaviour, confirm
 * your identity, a photo of yourself, a locked account). Each is a page kind
 * the session reads (`python/session/connectSession.py`) and a state here, so the run
 * says which one it is in and what ended it. Every browser step is an actor
 * the caller provides; tests never open a browser.
 */
import type { CaptchaAttempt, CaptchaDetection, CaptchaPlan, CaptchaPolicy, SolverAvailability } from '../../captcha/router/index'
import type { CodedFailure, ErrorCode } from '../../errors/catalog/index'

/** What the browser is showing, as `connectSession.py` `read` classifies it. */
export type ConnectPageKind =
  /** Marketplace without login markers: signed in. */
  | 'loggedIn'
  /** The email/password form (the page's or Marketplace's login dialog). */
  | 'loginForm'
  /** The login form again, saying the password is wrong or the account isn't found. */
  | 'wrongPassword'
  /** "Find your account": submitted once (Listaro), wrong credentials if it comes back. */
  | 'findAccount'
  /** Two-step: the code field is on screen. */
  | 'twoStepCode'
  /** Two-step, waiting on another device ("Check your notifications"), with a way to pick another method. */
  | 'twoStepMethod'
  /** After the code: "Trust this device" / "Save browser". Trusted. */
  | 'trustDevice'
  /** "Save your login info?". Not now. */
  | 'saveLogin'
  /** A remembered profile: "Continue as <name>". Continued. */
  | 'continueAs'
  /** The cookie consent banner. Accepted. */
  | 'cookieBanner'
  /** "We suspect automated behaviour on your account". Dismissed, as Listaro did (rule 23). */
  | 'automatedBehaviour'
  /** "Confirm that you're a real person with a video selfie". Ends the run at once (`videoSelfieRequired`): only a person on camera clears it. */
  | 'videoSelfie'
  /** Facebook's own checkpoint a person has to clear: confirm your identity, a photo, an SMS code. */
  | 'checkpoint'
  /** A captcha on the login page. Solved: CaptchaKraken, then 2Captcha (rule 10), else a person. */
  | 'captcha'
  /** The whole account is disabled, locked or suspended. */
  | 'disabled'
  /** Loading or a page none of the above match: read again. */
  | 'unknown'

export interface ConnectPage {
  kind: ConnectPageKind
  /** The URL without its query (no tokens). */
  path: string
  /** The page's main heading, e.g. "We suspect automated behaviour on your account". */
  heading?: string
  /** Visible button names, so a checkpoint says what it asks. */
  buttons?: string[]
  /** What the captcha is, for the solver (kind `captcha`). */
  captcha?: CaptchaDetection
  /** Start of the page text when signed in, for Listaro's post-login Marketplace check. */
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

/** Inputs of each actor the caller provides. */
export interface ConnectActorInputs {
  open: undefined
  read: undefined
  submitCredentials: { attempt: number }
  chooseAuthApp: undefined
  submitCode: { attempt: number }
  /** Answers a trustDevice, saveLogin, continueAs, cookieBanner, automatedBehaviour or findAccount page. */
  dismiss: { kind: ConnectPageKind }
  solveCaptcha: { solver: 'captchaKraken' | 'twoCaptcha'; detection: CaptchaDetection }
  save: undefined
}

export interface ConnectTiming {
  /** The whole sign-in, a person's part included. `--wait`. */
  deadlineMs: number
  /** Between reads while the page loads or a person works. */
  pollMs: number
  /** One authenticator code per TOTP window. */
  codeWindowMs: number
}

export interface ConnectLimits {
  /** Email/password submissions before it's left to a person. */
  loginTries: number
  /** Authenticator codes (one per window) before it's left to a person. */
  codeTries: number
  /** "Try another way" → "Authentication app" attempts. */
  methodTries: number
  /** Trust-device, save-login, continue-as, cookie, automated-behaviour and find-account answers, all together. */
  dismissTries: number
}

/** Listaro's budgets: 2 logins (fb-login-helper.ts:536), 3 codes, one per window. */
export const DEFAULT_CONNECT_LIMITS: ConnectLimits = { loginTries: 2, codeTries: 3, methodTries: 2, dismissTries: 6 }

export interface ConnectInput {
  accountId: string
  /** Twenty has the email and password (auto-login, rule 21). */
  hasPassword: boolean
  /** Twenty has the totpSecret, so two-step codes can be typed. */
  hasTotp: boolean
  timing: ConnectTiming
  limits?: ConnectLimits
  /** Which captcha solvers have keys (`captcha/router`). */
  availability: SolverAvailability
  policy?: CaptchaPolicy
  /** 2Captcha Arkose solves on this account today (the ledger). */
  arkoseToday?: number
}

export type ConnectResultKind =
  /** Signed in; the session was saved. */
  | 'connected'
  /** Facebook's own checkpoint was still up at the deadline. Account status → checkpoint. */
  | 'checkpointed'
  /** The account is disabled or locked. Account status → banned. */
  | 'disabled'
  /** Facebook said the password is wrong. Auto-login stops; Twenty's password needs fixing. */
  | 'wrongPassword'
  /** Not signed in by the deadline (login or two-step not finished, a captcha nobody took). Status → needsLogin. */
  | 'timedOut'
  /** Facebook wants a video selfie. Ended at once, nothing clicked. Status → checkpoint. */
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
  /** When the machine started (ms), for the deadline. */
  startedAt: number
  page: ConnectPage | null
  /** Every page kind seen, in order, repeats folded. */
  pages: ConnectPageKind[]
  loginTries: number
  codeTries: number
  methodTries: number
  dismissTries: number
  /** "Find your account" was submitted once: seeing it again is wrong credentials. */
  findAccountTried: boolean
  availability: SolverAvailability
  policy: CaptchaPolicy
  arkoseToday: number
  plan: CaptchaPlan | null
  captchaAttempts: CaptchaAttempt[]
  /** The signed-in page's text, for the post-login Marketplace check. */
  bodySample: string | null
  /** The TOTP window the last code was typed in, so one window gets one code. */
  lastCodeWindow: number | null
  /** The checkpoint heading a person was asked to clear. */
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
