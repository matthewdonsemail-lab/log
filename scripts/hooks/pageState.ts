#!/usr/bin/env bun
/**
 * Agent hook (rules 54-55), registered for Claude Code (`.claude/settings.json`)
 * and Codex (`.codex/hooks.json`) from one list (`src/agentHooks/registry`).
 * Reads the last step of every open inspect session (every browser log-cli
 * drives is one) and prints what `hookReply` decides: the state and its
 * resolver into the agent's context, or a Stop block while a browser sits on
 * something log-cli resolves itself. Reads only the session's own files;
 * snapshots carry no typed values (redacted at the source) and nothing from
 * Twenty is read. `LOG_HOOK_MEMORY` moves the memory file (the parity check
 * runs this against a scratch one).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { hookReply, parseMemory } from '../../src/agentHooks/pageState/index'
import type { BrowserAt } from '../../src/agentHooks/pageState/index'
import type { HookEvent } from '../../src/agentHooks/registry/index'
import { openInspects } from '../../src/browser/inspect/index'

interface HookInput {
  hook_event_name?: HookEvent
  stop_hook_active?: boolean
}

interface Reply {
  ok?: boolean
  error?: string
  step?: string
  url?: string
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

/** The session's last reply: its step, URL and whether it failed. */
function lastReply(path: string): Reply | null {
  if (!existsSync(path)) return null
  for (const line of readFileSync(path, 'utf8').trim().split('\n').reverse()) {
    try {
      const reply = (JSON.parse(line) as { result?: Reply }).result
      if (reply?.step) return reply
    } catch {
      // A line still being written: the one before it decides.
    }
  }
  return null
}

const browsers: BrowserAt[] = []
for (const session of openInspects()) {
  const stepsDir = join(session.runDir, 'steps')
  const reply = lastReply(session.repliesPath ?? join(session.runDir, 'replies.jsonl'))
  const folders = existsSync(stepsDir) ? readdirSync(stepsDir).filter((d) => /^\d+_/.test(d)).sort() : []
  const step = reply?.step ?? folders.at(-1)
  if (!step) continue
  // The step's own snapshot; a failed step may have none, then the last one taken.
  const withSnapshot = [step, ...folders.slice().reverse()].find((d) => existsSync(join(stepsDir, d, 'snapshot.yml')))
  const text = withSnapshot ? readFileSync(join(stepsDir, withSnapshot, 'snapshot.yml'), 'utf8') : ''
  browsers.push({ account: session.account, step, url: reply?.url ?? '', text, failed: reply && reply.ok === false ? (reply.error ?? 'failed') : null })
}

const result = hookReply(event, browsers, memory, input.stop_hook_active === true)
mkdirSync(dirname(memoryPath), { recursive: true })
writeFileSync(memoryPath, JSON.stringify(result.memory))
if (result.output) process.stdout.write(JSON.stringify(result.output))
