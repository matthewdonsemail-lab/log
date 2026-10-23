#!/usr/bin/env bun
import { liveLogVerdict } from '../../src/agentHooks/liveLog/index'

interface HookInput {
  tool_name?: string
  tool_input?: { command?: string; run_in_background?: boolean }
}

const raw = await Bun.stdin.text().catch(() => '')
let input: HookInput = {}
try {
  input = JSON.parse(raw || '{}') as HookInput
} catch {
  input = {}
}

const verdict = liveLogVerdict(input.tool_name ?? '', input.tool_input?.command ?? '', input.tool_input?.run_in_background === true)
if (verdict.deny) {
  process.stderr.write(verdict.deny)
  process.exit(2)
}
if (verdict.context) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: verdict.context } }))
