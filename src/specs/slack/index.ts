import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const SESSION = 'src/slack/account/session/client.ts'
const COMMAND = 'src/cli/slack/index.ts'
const PLATFORMS = 'src/cli/runner/helpers/platforms.ts'
const ROUTES = 'src/directApi/engine/client.ts'
const TRANSPORT = 'vendor/gabrielSlack/gabriel/core/transport.py'
const METADATA = 'vendor/gabrielSlack/gabriel/core/metadata.py'
const WS = 'vendor/gabrielSlack/gabriel/core/ws.py'
const CHECK = 'python/checks/slackTransport.py'

export const slack = {
  description: 'Slack: the account session, its engine, its own answer recorded, its wiring, and its curl_cffi transport',
  specPath: 'docs/specs/slack.md',
  codePaths: [SESSION, COMMAND, PLATFORMS, ROUTES, TRANSPORT, METADATA, WS, CHECK],
  anchors: {
    'REQ-SLACK-01': [
      { kind: 'symbol', file: SESSION, name: 'SLACK_PLATFORM' },
      { kind: 'symbol', file: SESSION, name: 'findSlackAccount' },
      { kind: 'symbol', file: SESSION, name: 'slackGate' },
      { kind: 'string', file: SESSION, includes: 'SLACK' },
    ],
    'REQ-SLACK-02': [
      { kind: 'symbol', file: SESSION, name: 'runSlackEngine' },
      { kind: 'string', file: SESSION, includes: 'slackApi' },
    ],
    'REQ-SLACK-03': [
      { kind: 'symbol', file: SESSION, name: 'recordSlackSession' },
      { kind: 'symbol', file: COMMAND, name: 'slackSessionCommand' },
    ],
    'REQ-SLACK-04': [
      { kind: 'string', file: PLATFORMS, includes: 'slack' },
      { kind: 'string', file: ROUTES, includes: 'slack' },
    ],
    'REQ-SLACK-05': [
      { kind: 'symbol', file: TRANSPORT, name: 'new_session' },
      { kind: 'symbol', file: TRANSPORT, name: 'ws_connect' },
      { kind: 'string', file: TRANSPORT, includes: 'chrome150' },
      { kind: 'string', file: TRANSPORT, includes: 'Chrome/150.0.0.0' },
      { kind: 'symbol', file: METADATA, name: 'DEFAULT_CLIENT_METADATA' },
      { kind: 'symbol', file: WS, name: 'default_ws_factory' },
      { kind: 'symbol', file: CHECK, name: 'touchpoints' },
    ],
  },
  rubrics: {
    'REQ-SLACK-01': noul('Does findSlackAccount find the account through findPlatformAccount with SLACK_PLATFORM, whose twentyPlatform is SLACK, and does slackGate check it with platformGate before the engine runs?'),
    'REQ-SLACK-02': noul('Does runSlackEngine run the account through runPlatformEngine with SLACK_PLATFORM, whose engine is python/slackApi/engine.py?'),
    'REQ-SLACK-03': noul('Does the slack session check command send nothing to Slack beyond the check, and record the answer Slack gave through recordSlackSession, which merges refreshed cookies for SLACK_COOKIE_DOMAIN back into the row?'),
    'REQ-SLACK-04': noul('Is slack listed in PLATFORMS and PLATFORM_SITES, and does DIRECT_ROUTES have a slackSession route for platform slack?'),
    'REQ-SLACK-05': noul('Does vendor/gabrielSlack reach Slack only through transport.py, where new_session makes the one curl_cffi AsyncSession with impersonate=IMPERSONATE (a chrome target), USER_AGENT is that same Chrome version, the client metadata default user_agent is USER_AGENT, the websocket opens through ws_connect on a new_session, no cookies are kept between calls, and no file imports httpx, websockets, aiohttp or requests?'),
    unspecifiedBehavior: noul('Does the Slack code call Slack outside the engine and its governor, or record anything but the answer Slack gave, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-SLACK-01': MET,
    'REQ-SLACK-02': MET,
    'REQ-SLACK-03': MET,
    'REQ-SLACK-04': MET,
    'REQ-SLACK-05': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
