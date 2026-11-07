#!/usr/bin/env bun
import { join } from 'node:path'
import { platformStateRoot, twitterStateRoot } from '../../src/directApi/engine/index'
import { inboxTextWithVoiceNotes } from '../../src/media/voiceNotes/index'
import { replaceHungOwners } from '../../src/inbox/relay/index'
import { claimContext } from '../../src/inbox/claims/index'
import { clearDeadQueueLocks, codeStamp, coolingDown, ensureLiveWatchers, hookReaderOf, stopStaleWatchers, inboxContext, inboxReaders, pollReaders, releasePoll, startDescriber, startDiscordWatch, startInstagramWatch, startSlackWatch, startTwitterWatch, storedInboxContext, takeAlerts, takePending, twitterAccounts } from '../../src/inbox/watch/index'

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

replaceHungOwners('twitter', twitterAccounts())
for (const platform of ['discord', 'slack', 'instagram']) replaceHungOwners(platform, twitterAccounts(platformStateRoot(platform)))
stopStaleWatchers('twitter', twitterAccounts(), codeStamp(repo, 'twitter'))
stopStaleWatchers('discord', twitterAccounts(platformStateRoot('discord')), codeStamp(repo, 'discord'))
stopStaleWatchers('slack', twitterAccounts(platformStateRoot('slack')), codeStamp(repo, 'slack'))
stopStaleWatchers('instagram', twitterAccounts(platformStateRoot('instagram')), codeStamp(repo, 'instagram'))
clearDeadQueueLocks()
ensureLiveWatchers('twitter', twitterAccounts().filter((a) => !coolingDown(twitterStateRoot(), a)), (account) => startTwitterWatch(account, repo))
ensureLiveWatchers('discord', twitterAccounts(platformStateRoot('discord')).filter((a) => !coolingDown(platformStateRoot('discord'), a)), (account) => startDiscordWatch(account, repo))
ensureLiveWatchers('slack', twitterAccounts(platformStateRoot('slack')).filter((a) => !coolingDown(platformStateRoot('slack'), a)), (account) => startSlackWatch(account, repo))
ensureLiveWatchers('instagram', twitterAccounts(platformStateRoot('instagram')).filter((a) => !coolingDown(platformStateRoot('instagram'), a)), (account) => startInstagramWatch(account, repo))
ensureLiveWatchers('model', ['describer'], () => startDescriber(repo))

const alerts = takeAlerts(hookReaderOf(raw))
const loud = alerts.length ? ['>>> ONE PROCESS PER ACCOUNT, NEVER TWO (rule 131): a second watcher tried to start and was refused. Every Claude session shares the one watcher per account through the inbox; never start another. Tell matt now.', ...alerts].join('\n') : ''
const fresh = takePending(hookReaderOf(raw)).map((m) => ({ ...m, text: inboxTextWithVoiceNotes(m) }))
const pushed = inboxContext(fresh)
const claims = claimContext(fresh)
const stored = event === 'SessionStart' ? storedInboxContext(twitterAccounts()) : null
const text = [loud, pushed, claims, stored].filter(Boolean).join('\n\n')
if (text) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }))
