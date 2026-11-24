import { join } from 'node:path'
import { getState, putState } from '../../storage/state/index'
import { AGENT_HOOKS } from '../registry/index'
import { harnessOff } from '../harness/off/client'
import type { AgentHook, HookEvent } from '../registry/types'
import { sessionIdOf } from '../sessionOffsets/index'
import { accountsFingerprint, freshBlock, numbersOut } from '../sessionBlocks/index'
import type { BlockStore } from '../sessionBlocks/index'
import { hookReply, parseMemory } from '../pageState/index'
import { readOpenBrowsers } from '../../browser/inspect/index'
import { diskFree, servedRunsBytes, storageVerdict } from '../../browser/runStore/index'
import { agentNotice, refreshInBackground } from '../../release/check/index'
import { engineContext } from '../../directApi/engine/index'
import { codeStampWatcher, localChangesLine, staleServerLine, uncommittedFiles, uncommittedFilesAsync } from '../../mcp/freshness/index'
import type { StampWatcher } from '../../mcp/freshness/index'
import { kbConfig } from '../../knowledge/base/index'
import { newQueueEvents, queueContext } from '../../twitter/queue/events/index'
import { newLiveEvents, xLiveContext } from '../../twitter/live/feed/index'
import { clearDeadQueueLocks, ensureLiveWatchers, hookReaderOf, startDescriber } from '../../inbox/watch/index'
import { readPending } from '../../inbox/pending/index'
import { quietUntil } from '../../inbox/push/index'
import { superviseLocalWatchers } from '../../platformKit/watcher/index'
import { hookAnswer } from '../../contextLayer/hook/index'
import type { HookInput } from '../../contextLayer/hook/index'
import { relateContext } from '../../relate/graph/index'
import { ensureGraphOwner, startGraphOwner } from '../../relate/owner/index'
import { connectedSearch } from '../../relate/search/index'
import { cardsNamedIn } from '../../people/index'
import { defaultDbPath, openDatabase } from '../../storage/schema/index'
import type { ConnectedSearch } from '../../relate/search/index'
import type { TimingStage } from '../../contextLayer/service/types'
import { REFUSING_HOOKS, WAITING_HOOKS } from './types'
import type { EventAnswer, HookAnswer, HookTiming, RouteAsk } from './types'

export function updateNoticeOf(raw: string): string | null {
  try {
    refreshInBackground()
    return agentNotice(sessionIdOf(raw))
  } catch {
    return null
  }
}

export interface BlockOptions {
  event?: HookEvent
  store?: BlockStore
}

export function resumedSession(event: HookEvent | undefined, raw: string): boolean {
  return event === 'SessionStart' && sourceOf(raw) !== 'startup'
}

export function storageAnswer(raw = '', verdict: () => string | null = () => storageVerdict(servedRunsBytes(), diskFree()), options: BlockOptions = {}): HookAnswer {
  const said = verdict() ?? ''
  const text = [freshBlock('storage', sessionIdOf(raw), said, numbersOut(said), options.store, resumedSession(options.event, raw)), updateNoticeOf(raw)].filter(Boolean).join('\n')
  return text ? { context: text } : {}
}

export interface FreshnessSource {
  stamp(): number
  changes(): string[]
}

let freshness: FreshnessSource | null = null

export function useFreshnessSource(source: FreshnessSource | null): void {
  freshness = source
}

export interface FreshnessDeps {
  stamps?: StampWatcher
  files?: () => string[]
  filesAsync?: () => Promise<string[]>
  refreshMs?: number
  now?: () => number
  background?: boolean
}

