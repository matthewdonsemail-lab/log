import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const gate = 'python/browser/proxyGate.py'
const vis = 'python/browser/visibleBrowser.py'
const device = 'python/device/deviceProfile.py'
const run = 'src/browser/run/client.ts'
const home = 'src/marketplace/home/helpers/homeOf.ts'

export const browserGate = {
  description: 'The gate every account browser passes before it loads anything',
  specPath: 'docs/specs/browserGate.md',
  codePaths: [
    'python/browser/proxyGate.py',
    'python/browser/visibleBrowser.py',
    'python/browser/browserDriver.py',
    'python/device/deviceProfile.py',
    'src/browser/run/client.ts',
    'src/marketplace/home/helpers/homeOf.ts',
    'src/marketplace/home/types.ts',
  ],
  anchors: {
    'REQ-GATE-01': [
      { kind: 'symbol', file: vis, name: 'VISIBLE_LAUNCH' },
      { kind: 'string', file: vis, includes: 'showcursor' },
      { kind: 'symbol', file: gate, name: 'apply' },
      { kind: 'string', file: gate, includes: 'unguardedLaunch' },
    ],
    'REQ-GATE-02': [
      { kind: 'symbol', file: gate, name: 'ALLOWED_CALLER_KEYS' },
      { kind: 'string', file: gate, includes: 'geoip' },
    ],
    'REQ-GATE-03': [
      { kind: 'symbol', file: gate, name: '_require_gate' },
      { kind: 'symbol', file: gate, name: 'install_guards' },
    ],
    'REQ-GATE-04': [
      { kind: 'symbol', file: gate, name: 'load_proxy' },
      { kind: 'symbol', file: gate, name: 'gate_attached' },
      { kind: 'string', file: gate, includes: 'noProxy' },
    ],
    'REQ-GATE-05': [
      { kind: 'symbol', file: gate, name: 'load_proxy' },
      { kind: 'string', file: gate, includes: 'direct' },
    ],
    'REQ-GATE-06': [
      { kind: 'symbol', file: gate, name: 'check' },
      { kind: 'string', file: gate, includes: 'proxyCountryMismatch' },
    ],
    'REQ-GATE-07': [
      { kind: 'symbol', file: gate, name: 'exit_location' },
      { kind: 'string', file: gate, includes: 'has no known timezone' },
    ],
    'REQ-GATE-08': [
      { kind: 'value', file: gate, name: 'SLOW_MS', equals: 2500 },
      { kind: 'symbol', file: gate, name: 'facebook_ms' },
      { kind: 'string', file: gate, includes: 'LOG_PROXY_MAX_MS' },
      { kind: 'string', file: gate, includes: 'proxyTooSlow' },
    ],
    'REQ-GATE-09': [{ kind: 'symbol', file: device, name: 'new_profile' }],
    'REQ-GATE-10': [{ kind: 'symbol', file: device, name: 'build_launch' }],
    'REQ-GATE-11': [
      { kind: 'symbol', file: device, name: 'check_profile' },
      { kind: 'string', file: gate, includes: 'deviceProfileInvalid' },
      { kind: 'string', file: run, includes: 'deviceProfileInvalid' },
    ],
    'REQ-GATE-12': [
      { kind: 'symbol', file: 'src/marketplace/home/types.ts', name: 'HOME_COUNTRIES' },
      { kind: 'symbol', file: home, name: 'homeOf' },
      { kind: 'string', file: home, includes: 'noHomeLocale' },
    ],
    'REQ-GATE-13': [
      { kind: 'symbol', file: device, name: 'locale_config' },
      { kind: 'string', file: device, includes: 'intl.locale.requested' },
    ],
    'REQ-GATE-14': [
      { kind: 'symbol', file: gate, name: 'compare' },
      { kind: 'symbol', file: gate, name: 'same_zone' },
      { kind: 'string', file: gate, includes: 'browserTimezoneMismatch' },
    ],
    'REQ-GATE-15': [
      { kind: 'symbol', file: gate, name: 'compare' },
      { kind: 'string', file: gate, includes: 'browserLocaleMismatch' },
    ],
    'REQ-GATE-16': [
      { kind: 'symbol', file: gate, name: 'compare' },
      { kind: 'string', file: gate, includes: 'browserLocaleMismatch' },
    ],
    'REQ-GATE-17': [
      { kind: 'symbol', file: gate, name: 'exit_checked' },
      { kind: 'string', file: gate, includes: 'selfCheckFailed' },
      { kind: 'string', file: gate, includes: 'browserExitIpMismatch' },
    ],
    'REQ-GATE-18': [
      { kind: 'symbol', file: gate, name: '_checked' },
      { kind: 'symbol', file: gate, name: 'check_attached' },
    ],
  },
  rubrics: {
    'REQ-GATE-01': noul('Does proxyGate.apply refuse a launch whose headless option is anything other than None or False, and is the visible launch always headed with humanize and the cursor on, with no option that turns it off?'),
    'REQ-GATE-02': noul('Does proxyGate.apply refuse any caller launch option that is not in the allowed caller keys?'),
    'REQ-GATE-03': noul('Is a Playwright launch, persistent context or new context refused when the gate has not armed a launch, when its options differ from the env, proxy and executable path the gate built, or when it is not headed?'),
    'REQ-GATE-04': noul('Do both the Camoufox launch path and the attached-browser path refuse when no proxy file is found?'),
    'REQ-GATE-05': noul('Is a proxy file marked direct refused when its platform is facebook or missing, and accepted only for another platform?'),
    'REQ-GATE-06': noul('Does the gate check refuse when the exit IP country is not the proxy file country?'),
    'REQ-GATE-07': noul('Does the gate check refuse with the country mismatch code when the exit IP has no known timezone, for a proxied exit and for a direct one?'),
    'REQ-GATE-08': noul('Do both launch paths refuse when the measured Facebook time through the proxy is above the limit, with the environment value taking the place of the default?'),
    'REQ-GATE-09': noul('When the device run file has no profile, does the gate make a new one, write it back marked created, and is a new device returned for saving only when it was marked created?'),
    'REQ-GATE-10': noul('When the device run file holds a profile, is the launch built from that stored profile without making a new one?'),
    'REQ-GATE-11': noul('Is a stored device that cannot be read or fails the profile check refused before launch, both in prepareRun and in the Python gate?'),
    'REQ-GATE-12': noul('Does homeOf refuse an account whose homeCountry is not a key of the home countries table?'),
    'REQ-GATE-13': noul('Does prepareRun set languages to the locale and its base language, and does the launch set the locale config and the requested Intl locale from the run locale?'),
    'REQ-GATE-14': noul('Does compare refuse when the page or the worker timeZone is not the same zone as the expected timezone, or when the page and worker offsets differ?'),
    'REQ-GATE-15': noul('Does compare refuse when language, intlLocale or numberLocale in the page or the worker is not exactly the expected locale?'),
    'REQ-GATE-16': noul('Does compare accept a navigator.languages list whose first entries equal the pinned languages in order, with extra languages after them, and refuse a list that does not start with them?'),
    'REQ-GATE-17': noul('Does the self-check refuse when no IP echo answers, and when the browser exit IP differs from the checked one, accepting a different IP on an attached browser only when it is in the same country and the same timezone?'),
    'REQ-GATE-18': noul('When the self-check refuses, is the Camoufox context and browser closed before the error is raised, and does the attached-browser check raise the error so the opener stops the profile?'),
    unspecifiedBehavior: noul('Does the gate let a browser open by a route the specification does not describe, such as skipping the self-check, opening without a proxy for a Facebook account, or launching headless?'),
  },
  assertions: {
    'REQ-GATE-01': MET,
    'REQ-GATE-02': MET,
    'REQ-GATE-03': MET,
    'REQ-GATE-04': MET,
    'REQ-GATE-05': MET,
    'REQ-GATE-06': MET,
    'REQ-GATE-07': MET,
    'REQ-GATE-08': MET,
    'REQ-GATE-09': MET,
    'REQ-GATE-10': MET,
    'REQ-GATE-11': MET,
    'REQ-GATE-12': MET,
    'REQ-GATE-13': MET,
    'REQ-GATE-14': MET,
    'REQ-GATE-15': MET,
    'REQ-GATE-16': MET,
    'REQ-GATE-17': MET,
    'REQ-GATE-18': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
