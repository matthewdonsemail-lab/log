import { createTwentyClient, withLocalAccounts } from '../../twenty/graphql/index'
import type { TwentyClient } from '../../twenty/graphql/index'
import { workspaceAccounts } from '../../platformKit/account/index'
import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec } from '../../platformKit/session/index'
import { discordGate, findDiscordAccount, runDiscordEngine } from '../../discord/account/session/index'
import { findSlackAccount, runSlackEngine, slackGate } from '../../slack/account/session/index'
import type { Database } from 'bun:sqlite'
import { botSources } from './client'
import type { BotAccount, BotMember, BotSources, BotSweep } from './types'

type Engine = (account: PlatformAccount, spec: Record<string, unknown>) => PlatformEngineRun

export interface BotWireOptions {
  handle: Database
  twenty?: TwentyClient
  discord?: Engine
  slack?: Engine
  accounts?: () => readonly BotAccount[]
}

const membersOf = (rows: unknown): BotMember[] => (Array.isArray(rows) ? rows : []).flatMap((row) => {
  if (!row || typeof row !== 'object') return []
  const r = row as { id?: unknown; userId?: unknown; bot?: unknown; username?: unknown }
  const userId = String(r.userId ?? r.id ?? '')
  return userId ? [{ userId, bot: r.bot === true, username: typeof r.username === 'string' ? r.username : null }] : []
})

function answerOf(run: PlatformEngineRun, servers: boolean): BotSweep & { servers?: { id: string; name: string | null }[] } {
  const answer = run.answer
  if (!answer.ok) return { ok: false, code: answer.code ?? 'platformError', detail: answer.detail ?? '', members: [] }
  const members = membersOf(answer.members)
  return {
    ok: true,
    members,
    requests: Number(answer.requests ?? 1),
    stopped: typeof answer.stopped === 'string' ? answer.stopped : null,
    ...(servers ? { servers: (Array.isArray(answer.servers) ? answer.servers : []) as { id: string; name: string | null }[] } : {}),
  }
}

function fine<T>(work: () => Promise<T>): Promise<T | BotSweep> {
  return work().catch((error: unknown) => ({ ok: false, code: (error as { code?: string }).code ?? 'accountNotFound', detail: error instanceof Error ? error.message : String(error), members: [] }))
}

export function defaultBotSources(options: BotWireOptions): BotSources {
  const twenty = options.twenty ?? withLocalAccounts(createTwentyClient())
  const directDiscord = options.discord ?? runDiscordEngine
  const directSlack = options.slack ?? runSlackEngine
  const accountRows = (): readonly BotAccount[] => options.accounts ? options.accounts() : workspaceAccounts({ limit: 200 }).accounts.map((a) => ({
    platform: a.platform,
    account: a.account,
    session: a.status !== 'deactivated' && a.sessionState !== 'loggedOut',
    userId: (options.handle.prepare('SELECT userId FROM accounts WHERE platform = ? AND account = ?').get(a.platform, a.account) as { userId: string } | null)?.userId ?? null,
  }))
  return botSources({
    handle: options.handle,
    accounts: accountRows,
    discord: async (account, spec) => fine(async () => {
      const found = await findDiscordAccount(twenty, account.account)
      const gate = discordGate(found)
      if (!gate.ok) return { ok: false, code: gate.code, detail: gate.detail, members: [] }
      return answerOf(directDiscord(found, spec as PlatformEngineSpec), spec.action === 'servers')
    }),
    slack: async (account, spec) => fine(async () => {
      const found = await findSlackAccount(twenty, account.account)
      const gate = slackGate(found)
      if (!gate.ok) return { ok: false, code: gate.code, detail: gate.detail, members: [] }
      return answerOf(directSlack(found, spec as PlatformEngineSpec), false)
    }),
  })
}
