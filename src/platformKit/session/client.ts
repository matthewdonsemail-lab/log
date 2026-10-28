import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { platformStateRoot, writeLocalSession } from '../../directApi/engine/index'
import { SOCIAL_ACCOUNTS, toFacebookAccount } from '../../marketplace/socialAccount/index'
import type { FacebookAccount, SocialAccountRow } from '../../marketplace/socialAccount/index'
import { TwentyError } from '../../twenty/graphql/index'
import type { TwentyClient } from '../../twenty/graphql/index'
import type { PlatformAnswer, PlatformEngineRun, PlatformEngineSpec, PlatformGate, PlatformShape } from './types'

export type PlatformAccount = FacebookAccount

export async function findPlatformAccount(twenty: TwentyClient, shape: PlatformShape, ref: string): Promise<PlatformAccount> {
  const key = ref.trim().replace(/^@/, '')
  const named = (await twenty.list(SOCIAL_ACCOUNTS, { accountName: { eq: key } })).filter((r) => String(r.platform) === shape.twentyPlatform)
  const rows = named.length ? named : (await twenty.list(SOCIAL_ACCOUNTS, { name: { eq: key } })).filter((r) => String(r.platform) === shape.twentyPlatform && !r.accountName?.trim())
  if (rows.length === 0) throw new TwentyError('accountNotFound', `no ${shape.twentyPlatform} socialAccount "${key}"`)
  if (rows.length > 1) throw new TwentyError('accountNotFound', `${rows.length} ${shape.twentyPlatform} socialAccounts are called "${key}"`)
  return toFacebookAccount(rows[0] as SocialAccountRow)
}

export function sessionCookiesOf(raw: unknown): Record<string, string> {
  if (typeof raw === 'string') {
    const text = raw.trim()
    if (text.startsWith('[') || text.startsWith('{')) {
      try {
        return sessionCookiesOf(JSON.parse(text))
      } catch {
        return {}
      }
    }
    return Object.fromEntries(text.split(/;\s*/).filter((p) => p.includes('=')).map((p) => [p.slice(0, p.indexOf('=')).trim(), p.slice(p.indexOf('=') + 1).trim()]))
  }
  if (Array.isArray(raw)) {
    const out: Record<string, string> = {}
    for (const item of raw) if (item && typeof item === 'object' && 'name' in item) out[String((item as { name: unknown }).name)] = String((item as { value?: unknown }).value ?? '')
    return out
  }
  if (raw && typeof raw === 'object') return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v)]))
  return {}
}

export function sessionStorageOf(origins: unknown, wanted: PlatformShape['sessionStorage']): Record<string, string> {
  if (!wanted || !Array.isArray(origins)) return {}
  const origin = origins.find((o) => o && typeof o === 'object' && (o as { origin?: unknown }).origin === wanted.origin) as { localStorage?: unknown } | undefined
  const out: Record<string, string> = {}
  for (const item of Array.isArray(origin?.localStorage) ? origin!.localStorage : []) {
    const { name, value } = item as { name?: unknown; value?: unknown }
    if (typeof name !== 'string' || typeof value !== 'string' || !wanted.keys.includes(name)) continue
    let text = value
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'string') text = parsed
    } catch {}
    if (text) out[name] = text
  }
  return out
}

export function platformGate(account: PlatformAccount, shape: PlatformShape): PlatformGate {
  if (String(account.platform) !== shape.twentyPlatform) return { ok: false, code: 'accountNotOnPlatform', detail: `${account.accountName} is ${account.platform ?? 'no platform'}, not ${shape.twentyPlatform}` }
  if (account.status === 'deactivated') return { ok: false, code: 'accountDeactivated', detail: `${account.accountName} is deactivated` }
  const cookies = sessionCookiesOf(account.cookies)
  const missing = shape.sessionCookies.filter((name) => !cookies[name])
  if (shape.sessionStorage) {
    const stored = sessionStorageOf(account.storageOrigins, shape.sessionStorage)
    const absent = shape.sessionStorage.keys.filter((key) => !stored[key])
    if (missing.length || absent.length) return { ok: false, code: 'noPlatformSession', detail: `${account.accountName} has no saved ${[...missing, ...absent.map((k) => `${shape.sessionStorage!.origin} localStorage ${k}`)].join(' + ')} in Twenty` }
    return { ok: true }
  }
  if (missing.length || Object.keys(cookies).length === 0) return { ok: false, code: 'noPlatformSession', detail: `${account.accountName} has no saved ${missing.length ? missing.join(' + ') : 'cookies'} in Twenty` }
  return { ok: true }
}

export function mergeCookieShape(raw: unknown, refreshed: Record<string, string>, domain: string): unknown {
  if (Array.isArray(raw)) {
    const seen = new Set<string>()
    const merged = raw.map((item) => {
      const name = item && typeof item === 'object' ? String((item as { name?: unknown }).name ?? '') : ''
      if (name in refreshed) {
        seen.add(name)
        return { ...(item as object), value: refreshed[name] }
      }
      return item
    })
    for (const [name, value] of Object.entries(refreshed)) if (!seen.has(name)) merged.push({ name, value, domain, path: '/' })
    return merged
  }
  const base = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return { ...base, ...refreshed }
}

