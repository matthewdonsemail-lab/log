import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { hasStoredDevice, toDeviceProfile } from '../device/index'
import type { DeviceProfile, DeviceRunFile } from '../device/index'
import { homeOf, outsideActiveHours } from '../../marketplace/home/index'
import { checkRunnable, toFacebookCookies } from '../../marketplace/socialAccount/index'
import type { FacebookAccount, PlaywrightCookie, RunPurpose } from '../../marketplace/socialAccount/index'
import { LAUNCH_LIMITS, listLaunches, overLaunchBudget } from './helpers/index'
import type { PrepareRunOptions, PrepareRunResult } from './types'
import { driverNameOf } from '../../browser/driver/client'
import type { BrowserDriverName } from '../../browser/driver/types'

/** Stored localStorage origins (Playwright's `[{ origin, localStorage: [...] }]`), or none. Pure. */
export function toOrigins(raw: unknown): unknown[] {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  return value.filter((o) => !!o && typeof o === 'object' && typeof (o as { origin?: unknown }).origin === 'string')
}

/**
 * Everything a Camoufox run for `account` needs, or why it may not run. The
 * account check comes first (`checkRunnable`, rule 12): no proxy, no home
 * country, a non-Facebook or unusable account means no files and no browser.
 * Then its home (rule 16: a pinned locale and timezone for the country, or
 * refused), its local waking hours (rule 18: `outsideActiveHours`, with the
 * local time and when the window opens; `bypassHours` skips only this) and its stored device (rule 15: one
 * that can't be read is refused, never replaced). `check` only tests the
 * proxy, so it skips home, hours and device. A normal run also needs a saved
 * session; signing in doesn't.
 */
/**
 * `~/.logCli/runs/inspect/20261019T212953_61594063207669/adsPower`: the capture folder is named
 * after the browser that ran (matt, 2026-10-20). Runs from before kept theirs as `firefox`, and
 * every reader takes all three (`CAPTURE_FOLDERS`). Pure.
 */
export function captureDirFor(accountName: string, action: string, now: Date, root?: string, browser: BrowserDriverName = 'camoufox'): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '')
  return join(root ?? (process.env.LOG_RUNS_DIR || join(homedir(), '.logCli', 'runs')), action, `${stamp}_${accountName.replace(/\W/g, '')}`, browser)
}

/** The actions that open through python/browserDriver.py, so they run on the account's browser (rule 44). The rest still launch Camoufox. */
export const OPENER_ACTIONS: ReadonlySet<string> = new Set(['inspect', 'flow', 'warmup', 'host'])

/** Which browser a run of this action uses, so its capture folder can say so. Pure. */
export function runBrowserOf(account: { browserDriver: string | null; adsPowerProfileId: string | null }, action: string): BrowserDriverName {
  return OPENER_ACTIONS.has(action) ? driverNameOf(account) : 'camoufox'
}

