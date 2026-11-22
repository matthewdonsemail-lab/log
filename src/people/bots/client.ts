import type { Database } from 'bun:sqlite'
import { markAutomatedIdentity } from '../../storage/platform/index'
import { getState, putState } from '../../storage/state/index'
import { BOT_PLATFORMS, BOT_PLATFORM_NAMES } from './types'
import type { BotAccount, BotAccountReport, BotBackfillReport, BotMember, BotPlatformReport, BotSweep, BotSources } from './types'

const alreadyAutomated = (handle: Database, platform: string, userId: string): boolean =>
  Boolean(handle.prepare("SELECT 1 FROM identityProfiles WHERE platform = ? AND userId = ? AND json_extract(extra, '$.bot') = 1").get(platform, userId))

const skippedReason = (platform: string): string =>
  platform === 'x' || platform === 'instagram' || platform === 'linkedin'
    ? `${BOT_PLATFORM_NAMES[platform]} keeps no automated flag in what log stores, so nothing was read and no name was guessed`
    : 'nothing in log can read this platform'

const emptyReport = (platform: string, skipped: string): BotPlatformReport => ({ platform, accounts: [], skipped, read: 0, bots: 0, flagged: 0, already: 0 })

export async function backfillBots(handle: Database, sources: BotSources, options: { now?: Date; platforms?: readonly string[] } = {}): Promise<BotBackfillReport> {
  const now = options.now ?? new Date()
  const only = new Set(options.platforms?.length ? options.platforms : BOT_PLATFORMS)
  const accounts = await sources.accounts()
  const platforms: BotPlatformReport[] = []
  for (const platform of BOT_PLATFORMS) {
    if (!only.has(platform)) continue
    const source = sources.sources.find((s) => s.platform === platform)
    if (!source) {
      platforms.push(emptyReport(platform, skippedReason(platform)))
      continue
    }
    const mine = accounts.filter((a) => a.platform === platform)
    if (!mine.length) {
      platforms.push(emptyReport(platform, `no ${platform} account in this workspace`))
      continue
    }
    const rows: BotAccountReport[] = []
    for (const account of mine) {
      if (!account.session) {
        rows.push({ account: account.account, read: 0, bots: 0, flagged: 0, already: 0, refused: { code: 'noPlatformSession', detail: `${account.account} has no saved session in Twenty, so ${platform} was not asked` } })
        continue
      }
      const sweep: BotSweep = await source.sweep(account)
      if (!sweep.ok) {
        rows.push({ account: account.account, read: 0, bots: 0, flagged: 0, already: 0, refused: { code: sweep.code ?? 'platformError', detail: sweep.detail ?? `${platform} refused the member list` } })
        continue
      }
      let flagged = 0
      let already = 0
      for (const member of sweep.members) {
        if (!member.bot || !member.userId) continue
        if (alreadyAutomated(handle, platform, member.userId)) {
          already++
          continue
        }
        markAutomatedIdentity(handle, platform, member.userId, now)
        flagged++
      }
      rows.push({ account: account.account, read: sweep.members.length, bots: sweep.members.filter((m) => m.bot).length, flagged, already, ...(sweep.places === undefined ? {} : { places: sweep.places }), ...(sweep.stopped ? { stopped: sweep.stopped } : {}) })
    }
    platforms.push({
      platform,
      accounts: rows,
      read: rows.reduce((n, r) => n + r.read, 0),
      bots: rows.reduce((n, r) => n + r.bots, 0),
      flagged: rows.reduce((n, r) => n + r.flagged, 0),
      already: rows.reduce((n, r) => n + r.already, 0),
    })
  }
  const total = (pick: (p: BotPlatformReport) => number) => platforms.reduce((n, p) => n + pick(p), 0)
  return {
    at: now.toISOString(),
    platforms,
    read: total((p) => p.read),
    bots: total((p) => p.bots),
    flagged: total((p) => p.flagged),
    already: total((p) => p.already),
    refused: platforms.reduce((n, p) => n + p.accounts.filter((a) => a.refused).length, 0),
  }
}

export function botBackfillText(report: BotBackfillReport): string {
  const head = `log people bots: ${report.read} member${report.read === 1 ? '' : 's'} read from the platforms' own data, ${report.bots} the platform says ${report.bots === 1 ? 'is' : 'are'} automated, ${report.flagged} newly marked in log.db${report.already ? `, ${report.already} already marked` : ''}. No name was used to guess.`
  const lines = report.platforms.flatMap((p) => {
    if (p.skipped) return [`  ${p.platform}: skipped: ${p.skipped}`]
    return p.accounts.map((a) => {
      if (a.refused) return `  ${p.platform} ${a.account}: refused ${a.refused.code}: ${a.refused.detail}`
      const where = a.places === undefined ? '' : `${a.places} place${a.places === 1 ? '' : 's'}, `
      return `  ${p.platform} ${a.account}: ${where}${a.read} member${a.read === 1 ? '' : 's'} read, ${a.bots} automated, ${a.flagged} newly marked${a.already ? `, ${a.already} already marked` : ''}${a.stopped ? `. ${a.stopped}` : ''}`
    })
  })
  return [head, ...lines].join('\n')
}

