#!/usr/bin/env bun
import { join } from 'node:path'
import { hookHostOf, hostBody } from '../../src/agentHooks/harness/index'
import { hookReply, parseMemory } from '../../src/agentHooks/pageState/index'
import type { HookEvent } from '../../src/agentHooks/registry/index'
import { readOpenBrowsers } from '../../src/browser/inspect/index'
import { getState, putState } from '../../src/storage/state/index'

interface HookInput {
  hook_event_name?: HookEvent
  stop_hook_active?: boolean
}

const raw = await Bun.stdin.text().catch(() => '')
let input: HookInput = {}
try {
  input = JSON.parse(raw || '{}') as HookInput
} catch {
  input = {}
}
const event: HookEvent = input.hook_event_name ?? 'PostToolUse'

const memoryPath = process.env.LOG_HOOK_MEMORY || join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.logCli', 'runs', 'inspect', 'hookState.json')
const kept = getState<unknown>('hookMemory', memoryPath, { legacyFile: memoryPath })
const memory = parseMemory(kept ? JSON.stringify(kept.body) : '')

const result = hookReply(event, readOpenBrowsers(), memory, input.stop_hook_active === true)
putState('hookMemory', memoryPath, result.memory)
const body = hostBody(hookHostOf(process.argv), event, result.output as Record<string, unknown> | null)
if (body) process.stdout.write(JSON.stringify(body))
