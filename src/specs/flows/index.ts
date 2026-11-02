import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const record = 'src/browser/flow/helpers/flowFromRecording.ts'
const client = 'src/browser/flow/client.ts'
const cli = 'src/cli/flow/index.ts'
const session = 'src/cli/flow/helpers/flowSession.ts'
const overlays = 'src/browser/flow/helpers/overlays.ts'
const answers = 'src/browser/flow/helpers/answers.ts'
const match = 'python/browser/controlMatch.py'
const inspectPy = 'python/session/inspectSession.py'
const docsGate = 'scripts/checks/checkFacebookClientDocs.mjs'

export const flows = {
  description: 'A recording becomes a flow, a control is one scored match, every step waits for and checks the call it must cause',
  specPath: 'docs/specs/flows.md',
  codePaths: [
    'src/browser/flow/helpers/flowFromRecording.ts',
    'src/browser/flow/client.ts',
    'src/browser/flow/machine.ts',
    'src/browser/flow/helpers/overlays.ts',
    'src/browser/flow/helpers/answers.ts',
    'src/cli/flow/index.ts',
    'src/cli/flow/helpers/flowSession.ts',
    'src/mcp/server/helpers/toolsFromFlows.ts',
    'scripts/checks/checkFacebookClientDocs.mjs',
    'python/browser/controlMatch.py',
    'python/session/inspectSession.py',
  ],
  anchors: {
    'REQ-FLOW-01': [
      { kind: 'symbol', file: record, name: 'flowFromRecording' },
      { kind: 'symbol', file: client, name: 'readRecordedCommands' },
      { kind: 'symbol', file: client, name: 'saveFlow' },
      { kind: 'symbol', file: client, name: 'writeFlowDoc' },
      { kind: 'string', file: client, includes: './definitions' },
      { kind: 'string', file: cli, includes: '--name must be camelCase' },
    ],
    'REQ-FLOW-02': [{ kind: 'symbol', file: record, name: 'flowFromRecording' }],
    'REQ-FLOW-03': [{ kind: 'symbol', file: record, name: 'confirmingRequest' }],
    'REQ-FLOW-04': [{ kind: 'symbol', file: record, name: 'flowFromRecording' }],
    'REQ-FLOW-05': [
      { kind: 'string', file: client, includes: 'docs/platforms/facebook/flows' },
      { kind: 'symbol', file: client, name: 'writeFlowDoc' },
      { kind: 'string', file: docsGate, includes: 'definitions' },
    ],
    'REQ-FLOW-06': [{ kind: 'symbol', file: 'src/browser/flow/machine.ts', name: 'createFlowMachine' }],
    'REQ-FLOW-07': [{ kind: 'symbol', file: cli, name: 'runFlow' }],
    'REQ-FLOW-08': [
      { kind: 'value', file: 'src/mcp/server/helpers/toolAnnotations.ts', name: 'LIVE_SUFFIX', equals: 'Live' },
      { kind: 'symbol', file: 'src/mcp/server/helpers/toolsFromFlows.ts', name: 'toolsFromFlows' },
      { kind: 'symbol', file: 'src/browser/flow/helpers/renderFlowDoc.ts', name: 'toolName' },
    ],
    'REQ-FLOW-09': [
      { kind: 'symbol', file: match, name: 'pick' },
      { kind: 'symbol', file: match, name: 'norm' },
    ],
    'REQ-FLOW-10': [{ kind: 'symbol', file: match, name: 'pick' }],
    'REQ-FLOW-11': [{ kind: 'string', file: match, includes: 'controlAmbiguous' }],
    'REQ-FLOW-12': [{ kind: 'string', file: match, includes: 'controlMissing' }],
    'REQ-FLOW-13': [{ kind: 'string', file: inspectPy, includes: 'controlDisabled' }],
    'REQ-FLOW-14': [
      { kind: 'symbol', file: session, name: 'runFlowInSession' },
      { kind: 'symbol', file: answers, name: 'answerWait' },
    ],
    'REQ-FLOW-15': [
      { kind: 'symbol', file: answers, name: 'answersIssue' },
      { kind: 'symbol', file: answers, name: 'answerIssueOf' },
    ],
    'REQ-FLOW-16': [
      { kind: 'value', file: overlays, name: 'OVERLAY_CLEARS', path: ['browserNotificationsNotice', 'key'], equals: 'Escape' },
      { kind: 'value', file: overlays, name: 'OVERLAY_CLEARS', path: ['pastNoticeDialog', 'key'], equals: 'Escape' },
      { kind: 'string', file: overlays, includes: 'data.xfb_ixt_gateway_clear_flow' },
      { kind: 'symbol', file: overlays, name: 'PRESSING_ACTIONS' },
      { kind: 'symbol', file: session, name: 'clearOverlays' },
    ],
    'REQ-FLOW-17': [{ kind: 'string', file: session, includes: 'overlayNotCleared' }],
  },
  rubrics: {
    'REQ-FLOW-01': noul('Does the flow fromInspect subcommand refuse a --name that is not camelCase, and otherwise build the flow with flowFromRecording from readRecordedCommands and call both saveFlow and writeFlowDoc in the same call?'),
    'REQ-FLOW-02': noul('For a step that clicks or fills a ref, does flowFromRecording take the role and name of the element from readScreen of the snapshot of the previous command, and set within from dialogOf on that same snapshot?'),
    'REQ-FLOW-03': noul('Does confirmingRequest pick a 200 POST whose name ends in Mutation first, then a plain endpoint path, then a name ending in DialogQuery, and does flowFromRecording store it as the expect of the step?'),
    'REQ-FLOW-04': noul('Does flowFromRecording store the reaEvidenceId of each recorded command in the recorded field of its step?'),
    'REQ-FLOW-05': noul('Does writeFlowDoc write <name>.md into the flow docs folder, and does checkFacebookClientDocs report a problem for every JSON file in the flow definitions folder that has no matching doc in the flows docs folder?'),
    'REQ-FLOW-06': noul('Does createFlowMachine make one state per flow step, in order, where a step whose output is not ok, or whose actor throws, goes to the final state failed and records failedAt?'),
    'REQ-FLOW-07': noul('Does runFlow return the list of steps without opening any browser when the live flag is not set, and only open the account and run the flow in its session when it is set?'),
    'REQ-FLOW-08': noul('Does toolsFromFlows make two MCP tools for every saved flow, one named toolName(flow.name) that is a dry run and one with LIVE_SUFFIX added that runs it?'),
    'REQ-FLOW-09': noul('Does pick match a candidate only when its role equals the role of the step and one of aria, label, text or placeholder equals the name of the step, both compared after norm collapses whitespace and casefolds?'),
    'REQ-FLOW-10': noul('When within is given, does pick keep only candidates whose dialog equals within, and when within is not given and some match has a dialog, does it keep only the matches inside a dialog?'),
    'REQ-FLOW-11': noul('After narrowing by exact accessible name, enabled, not aria-hidden and hit, does pick return code controlAmbiguous when more than one candidate is left, rather than taking the first?'),
    'REQ-FLOW-12': noul('Does pick return code controlMissing when no candidate matches the role and name?'),
    'REQ-FLOW-13': noul('Does by_role in inspectSession.py return a locator only when pick found the control and it is enabled, and when the control is found but disabled, does it keep polling until its deadline and then fail with code controlDisabled, never pressing a disabled control?'),
    'REQ-FLOW-14': noul('Does runFlowInSession send each step with step.expect, or answerWait(step.answers), as the call to wait for, and in the step method of inspectSession.py is ok false when an expected request was not seen?'),
    'REQ-FLOW-15': noul('After a step that went ok, does runFlowInSession run answersIssue on the exchanges of the step and fail the step on its issue, and does answerIssueOf report an issue when the call was never answered, when none of its answers had a 2xx status, when the last 2xx answer has errors, or when a check in says does not hold?'),
    'REQ-FLOW-16': noul('Before the first step whose action is in PRESSING_ACTIONS (click, fill, upload, setLocation), does runFlowInSession call clearOverlays, which presses the key of each overlay found from OVERLAY_CLEARS and checks its answers with answersIssue?'),
    'REQ-FLOW-17': noul('When clearOverlays returns a reason, such as the same overlay still being there after its key or its answer not as expected, does runFlowInSession fail the step with issue overlayNotCleared?'),
    unspecifiedBehavior: noul('Does a flow step act on a control picked by a guess, such as the first of several matches or a match outside the named dialog, or go on to the next step without waiting for and checking its call, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-FLOW-01': MET,
    'REQ-FLOW-02': MET,
    'REQ-FLOW-03': MET,
    'REQ-FLOW-04': MET,
    'REQ-FLOW-05': MET,
    'REQ-FLOW-06': MET,
    'REQ-FLOW-07': MET,
    'REQ-FLOW-08': MET,
    'REQ-FLOW-09': MET,
    'REQ-FLOW-10': MET,
    'REQ-FLOW-11': MET,
    'REQ-FLOW-12': MET,
    'REQ-FLOW-13': MET,
    'REQ-FLOW-14': MET,
    'REQ-FLOW-15': MET,
    'REQ-FLOW-16': MET,
    'REQ-FLOW-17': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
