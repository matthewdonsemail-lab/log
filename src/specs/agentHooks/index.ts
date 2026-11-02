import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

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
  ],
  rubrics: {
    'REQ-HOOKS-01': noul('Does checkAgentHooks write both .claude/settings.json (claudeCode) and .codex/hooks.json (codex) from hooksFor, which builds every entry of AGENT_HOOKS into a command running its script through hookCommand?'),
    'REQ-HOOKS-02': noul('Does checkAgentHooks add a problem when a host file\'s hooks differ from hooksFor(host), rewrite the file instead when --write is given, and exit 1 when there is any problem?'),
    'REQ-HOOKS-03': noul('Does AGENT_HOOKS contain both an entry with event UserPromptSubmit and script PAGE_STATE, and an entry with event SessionStart, script PAGE_STATE and matcher startup|resume|clear|compact, and does hookReply report every finding when the event is SessionStart or UserPromptSubmit?'),
    'REQ-HOOKS-04': noul('Does AGENT_HOOKS run scripts/hooks/pageState.ts on PostToolUse with TOOL_MATCHER covering Bash, PowerShell, Monitor and mcp__log__ tools, and does hookReply on PostToolUse report a finding only when it is not clear and its mark differs from memory.seen for that account?'),
    'REQ-HOOKS-05': noul('On Stop, does hookReply return decision block only when a finding is resolvable or a goal note blocks, does findingOf set resolvable false for a state whose person is true, and does hookReply return no output when stop_hook_active is true and memory.stopBlocked equals the same marks?'),
    'REQ-HOOKS-06': noul('Does liveLogVerdict deny a log command when buffersOutput finds it piped through tail, head or Select-Object -First or -Last, and does scripts/hooks/liveLogs.ts exit 2 with the deny on stderr?'),
    'REQ-HOOKS-07': noul('Does checkAgentHooks run every AGENT_HOOKS script with a sample of its event and add a problem when the script is missing, exits non-zero (except exit 2 with stderr on PreToolUse or Stop) or prints output that is not JSON, and add a problem when the PreToolUse script does not exit 2 on a log run piped through tail?'),
    'REQ-HOOKS-08': noul('Does checkAgentHooks add a problem for a command name with no MCP tool from commandTools that is not in TERMINAL_ONLY, and for a TERMINAL_ONLY key that is not a command name?'),
    'REQ-HOOKS-09': noul('Does checkAgentHooks add a problem for every tool from toolsFromCommands and toolsFromFlows for which toolIsHooked is false?'),
    'REQ-HOOKS-10': noul('Does checkAgentHooks add a problem for a LONG_RUNNING command whose MCP tool description does not include ~/.logCli/mcp/<day>.log?'),
    'REQ-HOOKS-11': noul('Does checkAgentHooks add a problem for a PAGE_STATES state not in RESOLVE_CALLS, a RESOLVE_CALLS key that is not a page state, a resolver whose sample tool is not an MCP tool, and a state.resolve naming a log command that is not in COMMANDS?'),
    unspecifiedBehavior: noul('Does the hook code hold the turn on a person\'s state, let a log run piped through tail or head through, or let the check pass drift between the hooks, the CLI and the MCP tools by a route the specification does not describe?'),
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
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
