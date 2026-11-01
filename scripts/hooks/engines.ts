#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { engineContext, fbkStateRoot } from '../../src/directApi/engine/index'
import { localChangesLine, staleServerLine } from '../../src/mcp/freshness/index'

const raw = await Bun.stdin.text().catch(() => '')
let event = 'UserPromptSubmit'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

const repo = join(import.meta.dir, '..', '..')
const text = [staleServerLine(repo), localChangesLine(repo), engineContext()].filter(Boolean).join('\n')
const root = fbkStateRoot()
const last = join(root, '.lastHook')
const changed = !existsSync(last) || readFileSync(last, 'utf8') !== text
if (event === 'SessionStart' || changed) {
  mkdirSync(root, { recursive: true })
  writeFileSync(last, text)
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
}
