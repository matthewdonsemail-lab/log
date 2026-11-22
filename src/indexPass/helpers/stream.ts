import type { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import { modelByKey } from '../../models/manifest/index'
import { placeOf } from '../../models/store/index'
import { localEmbedder } from '../../search/conversations/helpers/embed'
import type { Embedder } from '../../search/conversations/types'
import { onePerPerson } from '../../search/conversations/helpers/index'
import { readConversations } from '../../storage/platform/helpers/conversations'
import { personKeyOf } from '../../twitter/dm/person/client'
import type { StoredConversation } from '../../storage/platform/helpers/conversations'
import { factDecider } from '../../people/facts/helpers/decide'
import { gliner2Screener } from '../../people/facts/helpers/screen'
import type { FactDecider, Screener } from '../../people/facts/types'
import { SCREEN_MODEL_KEY, SCREEN_SETTING } from '../../people/facts/types'
import { PASS_IDLE_MS, PASS_RETRY_MS, PASS_SETTING, PASS_SLICE_MS } from '../types'
import type { PassOptions, PassStage, PassTick } from '../types'
import { backlogOf, cursorOf, headOf, saveCursor, sliceOf } from './queue'
import { screenChat, markChatOffset } from './facts'
import { correctionBook } from './corrections'
import { SearchStage } from './search'
import { VoiceStage } from './voice'
import { signedInAccounts } from './accounts'
import { percentile } from '../../people/facts/helpers/extract'

export interface IndexStream {
  tick: () => Promise<PassTick | null>
  stop: () => void
  last: () => PassTick | null
}

export interface IndexStreamOptions extends PassOptions {
  env?: Record<string, string | undefined>
  embedder?: () => Embedder
  screener?: () => Screener
  decider?: () => FactDecider
  clock?: () => number
  sliceMs?: number
  signedIn?: () => Set<string>
}

export function indexStream(handle: Database, options: IndexStreamOptions = {}): IndexStream | null {
  const env = options.env ?? process.env
  if (env[PASS_SETTING] === 'off') return null
  const log = options.log ?? (() => undefined)
  const clock = options.clock ?? Date.now
  const sliceMs = options.sliceMs ?? PASS_SLICE_MS
  const modelDir = placeOf(modelByKey(SCREEN_MODEL_KEY), env)
  const screenable = Boolean(options.screener) || (env[SCREEN_SETTING] !== 'off' && Boolean(modelDir) && existsSync(modelDir!))
  const makeEmbedder = options.embedder ?? (() => localEmbedder())
  const makeScreener = options.screener ?? (() => gliner2Screener(modelDir))
  const deciderOf = options.decider ?? (() => factDecider(env))
  const signedIn = options.signedIn ?? (() => signedInAccounts(env))
  let embedder: Embedder | null = null
  let screener: Screener | null = null
  let search: SearchStage | null = null
  let voice: VoiceStage | null = null
  let busy = false
  let retryAt = 0
  let lastWork = clock()
  let last: PassTick | null = null
  const stop = () => {
    screener?.stop?.()
    screener = null
    embedder?.stop?.()
    embedder = null
    search = null
    voice = null
  }
  const stageOn = (stage: PassStage): boolean => !options.only || options.only === stage
  return {
    last: () => last,
    stop,
    async tick() {
      if (busy || clock() < retryAt) return null
      busy = true
      const started = clock()
      try {
        const cursor = cursorOf(handle)
        const head = headOf(handle)
        const { chats, throughSeq } = sliceOf(handle, cursor, { chatIds: options.chatIds, platform: options.platform, account: options.account, since: options.since })
        const tick: PassTick = { chats: 0, queued: 0, embedded: 0, voiced: 0, screened: 0, decided: 0, p50: 0, p95: 0, throughSeq: cursor, head, backlog: backlogOf(handle, cursor), at: new Date(started).toISOString(), ms: 0, overran: 0 }
        if (!chats.length) {
          if (clock() - lastWork > PASS_IDLE_MS) stop()
          tick.ms = clock() - started
          tick.throughSeq = head > cursor ? cursor : throughSeq
          last = tick
          return tick
        }
        const session = signedIn()
        const book = correctionBook(handle)
        const ms: number[] = []
        const offsets: { chatId: string; throughSeq: number }[] = []
        let advanced = cursor
        let waiting = ''
        for (const chat of chats) {
          if (!session.has(`${chat.platform}:${chat.account}`.toLowerCase())) {
            waiting = `${chat.platform} ${chat.account} has no signed-in session`
            advanced = chat.throughSeq
            continue
          }
          const conversations = conversationsOf(handle, chat)
          if (!conversations.length) {
            advanced = chat.throughSeq
            continue
          }
          const chatStart = clock()
          const stages = { embedded: 0, voiced: 0, screened: 0, decided: 0 }
          if (stageOn('search')) {
            search ??= new SearchStage(embedder ??= makeEmbedder())
            stages.embedded = (await search.add(conversations)).embedded
          }
          if (stageOn('voice')) {
            voice ??= new VoiceStage(embedder ??= makeEmbedder())
            stages.voiced = (await voice.add(conversations)).embedded
          }
          if (stageOn('facts') && screenable) {
            screener ??= makeScreener()
            const decider = deciderOf()
            if (!decider.ok) waiting = decider.problem
            const facts = await screenChat(handle, chat, screener, decider, { now: new Date(clock()), book, ...(options.log ? { log: options.log } : {}) })
            stages.screened = facts.screened
            stages.decided = facts.added
            tick.queued += facts.marked
          }
          ms.push(clock() - chatStart)
          tick.chats++
          tick.embedded += stages.embedded
          tick.voiced += stages.voiced
          tick.screened += stages.screened
          tick.decided += stages.decided
          offsets.push({ chatId: chat.chatId, throughSeq: chat.throughSeq })
          advanced = chat.throughSeq
          if (clock() - started >= sliceMs) {
            tick.overran = 1
            break
          }
        }
        book.flush(new Date(clock()))
        if (search) await search.flush()
        if (voice) await voice.flush()
        if (advanced > cursor || offsets.length) {
          handle.exec('BEGIN IMMEDIATE')
          try {
            saveCursor(handle, advanced, clock())
            for (const offset of offsets) markChatOffset(handle, offset.chatId, offset.throughSeq, clock())
            handle.exec('COMMIT')
          } catch (error) {
            handle.exec('ROLLBACK')
            throw error
          }
        }
        lastWork = clock()
        tick.throughSeq = advanced
        tick.backlog = backlogOf(handle, advanced)
        tick.ms = clock() - started
        tick.p50 = percentile(ms, 50)
        tick.p95 = percentile(ms, 95)
        if (!tick.chats && waiting) log(`indexpass: nothing done this tick (${waiting})`)
        last = tick
        return tick
      } catch (error) {
        retryAt = clock() + PASS_RETRY_MS
        stop()
        log(`indexpass: the pass stopped (${error instanceof Error ? error.message : String(error)}); trying again in ${Math.round(PASS_RETRY_MS / 60_000)} min`)
        return null
      } finally {
        busy = false
      }
    },
  }
}

export function conversationsOf(handle: Database, chat: { chatId: string; platform: string; account: string; conversationId: string }): StoredConversation[] {
  const siblings = handle.prepare('SELECT chatId, conversationId FROM chats WHERE platform = ? AND account = ?').all(chat.platform, chat.account) as { chatId: string; conversationId: string }[]
  const key = chat.platform === 'twitter' ? personKeyOf(chat.conversationId) : null
  const ids = siblings.filter((s) => s.chatId === chat.chatId || (key !== null && personKeyOf(s.conversationId) === key)).map((s) => s.chatId)
  const rows = readConversations(handle, { chatIds: ids.length ? ids : [chat.chatId] })
  return onePerPerson(rows)
}
