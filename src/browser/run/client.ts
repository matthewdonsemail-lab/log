import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { hasStoredDevice, toDeviceProfile } from '../../camofox/device/index'
import type { DeviceProfile, DeviceRunFile } from '../../camofox/device/index'
import { HOME_COUNTRIES, homeOf, outsideActiveHours } from '../../marketplace/home/index'
import type { Home } from '../../marketplace/home/index'
import { siteOfAccount } from '../../cli/runner/helpers/platforms'
import { checkRunnable, toFacebookCookies } from '../../marketplace/socialAccount/index'
import type { FacebookAccount, PlaywrightCookie, RunPurpose } from '../../marketplace/socialAccount/index'
import { LAUNCH_LIMITS, listLaunches, overLaunchBudget } from './helpers/index'
import type { PrepareRunOptions, PrepareRunResult } from './types'
import { driverNameOf } from '../driver/client'
import type { BrowserDriverName } from '../driver/types'

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

export function captureDirFor(accountName: string, action: string, now: Date, root?: string, browser: BrowserDriverName = 'camoufox'): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '')
  return join(root ?? (process.env.LOG_RUNS_DIR || join(homedir(), '.logCli', 'runs')), action, `${stamp}_${accountName.replace(/\W/g, '')}`, browser)
}

export const OPENER_ACTIONS: ReadonlySet<string> = new Set(['inspect', 'flow', 'warmup', 'host'])

export const IN_OPEN_BROWSER: ReadonlySet<string> = new Set(['join', 'read', 'poll', 'check'])

export const CAMOUFOX_ONLY: ReadonlySet<string> = new Set(['doctor', 'connect', 'scan', 'status', 'watch', 'publish', 'profile', 'campaign'])

export function commandBrowser(command: string): 'accountBrowser' | 'camoufoxOnly' | 'none' {
  if (OPENER_ACTIONS.has(command) || IN_OPEN_BROWSER.has(command)) return 'accountBrowser'
  return CAMOUFOX_ONLY.has(command) ? 'camoufoxOnly' : 'none'
}

export function runBrowserOf(account: { browserDriver: string | null; adsPowerProfileId: string | null }, action: string): BrowserDriverName {
  return OPENER_ACTIONS.has(action) ? driverNameOf(account) : 'camoufox'
}

export function directHome(account: FacebookAccount): { ok: true; home: Home } {
  const country = account.homeCountry && HOME_COUNTRIES[account.homeCountry] ? account.homeCountry : 'US'
  const entry = HOME_COUNTRIES[country]
  return { ok: true, home: { country, city: account.homeCity, locale: entry.locale, facebookLocale: entry.facebookLocale, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, coordinates: null } }
}

export function prepareRun(account: FacebookAccount, purpose: RunPurpose, options: PrepareRunOptions = {}): PrepareRunResult {
  const check = checkRunnable(account, purpose)
  if (!check.ok) return check
  const cookies = toFacebookCookies(account.cookies, siteOfAccount(account).domain)
  if (purpose === 'run' && cookies.length === 0) {
    return { ok: false, code: 'neverConnected', detail: `${account.accountName} has no cookies in Twenty. Run: log facebook connect --account ${account.accountName}` }
  }

  let device: DeviceRunFile | null = null
  if (purpose !== 'check') {
    const direct = check.proxy.direct === true
    const known = homeOf(account)
    const home = known.ok || !direct ? known : directHome(account)
    if (!home.ok) return home
    const outside = options.bypassHours ? null : outsideActiveHours(account, home.home.timezone, options.now ?? new Date())
    if (outside) return { ok: false, code: 'outsideActiveHours', detail: outside }
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
          cpSync(dir, target, { recursive: true })
          rmSync(dir, { recursive: true, force: true })
        }
        kept = true
        return target
      }
    }
  }
}
