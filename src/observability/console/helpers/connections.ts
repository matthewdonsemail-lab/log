import { fromTwentyEnum } from '../../../marketplace/socialAccount/helpers/twentyEnum'
import { vendorOfProxy } from '../../../proxyVendor/vendor/helpers/vendorOfProxy'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { readLocalAccountRows } from '../../../twenty/graphql/helpers/localAccountRows'
import { subqKey } from '../../../subq/decisions/helpers/credentials'
import { memelordKey } from '../../../extensions/memelord/client'
import { envValue } from '../../../extensions/voiceClone/helpers/provider'
import { credentialFields, savedCredential } from '../../../auth/credentials'

const platforms = ['twitter', 'facebook', 'discord', 'slack', 'instagram', 'reddit', 'linkedin'] as const
type Platform = typeof platforms[number]
const accountStatuses = ['active', 'warming', 'limited', 'paused', 'needsLogin', 'checkpoint', 'restricted', 'banned', 'dead', 'deactivated'] as const
type AccountStatus = typeof accountStatuses[number]
type LocalAccount = { id: string; name: string; homeCountry: string | null; proxyProvider: 'twoCaptcha' | 'byteful' | 'unknown' | null; platform: Platform; status: AccountStatus | 'unknown'; statusReason: string | null; state: string; checkedAt: string | null }
const states = new Set(['loggedIn', 'loggedOut', 'restricted', 'checkpoint', 'unknown', 'shadowSuspect', 'accountWarning'])

function json(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) return null
  const value = JSON.parse(readFileSync(path, 'utf8'))
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null
}

