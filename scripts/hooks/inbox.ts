#!/usr/bin/env bun
import { join } from 'node:path'
import { platformStateRoot, twitterStateRoot } from '../../src/directApi/engine/index'
import { clearDeadQueueLocks, codeStamp, coolingDown, ensureLiveWatchers, stopStaleWatchers, inboxContext, inboxReaders, pollReaders, releasePoll, startDiscordWatch, startTwitterWatch, storedInboxContext, takePending, twitterAccounts } from '../../src/inbox/watch/index'

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

const stamp = codeStamp(repo)
stopStaleWatchers('twitter', twitterAccounts(), stamp)
stopStaleWatchers('discord', twitterAccounts(platformStateRoot('discord')), stamp)
clearDeadQueueLocks()
ensureLiveWatchers('twitter', twitterAccounts().filter((a) => !coolingDown(twitterStateRoot(), a)), (account) => startTwitterWatch(account, repo))
ensureLiveWatchers('discord', twitterAccounts(platformStateRoot('discord')).filter((a) => !coolingDown(platformStateRoot('discord'), a)), (account) => startDiscordWatch(account, repo))

const pushed = inboxContext(takePending())
const stored = event === 'SessionStart' ? storedInboxContext(twitterAccounts()) : null
const text = [pushed, stored].filter(Boolean).join('\n\n')
if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
