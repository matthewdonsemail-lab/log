#!/usr/bin/env bun
import { join } from 'node:path'
import { readPending } from '../../src/inbox/pending/index'
import { superviseLocalWatchers } from '../../src/platformKit/watcher/index'
import { clearDeadQueueLocks, ensureLiveWatchers, hookReaderOf, inboxReaders, pollReaders, releasePoll, startDescriber } from '../../src/inbox/watch/index'
import { contextOutput, hookHostOf } from '../../src/agentHooks/harness/index'

const repo = join(import.meta.dir, '..', '..')

if (process.argv[2] === 'poll') {
  try {
    pollReaders(inboxReaders(repo))
  } finally {
    releasePoll()
  }
  process.exit(0)
}

const raw = await Bun.stdin.text().catch(() => '')
let event = 'UserPromptSubmit'
try {
  event = (JSON.parse(raw || '{}') as { hook_event_name?: string }).hook_event_name ?? event
} catch {}

superviseLocalWatchers(repo)
clearDeadQueueLocks()
ensureLiveWatchers('model', ['describer'], () => startDescriber(repo))

const { text } = readPending(hookReaderOf(raw), { stored: event === 'SessionStart' })
if (text) process.stdout.write(contextOutput(event, text, hookHostOf(process.argv)))
