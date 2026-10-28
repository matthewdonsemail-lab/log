import { join } from 'node:path'
import { findPlatformAccount, platformGate, recordPlatformSession, runPlatformEngine } from '../../../platformKit/session/index'
import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec, PlatformGate, PlatformShape } from '../../../platformKit/session/index'
import type { TwentyClient } from '../../../twenty/graphql/index'

export const DISCORD_PLATFORM: PlatformShape = {
  platform: 'discord',
  twentyPlatform: 'DISCORD',
  label: 'Discord',
  engine: join(import.meta.dir, '..', '..', '..', '..', 'python', 'discordApi', 'engine.py'),
  sessionCookies: []
}

export const DISCORD_COOKIE_DOMAIN = '.discord.com'

export function findDiscordAccount(twenty: TwentyClient, ref: string): Promise<PlatformAccount> {
  return findPlatformAccount(twenty, DISCORD_PLATFORM, ref)
}

export function discordGate(account: PlatformAccount): PlatformGate {
  return platformGate(account, DISCORD_PLATFORM)
}

export function runDiscordEngine(account: PlatformAccount, spec: PlatformEngineSpec): PlatformEngineRun {
  return runPlatformEngine(DISCORD_PLATFORM, account, spec)
}

export function recordDiscordSession(twenty: TwentyClient, account: PlatformAccount, run: PlatformEngineRun, now: Date): Promise<string[]> {
  return recordPlatformSession(twenty, DISCORD_PLATFORM, account, run, now, DISCORD_COOKIE_DOMAIN)
}
