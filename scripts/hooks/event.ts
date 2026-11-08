#!/usr/bin/env bun
import { join } from 'node:path'
import { answerEvent } from '../../src/agentHooks/answers/index'
import type { HookEvent } from '../../src/agentHooks/registry/index'
import { askRoute, logTiming, readService, startService } from '../../src/contextLayer/service/index'

const started = performance.now()
const repo = join(import.meta.dir, '..', '..')
const raw = await Bun.stdin.text().catch(() => '')
let event = (process.argv[2] ?? '') as HookEvent
try {
  event = (event || (JSON.parse(raw || '{}') as { hook_event_name?: HookEvent }).hook_event_name || 'UserPromptSubmit') as HookEvent
} catch {
  event = event || 'UserPromptSubmit'
}
const service = readService()
if (!service) startService(repo)
const answered = await answerEvent(event, raw, repo, (prompt) => askRoute(prompt, service))
logTiming({ event, provider: 'hookEventProcess', ms: performance.now() - started, chars: JSON.stringify(answered.body ?? '').length, outcome: answered.timings.map((t) => `${t.hook}${t.ok ? '' : '!'}:${Math.round(t.ms)}`).join(',') })
if (answered.body) process.stdout.write(JSON.stringify(answered.body))
