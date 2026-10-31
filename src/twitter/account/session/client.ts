import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TwentyError, accountStore } from '../../../twenty/graphql/index'
import type { TwentyClient } from '../../../twenty/graphql/index'
import { SOCIAL_ACCOUNTS, toFacebookAccount } from '../../../marketplace/socialAccount/index'
import type { FacebookAccount, SocialAccountRow } from '../../../marketplace/socialAccount/index'
import { twitterStateRoot, writeLocalSession, writesPerDayOf } from '../../../directApi/engine/index'
import type { TwitterEngineRun, TwitterEngineSpec, TwitterGate, TwitterSessionAnswer, XChatLiveEvent } from './types'

const ENGINE = join(import.meta.dir, '..', '..', '..', '..', 'python', 'twitterApi', 'engine.py')

export type TwitterAccount = FacebookAccount

export async function findTwitterAccount(twenty: TwentyClient, ref: string): Promise<TwitterAccount> {
  const key = ref.trim().replace(/^@/, '')
  const rows = (await twenty.list(SOCIAL_ACCOUNTS, { accountName: { eq: key } })).filter((r) => r.platform === 'TWITTER')
  if (rows.length === 0) throw new TwentyError('accountNotFound', `no TWITTER socialAccount "${key}"`)
  if (rows.length > 1) throw new TwentyError('accountNotFound', `${rows.length} TWITTER socialAccounts are called "${key}"`)
  return toFacebookAccount(rows[0] as SocialAccountRow)
}

