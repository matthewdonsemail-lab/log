#!/usr/bin/env bun
/**
 * Agent hook (matt, 2026-10-22), SessionStart and UserPromptSubmit, for Claude
 * Code and Codex (`src/agentHooks/registry`): when `~/.logCli/runs` holds over
 * 2 GB or the disk is nearly full (AdsPower then refuses to start a browser),
 * it says so in the agent's context, with `log runs prune`. Silent otherwise.
 */
import { diskFree, runsBytes, storageVerdict } from '../../src/browser/runStore/index'

const raw = await Bun.stdin.text().catch(() => '')
let event = 'UserPromptSubmit'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

const verdict = storageVerdict(runsBytes(), diskFree())
if (verdict) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: verdict } }))
