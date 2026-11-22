import type { Database } from 'bun:sqlite'
import { claimState, putState } from '../../storage/state/index'
import { backfillBots } from './client'
import { BOT_BACKFILL_EVERY_MS, BOT_BACKFILL_RETRY_MS, BOT_BACKFILL_SETTING } from './types'
import type { BotBackfillReport, BotSources } from './types'

export interface BotBackfillStream {
  tick: () => Promise<BotBackfillReport | null>
  stop: () => void
}

export interface BotBackfillStreamOptions {
  sources?: () => BotSources
  log?: (line: string) => void
  clock?: () => number
  everyMs?: number
  env?: Record<string, string | undefined>
}

export const BOT_BACKFILL_KEY = 'run'

export function botBackfillStream(handle: Database, options: BotBackfillStreamOptions = {}): BotBackfillStream | null {
  const env = options.env ?? process.env
  if (env[BOT_BACKFILL_SETTING] === 'off') return null
  const log = options.log ?? (() => undefined)
  const clock = options.clock ?? Date.now
  const everyMs = options.everyMs ?? BOT_BACKFILL_EVERY_MS
  const make = options.sources
  let busy = false
  return {
    async tick() {
      if (busy || !make) return null
      if (!claimState('botBackfill', BOT_BACKFILL_KEY, { by: 'graph owner' }, everyMs, clock(), handle)) return null
      busy = true
      try {
        const report = await backfillBots(handle, make(), { now: new Date(clock()) })
        if (report.read) log(`bots: read ${report.read} member(s) from Discord and Slack, ${report.bots} the platform says are automated, ${report.flagged} newly marked${report.already ? `, ${report.already} already marked` : ''}`)
        for (const platform of report.platforms) for (const account of platform.accounts) if (account.refused) log(`bots: ${platform.platform} ${account.account} refused ${account.refused.code}: ${account.refused.detail}`)
        return report
      } catch (error) {
        putState('botBackfill', BOT_BACKFILL_KEY, { by: 'graph owner' }, clock() - everyMs + BOT_BACKFILL_RETRY_MS, handle)
        log(`bots: the backfill stopped (${error instanceof Error ? error.message : String(error)}); trying again in ${Math.round(BOT_BACKFILL_RETRY_MS / 60_000)} min`)
        return null
      } finally {
        busy = false
      }
    },
    stop() {},
  }
}
