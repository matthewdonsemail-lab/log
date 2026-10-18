/**
 * Publishing one Marketplace listing, as an XState machine
 * (`docs/listingPublish/stateMachine.md` §4). Every browser step is an actor
 * the caller provides, so tests never open a browser.
 */
import type { CaptchaAttempt, CaptchaDetection, CaptchaPlan, CaptchaPolicy, CaptchaSolverName, SolverAvailability } from '../../captcha/router/index'

export interface PublishListing {
  title: string
  price: number
  /** One of the create form's categories ("Miscellaneous", "Furniture", ...). */
  category: string
  /** Form label, e.g. "New", "Used – like new", "Used – good", "Used – fair". */
  condition?: string
  description?: string
  location?: string
  /** Path, URL or data-URL per photo, cover first. */
  photos: string[]
}

export interface PublishInput {
  accountId: string
  listing: PublishListing
  /** Stop at `reviewing`: everything filled, nothing published. */
  dryRun: boolean
  availability: SolverAvailability
  policy?: CaptchaPolicy
  /** 2Captcha Arkose attempts on this account today (from the ledger). */
  arkoseToday?: number
}

/** Account-level problems the form shows. They stop the run and go to the account. */
export type PublishIssue = 'noSession' | 'sessionExpired' | 'checkpoint' | 'limitReached' | 'marketplaceBlocked'

export interface StepFailure {
  ok: false
  code: string
  detail?: string
}

export type PreparePhotosOutput = { ok: true; paths: string[]; hashes: string[] } | StepFailure

/** What the page shows after opening (or re-checking) the form. */
export type FormOutcome =
  | { kind: 'ready'; url: string }
  | { kind: 'captcha'; detection: CaptchaDetection }
  | { kind: 'issue'; issue: PublishIssue; detail?: string }
  | { kind: 'error'; code: string; detail?: string }

export interface SolveOutput {
  solved: boolean
  code?: string
  detail?: string
}

export type StepOutput = { ok: true; value?: string } | StepFailure
export type UploadOutput = { ok: true; count: number } | StepFailure
export type FillOutput = { ok: true; filled: Record<string, string> } | StepFailure
export type ReviewOutput = { ok: true; receipt: string | null; photoCount: number } | StepFailure
export type PublishClickOutput = { ok: true; audienceStep: boolean } | StepFailure
export type ConfirmOutput = { ok: true; how: string } | StepFailure
export type CaptureOutput = { listingId: string | null; listingUrl: string | null; detail?: string }

export type PublishResultKind =
  /** Filled and reviewed, nothing published (`--live` not set). */
  | 'dryRun'
  /** Published and its listing id read off the matching card. */
  | 'published'
  /** Publish went through but the id wasn't found. Never retried: check by hand. */
  | 'unconfirmedId'
  /** The account has a problem (session, checkpoint, limit). */
  | 'blocked'
  /** A captcha no solver could take, or solvers ran out. */
  | 'needsPerson'
  | 'failed'

export interface PublishContext {
  accountId: string
  listing: PublishListing
  dryRun: boolean
  availability: SolverAvailability
  policy: CaptchaPolicy
  arkoseToday: number
  photoPaths: string[]
  photoHashes: string[]
  photoCount: number
  /** True once the form has been opened, so a re-check never re-navigates. */
  formOpened: boolean
  captcha: CaptchaDetection | null
  plan: CaptchaPlan | null
  captchaAttempts: CaptchaAttempt[]
  filled: Record<string, string>
  receipt: string | null
  /** Set once Publish is clicked. From here on nothing is retried. */
  publishClicked: boolean
  listingId: string | null
  listingUrl: string | null
  issue: PublishIssue | null
  failure: { state: string; code: string; detail?: string } | null
  result: PublishResultKind | null
}

export interface PublishOutput {
  accountId: string
  result: PublishResultKind
  listingId: string | null
  listingUrl: string | null
  issue: PublishIssue | null
  failure: PublishContext['failure']
  captchaAttempts: CaptchaAttempt[]
  plan: CaptchaPlan | null
  filled: Record<string, string>
  photoCount: number
  photoHashes: string[]
  receipt: string | null
}

/** Inputs of each actor the caller provides. */
export interface PublishActorInputs {
  preparePhotos: { sources: string[] }
  openForm: { accountId: string; recheck: boolean }
  solveCaptcha: { accountId: string; solver: CaptchaSolverName; detection: CaptchaDetection }
  setCategory: { category: string }
  uploadPhotos: { paths: string[] }
  fillFields: { listing: PublishListing }
  review: { listing: PublishListing; photoCount: number }
  publish: Record<string, never>
  confirm: Record<string, never>
  captureId: { title: string }
}
