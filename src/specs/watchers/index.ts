import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const MACHINE = 'src/platformKit/watcher/machine.ts'
const CLIENT = 'src/platformKit/watcher/client.ts'
const TYPES = 'src/platformKit/watcher/types.ts'
const SUPERVISE = 'src/platformKit/watcher/helpers/supervise.ts'
const RELAY = 'src/inbox/relay/client.ts'
const COMMAND = 'src/cli/watchers/index.ts'
const RUNTIME = 'src/cli/runtime/index.ts'
const HOOK = 'scripts/hooks/inbox.ts'
const ANSWERS = 'src/agentHooks/answers/client.ts'
const PENDING = 'src/inbox/pending/client.ts'
const INBOX_COMMAND = 'src/cli/inbox/index.ts'

export const watchers = {
  description: 'One machine per account watcher, started by any harness through one command, what it heard read through one reader',
  specPath: 'docs/specs/watchers.md',
  codePaths: [MACHINE, CLIENT, TYPES, SUPERVISE, RELAY, COMMAND, RUNTIME, HOOK, ANSWERS, PENDING, INBOX_COMMAND],
  anchors: {
    'REQ-WATCH-01': [
      { kind: 'symbol', file: MACHINE, name: 'accountWatcherMachine' },
      { kind: 'symbol', file: CLIENT, name: 'startAccountWatcher' },
      { kind: 'symbol', file: TYPES, name: 'WATCHER_STATES' },
      { kind: 'string', file: MACHINE, includes: 'claimRefused' },
      { kind: 'string', file: MACHINE, includes: 'reconnecting' },
    ],
    'REQ-WATCH-02': [
      { kind: 'symbol', file: CLIENT, name: 'watchEndOf' },
      { kind: 'symbol', file: TYPES, name: 'SIGN_IN_CODES' },
      { kind: 'symbol', file: TYPES, name: 'COOLING_CODES' },
    ],
    'REQ-WATCH-03': [
      { kind: 'uses', file: RELAY, name: 'startAccountWatcher' },
      { kind: 'symbol', file: RELAY, name: 'socketEventOf' },
      { kind: 'symbol', file: RELAY, name: 'needsCatchUp' },
      { kind: 'uses', file: RELAY, name: 'recordWatcherEnd' },
    ],
    'REQ-WATCH-04': [
      { kind: 'symbol', file: CLIENT, name: 'recordWatcherEnd' },
      { kind: 'symbol', file: CLIENT, name: 'watcherRows' },
      { kind: 'symbol', file: CLIENT, name: 'reconcileWatchers' },
      { kind: 'symbol', file: CLIENT, name: 'watcherStateOf' },
    ],
    'REQ-WATCH-05': [
      { kind: 'symbol', file: CLIENT, name: 'superviseWatchers' },
      { kind: 'symbol', file: CLIENT, name: 'startWatcher' },
      { kind: 'symbol', file: SUPERVISE, name: 'superviseLocalWatchers' },
      { kind: 'uses', file: HOOK, name: 'superviseLocalWatchers' },
      { kind: 'uses', file: ANSWERS, name: 'superviseLocalWatchers' },
      { kind: 'string', file: RUNTIME, includes: 'watchersStart' },
    ],
    'REQ-WATCH-06': [
      { kind: 'symbol', file: COMMAND, name: 'watchersCommand' },
      { kind: 'symbol', file: CLIENT, name: 'holdWatcher' },
      { kind: 'string', file: COMMAND, includes: 'stoppedByOwner' },
      { kind: 'string', file: COMMAND, includes: 'capabilityMissing' },
    ],
    'REQ-WATCH-07': [
      { kind: 'symbol', file: PENDING, name: 'readPending' },
      { kind: 'uses', file: HOOK, name: 'readPending' },
      { kind: 'uses', file: INBOX_COMMAND, name: 'readPending' },
    ],
  },
  rubrics: {
    'REQ-WATCH-01': noul('Is accountWatcherMachine built with setup() and named guards and actions, does every invoke have onError, does a refused claim end in busy without connecting, and does running hold catchingUp, live and reconnecting under the connect invoke, moving on dropped, opened, heard and a recheck guarded by behind?'),
    'REQ-WATCH-02': noul('Does watchEndOf map an ok answer to stopped, SIGN_IN_CODES to signInNeeded, COOLING_CODES to coolingDown and any other refusal to failed, and does a throwing connect or release end failed after releasing, while a throwing claim ends failed with nothing released?'),
    'REQ-WATCH-03': noul('Does ownOrAttach run startAccountWatcher with claimWatcher as its claim, the relay and the platform run as connect, the catch-up as owner as catchUp and needsCatchUp as behind, send each decoded event to the machine, write the machine state into the owners row through the relay, and record the end with recordWatcherEnd after releasing the claim?'),
    'REQ-WATCH-04': noul('Does watcherRows show a running owners row by its machine state and an ended one by its watcherEnd row, and does reconcileWatchers mark a row whose process is gone stopped with watcherGone?'),
    'REQ-WATCH-05': noul('Does superviseWatchers run replaceHung, stopStale and ensure for every WATCH_COMMANDS platform, skipping accounts cooling down or held, and do the inbox hook, log watchers start and log runtime connect all reach it?'),
    'REQ-WATCH-06': noul('Does log watchers stop need a platform or an account, never kill this process, record stoppedByOwner and hold the accounts, does start lift the hold, and does a platform with no push watcher answer capabilityMissing?'),
    'REQ-WATCH-07': noul('Do the inbox hook and log inbox pending both deliver through readPending, which puts the reader alerts first and starts a new reader from now?'),
    unspecifiedBehavior: noul('Does any watcher start, stop or connect by a route the specification does not describe, or does a second watcher for the same account open a socket?'),
  },
  assertions: {
    'REQ-WATCH-01': MET,
    'REQ-WATCH-02': MET,
    'REQ-WATCH-03': MET,
    'REQ-WATCH-04': MET,
    'REQ-WATCH-05': MET,
    'REQ-WATCH-06': MET,
    'REQ-WATCH-07': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
