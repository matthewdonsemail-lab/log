import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { hasStoredDevice, toDeviceProfile } from '../device/index'
import type { DeviceProfile, DeviceRunFile } from '../device/index'
import { homeOf, outsideActiveHours } from '../../marketplace/home/index'
import { checkRunnable, toFacebookCookies } from '../../marketplace/socialAccount/index'
import type { FacebookAccount, PlaywrightCookie, RunPurpose } from '../../marketplace/socialAccount/index'
import type { PrepareRunOptions, PrepareRunResult } from './types'

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
/** `~/.logCli/runs/connect/20261019T072812_61594387282311/firefox`. Pure. */
export function captureDirFor(accountName: string, action: string, now: Date, root?: string): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '')
  return join(root ?? (process.env.LOG_RUNS_DIR || join(homedir(), '.logCli', 'runs')), action, `${stamp}_${accountName.replace(/\W/g, '')}`, 'firefox')
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
  const proxyPath = join(dir, 'proxy.json')
  const statePath = join(dir, 'state.json')
  const devicePath = join(dir, 'device.json')
  const loginPath = options.login ? join(dir, 'login.json') : null
  const captureDir = purpose === 'check' ? null : captureDirFor(account.accountName, options.action ?? purpose, options.now ?? new Date(), options.captureRoot)
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
        rmSync(dir, { recursive: true, force: true })
      }
    }
  }
}
