#!/usr/bin/env bun
import { listUseCases } from '../../src/mcp/server/helpers/index.ts'
import { matchPlays, playMatchText } from '../../src/useCases/router/index'

const raw = await Bun.stdin.text().catch(() => '')
let input: { hook_event_name?: string; prompt?: string } = {}
try {
  input = JSON.parse(raw || '{}')
} catch {}

const text = playMatchText(matchPlays(String(input.prompt ?? ''), listUseCases()))
if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: input.hook_event_name ?? 'UserPromptSubmit', additionalContext: text } }))
