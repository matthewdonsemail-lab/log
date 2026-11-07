#!/usr/bin/env bun
import { join } from 'node:path'
import { hookAnswer, hookOutput } from '../../src/contextLayer/hook/index'
import type { HookInput } from '../../src/contextLayer/hook/index'
import { askRoute, logTiming, readService, startService } from '../../src/contextLayer/service/index'

const started = performance.now()
const raw = await Bun.stdin.text().catch(() => '')
let input: HookInput = {}
try {
  input = JSON.parse(raw || '{}') as HookInput
} catch {}
const service = readService()
if (!service) startService(join(import.meta.dir, '..', '..'))
const result = raw.trim() ? await hookAnswer(input, (prompt) => askRoute(prompt, service)) : { event: 'UserPromptSubmit', text: '', outcome: 'serviceDown' }
logTiming({ event: result.event, provider: 'useCasesFallback', ms: performance.now() - started, chars: result.text.length, outcome: service ? result.outcome : `serviceStarting ${result.outcome}` })
const body = hookOutput(result)
if (body) process.stdout.write(body)
