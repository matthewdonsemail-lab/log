import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { commandBrowser } from '../../browser/run/index'
import { homeOf, outsideActiveHours } from '../../marketplace/home/index'
import { parseProxyUrl } from '../../marketplace/socialAccount/index'
import type { FacebookAccount } from '../../marketplace/socialAccount/index'
import { setStatusAndReplace } from '../../marketplace/replacement/index'
import type { TwentyClient } from '../../twenty/graphql/index'
import { accountHasSession, cookiesOf, lastJsonLine, netscape, sessionStateOf } from './helpers/index'
import type { LocalEngineState, CommandEngine, DirectGate, DirectOutcome, DirectRoute, EngineAnswer, EngineSpec, GovernorStatus, SessionState } from './types'

export const DIRECT_ROUTES: Readonly<Record<string, DirectRoute>> = {
  read: { platform: 'facebook', library: 'fbk', only: false, surface: 'groups', method: 'feed_read', when: 'read group without --live on a numeric group id', seam: 'directRead' },
  session: { platform: 'twitter', library: 'twikit', only: true, surface: 'account', method: 'ping', when: 'session check', seam: 'directTwitter' }
}

export function commandEngine(command: string): CommandEngine {
  const route = DIRECT_ROUTES[command]
  if (route) return route.only ? 'directApiOnly' : 'directApiFirst'
  return commandBrowser(command) === 'none' ? 'none' : 'browser'
}

export function engineLine(command: string): string | null {
  const route = DIRECT_ROUTES[command]
  if (!route) return null
  if (route.platform === 'twitter') return `Engine: the direct-API engine only (twikit, vendored in vendor/twikit, ${route.surface}.${route.method}; no browser and no proxy: X accounts call X directly, rule 80). X's own answer decides: the session check's HTTP status (401 or 403 is loggedOut, 200 or 404 loggedIn), then the account's profile read; a suspended or locked account is restricted. Each account has its own governor under ~/.logCli/twitter/<account>, refreshed cookies are merged back into its Twenty row, and the result is written to socialAccounts.sessionState.`
  return `Engine: the direct-API engine first (fbk ${route.surface}.${route.method}, no browser) for ${route.when}, when the account has a saved c_user + xs session, a proxy in its home country and is inside its hours (--bypass skips the hours). Facebook's own page decides, not accountStatus: loggedIn reads; checkpoint stops and deactivates the account; loggedOut or accountWarning hands over to the browser path. Each account has its own governor (gaps of 4 s or more, 120 an hour, 500 a day, 40 writes a day, a 15-minute pause on a soft block, 6 hours on a checkpoint) and its result is written to socialAccounts.sessionState.`
}

export function fbkStateRoot(): string {
  return process.env.LOG_FBK_STATE || join(homedir(), '.logCli', 'fbk')
}

export function twitterStateRoot(): string {
  return process.env.LOG_TWITTER_STATE || join(homedir(), '.logCli', 'twitter')
}

export function allEngineStates(now: Date = new Date()): LocalEngineState[] {
  return [...localEngineStates(fbkStateRoot(), now), ...localEngineStates(twitterStateRoot(), now).map((s) => ({ ...s, account: `twitter ${s.account}` }))]
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return null
  }
}

export function writeLocalSession(accountName: string, state: string, now: Date, root = fbkStateRoot()): void {
  const dir = join(root, accountName)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'session.json'), JSON.stringify({ sessionState: state, checkedAt: now.toISOString() }))
}

export function localEngineStates(root = fbkStateRoot(), now: Date = new Date()): LocalEngineState[] {
  if (!existsSync(root)) return []
  const out: LocalEngineState[] = []
  for (const name of readdirSync(root).sort()) {
    const session = readJson<{ sessionState: string; checkedAt: string }>(join(root, name, 'session.json'))
    const governor = readJson<{ day: string; hour_count: number; day_count: number; mutation_count: number; cooldown_until: number; soft_blocks_seen: number }>(join(root, name, 'governor_state.json'))
    if (!session && !governor) continue
    const cooldown = governor ? Math.max(0, Math.round(governor.cooldown_until - now.getTime() / 1000)) : 0
    out.push({ account: name, sessionState: session?.sessionState ?? null, checkedAt: session?.checkedAt ?? null, day: governor?.day ?? null, today: governor?.day_count ?? 0, mutations: governor?.mutation_count ?? 0, cooldownSeconds: cooldown, softBlocks: governor?.soft_blocks_seen ?? 0 })
  }
  return out
}

