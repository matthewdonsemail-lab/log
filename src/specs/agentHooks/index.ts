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
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