export function cachedFreshness(repo: string, deps: FreshnessDeps = {}): FreshnessSource & { close(): void; settled(): Promise<void> } {
  const stamps = deps.stamps ?? codeStampWatcher(repo)
  const list = deps.files ?? (() => uncommittedFiles(repo))
  const listAsync = deps.filesAsync ?? (deps.files ? async () => list() : () => uncommittedFilesAsync(repo))
  const refreshMs = deps.refreshMs ?? 60_000
  const now = deps.now ?? Date.now
  let files = list()
  let filesStamp = stamps.current()
  let filesAt = now()
  let refreshing: Promise<void> | null = null
  const due = () => stamps.current() !== filesStamp || now() - filesAt >= refreshMs
  const refreshInBackground = () => {
    refreshing ??= (async () => {
      await stamps.refreshAsync()
      if (!due()) return
      const stamp = stamps.current()
      filesAt = now()
      files = await listAsync()
      filesStamp = stamp
    })()
      .catch(() => {})
      .finally(() => {
        refreshing = null
      })
  }
  return {
    stamp: () => stamps.current(),
    changes() {
      if (deps.background) {
        refreshInBackground()
        return files
      }
      stamps.refresh()
      if (due()) {
        files = list()
        filesStamp = stamps.current()
        filesAt = now()
      }
      return files
    },
    settled: async () => {
      await refreshing
    },
    close: () => stamps.close(),
  }
}

export function enginesAnswer(event: HookEvent, repo: string, raw = '', accounts: () => string = () => engineContext(), options: BlockOptions = {}): HookAnswer {
  const lines = [staleServerLine(repo, undefined, freshness?.stamp()), localChangesLine(repo, freshness ? freshness.changes() : undefined)].filter(Boolean)
  const said = accounts()
  const text = [...lines, said].filter(Boolean).join('\n')
  const fresh = freshBlock('engines', sessionIdOf(raw), text, [...lines, accountsFingerprint(said)].join('\n'), options.store, resumedSession(event, raw))
  return fresh ? { context: fresh } : {}
}

async function chunkCount(url: string): Promise<number | null> {
  const redis = new Bun.RedisClient(url, { connectionTimeout: 3000, autoReconnect: false })
  try {
    const info = (await Promise.race([redis.send('FT.INFO', ['kbIdx']), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))])) as Record<string, unknown>
    return Number(info.num_docs ?? NaN)
  } catch {
    return null
  } finally {
    redis.close()
  }
}

export async function knowledgeAnswer(): Promise<HookAnswer> {
  const config = kbConfig()
  const count = 'missing' in config ? null : await chunkCount(config.redisUrl)
  const reach = 'missing' in config ? `not set up on this machine (${config.missing})` : count === null ? 'not reachable right now (the KB_TWENTY_URL host)' : `${count} indexed chunks`
  return { context: `log-cli knowledge base: every AGENTS.md rule, skill, doc, infra note, memory file, page state, account and agent note, kept in Twenty and searched through Redis, ${reach}. The MCP tools read it: \`kbSearch\` { query } finds what an earlier session found or how something works, \`kbShow\` { key } reads one entry, and \`kbRemember\` { text } saves what this session learns, never a secret.` }
}

export function queueAnswer(raw: string): HookAnswer {
  const text = queueContext(newQueueEvents(undefined, sessionIdOf(raw)))
  return text ? { context: text } : {}
}

export function xLiveAnswer(event: HookEvent, raw: string): HookAnswer {
  if (quietUntil(Date.now())) return {}
  const text = xLiveContext(newLiveEvents(undefined, sessionIdOf(raw)), { sessionStart: event === 'SessionStart' })
  return text ? { context: text } : {}
}

export function pageStateAnswer(event: HookEvent, raw: string): HookAnswer {
  let input: { stop_hook_active?: boolean } = {}
  try {
    input = JSON.parse(raw || '{}')
  } catch {}
  const memoryPath = process.env.LOG_HOOK_MEMORY || join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.logCli', 'runs', 'inspect', 'hookState.json')
  const kept = getState<unknown>('hookMemory', memoryPath, { legacyFile: memoryPath })
  const memory = parseMemory(kept ? JSON.stringify(kept.body) : '')
  const result = hookReply(event, readOpenBrowsers(), memory, input.stop_hook_active === true)
  putState('hookMemory', memoryPath, result.memory)
  return result.output ? { output: result.output as Record<string, unknown> } : {}
}