const memberOf = (row: unknown): BotMember | null => {
  if (!row || typeof row !== 'object') return null
  const r = row as { id?: unknown; userId?: unknown; bot?: unknown; username?: unknown }
  const userId = String(r.userId ?? r.id ?? '')
  return userId ? { userId, bot: r.bot === true, username: typeof r.username === 'string' ? r.username : null } : null
}

export const BOT_DISCORD_REQUESTS_PER_RUN = 40
export const BOT_DISCORD_PAGES_PER_SERVER = 10
export const BOT_SLACK_MEMBERS_PER_RUN = 200
export const BOT_TARGETED_LOOKUPS = 12

const cursorKey = (account: string, server: string): string => `discord:${account}:${server}`

export interface BotEngineDeps {
  handle: Database
  accounts: () => readonly BotAccount[]
  discord: (account: BotAccount, spec: Record<string, unknown>) => Promise<BotSweep & { servers?: { id: string; name: string | null }[] }>
  slack: (account: BotAccount, spec: Record<string, unknown>) => Promise<BotSweep>
  now?: () => number
}

export function botSources(deps: BotEngineDeps): BotSources {
  const clock = deps.now ?? Date.now
  const discord: BotSources['sources'] = [{
    platform: 'discord',
    async sweep(account) {
      let budget = BOT_DISCORD_REQUESTS_PER_RUN
      const members: BotMember[] = []
      const seen = new Set<string>()
      let stopped: string | null = null
      const take = (rows: readonly unknown[]) => {
        for (const row of rows) {
          const member = memberOf(row)
          if (!member || seen.has(member.userId)) continue
          seen.add(member.userId)
          members.push(member)
        }
      }
      const known = deps.handle.prepare("SELECT userId FROM identities WHERE platform = 'discord' AND userId NOT LIKE 'unknown:%' ORDER BY lastSeenAt DESC LIMIT 200").all() as { userId: string }[]
      const targets = [...new Set([...(account.userId ? [account.userId] : []), ...known.map((k) => k.userId)])].filter((id) => !seen.has(id)).slice(0, BOT_TARGETED_LOOKUPS)
      for (const user of targets) {
        if (budget < 1) {
          stopped = `stopped at ${BOT_DISCORD_REQUESTS_PER_RUN} requests; the rest is read next run`
          break
        }
        const one = await deps.discord(account, { action: 'member', user })
        budget -= 1
        if (!one.ok) {
          stopped = `${one.code ?? 'platformError'}: ${one.detail ?? ''}`
          break
        }
        take(one.members)
      }
      const served = await deps.discord(account, { action: 'servers' })
      if (!served.ok) return members.length ? { ok: true, members, places: 0, stopped: stopped ?? `${served.code ?? 'platformError'}: ${served.detail ?? ''}` } : { ok: false, code: served.code, detail: served.detail, members: [] }
      const servers = served.servers ?? []
      for (const server of servers) {
        if (budget < 1) {
          stopped = `stopped at ${BOT_DISCORD_REQUESTS_PER_RUN} requests; the rest of ${servers.length} server${servers.length === 1 ? '' : 's'} is read next run`
          break
        }
        const cursor = getState<{ after?: string }>('botBackfill', cursorKey(account.account, server.id), {}, deps.handle)?.body.after ?? '0'
        const pages = Math.max(1, Math.min(BOT_DISCORD_PAGES_PER_SERVER, budget))
        const run = await deps.discord(account, { action: 'members', server: server.id, after: cursor, pages })
        if (!run.ok) {
          stopped = `${run.code ?? 'platformError'}: ${run.detail ?? ''}`
          break
        }
        budget -= Number(run.requests ?? pages)
        take(run.members)
        const last = [...run.members].reverse().map(memberOf).find((m) => m)
        if (run.stopped && last) putState('botBackfill', cursorKey(account.account, server.id), { after: last.userId }, clock(), deps.handle)
        else putState('botBackfill', cursorKey(account.account, server.id), { after: '0' }, clock(), deps.handle)
      }
      return { ok: true, members, places: servers.length, stopped }
    },
  }]
  const slack: BotSources['sources'] = [{
    platform: 'slack',
    async sweep(account) {
      const ids = (deps.handle.prepare("SELECT userId FROM identities WHERE platform = 'slack' AND userId NOT LIKE 'unknown:%' ORDER BY lastSeenAt DESC LIMIT ?").all(BOT_SLACK_MEMBERS_PER_RUN) as { userId: string }[]).map((r) => r.userId)
      if (!ids.length) return { ok: true, members: [], places: 0, stopped: null }
      const run = await deps.slack(account, { action: 'members', ids })
      return { ok: run.ok, ...(run.code ? { code: run.code } : {}), ...(run.detail ? { detail: run.detail } : {}), members: run.members, places: ids.length, stopped: run.stopped ?? null }
    },
  }]
  return { accounts: () => deps.accounts(), sources: [...discord, ...slack] }
}
