#!/usr/bin/env bun
import { join } from 'node:path'
import { answerEvent } from '../../src/agentHooks/answers/index'
import { hookHostOf, hostBody, positionalOf } from '../../src/agentHooks/harness/index'
import type { HookEvent } from '../../src/agentHooks/registry/index'
import { askRoute, logTiming, readService, startService } from '../../src/contextLayer/service/index'

const started = performance.now()
const repo = join(import.meta.dir, '..', '..')
const host = hookHostOf(process.argv)
const raw = await Bun.stdin.text().catch(() => '')
let event = (positionalOf(process.argv.slice(2))[0] ?? '') as HookEvent
try {
  event = (event || (JSON.parse(raw || '{}') as { hook_event_name?: HookEvent }).hook_event_name || 'UserPromptSubmit') as HookEvent
} catch {
  event = event || 'UserPromptSubmit'
}
const service = readService()
if (!service) startService(repo)
const answered = await answerEvent(event, raw, repo, (prompt) => askRoute(prompt, service))
const body = hostBody(host, event, answered.body)
logTiming({ event, provider: host === 'claudeCode' ? 'hookEventProcess' : `hookEventProcess:${host}`, ms: performance.now() - started, chars: JSON.stringify(body ?? '').length, outcome: answered.timings.map((t) => `${t.hook}${t.ok ? '' : '!'}:${Math.round(t.ms)}`).join(',') })
if (body) process.stdout.write(JSON.stringify(body))
