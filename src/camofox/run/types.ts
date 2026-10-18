/**
 * One run's private files: the account's proxy, its pinned device and home,
 * and its Facebook session, written from Twenty into a fresh temp folder for
 * the Python processes (which only ever get the paths, never credentials on
 * argv), and deleted afterwards.
 */
import type { DeviceProfile } from '../device/index'
import type { ErrorCode } from '../../errors/catalog/index'
import type { PlaywrightCookie } from '../../marketplace/socialAccount/index'

export interface PreparedRun {
  dir: string
  /** `{ server, username, password, country }` for python/proxyGate.py. */
  proxyPath: string
  /** Playwright storage_state. Only written when the account has cookies. */
  statePath: string
  /**
   * `device.json` (`camofox/device` DeviceRunFile): the pinned locale, home
   * timezone and stored device. null for `check`, which opens no browser.
   */
  devicePath: string | null
  hasSession: boolean
  /** The storage_state as the browser left it (after a sign-in). */
  readCookies(): PlaywrightCookie[]
  /** Cookies and localStorage as the browser left them, for saving back to Twenty. */
  readStorageState(): { cookies: PlaywrightCookie[]; origins: unknown[] }
  /** The device Python generated on this account's first launch, to save to Twenty; null otherwise. */
  newDeviceProfile(): DeviceProfile | null
  /** Deletes the folder. Always call it, success or not. */
  cleanup(): void
}

export interface PrepareRunOptions {
  /** Where the temp folder goes (tests). Default: the OS temp dir. */
  root?: string
  /** The clock for the active-hours gate (tests inject it). Default: now. */
  now?: Date
}

export type PrepareRunResult = { ok: true; run: PreparedRun } | { ok: false; code: ErrorCode; detail: string }
