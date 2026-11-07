import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const DEVICES = 'src/mobile/devices/client.ts'
const DEVICE_TYPES = 'src/mobile/devices/types.ts'
const GEELARK = 'src/mobile/geelark/client.ts'
const GEELARK_TYPES = 'src/mobile/geelark/types.ts'
const ANDROID = 'src/mobile/android/client.ts'
const DRIVER = 'python/mobile/androidDriver.py'
const COMMAND = 'src/cli/mobile/index.ts'

export const mobile = {
  description: 'Real phones as a device layer: one phone per account, USB phones over ADB and GeeLark cloud phones over the same ADB, the screen recorded and nothing tapped',
  specPath: 'docs/specs/mobile.md',
  codePaths: [DEVICES, DEVICE_TYPES, GEELARK, GEELARK_TYPES, ANDROID, DRIVER, COMMAND],
  anchors: {
    'REQ-MOBILE-01': [
      { kind: 'symbol', file: DEVICES, name: 'parseAdbDevices' },
      { kind: 'symbol', file: DEVICES, name: 'listUsbAndroid' },
      { kind: 'value', file: GEELARK_TYPES, name: 'GEELARK_ENDPOINTS', path: ['list'], equals: '/open/v1/phone/list' },
    ],
    'REQ-MOBILE-02': [
      { kind: 'symbol', file: DEVICES, name: 'bindDevice' },
      { kind: 'symbol', file: DEVICES, name: 'unbindDevice' },
      { kind: 'string', file: DEVICES, includes: 'deviceTaken' },
      { kind: 'string', file: DEVICES, includes: 'accountBound' },
    ],
    'REQ-MOBILE-03': [
      { kind: 'symbol', file: ANDROID, name: 'connectAndroid' },
      { kind: 'value', file: GEELARK_TYPES, name: 'GEELARK_ENDPOINTS', path: ['adbInfo'], equals: '/open/v1/adb/getData' },
      { kind: 'string', file: ANDROID, includes: 'glogin' },
    ],
    'REQ-MOBILE-04': [
      { kind: 'symbol', file: ANDROID, name: 'inspectAndroid' },
      { kind: 'symbol', file: DRIVER, name: 'inspect' },
    ],
    'REQ-MOBILE-05': [{ kind: 'symbol', file: DEVICE_TYPES, name: 'APPLE_NOT_BUILT' }],
  },
  rubrics: {
    'REQ-MOBILE-01': noul('Does log mobile android devices list the phones from adb devices -l and, when the GeeLark key is set, from GeeLark list, saying a missing adb or key beside the list instead of failing the command?'),
    'REQ-MOBILE-02': noul('Does bindDevice refuse a second phone for an account with accountBound and a phone held by another account with deviceTaken, answer already for the same binding, and leave every binding in place except one unbindDevice removes?'),
    'REQ-MOBILE-03': noul('For a GeeLark binding, does connectAndroid start the phone, wait for status started, turn ADB on, read the ADB address, run adb connect and then adb shell glogin with the code, stopping with its own code at the first step that fails?'),
    'REQ-MOBILE-04': noul('Does inspect only save the UI tree and a screenshot through uiautomator2 (starting the app only with --open), with no tap, swipe, click or text sent to the phone anywhere in the code?'),
    'REQ-MOBILE-05': noul('Is log mobile apple refused with appleNotBuilt before anything is reached?'),
    unspecifiedBehavior: noul('Does the mobile code tap, type, post, delete or spend money on a provider (create or buy a cloud phone) by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-MOBILE-01': MET,
    'REQ-MOBILE-02': MET,
    'REQ-MOBILE-03': MET,
    'REQ-MOBILE-04': MET,
    'REQ-MOBILE-05': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
