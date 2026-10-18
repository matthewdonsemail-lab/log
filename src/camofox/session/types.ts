/**
 * The contract between log-cli and `python/publishSession.py`: one long-lived
 * Camoufox browser, driven one step at a time over JSON lines (stdin out,
 * stdout back), so the XState publish machine can own every transition.
 */

export type SessionStep =
  | 'open'
  | 'solveCaptcha'
  | 'setCategory'
  | 'uploadPhotos'
  | 'fillFields'
  | 'review'
  | 'publish'
  | 'confirm'
  | 'captureId'
  | 'close'

export interface SessionConfig {
  accountId: string
  storageStatePath: string
  /** Override the create form URL (local fixture runs). */
  formUrl?: string
  /** Where the review screenshot goes. */
  receiptDir?: string
  headless?: boolean
  /** Camoufox geoip (needs `camoufox[geoip]`). Default true. */
  geoip?: boolean
}

export interface SessionRequest {
  id: number
  step: SessionStep
  params?: Record<string, unknown>
}

export interface SessionReply {
  id: number | null
  result: Record<string, unknown>
}

/** A running session. `call` resolves with the step's result object. */
export interface PublishSession {
  call<T = Record<string, unknown>>(step: SessionStep, params?: Record<string, unknown>): Promise<T>
  close(): Promise<void>
}

/** Starts a session. Injectable so tests never launch a browser. */
export type SessionFactory = (config: SessionConfig) => PublishSession
