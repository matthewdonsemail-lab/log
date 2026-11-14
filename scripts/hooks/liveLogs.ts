#!/usr/bin/env bun
import { join } from 'node:path'
import { liveLogVerdict } from '../../src/agentHooks/liveLog/index'
import { readService, startService } from '../../src/contextLayer/service/client'
import { contextOutput, hookHostOf } from '../../src/agentHooks/harness/index'

if (!readService()) startService(join(import.meta.dir, '..', '..'))

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
if (verdict.context) process.stdout.write(contextOutput('PreToolUse', verdict.context, hookHostOf(process.argv)))
