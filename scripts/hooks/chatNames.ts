#!/usr/bin/env bun
import { chatNameVerdict } from '../../src/agentHooks/chatNames/index'

const raw = await Bun.stdin.text().catch(() => '')
let input: { tool_name?: string; tool_input?: Record<string, unknown> } = {}
try {
  input = JSON.parse(raw || '{}')
} catch {
  input = {}
}

const verdict = chatNameVerdict(input.tool_name ?? '', input.tool_input ?? {})
if (verdict.deny) {
  process.stderr.write(verdict.deny)
  process.exit(2)
}
