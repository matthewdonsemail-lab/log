export const BOT_PLATFORMS = ['discord', 'slack', 'x', 'instagram', 'linkedin'] as const

export const BOT_PLATFORM_NAMES: Readonly<Record<string, string>> = {
  discord: 'Discord',
  slack: 'Slack',
  x: 'X',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
}

export const BOT_BACKFILL_EVERY_MS = 6 * 60 * 60_000
export const BOT_BACKFILL_RETRY_MS = 30 * 60_000
export const BOT_BACKFILL_SETTING = 'LOG_BOTS_BACKFILL'

export interface BotAccount {
  platform: string
  account: string
  session: boolean
  userId?: string | null
}

export interface BotMember {
  userId: string
  username?: string | null
  bot: boolean
}

export interface BotSweep {
  ok: boolean
  code?: string
  detail?: string
  members: BotMember[]
  requests?: number
  places?: number
  stopped?: string | null
}

export interface BotPlatformSource {
  platform: string
  sweep: (account: BotAccount) => Promise<BotSweep>
}

export interface BotSources {
  accounts: () => Promise<readonly BotAccount[]> | readonly BotAccount[]
  sources: readonly BotPlatformSource[]
}

export interface BotAccountReport {
  account: string
  read: number
  bots: number
  flagged: number
  already: number
  places?: number
  refused?: { code: string; detail: string }
  stopped?: string | null
}

export interface BotPlatformReport {
  platform: string
  accounts: BotAccountReport[]
  skipped?: string
  read: number
  bots: number
  flagged: number
  already: number
}

export interface BotBackfillReport {
  at: string
  platforms: BotPlatformReport[]
  read: number
  bots: number
  flagged: number
  already: number
  refused: number
}
