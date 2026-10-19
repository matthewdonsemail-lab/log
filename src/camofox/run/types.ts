/**
 * One run's private files: the account's proxy, its pinned device and home,
 * and its Facebook session, written from Twenty into a fresh temp folder for
 * the Python processes (which only ever get the paths, never credentials on
 * argv), and deleted afterwards.
 */
import type { LoginSecrets } from '../../twenty/graphql/index'
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
  /** The sign-in details for auto-login, or null when none were given. */
  loginPath: string | null
  /**
   * Where this run's raw HAR and step timeline go (rule 22), kept after the
   * run: `<captureRoot>/<action>/<time>_<account>/firefox`. Null for a proxy
   * check, which opens no browser. Python creates it.
   */
  captureDir: string | null
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
  /** `--bypass`: skip the waking-hours gate (rule 18) only. The proxy, home, device and self-check gates still run. */
  bypassHours?: boolean
  /** `connect`'s auto-login: written to `login.json` in the run folder (0600) and deleted with it. */
  login?: LoginSecrets | null
  /** The command, for the capture folder name (`connect`, `scan`...). Default: the purpose. */
  action?: string
  /** Where captures go. Default `LOG_RUNS_DIR` or `~/.logCli/runs`. */
  captureRoot?: string
  /** A run that never reaches Facebook (publish against the saved fixture form): not counted against rule 24. */
  skipLaunchBudget?: boolean
}

export type PrepareRunResult = { ok: true; run: PreparedRun } | { ok: false; code: ErrorCode; detail: string }
