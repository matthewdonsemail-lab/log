#!/usr/bin/env bun
import { sessionIdOf } from '../../src/agentHooks/sessionOffsets/index'
import { newQueueEvents, queueContext } from '../../src/twitter/queue/events/index'
import { contextOutput, hookHostOf } from '../../src/agentHooks/harness/index'

const raw = await Bun.stdin.text().catch(() => '')
let event = 'UserPromptSubmit'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

const text = queueContext(newQueueEvents(undefined, sessionIdOf(raw)))
if (text) process.stdout.write(contextOutput(event, text, hookHostOf(process.argv)))
