import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const states = 'src/browser/flow/helpers/pageState.ts'
const hook = 'src/agentHooks/pageState/index.ts'
const registry = 'src/agentHooks/registry/index.ts'

export const pageStates = {
  description: 'Known page states get their resolver, only a person state stops an account, and the page-state hook says it',
  specPath: 'docs/specs/pageStates.md',
  codePaths: [
    'src/browser/flow/helpers/pageState.ts',
    'src/agentHooks/pageState/index.ts',
    'src/agentHooks/pageState/types.ts',
    'src/agentHooks/registry/index.ts',
    'src/browser/inspect/helpers/browserStates.ts',
    'scripts/hooks/pageState.ts',
  ],
  anchors: {
    'REQ-STATE-01': [
      { kind: 'symbol', file: states, name: 'PAGE_STATES' },
      { kind: 'symbol', file: states, name: 'pageStateOf' },
      { kind: 'symbol', file: states, name: 'PageState' },
    ],
    'REQ-STATE-02': [{ kind: 'symbol', file: states, name: 'pageStateOf' }],
    'REQ-STATE-03': [{ kind: 'string', file: states, includes: 'checkpointStart' }],
    'REQ-STATE-04': [
      { kind: 'string', file: states, includes: 'textCaptcha' },
      { kind: 'string', file: states, includes: 'solve' },
    ],
    'REQ-STATE-05': [
      { kind: 'string', file: states, includes: 'rememberPassword' },
      { kind: 'string', file: states, includes: 'Not now' },
    ],
    'REQ-STATE-06': [
      { kind: 'string', file: states, includes: 'loginForm' },
      { kind: 'string', file: states, includes: 'signIn' },
      { kind: 'string', file: states, includes: 'twoStepCode' },
    ],
    'REQ-STATE-07': [
      { kind: 'string', file: states, includes: 'automatedBehaviour' },
      { kind: 'symbol', file: states, name: 'refOf' },
    ],
    'REQ-STATE-09': [
      { kind: 'string', file: states, includes: 'disabled' },
      { kind: 'string', file: states, includes: 'videoSelfie' },
      { kind: 'string', file: states, includes: 'identityVerificationHold' },
      { kind: 'symbol', file: states, name: 'resolveCallOf' },
      { kind: 'symbol', file: hook, name: 'findingOf' },
    ],
    'REQ-STATE-10': [
      { kind: 'string', file: states, includes: 'groupMembersList' },
      { kind: 'value', file: states, name: 'GROUP_MEMBERS_REFETCH', equals: 'GroupsCometMembersPageNewMembersSectionRefetchQuery' },
    ],
    'REQ-STATE-11': [
      { kind: 'symbol', file: registry, name: 'TOOL_MATCHER' },
      { kind: 'value', file: registry, name: 'PAGE_STATE', equals: 'scripts/hooks/pageState.ts' },
      { kind: 'string', file: 'scripts/hooks/pageState.ts', includes: 'PostToolUse' },
    ],
    'REQ-STATE-12': [{ kind: 'symbol', file: hook, name: 'hookReply' }],
    'REQ-STATE-13': [{ kind: 'symbol', file: hook, name: 'hookReply' }],
    'REQ-STATE-14': [{ kind: 'symbol', file: hook, name: 'findingOf' }],
    'REQ-STATE-15': [{ kind: 'symbol', file: hook, name: 'hookReply' }],
    'REQ-STATE-16': [{ kind: 'symbol', file: hook, name: 'hookReply' }],
  },
  rubrics: {
    'REQ-STATE-01': noul('Does pageStateOf walk the single PAGE_STATES list in order, skipping an entry whose url test does not match the URL and an entry whose text test does not match the page text (when no answer test decides it), and return the id, what, resolve and person fields of the first entry that passes every test it has?'),
    'REQ-STATE-02': noul('In pageStateOf, when an entry has an answer test and context.exchanges is not empty, is the entry matched by that answer test alone, with the text test used only when there are no exchanges?'),
    'REQ-STATE-03': noul('Is the checkpointStart entry in PAGE_STATES marked person true, and does its resolver in RESOLVE_CALLS return null, so nothing on that page is clicked?'),
    'REQ-STATE-04': noul('Is the textCaptcha resolver in RESOLVE_CALLS a live solve step?'),
    'REQ-STATE-05': noul('Is the rememberPassword resolver in RESOLVE_CALLS a live clickRole on the button "Not now"?'),
    'REQ-STATE-06': noul('Is the loginForm resolver in RESOLVE_CALLS a live signIn step and the twoStepCode resolver a live code step?'),
    'REQ-STATE-07': noul('Is the automatedBehaviour resolver in RESOLVE_CALLS a live click on the ref, found with refOf, of its Dismiss or Continue control?'),
    'REQ-STATE-08': noul('Is the last PAGE_STATES entry, checkpoint, matched on any /checkpoint URL with person set to true and a null resolver in RESOLVE_CALLS, while twoStepCode, which also matches a /checkpoint URL, comes before it in the list?'),
    'REQ-STATE-09': noul('Are the disabled, videoSelfie and identityVerificationHold entries in PAGE_STATES marked person true, does resolveCallOf return null for a person state, and does findingOf give such a state a line saying to stop the account and tell matt with resolvable false?'),
    'REQ-STATE-10': noul('For a state with needsNothing set, such as groupMembersList, does resolveCallOf return null and does findingOf return resolvable false?'),
    'REQ-STATE-11': noul('Does AGENT_HOOKS register the PAGE_STATE script on SessionStart, on UserPromptSubmit, on PostToolUse with TOOL_MATCHER (Bash, PowerShell, Monitor and every mcp__log__ tool), and on Stop?'),
    'REQ-STATE-12': noul('On SessionStart and UserPromptSubmit, does hookReply include the line of every finding, including findings of kind clear?'),
    'REQ-STATE-13': noul('On PostToolUse, does hookReply include the line of a finding only when its kind is not clear and its mark differs from memory.seen for that account?'),
    'REQ-STATE-14': noul('When at.failed is set and no page state matches, does findingOf return kind failed with resolvable true and a line saying to take a snapshot and then the resolver?'),
    'REQ-STATE-15': noul('On the Stop event, does hookReply return decision block when any finding is resolvable, and does it leave out findings that are not resolvable, such as a person state?'),
    'REQ-STATE-16': noul('On the Stop event, when stopHookActive is true and memory.stopBlocked equals the marks of the open findings, does hookReply return no output?'),
    unspecifiedBehavior: noul('Does the page-state map or hook stop an account, or let a turn end, on a state the system can resolve itself, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-STATE-01': MET,
    'REQ-STATE-02': MET,
    'REQ-STATE-03': MET,
    'REQ-STATE-04': MET,
    'REQ-STATE-05': MET,
    'REQ-STATE-06': MET,
    'REQ-STATE-07': MET,
    'REQ-STATE-08': MET,
    'REQ-STATE-09': MET,
    'REQ-STATE-10': MET,
    'REQ-STATE-11': MET,
    'REQ-STATE-12': MET,
    'REQ-STATE-13': MET,
    'REQ-STATE-14': MET,
    'REQ-STATE-15': MET,
    'REQ-STATE-16': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
