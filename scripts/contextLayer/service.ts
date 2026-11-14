#!/usr/bin/env bun
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { contextOutput, hookHostOf, hostBody } from '../../src/agentHooks/harness/index'
import { hookAnswer } from '../../src/contextLayer/hook/index'
import type { HookInput } from '../../src/contextLayer/hook/index'
import { CODE_CHECK_MS, CONTEXT_PORT, forgetService, HOST, labelledPath, logTiming, readService, serviceStarted, SOURCE_CHECK_MS, startService, writeService } from '../../src/contextLayer/service/index'
import { codeStamp } from '../../src/mcp/freshness/index.ts'
import { listUseCases } from '../../src/mcp/server/helpers/index.ts'
import { localEmbedder } from '../../src/search/conversations/helpers/embed.ts'
import { EMBED_MODEL } from '../../src/search/conversations/types.ts'
import { buildRouteIndex, routePrompt } from '../../src/useCases/router/index'
import { answerEvent, cachedFreshness, useFreshnessSource } from '../../src/agentHooks/answers/index'
import type { HookEvent } from '../../src/agentHooks/registry/index'
import type { RouteIndex, Thresholds, Utterance } from '../../src/useCases/router/index'

const repo = join(import.meta.dir, '..', '..')
const fixtures = join(repo, 'src', 'useCases', 'router', 'fixtures')
const sources = [join(repo, 'docs', 'useCases'), fixtures, labelledPath()]

const running = readService()
if (running && running.pid !== process.pid) {
  console.log(`context layer already running (pid ${running.pid}, port ${running.port})`)
  serviceStarted()
  process.exit(0)
}

function newest(dir: string): number {
  if (!existsSync(dir)) return 0
  let out = statSync(dir).mtimeMs
  if (!statSync(dir).isDirectory()) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    out = Math.max(out, entry.isDirectory() ? newest(path) : statSync(path).mtimeMs)
  }
  return out
}

const readJson = <T>(path: string, fallback: T): T => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return fallback
  }
}

const embedder = localEmbedder()
const embed = (texts: string[]) => embedder.embed(texts)
let index: RouteIndex
let thresholds: Thresholds = {}
let stamp = 0

async function load(): Promise<void> {
  const started = performance.now()
  const labelled = readJson<{ prompt: string; play: string }[]>(labelledPath(), [])
  const extra: Utterance[] = labelled.filter((l) => l.play !== 'none').map((l) => ({ route: l.play, text: l.prompt.toLowerCase().slice(0, 400) }))
  const useCases = listUseCases()
  index = await buildRouteIndex(useCases, embed, EMBED_MODEL, extra, useCases.map((u) => u.text).join(' '))
  thresholds = readJson<Thresholds>(join(fixtures, 'thresholds.json'), {})
  stamp = Math.max(...sources.map(newest))
  console.log(`${new Date().toISOString()} loaded ${index.utterances.length} utterances for ${index.titles.size} plays in ${Math.round(performance.now() - started)} ms`)
}

await load()
setInterval(() => {
  if (Math.max(...sources.map(newest)) > stamp) void load()
}, SOURCE_CHECK_MS)

const route = (prompt: string) => routePrompt(prompt, index, embed, thresholds)
useFreshnessSource(cachedFreshness(repo))

let server: ReturnType<typeof Bun.serve>
let inFlight = 0
const codeNow = () => Math.max(codeStamp(repo), newest(join(repo, 'scripts')))
const codeAtStart = codeNow()
async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/health') return Response.json({ ok: true, utterances: index.utterances.length })
    if (url.pathname === '/hook' && request.method === 'POST') {
      const started = performance.now()
      let input: HookInput = {}
      try {
        input = JSON.parse((await request.text()) || '{}') as HookInput
      } catch {}
      const result = await hookAnswer(input, route)
      const body = contextOutput(result.event, result.text, hookHostOf(['--host', url.searchParams.get('host') ?? '']))
      logTiming({ event: result.event, provider: 'contextLayer', ms: performance.now() - started, chars: result.text.length, outcome: result.outcome })
      return new Response(body, { headers: { 'content-type': 'application/json' } })
    }
    const eventPath = /^\/hooks\/(SessionStart|UserPromptSubmit|PostToolUse|Stop)$/.exec(url.pathname)
    if (eventPath && request.method === 'POST') {
      const started = performance.now()
      const raw = await request.text()
      const answered = await answerEvent(eventPath[1] as HookEvent, raw, repo, route)
      const chars = JSON.stringify(answered.body ?? '').length
      logTiming({ event: answered.event, provider: 'hookEvent', ms: performance.now() - started, chars, outcome: answered.timings.map((t) => `${t.hook}${t.ok ? '' : '!'}:${Math.round(t.ms)}`).join(',') })
      const body = hostBody(hookHostOf(['--host', url.searchParams.get('host') ?? '']), answered.event, answered.body)
      return body ? Response.json(body) : new Response('', { status: 200 })
    }
    if (url.pathname !== '/route' || request.method !== 'POST') return new Response('not found', { status: 404 })
    const { prompt } = (await request.json()) as { prompt?: string }
    const decision = await routePrompt(String(prompt ?? ''), index, embed, thresholds)
    logTiming({ event: 'UserPromptSubmit', provider: 'routeService', ms: decision.ms.total, chars: 0, outcome: decision.skipped ?? (decision.matches[0]?.id || 'none') })
    return Response.json(decision)
}
try {
  server = Bun.serve({
  hostname: HOST,
  port: CONTEXT_PORT,
  async fetch(request) {
    inFlight++
    try {
      return await handle(request)
    } finally {
      inFlight--
    }
  },
  })
} catch (error) {
  console.log(`${new Date().toISOString()} port ${CONTEXT_PORT} is taken, so another context layer holds it: ${String(error).slice(0, 160)}`)
  serviceStarted()
  embedder.stop?.()
  process.exit(0)
}

writeService({ pid: process.pid, port: server.port ?? 0, startedAt: new Date().toISOString(), model: EMBED_MODEL, utterances: index.utterances.length, sourceStamp: stamp })
serviceStarted()
console.log(`${new Date().toISOString()} context layer listening on ${HOST}:${server.port} (pid ${process.pid})`)

setInterval(() => {
  if (inFlight > 0 || codeNow() <= codeAtStart) return
  console.log(`${new Date().toISOString()} log's code changed since this service started, so it hands over to a fresh one running the new code`)
  void server.stop(true)
  embedder.stop?.()
  forgetService()
  serviceStarted()
  startService(repo)
  process.exit(0)
}, CODE_CHECK_MS)