export function runPlatformEngine(shape: PlatformShape, account: PlatformAccount, request: PlatformEngineSpec): PlatformEngineRun {
  const dir = mkdtempSync(join(tmpdir(), `${shape.platform}Api`))
  try {
    const cookiesPath = join(dir, 'cookies.json')
    const refreshedPath = join(dir, 'refreshed.json')
    writeFileSync(cookiesPath, JSON.stringify(account.cookies ?? {}), { mode: 0o600 })
    const storagePath = shape.sessionStorage ? join(dir, 'storage.json') : null
    if (storagePath) writeFileSync(storagePath, JSON.stringify(sessionStorageOf(account.storageOrigins, shape.sessionStorage)), { mode: 0o600 })
    const spec = join(dir, 'spec.json')
    writeFileSync(spec, JSON.stringify({ ...request, account: account.accountName, platform: shape.platform, stateRoot: platformStateRoot(shape.platform), cookiesPath, refreshedPath, ...(storagePath ? { storagePath } : {}) }), { mode: 0o600 })
    const run = spawnSync(process.env.LOG_PYTHON || 'python', [shape.engine, spec], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', request.streamProgress ? 'inherit' : 'pipe'] })
    const line = (run.stdout || '').trim().split('\n').filter(Boolean).pop() || ''
    let answer: PlatformAnswer
    try {
      answer = JSON.parse(line) as PlatformAnswer
    } catch {
      answer = { ok: false, code: 'engineNoAnswer', detail: (run.stderr || 'no output').slice(-300) }
    }
    const refreshed = existsSync(refreshedPath) ? (JSON.parse(readFileSync(refreshedPath, 'utf8')) as Record<string, string>) : null
    return { answer, refreshed }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

export function runPlatformEngineLive(shape: PlatformShape, account: PlatformAccount, request: PlatformEngineSpec, onLive: (event: Record<string, unknown>) => void): Promise<PlatformEngineRun> {
  const dir = mkdtempSync(join(tmpdir(), `${shape.platform}Api`))
  const cookiesPath = join(dir, 'cookies.json')
  const refreshedPath = join(dir, 'refreshed.json')
  writeFileSync(cookiesPath, JSON.stringify(account.cookies ?? {}), { mode: 0o600 })
  const storagePath = shape.sessionStorage ? join(dir, 'storage.json') : null
  if (storagePath) writeFileSync(storagePath, JSON.stringify(sessionStorageOf(account.storageOrigins, shape.sessionStorage)), { mode: 0o600 })
  const spec = join(dir, 'spec.json')
  writeFileSync(spec, JSON.stringify({ ...request, account: account.accountName, platform: shape.platform, stateRoot: platformStateRoot(shape.platform), cookiesPath, refreshedPath, ...(storagePath ? { storagePath } : {}) }), { mode: 0o600 })
  return new Promise((resolve) => {
    const child = spawn(process.env.LOG_PYTHON || 'python', ['-u', shape.engine, spec], { windowsHide: true })
    let buffer = ''
    let last = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      buffer += chunk
      let cut = buffer.indexOf('\n')
      while (cut >= 0) {
        const line = buffer.slice(0, cut).trim()
        buffer = buffer.slice(cut + 1)
        if (line) {
          try {
            const parsed = JSON.parse(line) as { liveEvent?: Record<string, unknown> }
            if (parsed.liveEvent) onLive(parsed.liveEvent)
            else last = line
          } catch {
            last = line
          }
        }
        cut = buffer.indexOf('\n')
      }
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = (stderr + chunk.toString()).slice(-2000)
    })
    child.on('close', () => {
      let answer: PlatformAnswer
      try {
        answer = JSON.parse(last || buffer.trim()) as PlatformAnswer
      } catch {
        answer = { ok: false, code: 'engineNoAnswer', detail: (stderr || 'no output').slice(-300) }
      }
      const refreshed = existsSync(refreshedPath) ? (JSON.parse(readFileSync(refreshedPath, 'utf8')) as Record<string, string>) : null
      rmSync(dir, { recursive: true, force: true })
      resolve({ answer, refreshed })
    })
  })
}

export async function recordPlatformSession(twenty: TwentyClient, shape: PlatformShape, account: PlatformAccount, run: PlatformEngineRun, now: Date, cookieDomain: string): Promise<string[]> {
  const state = run.answer.loginState
  if (!state) return []
  const update: Record<string, unknown> = { sessionState: state, sessionCheckedAt: now.toISOString() }
  const cookiesBack = run.answer.ok && state === 'loggedIn' && run.refreshed && Object.keys(run.refreshed).length > 0
  if (cookiesBack) update.cookies = mergeCookieShape(account.cookies, run.refreshed!, cookieDomain)
  await twenty.update(SOCIAL_ACCOUNTS, account.id, update as never)
  writeLocalSession(account.accountName, state, now, platformStateRoot(shape.platform))
  return [`Twenty: ${account.accountName} sessionState ${state} (${shape.label}'s own answer)${cookiesBack ? ', its refreshed cookies merged back' : ''}.`]
}