export function engineContext(states: LocalEngineState[] = allEngineStates(), now: Date = new Date()): string {
  const today = now.toISOString().slice(0, 10)
  const routes = Object.entries(DIRECT_ROUTES).map(([name, r]) => `log ${r.platform} ${name} (${r.when}) → ${r.library} ${r.surface}.${r.method}${r.only ? ', direct only' : ', before the browser'}`)
  const lines = [
    `log-cli engines: the direct-API engine runs ${routes.join('; ')}. Facebook goes through vendor/fbk with its proxy and a governor and token cache per account (~/.logCli/fbk/<account>); X goes through vendor/twikit directly, with no proxy (rule 80) and a governor per account (~/.logCli/twitter/<account>). The platform's own answer decides (socialAccounts.sessionState), not accountStatus. Everything else runs in the browser. Declared in DIRECT_ROUTES (src/directApi/engine).`
  ]
  for (const s of states) {
    const pause = s.cooldownSeconds > 0 ? `, PAUSED ${Math.ceil(s.cooldownSeconds / 60)} min (governor cooldown)` : ''
    const used = s.day === today ? `${s.today}/500 requests, ${s.mutations}/40 writes today` : 'no requests today'
    lines.push(`  ${s.account}: session ${s.sessionState ?? 'not read yet'}${s.checkedAt ? ` (${s.checkedAt.slice(0, 16)}Z)` : ''}, ${used}${pause}`)
  }
  return lines.join('\n')
}

const ENGINE = join(import.meta.dir, '..', '..', '..', 'python', 'directApi', 'engine.py')

function python(): string {
  return process.env.LOG_PYTHON || 'python'
}

export function directGate(account: FacebookAccount, options: { bypass: boolean; now: Date }): DirectGate {
  if (account.platform !== 'FACEBOOK') return { ok: false, detail: 'not a FACEBOOK account' }
  if (account.status === 'deactivated') return { ok: false, detail: 'deactivated' }
  if (!accountHasSession(account)) return { ok: false, detail: 'no saved c_user + xs session' }
  if (!account.proxy || !parseProxyUrl(account.proxy)) return { ok: false, detail: 'no usable proxy' }
  if (account.proxyExitCountry && account.homeCountry && account.proxyExitCountry !== account.homeCountry) {
    return { ok: false, detail: `proxy exits in ${account.proxyExitCountry}, home is ${account.homeCountry}` }
  }
  const home = homeOf(account)
  if (!home.ok) return { ok: false, detail: home.detail }
  const outside = options.bypass ? null : outsideActiveHours(account, home.home.timezone, options.now)
  if (outside) return { ok: false, detail: outside }
  return { ok: true }
}

function spawnEngine(spec: object): EngineAnswer {
  const dir = mkdtempSync(join(tmpdir(), 'directApi'))
  try {
    const file = join(dir, 'spec.json')
    const body = 'cookies' in spec ? { ...spec, cookies: undefined, cookiesPath: join(dir, 'cookies.txt') } : spec
    if ('cookies' in spec) writeFileSync(join(dir, 'cookies.txt'), spec.cookies as string, { mode: 0o600 })
    writeFileSync(file, JSON.stringify(body), { mode: 0o600 })
    const run = spawnSync(python(), [ENGINE, file], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
    return lastJsonLine(run.stdout || '') ?? { ok: false, code: 'engineNoAnswer', detail: (run.stderr || 'no output').slice(-300) }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

export function runEngine(account: FacebookAccount, spec: EngineSpec): EngineAnswer {
  if (!account.proxy) return { ok: false, code: 'noProxy', detail: 'no proxy' }
  return spawnEngine({ ...spec, account: account.accountName, proxy: account.proxy, cookies: netscape(cookiesOf(account)) })
}

export function governorStatus(accountName: string): GovernorStatus | null {
  return spawnEngine({ governorStatus: true, account: accountName }).governor ?? null
}

export function outcomeOf<Row>(answer: EngineAnswer<Row>): DirectOutcome<Row> {
  const sessionState = sessionStateOf(answer)
  if (answer.ok) return { ok: true, rows: answer.rows ?? [], sessionState: sessionState ?? 'loggedIn', governor: answer.governor }
  return {
    ok: false,
    code: answer.code ?? 'engineFailed',
    detail: answer.detail ?? 'the direct-API call failed',
    sessionState,
    stop: sessionState === 'checkpoint' || answer.code === 'governorBlocked'
  }
}

export async function recordSessionState(twenty: TwentyClient, account: FacebookAccount, state: SessionState | null, now: Date): Promise<string[]> {
  if (!state) return []
  await twenty.update('socialAccounts', account.id, { sessionState: state, sessionCheckedAt: now.toISOString() } as never)
  writeLocalSession(account.accountName, state, now)
  const lines = [`Twenty: ${account.accountName} sessionState ${state} (Facebook's own page, read by the direct-API engine).`]
  if (state === 'checkpoint' && account.status !== 'deactivated') {
    await setStatusAndReplace(twenty, account, 'deactivated', 'checkpointed', "the direct-API engine's bootstrap read is_checkpointed", now)
    lines.push(`Twenty: ${account.accountName} is checkpointed, so it is DEACTIVATED and its listings are marked lost.`)
  }
  return lines
}
