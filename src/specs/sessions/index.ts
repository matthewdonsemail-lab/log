import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const CHECK_TYPES = 'src/platformKit/sessionCheck/types.ts'
const CHECK_CLIENT = 'src/platformKit/sessionCheck/client.ts'
const CHECK_MACHINE = 'src/platformKit/sessionCheck/machine.ts'
const CHECK_ROWS = 'src/platformKit/sessionCheck/helpers/rows.ts'
const SIGN_IN_MACHINE = 'src/platformKit/signIn/machine.ts'
const SIGN_IN_CLIENT = 'src/platformKit/signIn/client.ts'
const SIGN_IN_STORE = 'src/platformKit/signIn/helpers/store.ts'
const SHAPES = 'src/platformKit/signIn/helpers/sessionShapes.ts'
const START = 'src/cli/launch/helpers/start.ts'
const LIVE = 'src/cli/live/index.ts'
const SOCIAL = 'src/platformKit/socialAccount/client.ts'
const SESSIONS = 'src/cli/sessions/index.ts'
const ACTORS = 'src/cli/sessions/helpers/signInActors.ts'
const CONSOLE_CHECK = 'src/console/accountCheck/client.ts'
const CONSOLE_SIGN_IN = 'src/console/signIn/client.ts'
const BROWSER_CHECK = 'src/console/browserCheck/client.ts'
const OPERATIONS = 'src/console/operations/client.ts'
const TOOLS_FROM = 'src/mcp/server/helpers/toolsFromCommands.ts'
const HOSTED = 'python/controlService/tools.py'
const PAGE_STATE = 'src/browser/flow/helpers/pageState.ts'
const SURFACE = 'src/mcp/apps/signIn/client.ts'
const LINK = 'src/platformKit/signInLink/client.ts'
const LINK_STORE = 'src/platformKit/signInLink/helpers/store.ts'
const VIEWER_STATE = 'python/browser/viewerState.py'
const BRIDGE = 'src/runtime/bridge/client.ts'
const OPERATION_TYPES = 'src/console/operations/types.ts'
const SERVER = 'src/mcp/server/index.ts'
const RUNTIME = 'src/cli/runtime/index.ts'

