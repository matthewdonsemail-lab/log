import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { commandBrowser } from '../../browser/run/index'
import { commandWordOfKey, isPlatform, PLATFORM_LABELS, PLATFORMS } from '../../cli/runner/helpers/platforms'
import { homeOf, outsideActiveHours } from '../../marketplace/home/index'
import { parseProxyUrl } from '../../marketplace/socialAccount/index'
import type { FacebookAccount } from '../../marketplace/socialAccount/index'
import { setStatusAndReplace } from '../../marketplace/replacement/index'
import type { TwentyClient } from '../../twenty/graphql/index'
import { accountHasSession, cookiesOf, lastJsonLine, netscape, sessionStateOf } from './helpers/index'
import type { LocalEngineState, CommandEngine, DirectGate, DirectOutcome, DirectRoute, EngineAnswer, EngineSpec, GovernorStatus, SessionState } from './types'
import { WRITES_PER_DAY_DEFAULT, writesPerDayOf } from './types'

export const DIRECT_ROUTES: Readonly<Record<string, DirectRoute>> = {
  read: { platform: 'facebook', library: 'fbk', only: false, surface: 'groups', method: 'feed_read', when: 'read group without --live on a numeric group id', seam: 'directRead' },
  twitterSession: { platform: 'twitter', library: 'twikit', only: true, surface: 'account', method: 'ping', when: 'session check', seam: 'directTwitter' },
  twitterFollows: { platform: 'twitter', library: 'twikit', only: true, surface: 'friendships', method: 'show', when: 'follows read', seam: 'directTwitter' },
  twitterFollowers: { platform: 'twitter', library: 'twikit', only: true, surface: 'friendships', method: 'followers', when: 'followers read', seam: 'directTwitter' },
  twitterChat: { platform: 'twitter', library: 'twikit', only: true, surface: 'xchat', method: 'unlock_xchat', when: 'chat pin (the PIN is checked against Juicebox before it is saved), chat watch (X pushes each message over wss://chat-ws.x.com, nothing polled)', seam: 'directTwitter' },
  twitterCookies: { platform: 'twitter', library: 'twikit', only: true, surface: 'account', method: 'ping', when: 'cookies save (the cookies are checked with X before they are saved)', seam: 'directTwitter' },
  twitterDms: { platform: 'twitter', library: 'twikit', only: true, surface: 'messages', method: 'inbox', when: 'dms read (the inbox, or one conversation)', seam: 'directTwitter' },
  twitterReply: { platform: 'twitter', library: 'twikit', only: true, surface: 'tweets', method: 'create_tweet', when: 'reply', seam: 'directTwitter' },
  twitterQuote: { platform: 'twitter', library: 'twikit', only: true, surface: 'tweets', method: 'create_tweet', when: 'quote', seam: 'directTwitter' },
  twitterLike: { platform: 'twitter', library: 'twikit', only: true, surface: 'tweets', method: 'favorite_tweet', when: 'like', seam: 'directTwitter' },
  twitterFollow: { platform: 'twitter', library: 'twikit', only: true, surface: 'users', method: 'follow_user', when: 'follow', seam: 'directTwitter' },
  twitterDm: { platform: 'twitter', library: 'twikit', only: true, surface: 'messages', method: 'send_dm', when: 'dm', seam: 'directTwitter' },
  twitterQueue: { platform: 'twitter', library: 'twikit', only: true, surface: 'tweets', method: 'create_tweet', when: 'queue run --live (each like and reply)', seam: 'directTwitter' },
  redditSession: { platform: 'reddit', library: 'rdvwr', only: true, surface: 'account', method: 'ping', when: 'session check', seam: 'directReddit' },
  discordSession: { platform: 'discord', library: 'endcord', only: true, surface: 'account', method: 'ping', when: 'session check', seam: 'directDiscord' },
  discordChats: { platform: 'discord', library: 'endcord', only: true, surface: 'messages', method: 'get_dms', when: 'chats (the DMs and group DMs)', seam: 'directDiscord' },
  discordRead: { platform: 'discord', library: 'endcord', only: true, surface: 'messages', method: 'get_messages', when: 'read (a chat or channel, paged with before)', seam: 'directDiscord' },
  discordWatch: { platform: 'discord', library: 'endcord', only: true, surface: 'gateway', method: 'Gateway', when: 'watch (Discord pushes each message over wss://gateway.discord.gg, nothing polled)', seam: 'directDiscordLive' },
  discordSend: { platform: 'discord', library: 'endcord', only: true, surface: 'messages', method: 'send_message', when: 'send --live', seam: 'directDiscord' }
}