export function prepareRun(account: FacebookAccount, purpose: RunPurpose, options: PrepareRunOptions = {}): PrepareRunResult {
  const check = checkRunnable(account, purpose)
  if (!check.ok) return check
  const cookies = toFacebookCookies(account.cookies)
  if (purpose === 'run' && cookies.length === 0) {
    return { ok: false, code: 'neverConnected', detail: `${account.accountName} has no cookies in Twenty. Run: log connect --account ${account.accountName}` }
  }

  let device: DeviceRunFile | null = null
  if (purpose !== 'check') {
    const home = homeOf(account)
    if (!home.ok) return home
    const outside = options.bypassHours ? null : outsideActiveHours(account, home.home.timezone, options.now ?? new Date())
    if (outside) return { ok: false, code: 'outsideActiveHours', detail: outside }
    // Rule 24: how often this account's browser opens on Facebook. --bypass doesn't skip it.
    if (!options.skipLaunchBudget) {
      const limits = options.skipLaunchGap ? { ...LAUNCH_LIMITS, minGapMinutes: 0 } : LAUNCH_LIMITS
      const over = overLaunchBudget(listLaunches(account.accountName, { runs: options.captureRoot }), options.now ?? new Date(), home.home.timezone, limits)
      if (over) return { ok: false, code: over.code, detail: `${account.accountName}: ${over.detail}` }
    }
    const profile = toDeviceProfile(account.deviceProfile)
    if (!profile && hasStoredDevice(account.deviceProfile)) {
      return { ok: false, code: 'deviceProfileInvalid', detail: `${account.accountName}: the stored deviceProfile can't be read` }
    }
    const { locale, facebookLocale, timezone, country, city, coordinates } = home.home
    device = {
      accountName: account.accountName,
      locale,
      languages: [...new Set([locale, locale.split('-')[0]])],
      facebookLocale,
      homeCountry: country,
      homeCity: city,
      homeTimezone: timezone,
      homeCoordinates: coordinates,
      profile
    }
  }

  const dir = mkdtempSync(join(options.root ?? tmpdir(), 'logCliRun'))
  let kept = false
  const proxyPath = join(dir, 'proxy.json')
  const statePath = join(dir, 'state.json')
  const devicePath = join(dir, 'device.json')
  const loginPath = options.login ? join(dir, 'login.json') : null
  const action = options.action ?? purpose
  const captureDir = purpose === 'check' ? null : captureDirFor(account.accountName, action, options.now ?? new Date(), options.captureRoot, runBrowserOf(account, action))
  writeFileSync(proxyPath, JSON.stringify(check.proxy), { mode: 0o600 })
  if (cookies.length) writeFileSync(statePath, JSON.stringify({ cookies, origins: toOrigins(account.storageOrigins) }), { mode: 0o600 })
  if (device) writeFileSync(devicePath, JSON.stringify(device), { mode: 0o600 })
  if (loginPath) writeFileSync(loginPath, JSON.stringify(options.login), { mode: 0o600 })
  return {
    ok: true,
    run: {
      dir,
      proxyPath,
      statePath,
      devicePath: device ? devicePath : null,
      loginPath,
      captureDir,
      hasSession: cookies.length > 0,
      readCookies(): PlaywrightCookie[] {
        if (!existsSync(statePath)) return []
        try {
          return toFacebookCookies((JSON.parse(readFileSync(statePath, 'utf8')) as { cookies?: unknown }).cookies)
        } catch {
          return []
        }
      },
      readStorageState(): { cookies: PlaywrightCookie[]; origins: unknown[] } {
        if (!existsSync(statePath)) return { cookies: [], origins: [] }
        try {
          const state = JSON.parse(readFileSync(statePath, 'utf8')) as { cookies?: unknown; origins?: unknown }
          return { cookies: toFacebookCookies(state.cookies), origins: toOrigins(state.origins) }
        } catch {
          return { cookies: [], origins: [] }
        }
      },
      newDeviceProfile(): DeviceProfile | null {
        if (!device || !existsSync(devicePath)) return null
        try {
          const written = JSON.parse(readFileSync(devicePath, 'utf8')) as Partial<DeviceRunFile>
          return written.created ? toDeviceProfile(written.profile) : null
        } catch {
          return null
        }
      },
      cleanup() {
        if (!kept) rmSync(dir, { recursive: true, force: true })
      },
      keep(): string {
        if (loginPath) rmSync(loginPath, { force: true })
        const stamp = (options.now ?? new Date()).toISOString().replace(/[-:]/g, '').slice(0, 15)
        const target = join(process.env.LOG_UNSAVED_DIR || join(homedir(), '.logCli', 'runs', 'unsaved'), `${stamp}_${account.accountName}`)
        mkdirSync(join(target, '..'), { recursive: true })
        try {
          renameSync(dir, target)
        } catch {
          // Another drive: copy, then remove the original.
          cpSync(dir, target, { recursive: true })
          rmSync(dir, { recursive: true, force: true })
        }
        kept = true
        return target
      }
    }
  }
}
