#!/usr/bin/env bun
import { diskFree, runsBytes, storageVerdict } from '../../src/browser/runStore/index'

const raw = await Bun.stdin.text().catch(() => '')
let event = 'UserPromptSubmit'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

const verdict = storageVerdict(runsBytes(), diskFree())
if (verdict) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: verdict } }))