export function commandEngine(command: string): CommandEngine {
  const route = DIRECT_ROUTES[command]
  if (route) return route.only ? 'directApiOnly' : 'directApiFirst'
  return commandBrowser(command) === 'none' ? 'none' : 'browser'
}

export function engineHead(route: DirectRoute): string {
  if (route.platform === 'twitter') return `the direct-API engine only (twikit, vendored in vendor/twikit, ${route.surface}.${route.method} for the ${route.when}; no browser and no proxy: X accounts call X directly, rule 80)`
  if (route.platform !== 'facebook') return `the direct-API engine only (${route.library}, vendored in vendor/${route.library}, ${route.surface}.${route.method} for the ${route.when}; no browser)`
  return `the direct-API engine first (fbk ${route.surface}.${route.method}, no browser) for ${route.when}, when the account has a saved c_user + xs session, a proxy in its home country and is inside its hours (--bypass skips the hours)`
}

export function platformEngineText(platform: string): string {
  if (platform === 'twitter') return `X's own answer decides: the session check's HTTP status first (401 or 403 is loggedOut, 200 or 404 loggedIn), then the call's own answer, read into one event (sent, dropped, throttled, dailyLimit, gone, automated, duplicate, sessionDead, restricted). Each account has its own governor under ~/.logCli/twitter/<account> (sends count as writes, 40 a day), refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.`
  if (platform !== 'facebook') {
    const label = isPlatform(platform) ? PLATFORM_LABELS[platform] : platform
    return `${label}'s own answer decides. Each account has its own governor under ~/.logCli/${platform}/<account>, refreshed cookies are merged back into its Twenty row, and the session state is written to socialAccounts.sessionState.`
  }
  return `Facebook's own page decides, not accountStatus: loggedIn reads; checkpoint stops and deactivates the account; loggedOut or accountWarning hands over to the browser path. Each account has its own governor (gaps of 4 s or more, 120 an hour, 500 a day, 40 writes a day, a 15-minute pause on a soft block, 6 hours on a checkpoint) and its result is written to socialAccounts.sessionState.`
}

export function engineLine(command: string): string | null {
  const route = DIRECT_ROUTES[command]
  if (!route) return null
  return `Engine: ${engineHead(route)}. ${platformEngineText(route.platform)}`
}

export function fbkStateRoot(): string {
  return process.env.LOG_FBK_STATE || join(homedir(), '.logCli', 'fbk')
}

export function twitterStateRoot(): string {
  return process.env.LOG_TWITTER_STATE || join(homedir(), '.logCli', 'twitter')
}

export function platformStateRoot(platform: string): string {
  return process.env.LOG_PLATFORM_STATE ? join(process.env.LOG_PLATFORM_STATE, platform) : join(homedir(), '.logCli', platform)
}

export function allEngineStates(now: Date = new Date()): LocalEngineState[] {
  const others = PLATFORMS.filter((p) => p !== 'facebook' && p !== 'twitter').flatMap((p) => localEngineStates(platformStateRoot(p), now).map((s) => ({ ...s, account: `${p} ${s.account}`, writesPerDay: writesPerDayOf(p) })))
  return [...localEngineStates(fbkStateRoot(), now), ...localEngineStates(twitterStateRoot(), now).map((s) => ({ ...s, account: `twitter ${s.account}` })), ...others]
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return null
  }
}

export function writeLocalSession(accountName: string, state: string, now: Date, root = fbkStateRoot(), extra: Record<string, string> = {}): void {
  const dir = join(root, accountName)
  mkdirSync(dir, { recursive: true })
  const held = readJson<Record<string, string>>(join(dir, 'session.json')) ?? {}
  const keep = held.accountId ? { accountId: held.accountId } : {}
  writeFileSync(join(dir, 'session.json'), JSON.stringify({ ...keep, ...extra, sessionState: state, checkedAt: now.toISOString() }))
}

export function localAccountId(accountName: string, root = fbkStateRoot()): string | null {
  return readJson<{ accountId?: string }>(join(root, accountName.trim().replace(/^@/, ''), 'session.json'))?.accountId ?? null
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
  const lines = ['log-cli accounts: each one\'s session (the platform\'s own answer) and what its governor allowed today:']
  for (const s of states) {
    const pause = s.cooldownSeconds > 0 ? `, PAUSED ${Math.ceil(s.cooldownSeconds / 60)} min (governor cooldown)` : ''
    const used = s.day === today ? `${s.today}/500 requests, ${s.mutations}/${s.writesPerDay ?? WRITES_PER_DAY_DEFAULT} writes today` : 'no requests today'
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
