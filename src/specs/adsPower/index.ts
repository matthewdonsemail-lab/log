import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const client = 'src/browser/adsPower/client.ts'
const types = 'src/browser/adsPower/types.ts'
const plan = 'src/browser/adsPower/helpers/planSync.ts'
const request = 'src/browser/adsPower/helpers/profileRequest.ts'
const driverClient = 'src/browser/driver/client.ts'
const driverTypes = 'src/browser/driver/types.ts'
const social = 'src/platformKit/socialAccount/client.ts'
const accountCli = 'src/cli/account/index.ts'
const adsPowerCli = 'src/cli/adsPower/index.ts'
const opener = 'python/browser/browserDriver.py'
const local = 'python/browser/adsPowerBrowser.py'

export const adsPower = {
  description: 'One AdsPower profile per account, opened through the gate and given back when the account no longer needs it',
  specPath: 'docs/specs/adsPower.md',
  codePaths: [
    'src/browser/adsPower/client.ts',
    'src/browser/adsPower/types.ts',
    'src/browser/adsPower/helpers/planSync.ts',
    'src/browser/adsPower/helpers/profileRequest.ts',
    'src/browser/driver/client.ts',
    'src/cli/account/index.ts',
    'python/browser/adsPowerBrowser.py',
    'python/browser/browserDriver.py',
  ],
  anchors: {
    'REQ-ADSPOWER-01': [
      { kind: 'symbol', file: plan, name: 'planSync' },
      { kind: 'symbol', file: client, name: 'syncProfiles' },
      { kind: 'symbol', file: request, name: 'remarkAccountId' },
      { kind: 'symbol', file: social, name: 'saveAdsPowerProfileId' },
      { kind: 'string', file: adsPowerCli, includes: 'apply' },
    ],
    'REQ-ADSPOWER-02': [
      { kind: 'symbol', file: request, name: 'profileRequest' },
      { kind: 'symbol', file: request, name: 'twentyRemark' },
      { kind: 'value', file: types, name: 'ADS_POWER_GROUP', equals: 'logCli' },
      { kind: 'string', file: request, includes: 'no_proxy' },
    ],
    'REQ-ADSPOWER-03': [
      { kind: 'symbol', file: driverClient, name: 'driverNameOf' },
      { kind: 'value', file: driverTypes, name: 'BROWSER_DRIVERS', equals: ['camoufox', 'adsPower'] },
      { kind: 'value', file: driverTypes, name: 'DEFAULT_BROWSER_DRIVER', equals: 'camoufox' },
    ],
    'REQ-ADSPOWER-04': [
      { kind: 'string', file: opener, includes: 'adsPowerProfileMissing' },
      { kind: 'string', file: client, includes: 'adsPowerProfileMissing' },
    ],
    'REQ-ADSPOWER-05': [
      { kind: 'symbol', file: opener, name: 'open_ads_power' },
      { kind: 'symbol', file: 'python/browser/proxyGate.py', name: 'gate_attached' },
    ],
    'REQ-ADSPOWER-06': [
      { kind: 'symbol', file: local, name: 'user_proxy_config' },
      { kind: 'symbol', file: local, name: 'set_proxy' },
      { kind: 'symbol', file: local, name: 'NO_PROXY' },
    ],
    'REQ-ADSPOWER-07': [
      { kind: 'symbol', file: local, name: 'stop' },
      { kind: 'string', file: local, includes: 'no_proxy' },
    ],
    'REQ-ADSPOWER-08': [
      { kind: 'symbol', file: local, name: 'start' },
      { kind: 'string', file: local, includes: '/api/v2/browser-profile/start' },
    ],
    'REQ-ADSPOWER-09': [{ kind: 'symbol', file: opener, name: 'open_ads_power' }],
    'REQ-ADSPOWER-10': [
      { kind: 'symbol', file: 'python/browser/harRecorder.py', name: 'SessionHar' },
      { kind: 'symbol', file: 'python/browser/proxyGate.py', name: 'check_attached' },
    ],
    'REQ-ADSPOWER-11': [
      { kind: 'symbol', file: opener, name: 'carry_session_once' },
      { kind: 'string', file: opener, includes: 'c_user' },
    ],
    'REQ-ADSPOWER-12': [
      { kind: 'value', file: types, name: 'RELEASE_STATUSES', equals: ['deactivated'] },
      { kind: 'symbol', file: social, name: 'saveAdsPowerProfileId' },
    ],
    'REQ-ADSPOWER-13': [{ kind: 'symbol', file: accountCli, name: 'giveProfileBack' }],
    'REQ-ADSPOWER-14': [{ kind: 'symbol', file: client, name: 'syncProfiles' }],
    'REQ-ADSPOWER-15': [
      { kind: 'value', file: types, name: 'ADS_POWER_HOMES_ENV', equals: 'LOG_ADSPOWER_HOMES' },
      { kind: 'symbol', file: client, name: 'adsPowerHomes' },
      { kind: 'symbol', file: client, name: 'homesOf' },
      { kind: 'string', file: adsPowerCli, includes: 'homes' },
    ],
  },
  rubrics: {
    'REQ-ADSPOWER-01': noul('Does planSync return linked for an account whose adsPowerProfileId is a live profile, relink when a profile remark names the account Twenty id, and create otherwise, with syncProfiles saving the profile id it made or relinked?'),
    'REQ-ADSPOWER-02': noul('Does profileRequest create the profile with no proxy, the remark from twentyRemark, the given group and the language of the home country, with no password, cookie or 2FA field in the body?'),
    'REQ-ADSPOWER-03': noul('Does driverNameOf return the browserDriver when it names a known driver, and otherwise adsPower when adsPowerProfileId is set and the default driver when it is not?'),
    'REQ-ADSPOWER-04': noul('Do open_ads_power and adsPowerDriver.prepare refuse with the missing profile code, before anything else is done, when the account has no AdsPower profile id?'),
    'REQ-ADSPOWER-05': noul('Does open_ads_power call proxyGate.gate_attached before it calls adsPowerBrowser.set_proxy or adsPowerBrowser.start?'),
    'REQ-ADSPOWER-06': noul('Does open_ads_power set the profile proxy from the gate proxy right before adsPowerBrowser.start, and set no proxy instead when the gate proxy is direct?'),
    'REQ-ADSPOWER-07': noul('In a finally block, does open_ads_power stop the profile when it started and then clear the profile proxy, whether or not the session failed?'),
    'REQ-ADSPOWER-08': noul('Does adsPowerBrowser.start ask the Local API start endpoint for a headed browser (headless "0")?'),
    'REQ-ADSPOWER-09': noul('Does open_ads_power attach with playwright.chromium.connect_over_cdp and use browser.contexts[0] when the profile has a context?'),
    'REQ-ADSPOWER-10': noul('Does open_ads_power attach a SessionHar to the context and await proxyGate.check_attached on it before yielding the Opened browser?'),
    'REQ-ADSPOWER-11': noul('Does carry_session_once add the saved Facebook cookies only when the profile has no c_user cookie, and leave the profile cookies untouched otherwise?'),
    'REQ-ADSPOWER-12': noul('For an account whose status is a release status, does planSync return release, and does syncProfiles then delete the live profile and save a null profile id, without deleting the Twenty account?'),
    'REQ-ADSPOWER-13': noul('When the account status command sets deactivated on an account with an adsPowerProfileId, does it call giveProfileBack, which runs syncProfiles with apply true?'),
    'REQ-ADSPOWER-14': noul('Does syncProfiles order the entries so every release entry runs before any create, relink or linked entry?'),
    'REQ-ADSPOWER-15': noul('When homes is set, does planSync release or skip an account whose homeCountry is not in homes, unless its platform runs with no proxy, with homes taken from the homes option or else the environment?'),
    unspecifiedBehavior: noul('Does the AdsPower code open a profile, keep a proxy on it, or keep a profile for an account by a route the specification does not describe, such as starting the profile before the gate or leaving the proxy set after it stops?'),
  },
  assertions: {
    'REQ-ADSPOWER-01': MET,
    'REQ-ADSPOWER-02': MET,
    'REQ-ADSPOWER-03': MET,
    'REQ-ADSPOWER-04': MET,
    'REQ-ADSPOWER-05': MET,
    'REQ-ADSPOWER-06': MET,
    'REQ-ADSPOWER-07': MET,
    'REQ-ADSPOWER-08': MET,
    'REQ-ADSPOWER-09': MET,
    'REQ-ADSPOWER-10': MET,
    'REQ-ADSPOWER-11': MET,
    'REQ-ADSPOWER-12': MET,
    'REQ-ADSPOWER-13': MET,
    'REQ-ADSPOWER-14': MET,
    'REQ-ADSPOWER-15': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
