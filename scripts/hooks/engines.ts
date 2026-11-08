#!/usr/bin/env bun
import { join } from 'node:path'
import { engineContext, fbkStateRoot } from '../../src/directApi/engine/index'
import { localChangesLine, staleServerLine } from '../../src/mcp/freshness/index'
import { getState, putState } from '../../src/storage/state/index'

const raw = await Bun.stdin.text().catch(() => '')
let event = 'UserPromptSubmit'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

const repo = join(import.meta.dir, '..', '..')
const text = [staleServerLine(repo), localChangesLine(repo), engineContext()].filter(Boolean).join('\n')
const root = fbkStateRoot()
const last = join(root, '.lastHook')
const changed = getState<string>('lastHook', last, { legacyFile: last, parse: (raw) => raw })?.body !== text
if (event === 'SessionStart' || changed) {
  putState('lastHook', last, text)
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
}
