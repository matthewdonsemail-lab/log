import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const REGISTRY = 'src/agentHooks/registry/index.ts'
const PAGE_STATE = 'src/agentHooks/pageState/index.ts'
const LIVE_LOG = 'src/agentHooks/liveLog/index.ts'
const LIVE_LOGS = 'scripts/hooks/liveLogs.ts'
const CHECK = 'scripts/checks/checkAgentHooks.ts'
const STATES = 'src/browser/flow/helpers/pageState.ts'
const INBOX_HOOK = 'scripts/hooks/inbox.ts'
const INBOX_WATCH = 'src/inbox/watch/client.ts'
const INBOX_RELAY = 'src/inbox/relay/client.ts'
const INBOX_CLAIMS = 'src/inbox/claims/client.ts'
const INBOX_STORE = 'src/inbox/store/client.ts'

export const agentHooks = {
  description: 'The agent hooks: one list for both hosts, what each event does, and the check that refuses drift',
  specPath: 'docs/specs/agentHooks.md',
  codePaths: [
    'src/agentHooks/registry/index.ts',
    'src/agentHooks/registry/types.ts',
    'src/agentHooks/pageState/index.ts',
    'src/agentHooks/liveLog/index.ts',
    'scripts/hooks/pageState.ts',
    'scripts/hooks/liveLogs.ts',
    'scripts/checks/checkAgentHooks.ts',
    'scripts/hooks/inbox.ts',
    'src/inbox/watch/client.ts',
    'src/inbox/relay/client.ts',
    'src/inbox/claims/client.ts',
    'src/inbox/store/client.ts',
    'src/inbox/store/types.ts',
    'src/cli/inbox/index.ts',
    'src/cli/twitter/helpers/send.ts',
    'src/cli/twitter/helpers/queue.ts',
    'src/cli/discord/index.ts',
    'src/cli/slack/index.ts',
    'src/cli/instagram/index.ts',
    'src/cli/twitter/helpers/chat.ts',
  ],
  anchors: {
    'REQ-HOOKS-12': [
      { kind: 'symbol', file: INBOX_WATCH, name: 'ensureLiveWatchers' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'stopStaleWatchers' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'startTwitterWatch' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'startDiscordWatch' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'startSlackWatch' },
      { kind: 'string', file: INBOX_WATCH, includes: '--inbox' },
      { kind: 'string', file: INBOX_HOOK, includes: 'discord' },
    ],
    'REQ-HOOKS-16': [
      { kind: 'symbol', file: INBOX_STORE, name: 'appendEvent' },
      { kind: 'symbol', file: INBOX_STORE, name: 'typeStatus' },
      { kind: 'symbol', file: INBOX_STORE, name: 'immediate' },
      { kind: 'symbol', file: INBOX_STORE, name: 'importPendingFile' },
      { kind: 'symbol', file: INBOX_CLAIMS, name: 'stillHeld' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'takePending' },
      { kind: 'string', file: INBOX_STORE, includes: 'PRAGMA journal_mode = WAL' },
      { kind: 'string', file: 'src/cli/discord/index.ts', includes: 'the claim on this chat was lost' },
      { kind: 'string', file: 'src/cli/slack/index.ts', includes: 'the claim on this chat was lost' },
    ],
    'REQ-HOOKS-15': [
      { kind: 'symbol', file: INBOX_CLAIMS, name: 'claimChat' },
      { kind: 'symbol', file: INBOX_CLAIMS, name: 'releaseChat' },
      { kind: 'symbol', file: INBOX_CLAIMS, name: 'guardSend' },
      { kind: 'symbol', file: INBOX_CLAIMS, name: 'eventIdOf' },
      { kind: 'symbol', file: INBOX_CLAIMS, name: 'claimContext' },
      { kind: 'symbol', file: INBOX_CLAIMS, name: 'recordAction' },
      { kind: 'string', file: INBOX_CLAIMS, includes: 'INSERT INTO actions' },
    ],
    'REQ-HOOKS-14': [
      { kind: 'symbol', file: INBOX_RELAY, name: 'ownOrAttach' },
      { kind: 'symbol', file: INBOX_RELAY, name: 'openRelay' },
      { kind: 'symbol', file: INBOX_RELAY, name: 'attachRelay' },
      { kind: 'symbol', file: INBOX_RELAY, name: 'sessionLive' },
      { kind: 'symbol', file: INBOX_RELAY, name: 'replaceHungOwners' },
      { kind: 'string', file: INBOX_RELAY, includes: 'UPDATE owners SET heartbeat' },
    ],
    'REQ-HOOKS-13': [
      { kind: 'symbol', file: INBOX_WATCH, name: 'claimWatcher' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'releaseWatcher' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'watchHolder' },
      { kind: 'symbol', file: INBOX_WATCH, name: 'takeAlerts' },
      { kind: 'string', file: INBOX_WATCH, includes: 'INSERT INTO owners' },
      { kind: 'string', file: INBOX_HOOK, includes: 'ONE PROCESS PER ACCOUNT' },
    ],
    'REQ-HOOKS-01': [
      { kind: 'symbol', file: REGISTRY, name: 'AGENT_HOOKS' },
      { kind: 'symbol', file: REGISTRY, name: 'hooksFor' },
      { kind: 'symbol', file: REGISTRY, name: 'hookCommand' },
      { kind: 'string', file: CHECK, includes: '.claude/settings.json' },
      { kind: 'string', file: CHECK, includes: '.codex/hooks.json' },
    ],
    'REQ-HOOKS-02': [{ kind: 'string', file: CHECK, includes: '--write' }],
    'REQ-HOOKS-03': [
      { kind: 'string', file: REGISTRY, includes: 'scripts/hooks/pageState.ts' },
      { kind: 'string', file: REGISTRY, includes: 'startup|resume|clear|compact' },
      { kind: 'symbol', file: PAGE_STATE, name: 'hookReply' },
    ],
    'REQ-HOOKS-04': [
      { kind: 'symbol', file: REGISTRY, name: 'TOOL_MATCHER' },
      { kind: 'value', file: REGISTRY, name: 'MCP_SERVER_NAME', equals: 'log' },
      { kind: 'value', file: REGISTRY, name: 'SHELL_MATCHER', equals: 'Bash|PowerShell|Monitor' },
    ],
    'REQ-HOOKS-05': [
      { kind: 'symbol', file: PAGE_STATE, name: 'findingOf' },
      { kind: 'symbol', file: PAGE_STATE, name: 'hookReply' },
    ],
    'REQ-HOOKS-06': [
      { kind: 'symbol', file: LIVE_LOG, name: 'buffersOutput' },
      { kind: 'symbol', file: LIVE_LOG, name: 'liveLogVerdict' },
      { kind: 'string', file: REGISTRY, includes: 'scripts/hooks/liveLogs.ts' },
    ],
    'REQ-HOOKS-07': [{ kind: 'string', file: CHECK, includes: 'log facebook warmup feed run | tail -5' }],
    'REQ-HOOKS-09': [{ kind: 'symbol', file: REGISTRY, name: 'toolIsHooked' }],
    'REQ-HOOKS-10': [{ kind: 'string', file: CHECK, includes: '~/.logCli/mcp/<day>.log' }],
    'REQ-HOOKS-11': [
      { kind: 'symbol', file: STATES, name: 'PAGE_STATES' },
      { kind: 'symbol', file: STATES, name: 'RESOLVE_CALLS' },
    ],
  },
  rubrics: {
    'REQ-HOOKS-01': noul('Does checkAgentHooks write both host files, claudeCode and codex, from hooksFor, which turns every entry of AGENT_HOOKS into a command that runs its script from the repo through hookCommand?'),
    'REQ-HOOKS-02': noul('Does checkAgentHooks add a problem when the hooks of a host file differ from hooksFor(host), rewrite the file instead when the write flag is given, and exit 1 when there is any problem?'),
    'REQ-HOOKS-03': noul('Does AGENT_HOOKS run the page-state script on UserPromptSubmit and on SessionStart for startup, resume, clear and compact, and does hookReply report every finding when the event is SessionStart or UserPromptSubmit?'),
    'REQ-HOOKS-04': noul('Does AGENT_HOOKS run the page-state script on PostToolUse with TOOL_MATCHER, which covers Bash, PowerShell, Monitor and every mcp__log__ tool, and does hookReply on PostToolUse report a finding only when it is not clear and its mark differs from memory.seen for that account?'),
    'REQ-HOOKS-05': noul('On Stop, does hookReply return decision block only when a finding is resolvable or an inspect goal is still open, does findingOf set resolvable false for a state only a person can clear, and does hookReply return no output when stop_hook_active is true and memory.stopBlocked equals the same marks?'),
    'REQ-HOOKS-06': noul('Does liveLogVerdict deny a log command when buffersOutput finds it piped through tail, head or Select-Object -First or -Last, does the liveLogs hook script, registered on PreToolUse for the shell tools, exit 2 with the deny on stderr, and does a long log run outside a Monitor get context telling it to start one?'),
    'REQ-HOOKS-07': noul('Does checkAgentHooks run every AGENT_HOOKS script with a sample of its event and add a problem when the script is missing, exits non-zero (except exit 2 with stderr on PreToolUse or Stop) or prints output that is not JSON, and add a problem when the PreToolUse script does not exit 2 on a log run piped through tail?'),
    'REQ-HOOKS-08': noul('Does checkAgentHooks add a problem for a command name with no MCP tool from commandTools that is not in TERMINAL_ONLY, and for a TERMINAL_ONLY key that is not a command name?'),
    'REQ-HOOKS-09': noul('Does checkAgentHooks add a problem for every tool from toolsFromCommands and toolsFromFlows for which toolIsHooked is false?'),
    'REQ-HOOKS-10': noul('Does checkAgentHooks add a problem for every MCP tool of a LONG_RUNNING command whose description does not point at the live log?'),
    'REQ-HOOKS-11': noul('Does checkAgentHooks add a problem for a PAGE_STATES state with no RESOLVE_CALLS entry, a RESOLVE_CALLS key that is not a page state, a resolver whose sample call names a tool that is not an MCP tool, and a state whose resolve text names a log command that is not in COMMANDS?'),
    'REQ-HOOKS-12': noul('Does the inbox hook script, on every event, call stopStaleWatchers and then ensureLiveWatchers for twitter, discord and slack accounts, leaving out accounts for which coolingDown is true, so that startTwitterWatch, startDiscordWatch and startSlackWatch run the account watch with --inbox, and does it put the messages from takePending into the agent context through inboxContext?'),
    'REQ-HOOKS-15': noul('Does claimChat create one claim row per chat for the calling process inside an immediate transaction, refuse another live process holding the same chat (an X chat matched by the person id or the pair), renew its own and take over a claim whose process ended or whose expiresAt passed; does guardSend claim the chat before each discord, slack, twitter dm, queue dm and instagram send and release it as sent, interrupted or failed; does every claim, renewal, refusal, send and release go to the actions table through recordAction; and does the inbox hook put claimContext, each pushed message with its eventIdOf id and its claim state, in front of the agent?'),
    'REQ-HOOKS-14': noul('Does ownOrAttach make the watch that wins claimWatcher the one owner, opening a relay with openRelay that records its owners row (pid, hostname, startedAt, a lastHeartbeat refreshed every HEARTBEAT_MS, status, port, token, subscribers) and broadcasting every event to every subscriber that sent the token, while a watch that loses attaches through attachRelay to a live owner session or, when it is an inbox watch, is refused; and does replaceHungOwners stop an owner whose heartbeat is older than STALE_MS and write a hungOwner alert? Do the twitter chat, discord, slack and instagram watch commands all go through ownOrAttach?'),
    'REQ-HOOKS-13': noul('Does claimWatcher write the owners row with the watcher pid in an immediate transaction, refuse a second watcher while the lock holder is alive by writing a duplicateWatcher alert, and take over a dead holder lock; does ensureLiveWatchers skip starting a watcher while watchHolder finds a live holder; does stopStaleWatchers also stop a live lock holder; and does the inbox hook put takeAlerts lines first in the agent context under ONE PROCESS PER ACCOUNT?'),
    'REQ-HOOKS-16': noul('Does appendEvent insert each event once by its eventId into the events table with an autoincrement seq inside an immediate transaction, store an event whose type is not in eventTypes with known 0 and add an unknownEventType alert through typeStatus, and time its received, appended and indexed stages; does takePending read events after the reader cursor and start a new reader at latestSeq; does importPendingFile import pending.jsonl only while events is empty; does claimChat give each new claim the next chatGenerations generation and stillHeld compare the holder and generation; do the discord and slack sends call guard.held() before every part after the first and stop when it is false; does releaseChat write its actions in the same transaction as deleting the claim; and does the relay broadcast drop a subscriber whose writableLength passes MAX_BUFFERED_BYTES?'),
    unspecifiedBehavior: noul('Does the hook code hold the turn on a state only a person can clear, let a log run piped through tail or head through, or let the check pass drift between the hooks, the CLI and the MCP tools by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-HOOKS-01': MET,
    'REQ-HOOKS-02': MET,
    'REQ-HOOKS-03': MET,
    'REQ-HOOKS-04': MET,
    'REQ-HOOKS-05': MET,
    'REQ-HOOKS-06': MET,
    'REQ-HOOKS-07': MET,
    'REQ-HOOKS-08': MET,
    'REQ-HOOKS-09': MET,
    'REQ-HOOKS-10': MET,
    'REQ-HOOKS-11': MET,
    'REQ-HOOKS-12': MET,
    'REQ-HOOKS-13': MET,
    'REQ-HOOKS-14': MET,
    'REQ-HOOKS-15': MET,
    'REQ-HOOKS-16': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
