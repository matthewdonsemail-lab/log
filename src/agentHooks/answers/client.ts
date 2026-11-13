import { join } from 'node:path'
import { getState, putState } from '../../storage/state/index'
import { AGENT_HOOKS } from '../registry/index'
import type { AgentHook, HookEvent } from '../registry/types'
import { sessionIdOf } from '../sessionOffsets/index'
import { hookReply, parseMemory } from '../pageState/index'
import { readOpenBrowsers } from '../../browser/inspect/index'
import { diskFree, runsBytes, storageVerdict } from '../../browser/runStore/index'
import { engineContext, fbkStateRoot, platformStateRoot, twitterStateRoot } from '../../directApi/engine/index'
import { codeStampWatcher, localChangesLine, staleServerLine, uncommittedFiles } from '../../mcp/freshness/index'
import type { StampWatcher } from '../../mcp/freshness/index'
import { kbConfig } from '../../knowledge/base/index'
import { newQueueEvents, queueContext } from '../../twitter/queue/events/index'
import { newLiveEvents, xLiveContext } from '../../twitter/live/feed/index'
import { inboxTextWithVoiceNotes } from '../../media/voiceNotes/index'
import { replaceHungOwners } from '../../inbox/relay/index'
import { claimContext } from '../../inbox/claims/index'
import { clearDeadQueueLocks, codeStamp, coolingDown, ensureLiveWatchers, hookReaderOf, inboxContext, startDescriber, startDiscordWatch, startInstagramWatch, startSlackWatch, startTwitterWatch, stopStaleWatchers, storedInboxContext, takeAlerts, takePending, twitterAccounts } from '../../inbox/watch/index'
import { hookAnswer } from '../../contextLayer/hook/index'
import type { HookInput } from '../../contextLayer/hook/index'
import { REFUSING_HOOKS } from './types'
import type { EventAnswer, HookAnswer, HookTiming, RouteAsk } from './types'

export function storageAnswer(): HookAnswer {
  const verdict = storageVerdict(runsBytes(), diskFree())
  return verdict ? { context: verdict } : {}
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
  refreshMs?: number
  now?: () => number
}

export function cachedFreshness(repo: string, deps: FreshnessDeps = {}): FreshnessSource & { close(): void } {
  const stamps = deps.stamps ?? codeStampWatcher(repo)
  const list = deps.files ?? (() => uncommittedFiles(repo))
  const refreshMs = deps.refreshMs ?? 60_000
  const now = deps.now ?? Date.now
  let files = list()
  let filesStamp = stamps.current()
  let filesAt = now()
  return {
    stamp: () => stamps.current(),
    changes() {
      stamps.refresh()
      if (stamps.current() !== filesStamp || now() - filesAt >= refreshMs) {
        files = list()
        filesStamp = stamps.current()
        filesAt = now()
      }
      return files
    },
    close: () => stamps.close(),
  }
}

export function enginesAnswer(event: HookEvent, repo: string): HookAnswer {
  const text = [staleServerLine(repo, undefined, freshness?.stamp()), localChangesLine(repo, freshness ? freshness.changes() : undefined), engineContext()].filter(Boolean).join('\n')
  const root = fbkStateRoot()
  const last = join(root, '.lastHook')
  const changed = getState<string>('lastHook', last, { legacyFile: last, parse: (raw) => raw })?.body !== text
  if (event !== 'SessionStart' && !changed) return {}
  putState('lastHook', last, text)
  return { context: text }
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
  return { context: `log-cli knowledge base (rule 93): every AGENTS.md rule, skill, doc, infra note, Claude memory file, page state, account and agent note, in ListeningKit's Twenty and searched through Redis, ${reach}. Before guessing how something works, where a login lives or what an earlier session found, run \`log kb search "<query>"\` (MCP kbSearch) and \`log kb show <key>\`; save what this session learns with \`log kb remember "<text>"\`, never a secret.` }
}

export function queueAnswer(raw: string): HookAnswer {
  const text = queueContext(newQueueEvents(undefined, sessionIdOf(raw)))
  return text ? { context: text } : {}
}

export function xLiveAnswer(event: HookEvent, raw: string): HookAnswer {
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
  replaceHungOwners('twitter', twitterAccounts())
  for (const platform of ['discord', 'slack', 'instagram']) replaceHungOwners(platform, twitterAccounts(platformStateRoot(platform)))
  stopStaleWatchers('twitter', twitterAccounts(), codeStamp(repo, 'twitter'))
  for (const platform of ['discord', 'slack', 'instagram']) stopStaleWatchers(platform, twitterAccounts(platformStateRoot(platform)), codeStamp(repo, platform))
  clearDeadQueueLocks()
  ensureLiveWatchers('twitter', twitterAccounts().filter((a) => !coolingDown(twitterStateRoot(), a)), (account) => startTwitterWatch(account, repo))
  ensureLiveWatchers('discord', twitterAccounts(platformStateRoot('discord')).filter((a) => !coolingDown(platformStateRoot('discord'), a)), (account) => startDiscordWatch(account, repo))
  ensureLiveWatchers('slack', twitterAccounts(platformStateRoot('slack')).filter((a) => !coolingDown(platformStateRoot('slack'), a)), (account) => startSlackWatch(account, repo))
  ensureLiveWatchers('instagram', twitterAccounts(platformStateRoot('instagram')).filter((a) => !coolingDown(platformStateRoot('instagram'), a)), (account) => startInstagramWatch(account, repo))
  ensureLiveWatchers('model', ['describer'], () => startDescriber(repo))
  const alerts = takeAlerts(hookReaderOf(raw))
  const loud = alerts.length ? ['>>> ONE PROCESS PER ACCOUNT, NEVER TWO (rule 131): a second watcher tried to start and was refused. Every Claude session shares the one watcher per account through the inbox; never start another. Tell matt now.', ...alerts].join('\n') : ''
  const fresh = takePending(hookReaderOf(raw)).map((m) => ({ ...m, text: inboxTextWithVoiceNotes(m) }))
  const text = [loud, inboxContext(fresh), claimContext(fresh), event === 'SessionStart' ? storedInboxContext(twitterAccounts()) : null].filter(Boolean).join('\n\n')
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
  if (name === 'storage') return storageAnswer()
  if (name === 'engines') return enginesAnswer(event, repo)
  if (name === 'knowledge') return knowledgeAnswer()
  if (name === 'queue') return queueAnswer(raw)
  if (name === 'xLive') return xLiveAnswer(event, raw)
  if (name === 'pageState') return pageStateAnswer(event, raw)
  if (name === 'inbox') return inboxAnswer(event, raw, repo)
  if (name === 'useCases') return useCasesAnswer(raw, route)
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

export async function answerEvent(event: HookEvent, raw: string, repo: string, route: RouteAsk, hooks: readonly AgentHook[] = AGENT_HOOKS): Promise<EventAnswer> {
  const chosen = hooksForEvent(event, raw, hooks)
  const timings: HookTiming[] = []
  const settled = await Promise.all(
    chosen.map(async (hook) => {
      const started = performance.now()
      const name = hook.script.replace(/^.*\//, '').replace(/\.ts$/, '')
      try {
        const answer = await answerOne(hook, event, raw, repo, route)
        timings.push({ hook: name, ms: performance.now() - started, ok: true })
        return answer
      } catch (error) {
        timings.push({ hook: name, ms: performance.now() - started, ok: false })
        return { context: `log hook ${name} failed on ${event}: ${error instanceof Error ? error.message : String(error)}` } satisfies HookAnswer
      }
    }),
  )
  return { event, body: mergeAnswers(event, settled), timings }
}
