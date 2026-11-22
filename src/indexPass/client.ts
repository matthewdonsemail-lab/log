import type { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import { modelByKey } from '../models/manifest/index'
import { placeOf } from '../models/store/index'
import { localEmbedder } from '../search/conversations/helpers/embed'
import type { Embedder } from '../search/conversations/types'
import { factDecider } from '../people/facts/helpers/decide'
import { gliner2Screener } from '../people/facts/helpers/screen'
import { percentile } from '../people/facts/helpers/extract'
import type { FactDecider, Screener } from '../people/facts/types'
import { SCREEN_MODEL_KEY, SCREEN_SETTING } from '../people/facts/types'
import { PASS_SETTING, PASS_SLICE_MS } from './types'
import type { PassOptions, PassReport, PassStage, PassTick } from './types'
import { backlogOf, cursorOf, headOf, saveCursor, sliceOf } from './helpers/queue'
import { markChatOffset, screenChat } from './helpers/facts'
import { correctionBook } from './helpers/corrections'
import { SearchStage } from './helpers/search'
import { VoiceStage } from './helpers/voice'
import { conversationsOf } from './helpers/stream'
import { signedInAccounts } from './helpers/accounts'

export interface IndexPassOptions extends PassOptions {
  env?: Record<string, string | undefined>
  embedder?: () => Embedder
  screener?: () => Screener
  decider?: () => FactDecider
  clock?: () => number
  signedIn?: () => Set<string>
  from?: 'cursor' | 'start'
}

export async function runIndexPass(handle: Database, options: IndexPassOptions = {}): Promise<PassReport> {
  const env = options.env ?? process.env
  const log = options.log ?? (() => undefined)
  const clock = options.clock ?? Date.now
  const started = clock()
  const modelDir = placeOf(modelByKey(SCREEN_MODEL_KEY), env)
  const screenable = Boolean(options.screener) || (env[SCREEN_SETTING] !== 'off' && Boolean(modelDir) && existsSync(modelDir!))
  const embedder = (options.embedder ?? (() => localEmbedder()))()
  let screener: Screener | null = null
  const search = new SearchStage(embedder)
  const voice = new VoiceStage(embedder)
  const stageOn = (stage: PassStage): boolean => !options.only || options.only === stage
  const report: PassReport = { chats: 0, queued: 0, embedded: 0, voiced: 0, screened: 0, decided: 0, ms: [], throughSeq: 0, head: 0, backlog: 0, stages: { search: 0, voice: 0, facts: 0 }, waiting: '' }
  const limit = Math.max(1, options.limit ?? 1_000_000)
  const session = (options.signedIn ?? (() => signedInAccounts(env)))()
  let cursor = options.from === 'start' ? 0 : cursorOf(handle)
  report.head = headOf(handle)
  report.backlog = backlogOf(handle, cursor)
  let advanced = cursor
  const book = correctionBook(handle)
  const offsets: { chatId: string; throughSeq: number }[] = []
  try {
    while (report.chats < limit) {
      const { chats } = sliceOf(handle, cursor, { chatIds: options.chatIds, platform: options.platform, account: options.account, since: options.since })
      if (!chats.length) break
      let processed = 0
      for (const chat of chats) {
        if (report.chats >= limit) break
        processed++
        if (!session.has(`${chat.platform}:${chat.account}`.toLowerCase())) {
          report.waiting = `${chat.platform} ${chat.account} has no signed-in session`
          advanced = chat.throughSeq
          continue
        }
        const conversations = conversationsOf(handle, chat)
        if (!conversations.length) {
          advanced = chat.throughSeq
          continue
        }
        const chatStart = clock()
        if (stageOn('search')) {
          const done = await search.add(conversations)
          report.embedded += done.embedded
        }
        if (stageOn('voice')) {
          const done = await voice.add(conversations)
          report.voiced += done.embedded
        }
        if (stageOn('facts') && screenable) {
          screener ??= options.screener ? options.screener() : gliner2Screener(modelDir)
          const decider = (options.decider ?? (() => factDecider(env)))()
          if (!decider.ok) report.waiting = decider.problem
          const done = await screenChat(handle, chat, screener, decider, { now: new Date(clock()), book, ...(options.log ? { log: options.log } : {}) })
          report.screened += done.screened
          report.decided += done.added
          report.queued += done.marked
        }
        report.ms.push(clock() - chatStart)
        report.chats++
        report.stages[stageOn('search') ? 'search' : stageOn('voice') ? 'voice' : 'facts'] += clock() - chatStart
        offsets.push({ chatId: chat.chatId, throughSeq: chat.throughSeq })
        advanced = chat.throughSeq
      }
      book.flush(new Date(clock()))
      if (search.pendingCount()) await search.flush()
      if (voice.pendingCount()) await voice.flush()
      if (advanced > cursor || offsets.length) {
        handle.exec('BEGIN IMMEDIATE')
        try {
          saveCursor(handle, advanced, clock())
          for (const offset of offsets.splice(0)) markChatOffset(handle, offset.chatId, offset.throughSeq, clock())
          handle.exec('COMMIT')
        } catch (error) {
          handle.exec('ROLLBACK')
          throw error
        }
      }
      cursor = advanced
      if (processed === 0) break
      if (clock() - started > PASS_SLICE_MS * 90 * 60) break
    }
    await search.flush()
    await voice.flush()
    report.throughSeq = advanced
    report.backlog = backlogOf(handle, advanced)
    log(`indexpass: ${report.chats} conversation(s), ${report.embedded} chunk(s) embedded, ${report.voiced} voice pair(s), ${report.screened} line(s) screened, ${report.decided} fact(s) added`)
    return report
  } finally {
    screener?.stop?.()
    embedder.stop?.()
    await search.close()
    await voice.close()
  }
}

export function passLine(report: PassReport): string {
  const queued = report.chats
  const tail = report.waiting ? `; ${report.waiting}` : ''
  return `log index: ${queued} conversation(s) queued, ${report.embedded} embedded for search, ${report.voiced} voice pair(s) rebuilt, ${report.screened} line(s) screened, ${report.decided} fact(s) decided; ${percentile(report.ms, 50).toFixed(0)} ms p50 / ${percentile(report.ms, 95).toFixed(0)} ms p95 a conversation, ${report.backlog} conversation(s) still behind${tail}`
}

export function tickLine(tick: PassTick | null): string {
  if (!tick) return 'index pass: not in this owner'
  if (!tick.chats) return `index pass: nothing new (through event ${tick.throughSeq} of ${tick.head}, ${tick.backlog} conversation(s) behind)`
  return `index pass: ${tick.chats} conversation(s) queued, ${tick.embedded} embedded, ${tick.voiced} voiced, ${tick.screened} screened, ${tick.decided} decided; ${tick.p50.toFixed(0)} ms p50 / ${tick.p95.toFixed(0)} ms p95, ${tick.ms} ms this tick, ${tick.backlog} behind${tick.overran ? ', carried over' : ''}`
}

export function indexStreamOn(env: Record<string, string | undefined> = process.env): boolean {
  return env[PASS_SETTING] !== 'off'
}
