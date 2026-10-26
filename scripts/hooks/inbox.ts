#!/usr/bin/env bun
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { claimPoll, inboxContext, inboxReaders, pollReaders, releasePoll, takePending } from '../../src/inbox/watch/index'

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

if (claimPoll()) {
  const child = spawn('bun', [import.meta.path, 'poll'], { cwd: repo, detached: true, stdio: 'ignore', windowsHide: true, env: process.env })
  child.unref()
}

const text = inboxContext(takePending())
if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
