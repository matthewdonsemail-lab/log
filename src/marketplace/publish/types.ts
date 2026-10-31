import type { CaptchaAttempt, CaptchaDetection, CaptchaPlan, CaptchaPolicy, CaptchaSolverName, SolverAvailability } from '../../captcha/router/index'
import type { CodedFailure, ErrorCode } from '../../errors/catalog/index'
import type { AccountIssue } from '../account/types'
import type { ConnectOutput, ConnectTiming } from '../connect/types'

export interface PublishListing {
  title: string
  price: number
  category: string
  condition?: string
  description?: string
  location?: string
  postalCode?: string
  photos: string[]
}

export interface PublishInput {
  accountId: string
  listing: PublishListing
  dryRun: boolean
  availability: SolverAvailability
  policy?: CaptchaPolicy
  arkoseToday?: number
  signIn?: PublishSignIn
}

export interface PublishSignIn {
  hasPassword: boolean
  hasTotp: boolean
  timing: ConnectTiming
}

export type StepFailure = CodedFailure

export interface PublishFailure {
  state: string
  code: ErrorCode
  detail?: string
}

export type PreparePhotosOutput = { ok: true; paths: string[]; hashes: string[] } | StepFailure

export type FormOutcome =
  | { kind: 'ready'; url: string }
  | { kind: 'captcha'; detection: CaptchaDetection }
  | { kind: 'issue'; issue: AccountIssue; detail?: string }
  | { kind: 'error'; code: ErrorCode; detail?: string }

export interface SolveOutput {
  solved: boolean
  code?: ErrorCode
  detail?: string
}

export type StepOutput = { ok: true; value?: string } | StepFailure
export type UploadOutput = { ok: true; count: number } | StepFailure
export type FillOutput = { ok: true; filled: Record<string, string> } | StepFailure
export type ReviewOutput = { ok: true; receipt: string | null; photoCount: number } | StepFailure
export type PublishClickOutput = { ok: true; audienceStep: boolean } | StepFailure
export type ConfirmOutput = { ok: true; how: string } | StepFailure
export type CaptureOutput = { listingId: string | null; listingUrl: string | null; review?: string | null; detail?: string }

export type PublishResultKind =
  | 'dryRun'
  | 'published'
  | 'unconfirmedId'
  | 'blocked'
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
  formOpened: boolean
  captcha: CaptchaDetection | null
  plan: CaptchaPlan | null
  captchaAttempts: CaptchaAttempt[]
  filled: Record<string, string>
  receipt: string | null
  publishClicked: boolean
  listingId: string | null
  listingUrl: string | null
  review: string | null
  issue: AccountIssue | null
  failure: PublishFailure | null
  result: PublishResultKind | null
  signInConfig: PublishSignIn | null
  signInTried: boolean
  signIn: ConnectOutput | null
}

export interface PublishOutput {
  accountId: string
  result: PublishResultKind
  listingId: string | null
  listingUrl: string | null
  review: string | null
  issue: AccountIssue | null
  failure: PublishFailure | null
  captchaAttempts: CaptchaAttempt[]
  plan: CaptchaPlan | null
  filled: Record<string, string>
  photoCount: number
  photoHashes: string[]
  receipt: string | null
  signIn: ConnectOutput | null
}

export interface PublishActorInputs {
  preparePhotos: { sources: string[] }
  openForm: { accountId: string; recheck: boolean; location?: string; postalCode?: string; setLocation?: boolean }
  solveCaptcha: { accountId: string; solver: CaptchaSolverName; detection: CaptchaDetection }
  setCategory: { category: string }
  uploadPhotos: { paths: string[] }
  fillFields: { listing: PublishListing }
  review: { listing: PublishListing; photoCount: number }
  publish: Record<string, never>
  confirm: Record<string, never>
  captureId: { title: string }
}
