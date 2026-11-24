#!/usr/bin/env bun
import { classifyCall, handRolledText } from '../../src/agentHooks/handRolled/client'
import { harnessOff } from '../../src/agentHooks/harness/off/client'
import { contextOutput, hookHostOf } from '../../src/agentHooks/harness/index'
import type { HandRolledVerdict } from '../../src/agentHooks/handRolled/types'

if (harnessOff()) process.exit(0)

const raw = await Bun.stdin.text().catch(() => '')
let input: { tool_name?: string; tool_input?: Record<string, unknown>; cwd?: string } = {}
try {
  input = JSON.parse(raw || '{}') as typeof input
} catch {}

if (classifyCall(input.tool_name ?? '', input.tool_input ?? {}, { cwd: input.cwd }).handRolled) {
  let record = (_verdict: HandRolledVerdict) => 0
  try {
    const { recordHandRolled } = await import('../../src/agentHooks/handRolled/helpers/store')
    record = recordHandRolled
  } catch {}
  const text = handRolledText(raw, record)
  if (text) process.stdout.write(contextOutput('PreToolUse', text, hookHostOf(process.argv)))
}
