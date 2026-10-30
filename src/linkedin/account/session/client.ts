import { join } from 'node:path'
import { findPlatformAccount, platformGate, recordPlatformSession, runPlatformEngine } from '../../../platformKit/session/index'
import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec, PlatformGate, PlatformShape } from '../../../platformKit/session/index'
import type { TwentyClient } from '../../../twenty/graphql/index'

export const LINKEDIN_PLATFORM: PlatformShape = {
  platform: 'linkedin',
  twentyPlatform: 'LINKEDIN',
  label: 'LinkedIn',
  engine: join(import.meta.dir, '..', '..', '..', '..', 'python', 'linkedinApi', 'engine.py'),
  sessionCookies: ['li_at', 'JSESSIONID']
}

export const LINKEDIN_COOKIE_DOMAIN = '.linkedin.com'

export function findLinkedinAccount(twenty: TwentyClient, ref: string): Promise<PlatformAccount> {
  return findPlatformAccount(twenty, LINKEDIN_PLATFORM, ref)
}

export function linkedinGate(account: PlatformAccount): PlatformGate {
  return platformGate(account, LINKEDIN_PLATFORM)
}

export function runLinkedinEngine(account: PlatformAccount, spec: PlatformEngineSpec): PlatformEngineRun {
  return runPlatformEngine(LINKEDIN_PLATFORM, account, spec)
}

export function recordLinkedinSession(twenty: TwentyClient, account: PlatformAccount, run: PlatformEngineRun, now: Date): Promise<string[]> {
  return recordPlatformSession(twenty, LINKEDIN_PLATFORM, account, run, now, LINKEDIN_COOKIE_DOMAIN)
}
