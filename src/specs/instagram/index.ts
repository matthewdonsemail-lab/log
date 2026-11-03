import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const SESSION = 'src/instagram/account/session/client.ts'
const COMMAND = 'src/cli/instagram/index.ts'
const PLATFORMS = 'src/cli/runner/helpers/platforms.ts'
const ROUTES = 'src/directApi/engine/client.ts'
const ENGINE = 'python/instagramApi/engine.py'

export const instagram = {
  description: 'Instagram: the account session, its engine, its own answer recorded, and its wiring',
  specPath: 'docs/specs/instagram.md',
  codePaths: [SESSION, COMMAND, PLATFORMS, ROUTES, ENGINE],
  anchors: {
    'REQ-INSTAGRAM-01': [
      { kind: 'symbol', file: SESSION, name: 'INSTAGRAM_PLATFORM' },
      { kind: 'symbol', file: SESSION, name: 'findInstagramAccount' },
      { kind: 'symbol', file: SESSION, name: 'instagramGate' },
      { kind: 'string', file: SESSION, includes: 'INSTAGRAM' },
    ],
    'REQ-INSTAGRAM-02': [
      { kind: 'symbol', file: SESSION, name: 'runInstagramEngine' },
      { kind: 'string', file: SESSION, includes: 'instagramApi' },
    ],
    'REQ-INSTAGRAM-03': [
      { kind: 'symbol', file: SESSION, name: 'recordInstagramSession' },
      { kind: 'symbol', file: COMMAND, name: 'instagramSessionCommand' },
    ],
    'REQ-INSTAGRAM-05': [
      { kind: 'string', file: ENGINE, includes: 'vendor/instagrapi' },
      { kind: 'string', file: ENGINE, includes: 'curl' },
      { kind: 'string', file: ENGINE, includes: 'challenged' },
      { kind: 'string', file: ENGINE, includes: 'sessionMismatch' },
    ],
    'REQ-INSTAGRAM-04': [
      { kind: 'string', file: PLATFORMS, includes: 'instagram' },
      { kind: 'string', file: ROUTES, includes: 'instagram' },
    ],
  },
  rubrics: {
    'REQ-INSTAGRAM-01': noul('Does findInstagramAccount find the account through findPlatformAccount with INSTAGRAM_PLATFORM, whose twentyPlatform is INSTAGRAM, and does instagramGate check it with platformGate before the engine runs?'),
    'REQ-INSTAGRAM-02': noul('Does runInstagramEngine run the account through runPlatformEngine with INSTAGRAM_PLATFORM, whose engine is python/instagramApi/engine.py?'),
    'REQ-INSTAGRAM-03': noul('Does the instagram session check command send nothing to Instagram beyond the check, and record the answer Instagram gave through recordInstagramSession, which merges refreshed cookies for INSTAGRAM_COOKIE_DOMAIN back into the row?'),
    'REQ-INSTAGRAM-05': noul('Does ping in python/instagramApi/engine.py answer sessionDead without calling Instagram when the cookies have no sessionid, and otherwise sign in only through the vendored instagrapi Client with login_by_sessionid, its private transport set to curl, answering sessionMismatch when the user Instagram returns differs from the cookies\' ds_user_id, and challenged, rateLimited or sessionDead for instagrapi\'s challenge, rate limit and login errors?'),
    'REQ-INSTAGRAM-04': noul('Is instagram listed in PLATFORMS and PLATFORM_SITES, and does DIRECT_ROUTES have a instagramSession route for platform instagram?'),
    unspecifiedBehavior: noul('Does the Instagram code call Instagram outside the engine and its governor, or record anything but the answer Instagram gave, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-INSTAGRAM-01': MET,
    'REQ-INSTAGRAM-02': MET,
    'REQ-INSTAGRAM-03': MET,
    'REQ-INSTAGRAM-04': MET,
    'REQ-INSTAGRAM-05': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
