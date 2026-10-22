import type { LoginSecrets } from '../../twenty/graphql/index'
import type { DeviceProfile } from '../../camofox/device/index'
import type { ErrorCode } from '../../errors/catalog/index'
import type { PlaywrightCookie } from '../../marketplace/socialAccount/index'

export interface PreparedRun {
  dir: string
  proxyPath: string
  statePath: string
  devicePath: string | null
  loginPath: string | null
  captureDir: string | null
  hasSession: boolean
  readCookies(): PlaywrightCookie[]
  readStorageState(): { cookies: PlaywrightCookie[]; origins: unknown[] }
  newDeviceProfile(): DeviceProfile | null
  cleanup(): void
  keep(): string
}

export interface PrepareRunOptions {
  root?: string
  now?: Date
  bypassHours?: boolean
  skipLaunchGap?: boolean
  login?: LoginSecrets | null
  action?: string
  captureRoot?: string
  skipLaunchBudget?: boolean
}

export type PrepareRunResult = { ok: true; run: PreparedRun } | { ok: false; code: ErrorCode; detail: string }
