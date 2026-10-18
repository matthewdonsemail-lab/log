/**
 * One run's private files: the account's proxy and its Facebook session,
 * written from Twenty into a fresh temp folder for the Python processes (which
 * only ever get the paths, never credentials on argv), and deleted afterwards.
 */
import type { ErrorCode } from '../../errors/catalog/index'
import type { PlaywrightCookie } from '../../marketplace/socialAccount/index'

export interface PreparedRun {
  dir: string
  /** `{ server, username, password, country }` for python/proxyGate.py. */
  proxyPath: string
  /** Playwright storage_state. Only written when the account has cookies. */
  statePath: string
  hasSession: boolean
  /** The storage_state as the browser left it (after a sign-in). */
  readCookies(): PlaywrightCookie[]
  /** Deletes the folder. Always call it, success or not. */
  cleanup(): void
}

export type PrepareRunResult = { ok: true; run: PreparedRun } | { ok: false; code: ErrorCode; detail: string }
