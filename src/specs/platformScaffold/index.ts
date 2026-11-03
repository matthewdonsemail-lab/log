import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const SCAFFOLD = 'src/scaffold/platform/client.ts'
const AST = 'src/scaffold/platform/helpers/astEdits.ts'
const NEW = 'src/cli/new/index.ts'
const PLATFORMS = 'src/cli/runner/helpers/platforms.ts'
const CHECK = 'scripts/checks/checkPlatforms.ts'
const TEMPLATES = 'src/scaffold/platform/helpers/templates.ts'

export const platformScaffold = {
  description: 'log new platform and PLATFORM_SITES: one command makes a platform whole, one table says what each platform is',
  specPath: 'docs/specs/platformScaffold.md',
  codePaths: [
    'src/scaffold/platform/client.ts',
    'src/scaffold/platform/helpers/astEdits.ts',
    'src/scaffold/platform/types.ts',
    'src/scaffold/platform/helpers/templates.ts',
    'src/cli/new/index.ts',
    'scripts/checks/checkPlatforms.ts',
    'src/cli/runner/helpers/platforms.ts',
    'src/browser/inspect/helpers/parseInspectAction.ts',
    'src/marketplace/socialAccount/helpers/checkRunnable.ts',
    'src/browser/adsPower/helpers/planSync.ts',
    'src/browser/adsPower/helpers/profileRequest.ts',
  ],
  anchors: {
    'REQ-PLATFORM-14': [
      { kind: 'symbol', file: TEMPLATES, name: 'specDoc' },
      { kind: 'symbol', file: TEMPLATES, name: 'specIndex' },
      { kind: 'symbol', file: SCAFFOLD, name: 'planNewPlatform' },
    ],
    'REQ-PLATFORM-01': [
      { kind: 'symbol', file: SCAFFOLD, name: 'planNewPlatform' },
      { kind: 'symbol', file: NEW, name: 'newCommand' },
    ],
    'REQ-PLATFORM-02': [
      { kind: 'symbol', file: AST, name: 'addToArray' },
      { kind: 'symbol', file: AST, name: 'addToObject' },
      { kind: 'symbol', file: AST, name: 'addImport' },
      { kind: 'symbol', file: AST, name: 'addToReturnedObject' },
      { kind: 'symbol', file: AST, name: 'addToInterface' },
      { kind: 'string', file: SCAFFOLD, includes: 'PLATFORMS' },
      { kind: 'string', file: SCAFFOLD, includes: 'PLATFORM_LABELS' },
      { kind: 'string', file: SCAFFOLD, includes: 'PLATFORM_SITES' },
      { kind: 'string', file: SCAFFOLD, includes: 'COMMANDS' },
      { kind: 'string', file: SCAFFOLD, includes: 'COMMAND_INDEX' },
      { kind: 'string', file: SCAFFOLD, includes: 'createContext' },
      { kind: 'string', file: SCAFFOLD, includes: 'CommandContext' },
      { kind: 'string', file: SCAFFOLD, includes: 'DIRECT_ROUTES' },
      { kind: 'string', file: SCAFFOLD, includes: 'COMMAND_RULES' },
    ],
    'REQ-PLATFORM-03': [{ kind: 'symbol', file: SCAFFOLD, name: 'applyPlan' }],
    'REQ-PLATFORM-04': [{ kind: 'string', file: NEW, includes: 'apply' }],
    'REQ-PLATFORM-06': [{ kind: 'symbol', file: SCAFFOLD, name: 'PLATFORM_NAME' }],
    'REQ-PLATFORM-07': [{ kind: 'symbol', file: SCAFFOLD, name: 'twentyPlatforms' }],
    'REQ-PLATFORM-08': [
      { kind: 'symbol', file: SCAFFOLD, name: 'namesOf' },
      { kind: 'string', file: NEW, includes: 'hosts' },
      { kind: 'string', file: NEW, includes: 'home' },
      { kind: 'string', file: NEW, includes: 'noProxy' },
      { kind: 'string', file: NEW, includes: 'noBrowser' },
    ],
    'REQ-PLATFORM-09': [
      { kind: 'string', file: CHECK, includes: 'session' },
    ],
    'REQ-PLATFORM-10': [
      { kind: 'symbol', file: PLATFORMS, name: 'PlatformSite' },
      { kind: 'symbol', file: PLATFORMS, name: 'PLATFORM_SITES' },
      { kind: 'value', file: PLATFORMS, name: 'PLATFORM_SITES', path: ['facebook', 'proxy'], equals: 'required' },
      { kind: 'value', file: PLATFORMS, name: 'PLATFORM_SITES', path: ['twitter', 'browser'], equals: false },
      { kind: 'value', file: PLATFORMS, name: 'PLATFORM_SITES', path: ['reddit', 'proxy'], equals: 'none' },
    ],
    'REQ-PLATFORM-11': [
      { kind: 'symbol', file: PLATFORMS, name: 'hostOnPlatforms' },
      { kind: 'symbol', file: 'src/browser/inspect/helpers/parseInspectAction.ts', name: 'parseInspectAction' },
    ],
    'REQ-PLATFORM-12': [{ kind: 'symbol', file: 'src/marketplace/socialAccount/helpers/checkRunnable.ts', name: 'checkRunnable' }],
    'REQ-PLATFORM-13': [
      { kind: 'symbol', file: 'src/browser/adsPower/helpers/planSync.ts', name: 'planSync' },
      { kind: 'symbol', file: 'src/browser/adsPower/helpers/profileRequest.ts', name: 'profileRequest' },
    ],
  },
  rubrics: {
    'REQ-PLATFORM-01': noul('Does planNewPlatform plan the account session client and index under src/<name>/account, the session command under src/cli/<name> with its test, python/<name>Api with its __init__.py and engine.py on the shared engine kit, and docs/platforms/<name>/README.md?'),
    'REQ-PLATFORM-02': noul('Does planNewPlatform plan every edit to the repo through the astEdits helpers, which parse the source into a syntax tree rather than searching its text, and key the new DIRECT_ROUTES and COMMAND_RULES entries by the platform-qualified sessionKey?'),
    'REQ-PLATFORM-03': noul('Does applyPlan apply every edit in memory, throw before writing any file when any edit.landed returns false, and only then write the planned files and the edited sources?'),
    'REQ-PLATFORM-04': noul('When the apply flag is not given, does newCommand return the list of planned files, edits and notes without calling applyPlan or writing anything?'),
    'REQ-PLATFORM-05': noul('Does planNewPlatform throw when PLATFORMS already has the name, and throw when any planned file path already exists, before anything is written?'),
    'REQ-PLATFORM-06': noul('Does planNewPlatform throw before planning anything when the name does not match PLATFORM_NAME, a camelCase name starting with a lowercase letter?'),
    'REQ-PLATFORM-07': noul('Does planNewPlatform add a note when twentyPlatforms (read from the generated schema) lacks the twentyPlatform value of the new platform, and does nothing in the new platform command or applyPlan write to Twenty?'),
    'REQ-PLATFORM-08': noul('Does namesOf set hosts from the hosts option (default <name>.com), home from the home option (default https://www.<first host>/), proxy to none when noProxy is set and required otherwise, and browser to false when noBrowser is set, and does planNewPlatform refuse a home that is not https on one of the hosts?'),
    'REQ-PLATFORM-09': noul('Does checkPlatforms add a problem for a platform with no PLATFORM_SITES entry, no PLATFORM_LABELS entry, no src/<platform>, no src/cli/<platform>/index.ts, no python/<platform>Api/engine.py, no docs, no session command, no DIRECT_ROUTES.<platform>Session, or a command without its COMMAND_RULES or DIRECT_ROUTES entry under commandKey, and exit 1 when there is any problem?'),
    'REQ-PLATFORM-11': noul('Does parseInspectAction refuse goto when hostOnPlatforms is false, and does hostOnPlatforms return true only for an https URL whose hostname equals, or ends with a dot and, a host in PLATFORM_SITES?'),
    'REQ-PLATFORM-12': noul('For an account that is not FACEBOOK, does checkRunnable refuse it when its site has no browser path, and return ok with a direct connection and no proxy server when its site proxy is none, while a FACEBOOK account still needs a proxy and a homeCountry?'),
    'REQ-PLATFORM-13': noul('Does planSync skip the homes check and the home locale check for an account whose site proxy is none, and does profileRequest use the US home (en-US) when such an account has no home?'),
    'REQ-PLATFORM-14': noul('Does planNewPlatform add docs/specs/<name>.md from specDoc and src/specs/<name>/index.ts from specIndex to the files it writes, and does specIndex give every requirement in specDoc anchors on symbols or strings in the session client, the cli command, PLATFORMS and DIRECT_ROUTES that the plan writes or edits, with a rubric for each and MET assertions?'),
    unspecifiedBehavior: noul('Does the code write files or edits for a new platform, overwrite an existing one, change Twenty, or open a browser for a platform outside PLATFORM_SITES, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-PLATFORM-01': MET,
    'REQ-PLATFORM-02': MET,
    'REQ-PLATFORM-03': MET,
    'REQ-PLATFORM-04': MET,
    'REQ-PLATFORM-05': MET,
    'REQ-PLATFORM-06': MET,
    'REQ-PLATFORM-07': MET,
    'REQ-PLATFORM-08': MET,
    'REQ-PLATFORM-09': MET,
    'REQ-PLATFORM-11': MET,
    'REQ-PLATFORM-12': MET,
    'REQ-PLATFORM-13': MET,
    'REQ-PLATFORM-14': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
