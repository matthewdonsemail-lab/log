#!/usr/bin/env bun
import { join } from 'node:path'
import { platformStateRoot } from '../../src/directApi/engine/index'
import { ensureLiveWatchers, inboxContext, inboxReaders, pollReaders, releasePoll, startDiscordWatch, startTwitterWatch, takePending, twitterAccounts } from '../../src/inbox/watch/index'

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

ensureLiveWatchers('twitter', twitterAccounts(), (account) => startTwitterWatch(account, repo))
ensureLiveWatchers('discord', twitterAccounts(platformStateRoot('discord')), (account) => startDiscordWatch(account, repo))

const text = inboxContext(takePending())
if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
