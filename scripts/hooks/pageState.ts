#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { hookReply, parseMemory } from '../../src/agentHooks/pageState/index'
import type { HookEvent } from '../../src/agentHooks/registry/index'
import { readOpenBrowsers } from '../../src/browser/inspect/index'

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
const memory = parseMemory(existsSync(memoryPath) ? readFileSync(memoryPath, 'utf8') : '')

const result = hookReply(event, readOpenBrowsers(), memory, input.stop_hook_active === true)
mkdirSync(dirname(memoryPath), { recursive: true })
writeFileSync(memoryPath, JSON.stringify(result.memory))
if (result.output) process.stdout.write(JSON.stringify(result.output))