export const sessions = {
  description: 'Whether an account is signed in, and signing it back in: one state, one gate and one machine on every surface',
  specPath: 'docs/specs/sessions.md',
  codePaths: [CHECK_TYPES, CHECK_CLIENT, CHECK_MACHINE, CHECK_ROWS, SIGN_IN_MACHINE, SIGN_IN_CLIENT, SIGN_IN_STORE, SHAPES, START, LIVE, SOCIAL, SESSIONS, ACTORS, CONSOLE_CHECK, CONSOLE_SIGN_IN, BROWSER_CHECK, OPERATIONS, TOOLS_FROM, PAGE_STATE, SURFACE, LINK, LINK_STORE, VIEWER_STATE, BRIDGE, OPERATION_TYPES],
  anchors: {
    'REQ-SESSIONS-01': [
      { kind: 'symbol', file: CHECK_TYPES, name: 'CHECK_STATES' },
      { kind: 'symbol', file: CHECK_TYPES, name: 'LEGACY_CHECK_STATES' },
      { kind: 'symbol', file: CHECK_ROWS, name: 'checkStateOfStored' },
      { kind: 'string', file: CHECK_CLIENT, includes: 'browserCheckRequired' },
    ],
    'REQ-SESSIONS-02': [
      { kind: 'symbol', file: CHECK_CLIENT, name: 'sessionGate' },
      { kind: 'symbol', file: CHECK_CLIENT, name: 'gateReport' },
      { kind: 'uses', file: CONSOLE_CHECK, name: 'sessionGate' },
      { kind: 'uses', file: BROWSER_CHECK, name: 'sessionGate' },
    ],
    'REQ-SESSIONS-03': [
      { kind: 'symbol', file: CHECK_MACHINE, name: 'sessionCheckMachine' },
      { kind: 'symbol', file: CHECK_ROWS, name: 'claimCheck' },
      { kind: 'symbol', file: CHECK_ROWS, name: 'reconcileChecks' },
      { kind: 'string', file: CHECK_ROWS, includes: 'checkInterrupted' },
      { kind: 'symbol', file: CHECK_CLIENT, name: 'runSessionCheck' },
      { kind: 'uses', file: SESSIONS, name: 'runSessionCheck' },
      { kind: 'uses', file: CONSOLE_CHECK, name: 'runSessionCheck' },
      { kind: 'symbol', file: 'src/platformKit/gates/helpers/commandGates.ts', name: 'isLongRunning' },
    ],
    'REQ-SESSIONS-04': [
      { kind: 'symbol', file: SIGN_IN_MACHINE, name: 'signInMachine' },
      { kind: 'symbol', file: SIGN_IN_MACHINE, name: 'signInMachineWith' },
      { kind: 'symbol', file: SIGN_IN_CLIENT, name: 'runSignIn' },
      { kind: 'symbol', file: SIGN_IN_STORE, name: 'logDbSignInStore' },
      { kind: 'string', file: SIGN_IN_MACHINE, includes: 'waitingForOwner' },
    ],
    'REQ-SESSIONS-05': [
      { kind: 'symbol', file: START, name: 'SIGN_IN_ROUTES' },
      { kind: 'symbol', file: SIGN_IN_CLIENT, name: 'signInRouteFor' },
    ],
    'REQ-SESSIONS-06': [
      { kind: 'symbol', file: SHAPES, name: 'browserSessionGate' },
      { kind: 'uses', file: LIVE, name: 'browserSessionGate' },
      { kind: 'uses', file: LIVE, name: 'recordSessionSave' },
      { kind: 'symbol', file: SOCIAL, name: 'savePlatformSession' },
      { kind: 'string', file: SOCIAL, includes: 'loggedIn' },
    ],
    'REQ-SESSIONS-07': [
      { kind: 'uses', file: SESSIONS, name: 'runSignIn' },
      { kind: 'symbol', file: ACTORS, name: 'signInActorsOf' },
      { kind: 'uses', file: CONSOLE_SIGN_IN, name: 'runSignIn' },
      { kind: 'symbol', file: CONSOLE_SIGN_IN, name: 'finishConsoleSignIn' },
      { kind: 'uses', file: OPERATIONS, name: 'finishConsoleSignIn' },
      { kind: 'string', file: HOSTED, includes: 'sessionsSignIn' },
    ],
    'REQ-SESSIONS-08': [
      { kind: 'symbol', file: PAGE_STATE, name: 'platformLoginState' },
      { kind: 'symbol', file: PAGE_STATE, name: 'platformOfUrl' },
    ],
    'REQ-SESSIONS-09': [
      { kind: 'symbol', file: SIGN_IN_CLIENT, name: 'accountNotConfigured' },
      { kind: 'uses', file: SESSIONS, name: 'accountNotConfigured' },
    ],
    'REQ-SESSIONS-10': [
      { kind: 'symbol', file: SURFACE, name: 'signInCall' },
      { kind: 'symbol', file: SURFACE, name: 'signInRungOf' },
      { kind: 'uses', file: SERVER, name: 'signInCall' },
      { kind: 'string', file: RUNTIME, includes: 'sessionsSignIn' },
      { kind: 'symbol', file: LINK, name: 'issueSignInLink' },
      { kind: 'symbol', file: LINK, name: 'redeemSignInLink' },
      { kind: 'uses', file: OPERATIONS, name: 'redeemSignInLink' },
      { kind: 'string', file: LINK_STORE, includes: 'RETURNING' },
    ],
    'REQ-SESSIONS-11': [
      { kind: 'symbol', file: VIEWER_STATE, name: 'viewer_state' },
      { kind: 'symbol', file: VIEWER_STATE, name: 'platform_of' },
    ],
    'REQ-SESSIONS-12': [
      { kind: 'symbol', file: OPERATION_TYPES, name: 'UNJOURNALED_TOOLS' },
      { kind: 'symbol', file: BRIDGE, name: 'connectOnce' },
    ],
  },
  rubrics: {
    'REQ-SESSIONS-01': noul('Is CHECK_STATES exactly signedIn, signInNeeded, stopped, unknown, checking and skipped, do the console and the session check use that one type, and are the old stored names read as signedIn, checking and unknown?'),
    'REQ-SESSIONS-02': noul('Does sessionGate refuse a deactivated account, a stopped status or session state, and a refused last check not replaced by a newer session check, and do sessionsCheck, the console check and the sign-in machine all reach it?'),
    'REQ-SESSIONS-03': noul('Does the check machine claim the account in log.db with its pid and start time, refuse a second check while a live process holds it, record a thrown check as unknown, and does reading the rows reconcile a checking row whose process is gone to unknown?'),
    'REQ-SESSIONS-04': noul('Is signInMachine built with setup() and named guards and actions, does every invoke have onError, does it go checking, then opening or saving, waitingForOwner, saving and rechecking, ending in signedIn, signInNeeded, stopped or failed, and is a machine waiting for the owner kept as its persisted snapshot and resumed?'),
    'REQ-SESSIONS-05': noul('Do the routes come from one table, browser for every platform with a browser and cookies where a cookie prompt exists, with X cookies only, and is a route the platform lacks refused?'),
    'REQ-SESSIONS-06': noul('Is a browser session saved only when the platform session cookies or token are in it, with sessionState and sessionCheckedAt written, is the outcome recorded and returned to the sign-in machine, and is a signed-out browser left without touching the stored session?'),
    'REQ-SESSIONS-07': noul('Do log sessions signIn, the sessionsSignIn tool and the console sign-in and browser close all run runSignIn, does the console pass pasted cookies through the context rather than a module change, and does the hosted relay list the four session tools?'),
    'REQ-SESSIONS-08': noul('Does pageStateOf resolve loginForm to Facebook sign-in only on facebook.com, and to the owner signing in on any other platform?'),
    'REQ-SESSIONS-09': noul('Does a sign-in or a check of an account that is not set up refuse with accountNotConfigured, carrying the platform and the step that adds the account, as structured data?'),
    'REQ-SESSIONS-10': noul('Does sessionsSignIn pick MCP Apps, then URL elicitation, then text from what the host declares, and is the link a console page that holds no secret, works once, expires in ten minutes, is refused to anyone but the person it was made for, and never carries the stream URL?'),
    'REQ-SESSIONS-11': noul('Does the viewer classify a password field as <platform>Login and a code field as <platform>TwoStep off facebook.com, keep Facebook classification on facebook.com, and treat a checkpoint or suspended address as a stop?'),
    'REQ-SESSIONS-12': noul('Do the browser-view app tools and the console frame and state polls run through the bridge without an operations row, while every other tool is journaled?'),
    unspecifiedBehavior: noul('Does a check or a sign-in retry a refused account, save a session with no sign-in cookies, or keep check state in module memory, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-SESSIONS-01': MET,
    'REQ-SESSIONS-02': MET,
    'REQ-SESSIONS-03': MET,
    'REQ-SESSIONS-04': MET,
    'REQ-SESSIONS-05': MET,
    'REQ-SESSIONS-06': MET,
    'REQ-SESSIONS-07': MET,
    'REQ-SESSIONS-08': MET,
    'REQ-SESSIONS-09': MET,
    'REQ-SESSIONS-10': MET,
    'REQ-SESSIONS-11': MET,
    'REQ-SESSIONS-12': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
