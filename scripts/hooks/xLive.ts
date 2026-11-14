#!/usr/bin/env bun
import { sessionIdOf } from '../../src/agentHooks/sessionOffsets/index'
import { newLiveEvents, xLiveContext } from '../../src/twitter/live/feed/index'
import { contextOutput, hookHostOf } from '../../src/agentHooks/harness/index'

const raw = await Bun.stdin.text().catch(() => '')
let event = 'UserPromptSubmit'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

const text = xLiveContext(newLiveEvents(undefined, sessionIdOf(raw)), { sessionStart: event === 'SessionStart' })
if (text) process.stdout.write(contextOutput(event, text, hookHostOf(process.argv)))