export function readConsoleConnections(env: Record<string, string | undefined> = process.env, home = homedir()) {
  const accounts = new Map<string, LocalAccount>()
  function add(platform: Platform, name: string, state: unknown, checkedAt: unknown, status?: unknown, homeCountry?: unknown, proxy?: unknown, statusReason?: unknown) {
    const key = `${platform}:${name.replace(/^@/, '').toLowerCase()}`
    const date = typeof checkedAt === 'string' && Number.isFinite(Date.parse(checkedAt)) ? checkedAt : null
    accounts.set(key, { id: createHash('sha256').update(key).digest('hex').slice(0, 24), name, platform, proxyProvider: typeof proxy === 'string' && proxy.trim() ? vendorOfProxy(proxy)?.vendor ?? 'unknown' : accounts.get(key)?.proxyProvider ?? null, homeCountry: typeof homeCountry === 'string' && /^[A-Za-z]{2}$/.test(homeCountry.trim()) ? homeCountry.trim().toUpperCase() : accounts.get(key)?.homeCountry ?? null, status: accountStatuses.includes(status as AccountStatus) ? status as AccountStatus : accounts.get(key)?.status ?? 'unknown', statusReason: typeof statusReason === 'string' && /^[a-zA-Z]{1,100}$/.test(statusReason) ? statusReason : accounts.get(key)?.statusReason ?? null, state: typeof state === 'string' && states.has(state) ? state : 'unknown', checkedAt: date })
  }
  const rows = readLocalAccountRows(env.LOG_LOCAL_ACCOUNTS || join(home, '.logCli', 'localAccounts.json'))
  for (const row of rows) {
    const source = String(row.platform ?? '').toLowerCase()
    const platform = source === 'x' ? 'twitter' : source
    const name = typeof row.accountName === 'string' ? row.accountName : typeof row.name === 'string' ? row.name : ''
    if (name && platforms.includes(platform as Platform)) add(platform as Platform, name, row.sessionState, row.sessionCheckedAt, typeof row.accountStatus === 'string' && row.accountStatus ? fromTwentyEnum(row.accountStatus) : row.status, row.homeCountry, row.proxy, row.statusReason)
  }
  for (const platform of platforms) {
    const root = platform === 'facebook' ? env.LOG_FBK_STATE || join(home, '.logCli', 'fbk') : platform === 'twitter' ? env.LOG_TWITTER_STATE || join(home, '.logCli', 'twitter') : join(env.LOG_PLATFORM_STATE || join(home, '.logCli'), platform)
    if (!existsSync(root)) continue
    for (const directory of readdirSync(root, { withFileTypes: true })) {
      if (!directory.isDirectory() || directory.isSymbolicLink()) continue
      const session = json(join(root, directory.name, 'session.json'))
      if (session) add(platform, directory.name, session.sessionState, session.checkedAt)
    }
  }
  const treg = () => Boolean(envValue('TREG_TOKEN', env, home) || json(join(home, '.treg', 'config.json'))?.token)
  const checks: [string, () => boolean][] = [
    ['adsPower', () => Boolean(envValue('ADSPOWER_HOST', env, home) || envValue('ADSPOWER_API_KEY', env, home))],
    ['typesafe', () => Boolean(envValue('JEV_API_KEY', env, home) || envValue('TYPESAFE_API_KEY', env, home))],
    ['subq', () => Boolean(subqKey(env, join(home, '.config', 'listeningkit', 'subq-api-key.txt')) || envValue('SUBQ_API_KEY', env, home))],
    ['memelord', () => Boolean(memelordKey(env, home))],
    ['fishAudio', () => Boolean(envValue('FISH_API_KEY', env, home))],
    ['inworld', () => Boolean(envValue('INWORLD_API_KEY', env, home))],
    ['treg', treg],
    ['jina', () => Boolean(envValue('JINA_API_KEY', env, home))],
    ['assemblyAi', () => Boolean(envValue('ASSEMBLYAI_API_KEY', env, home) || envValue('ASSEMBLY_AI_KEY', env, home))],
    ['parallel', () => Boolean(envValue('PARALLEL_API_KEY', env, home))],
    ['twoCaptcha', () => Boolean(envValue('2CAPTCHA_API_KEY', env, home) || envValue('TWOCAPTCHA_API_KEY', env, home))],
    ['byteful', () => Boolean(envValue('BYTEFUL_PUBLIC_KEY', env, home) && envValue('BYTEFUL_PRIVATE_KEY', env, home))],
  ]
  const extensions = checks.map(([key, check]) => {
    try {
      const configured = check()
      return { key, state: configured ? 'configured' as const : 'notConfigured' as const, fields: credentialFields[key].map((field) => ({ ...field, hasValue: credentialFields[key].length === 1 ? configured : Boolean(envValue(field.id, env, home)), masked: (credentialFields[key].length === 1 ? configured : Boolean(envValue(field.id, env, home))) ? '••••••••••••••••' : null })), persisted: credentialFields[key].some((field) => Boolean(savedCredential(field.id, env))) }
    }
    catch { return { key, state: 'unavailable' as const, fields: credentialFields[key].map((field) => ({ ...field, hasValue: false, masked: null })), persisted: false } }
  })
  return { schemaVersion: 1 as const, source: 'workspace' as const, mode: 'local' as const, generatedAt: new Date().toISOString(), accounts: [...accounts.values()].sort((left, right) => left.platform.localeCompare(right.platform) || left.name.localeCompare(right.name)), extensions }
}

export function readConsoleCredentials(provider: string, env: Record<string, string | undefined> = process.env, home = homedir()): Record<string, string> {
  if (!Object.prototype.hasOwnProperty.call(credentialFields, provider)) throw new Error('credentialInputInvalid')
  const values = Object.fromEntries(credentialFields[provider].map((field) => [field.id, envValue(field.id, env, home) ?? '']))
  if (provider === 'adsPower') { values.ADSPOWER_HOST ||= 'http://local.adspower.net:50325'; values.LOG_ADSPOWER_HOMES ||= 'all' }
  if (provider === 'typesafe') values.JEV_API_KEY ||= envValue('TYPESAFE_API_KEY', env, home) ?? ''
  if (provider === 'subq') values.SUBQ_API_KEY = subqKey(env, join(home, '.config', 'listeningkit', 'subq-api-key.txt')) ?? values.SUBQ_API_KEY
  if (provider === 'memelord') values.MEMELORD_API_KEY = memelordKey(env, home) ?? values.MEMELORD_API_KEY
  if (provider === 'assemblyAi') values.ASSEMBLYAI_API_KEY ||= envValue('ASSEMBLY_AI_KEY', env, home) ?? ''
  if (provider === 'twoCaptcha') values.TWOCAPTCHA_API_KEY ||= envValue('2CAPTCHA_API_KEY', env, home) ?? ''
  if (provider === 'treg') values.TREG_TOKEN ||= String(json(join(home, '.treg', 'config.json'))?.token ?? '')
  return values
}
