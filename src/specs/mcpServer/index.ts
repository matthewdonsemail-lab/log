import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const RULES = 'src/mcp/server/helpers/agentRules.ts'
const GUIDES = 'src/mcp/server/helpers/guides.ts'
const SERVER = 'src/mcp/server/index.ts'
const TYPES = 'src/mcp/server/types.ts'
const LIVE_LOG = 'src/agentHooks/liveLog/index.ts'
const FRESHNESS = 'src/mcp/freshness/client.ts'
const ENGINES = 'scripts/hooks/engines.ts'
const REVIEW = 'src/useCases/review/client.ts'

export const mcpServer = {
  description: 'The log MCP server: the rules in its instructions and tools, the guides and use cases, and the hooks that keep agents on it',
  specPath: 'docs/specs/mcpServer.md',
  codePaths: [
    'src/mcp/server/helpers/agentRules.ts',
    'src/mcp/server/helpers/guides.ts',
    'src/mcp/server/helpers/toolsFromCommands.ts',
    'src/mcp/server/helpers/toolsFromFlows.ts',
    'src/mcp/server/index.ts',
    'src/mcp/server/types.ts',
    'src/agentHooks/liveLog/index.ts',
    'src/mcp/freshness/client.ts',
    'scripts/hooks/engines.ts',
    'src/useCases/review/client.ts',
    'scripts/checks/checkUseCases.ts',
  ],
  anchors: {
    'REQ-MCP-01': [
      { kind: 'symbol', file: RULES, name: 'SERVER_INSTRUCTIONS' },
      { kind: 'string', file: RULES, includes: "Rule one, above every other: if we don't know, we do this" },
      { kind: 'string', file: RULES, includes: '(rules 73-76)' },
      { kind: 'string', file: RULES, includes: '(rule 30)' },
    ],
    'REQ-MCP-02': [
      { kind: 'string', file: RULES, includes: 'You MUST load the full guide before other log tools: getGuide({ topic: "logMcpInstructions" }). Do this once per session' },
      { kind: 'value', file: GUIDES, name: 'CORE_GUIDE', equals: 'logMcpInstructions' },
      { kind: 'value', file: GUIDES, name: 'GUIDE_TOOL', equals: 'getGuide' },
    ],
    'REQ-MCP-03': [
      { kind: 'value', file: RULES, name: 'AGENTS_URI', equals: 'log://agents' },
      { kind: 'symbol', file: SERVER, name: 'AGENTS_MD' },
      { kind: 'string', file: SERVER, includes: 'AGENTS.md' },
    ],
    'REQ-MCP-04': [
      { kind: 'value', file: RULES, name: 'EVERY_TOOL_RULES', equals: [30, 38, 39, 40, 41] },
      { kind: 'symbol', file: RULES, name: 'COMMAND_RULES' },
      { kind: 'symbol', file: RULES, name: 'rulesLine' },
    ],
    'REQ-MCP-05': [
      { kind: 'symbol', file: GUIDES, name: 'guideOfCommand' },
      { kind: 'symbol', file: GUIDES, name: 'guideLine' },
      { kind: 'symbol', file: GUIDES, name: 'FLOWS_GUIDE' },
    ],
    'REQ-MCP-06': [
      { kind: 'symbol', file: GUIDES, name: 'readGuide' },
      { kind: 'symbol', file: GUIDES, name: 'readUseCase' },
      { kind: 'string', file: GUIDES, includes: 'docs/guides/' },
      { kind: 'string', file: GUIDES, includes: 'docs/useCases/' },
    ],
    'REQ-MCP-07': [
      { kind: 'symbol', file: GUIDES, name: 'listUseCases' },
      { kind: 'symbol', file: GUIDES, name: 'useCaseLine' },
      { kind: 'symbol', file: GUIDES, name: 'withUseCases' },
    ],
    'REQ-MCP-08': [
      { kind: 'symbol', file: TYPES, name: 'RESULT_SIZE_META' },
      { kind: 'string', file: TYPES, includes: 'anthropic/maxResultSizeChars' },
    ],
    'REQ-MCP-09': [
      { kind: 'symbol', file: REVIEW, name: 'latestSession' },
      { kind: 'symbol', file: REVIEW, name: 'sessionDigest' },
      { kind: 'symbol', file: REVIEW, name: 'reviewQuestions' },
      { kind: 'symbol', file: REVIEW, name: 'readReview' },
    ],
    'REQ-MCP-10': [
      { kind: 'symbol', file: LIVE_LOG, name: 'logCommandOf' },
      { kind: 'symbol', file: LIVE_LOG, name: 'handRunDenial' },
      { kind: 'symbol', file: LIVE_LOG, name: 'liveLogVerdict' },
    ],
    'REQ-MCP-11': [{ kind: 'symbol', file: TYPES, name: 'TERMINAL_ONLY' }],
    'REQ-MCP-12': [
      { kind: 'symbol', file: FRESHNESS, name: 'codeStamp' },
      { kind: 'symbol', file: FRESHNESS, name: 'recordServerStart' },
      { kind: 'symbol', file: FRESHNESS, name: 'staleServerLine' },
    ],
    'REQ-MCP-13': [
      { kind: 'symbol', file: FRESHNESS, name: 'uncommittedFiles' },
      { kind: 'symbol', file: FRESHNESS, name: 'localChangesLine' },
      { kind: 'value', file: FRESHNESS, name: 'LOCAL_PATHS', equals: ['src', 'python', 'vendor', 'bin', 'scripts', 'package.json'] },
      { kind: 'string', file: FRESHNESS, includes: '--porcelain' },
    ],
    'REQ-MCP-14': [
      { kind: 'string', file: ENGINES, includes: '.lastHook' },
      { kind: 'string', file: ENGINES, includes: 'SessionStart' },
    ],
  },
  rubrics: {
    'REQ-MCP-01': noul('In SERVER_INSTRUCTIONS, is the first numbered line rule one and the second numbered line rule 30, and does every numbered line name its rule numbers?'),
    'REQ-MCP-03': noul('Does the server list exactly one resource, AGENTS_URI, and answer a read of it with the text of the AGENTS_MD file read from disk at the time of the read?'),
    'REQ-MCP-04': noul('Is rulesLine, which joins COMMAND_RULES for the command with EVERY_TOOL_RULES, appended as the last line of the description of every typed, args and flow tool?'),
    'REQ-MCP-05': noul('Do the typed and args tool descriptions include guideLine for the topic guideOfCommand finds for the command, and do flow tool descriptions include guideLine(FLOWS_GUIDE)?'),
    'REQ-MCP-06': noul('Does runToolCall answer getGuide with readUseCase when useCase is given, otherwise with readGuide for topic, defaulting to CORE_GUIDE when no topic is given, and with an isError result listing the topics or use cases there are when the one asked for is unknown?'),
    'REQ-MCP-07': noul('Does withUseCases insert useCaseLine, naming every use case whose page names the tool in backticks, before the "Before first using this tool" guide line of that tool, and does the ListTools handler apply withUseCases to the tools it lists?'),
    'REQ-MCP-08': noul('Does the ListTools handler add RESULT_SIZE_META as _meta to every tool it lists, the getGuide tool included?'),
    'REQ-MCP-09': noul('Does checkUseCases ask SubQ reviewQuestions for every page from listUseCases against sessionDigest of the latest session, and exit 1 when readReview says it blocks, a page blocking only when it is not current, its confidence reaches blockAt and it is not staged, and uncovered work blocking only when no new page is staged?'),
    'REQ-MCP-10': noul('Does liveLogVerdict return the deny from handRunDenial for every command logCommandOf recognises as an installed log command or bun bin/log.ts, before it checks for tail or head?'),
    'REQ-MCP-11': noul('Does handRunDenial return null, so nothing is refused, for a command name that is a key of TERMINAL_ONLY, and a denial for every other name?'),
    'REQ-MCP-12': noul('Is staleServerLine(repo) one of the parts the engines hook joins into its text, and does staleServerLine return a line telling matt to restart and never to work around it with a hand-run command when the recorded server pid is alive and codeStamp of the checkout is newer than the recorded stamp, and null otherwise?'),
    'REQ-MCP-13': noul('Does localChangesLine return null when there are no files, and otherwise a line starting with >>> UNCOMMITTED LOCAL CHANGES that lists the files and says to read each diff and never overwrite, revert, stage, publish or ship them without matt?'),
    'REQ-MCP-14': noul('Does the engines hook write its text when the event is SessionStart, and on any other event only when the text differs from the one saved in its last hook file?'),
    unspecifiedBehavior: noul('Does the server list a tool without its rules line or result size limit, or let a hand-run log command through, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-MCP-01': MET,
    'REQ-MCP-03': MET,
    'REQ-MCP-04': MET,
    'REQ-MCP-05': MET,
    'REQ-MCP-06': MET,
    'REQ-MCP-07': MET,
    'REQ-MCP-08': MET,
    'REQ-MCP-09': MET,
    'REQ-MCP-10': MET,
    'REQ-MCP-11': MET,
    'REQ-MCP-12': MET,
    'REQ-MCP-13': MET,
    'REQ-MCP-14': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