export function inboxAnswer(event: HookEvent, raw: string, repo: string): HookAnswer {
  superviseLocalWatchers(repo)
  clearDeadQueueLocks()
  ensureLiveWatchers('model', ['describer'], () => startDescriber(repo))
  if (quietUntil(Date.now())) return {}
  const { text } = readPending(hookReaderOf(raw), { stored: event === 'SessionStart' })
  return text ? { context: text } : {}
}

export async function useCasesAnswer(raw: string, route: RouteAsk): Promise<HookAnswer> {
  let input: HookInput = {}
  try {
    input = JSON.parse(raw || '{}') as HookInput
  } catch {}
  if (!raw.trim()) return {}
  const result = await hookAnswer(input, route as never)
  return result.text ? { context: result.text } : {}
}

export function promptOf(raw: string): string {
  try {
    return String((JSON.parse(raw || '{}') as { prompt?: string }).prompt ?? '')
  } catch {
    return ''
  }
}

export async function relateAnswer(raw: string, repo: string, searched: (prompt: string) => Promise<ConnectedSearch | null> = connectedSearch, dbPath?: string, start: (repo: string, dbPath: string) => number | null = startGraphOwner): Promise<HookAnswer> {
  try {
    ensureGraphOwner(repo, dbPath ?? defaultDbPath(), start)
  } catch {}
  const prompt = promptOf(raw)
  if (!prompt.trim() || prompt.trimStart().startsWith('<')) return {}
  const answer = await relateContext(prompt, dbPath)
  let cards = ''
  try {
    cards = cardsNamedIn(openDatabase(dbPath ?? defaultDbPath()), prompt).map((c) => c.text).join('\n')
  } catch {}
  const found = answer.outcome === 'answered' ? await searched(prompt).catch(() => null) : null
  const text = [cards, answer.text, found?.text ?? ''].filter(Boolean).join('\n')
  return text ? { context: text } : {}
}

function toolOf(raw: string): string {
  try {
    return String((JSON.parse(raw || '{}') as { tool_name?: string }).tool_name ?? '')
  } catch {
    return ''
  }
}

function sourceOf(raw: string): string {
  try {
    return String((JSON.parse(raw || '{}') as { source?: string }).source ?? '')
  } catch {
    return ''
  }
}

export function hooksForEvent(event: HookEvent, raw: string, hooks: readonly AgentHook[] = AGENT_HOOKS): AgentHook[] {
  const subject = event === 'SessionStart' ? sourceOf(raw) : toolOf(raw)
  return hooks.filter((h) => h.event === event && !REFUSING_HOOKS.includes(h.script) && (!h.matcher || !subject || new RegExp(`^(?:${h.matcher})$`).test(subject)))
}