export function twitterCookies(raw: unknown): Record<string, string> {
  if (typeof raw === 'string') {
    const text = raw.trim()
    if (text.startsWith('[') || text.startsWith('{')) {
      try {
        return twitterCookies(JSON.parse(text))
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

export function twitterGate(account: TwitterAccount): TwitterGate {
  if (account.platform !== 'TWITTER') return { ok: false, code: 'accountNotTwitter', detail: `${account.accountName} is ${account.platform ?? 'no platform'}` }
  if (account.status === 'deactivated') return { ok: false, code: 'accountDeactivated', detail: `${account.accountName} is deactivated` }
  const cookies = twitterCookies(account.cookies)
  if (!cookies.auth_token || !cookies.ct0) return { ok: false, code: 'noTwitterSession', detail: `${account.accountName} has no saved auth_token + ct0 in Twenty` }
  return { ok: true }
}

export function mergeCookieShape(raw: unknown, refreshed: Record<string, string>): unknown {
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
    for (const [name, value] of Object.entries(refreshed)) if (!seen.has(name)) merged.push({ name, value, domain: '.x.com', path: '/' })
    return merged
  }
  const base = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return { ...base, ...refreshed }
}

export function runTwitterEngine(account: TwitterAccount, request: TwitterEngineSpec): TwitterEngineRun {
  const dir = mkdtempSync(join(tmpdir(), 'twitterApi'))
  try {
    const cookiesPath = join(dir, 'cookies.json')
    const refreshedPath = join(dir, 'refreshed.json')
    writeFileSync(cookiesPath, JSON.stringify(account.cookies ?? {}), { mode: 0o600 })
    const { chatPin, ...rest } = request
    const pinPath = chatPin ? join(dir, 'chatPin.txt') : undefined
    if (pinPath) writeFileSync(pinPath, chatPin!, { mode: 0o600 })
    const spec = join(dir, 'spec.json')
    writeFileSync(spec, JSON.stringify({ ...rest, account: account.accountName, writesPerDay: writesPerDayOf('twitter'), cookiesPath, refreshedPath, ...(pinPath ? { pinPath } : {}) }), { mode: 0o600 })
    const run = spawnSync(process.env.LOG_PYTHON || 'python', [ENGINE, spec], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, windowsHide: true })
    const line = (run.stdout || '').trim().split('\n').filter(Boolean).pop() || ''
    let answer: TwitterSessionAnswer
    try {
      answer = JSON.parse(line) as TwitterSessionAnswer
    } catch {
      answer = { ok: false, code: 'engineNoAnswer', detail: (run.stderr || 'no output').slice(-300) }
    }
    const refreshed = existsSync(refreshedPath) ? (JSON.parse(readFileSync(refreshedPath, 'utf8')) as Record<string, string>) : null
    return { answer, refreshed }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

export function runTwitterEngineLive(account: TwitterAccount, request: TwitterEngineSpec, onLive: (event: XChatLiveEvent) => void): Promise<TwitterEngineRun> {
  const dir = mkdtempSync(join(tmpdir(), 'twitterApi'))
  const cookiesPath = join(dir, 'cookies.json')
  const refreshedPath = join(dir, 'refreshed.json')
  writeFileSync(cookiesPath, JSON.stringify(account.cookies ?? {}), { mode: 0o600 })
  const { chatPin, ...rest } = request
  const pinPath = chatPin ? join(dir, 'chatPin.txt') : undefined
  if (pinPath) writeFileSync(pinPath, chatPin!, { mode: 0o600 })
  const spec = join(dir, 'spec.json')
  writeFileSync(spec, JSON.stringify({ ...rest, account: account.accountName, writesPerDay: writesPerDayOf('twitter'), cookiesPath, refreshedPath, ...(pinPath ? { pinPath } : {}) }), { mode: 0o600 })
  return new Promise((resolve) => {
    const child = spawn(process.env.LOG_PYTHON || 'python', ['-u', ENGINE, spec], { windowsHide: true })
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
            const parsed = JSON.parse(line) as { liveEvent?: XChatLiveEvent }
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
      let answer: TwitterSessionAnswer
      try {
        answer = JSON.parse(last || buffer.trim()) as TwitterSessionAnswer
      } catch {
        answer = { ok: false, code: 'engineNoAnswer', detail: (stderr || 'no output').slice(-300) }
      }
      const refreshed = existsSync(refreshedPath) ? (JSON.parse(readFileSync(refreshedPath, 'utf8')) as Record<string, string>) : null
      rmSync(dir, { recursive: true, force: true })
      resolve({ answer, refreshed })
    })
  })
}

export const SESSION_REWRITE_MS = 60 * 60 * 1000

function sameCookies(a: unknown, b: unknown): boolean {
  const left = twitterCookies(a)
  const right = twitterCookies(b)
  const names = new Set([...Object.keys(left), ...Object.keys(right)])
  return [...names].every((name) => left[name] === right[name])
}

export async function recordTwitterSession(twenty: TwentyClient, account: TwitterAccount, run: TwitterEngineRun, now: Date): Promise<string[]> {
  const state = run.answer.loginState
  if (!state) return []
  const update: Record<string, unknown> = { sessionState: state, sessionCheckedAt: now.toISOString() }
  const cookiesBack = run.answer.ok && state === 'loggedIn' && run.refreshed && Object.keys(run.refreshed).length > 0
  const merged = cookiesBack ? mergeCookieShape(account.cookies, run.refreshed!) : null
  const cookiesChanged = merged !== null && !sameCookies(merged, account.cookies)
  if (cookiesChanged) update.cookies = merged
  const checkedAt = account.sessionCheckedAt ? Date.parse(account.sessionCheckedAt) : NaN
  const fresh = state === account.sessionState && !cookiesChanged && Number.isFinite(checkedAt) && now.getTime() - checkedAt < SESSION_REWRITE_MS
  writeLocalSession(account.accountName, state, now, twitterStateRoot(), { accountId: account.id })
  if (fresh) return []
  account.sessionState = state
  account.sessionCheckedAt = now.toISOString()
  if (cookiesChanged) account.cookies = merged as never
  await twenty.update(SOCIAL_ACCOUNTS, account.id, update as never)
  return [`${accountStore(account.id)}: ${account.accountName} sessionState ${state} (X's own answer)${cookiesChanged ? ', its refreshed cookies merged back' : ''}.`]
}