export function answerOne(hook: AgentHook, event: HookEvent, raw: string, repo: string, route: RouteAsk): HookAnswer | Promise<HookAnswer> {
  const name = hook.script.replace(/^.*\//, '').replace(/\.ts$/, '')
  if (name === 'storage') return storageAnswer(raw, undefined, { event })
  if (name === 'engines') return enginesAnswer(event, repo)
  if (name === 'knowledge') return knowledgeAnswer()
  if (name === 'queue') return queueAnswer(raw)
  if (name === 'xLive') return xLiveAnswer(event, raw)
  if (name === 'pageState') return pageStateAnswer(event, raw)
  if (name === 'inbox') return inboxAnswer(event, raw, repo)
  if (name === 'useCases') return useCasesAnswer(raw, route)
  if (name === 'relate') return relateAnswer(raw, repo)
  return {}
}

export function mergeAnswers(event: HookEvent, answers: readonly HookAnswer[]): Record<string, unknown> | null {
  const contexts: string[] = []
  let decision: Record<string, unknown> = {}
  for (const answer of answers) {
    if (answer.context) contexts.push(answer.context)
    const output = answer.output
    if (!output) continue
    const specific = output.hookSpecificOutput as { additionalContext?: string } | undefined
    if (specific?.additionalContext) contexts.push(specific.additionalContext)
    const { hookSpecificOutput: _ignored, ...rest } = output
    decision = { ...decision, ...rest }
  }
  if (!contexts.length && !Object.keys(decision).length) return null
  return { ...decision, ...(contexts.length ? { hookSpecificOutput: { hookEventName: event, additionalContext: contexts.join('\n\n') } } : {}) }
}

export function sentAtOf(raw: string): number | null {
  try {
    const sent = Number((JSON.parse(raw || '{}') as { log_sent_at?: unknown }).log_sent_at)
    return Number.isFinite(sent) && sent > 0 ? sent : null
  } catch {
    return null
  }
}

export function hookStages(raw: string, timings: readonly HookTiming[], at: { processAt?: number; bootedAt?: number; arrivedAt?: number }): TimingStage[] {
  const sentAt = sentAtOf(raw)
  const stages: TimingStage[] = []
  const between = (name: string, from: number | null | undefined, to: number | undefined) => {
    if (from && to && to >= from) stages.push({ name, startedAt: from, ms: to - from })
  }
  between('spawn', sentAt, at.processAt)
  between('bunStart', at.processAt, at.bootedAt)
  between('sent', sentAt, at.arrivedAt)
  for (const t of timings) stages.push({ name: `hook ${t.hook}`, startedAt: t.startedAt ?? at.bootedAt ?? at.arrivedAt ?? Date.now(), ms: t.ms, ok: t.ok })
  return stages
}

export function waitingHooksFirst(chosen: readonly AgentHook[]): AgentHook[] {
  const waits = (hook: AgentHook) => WAITING_HOOKS.includes(hookName(hook))
  return [...chosen.filter(waits), ...chosen.filter((hook) => !waits(hook))]
}

const hookName = (hook: AgentHook) => hook.script.replace(/^.*\//, '').replace(/\.ts$/, '')

const failedAnswer = (name: string, event: HookEvent, error: unknown): HookAnswer => ({ context: `log hook ${name} failed on ${event}: ${error instanceof Error ? error.message : String(error)}` })

export async function answerEvent(event: HookEvent, raw: string, repo: string, route: RouteAsk, hooks: readonly AgentHook[] = AGENT_HOOKS): Promise<EventAnswer> {
  if (harnessOff()) return { event, body: {}, timings: [] }
  const chosen = hooksForEvent(event, raw, hooks)
  const order = waitingHooksFirst(chosen)
  const timings: HookTiming[] = []
  const pending = order.map((hook) => {
    const name = hookName(hook)
    const startedAt = Date.now()
    const began = performance.now()
    try {
      const answer = answerOne(hook, event, raw, repo, route)
      if (!(answer instanceof Promise)) {
        timings.push({ hook: name, ms: performance.now() - began, ok: true, startedAt })
        return answer
      }
      return answer.then(
        (done) => (timings.push({ hook: name, ms: performance.now() - began, ok: true, startedAt }), done),
        (error) => (timings.push({ hook: name, ms: performance.now() - began, ok: false, startedAt }), failedAnswer(name, event, error)),
      )
    } catch (error) {
      timings.push({ hook: name, ms: performance.now() - began, ok: false, startedAt })
      return failedAnswer(name, event, error)
    }
  })
  const settled = await Promise.all(pending)
  const byHook = new Map(order.map((hook, i) => [hook, settled[i]] as const))
  return { event, body: mergeAnswers(event, chosen.map((hook) => byHook.get(hook) ?? {})), timings }
}
