# The Apple route

`log mobile apple …` has the same shape as the Android route, and it is not
wired yet. The command is refused with `appleDeviceNotWired` and says so
plainly: nothing is claimed about an iPhone that is not there.

## The shape

```
log mobile apple snapchat devices
log mobile apple snapchat attach --account <handle> --serial <udid> [--network <label>]
log mobile apple snapchat state --account <handle>
log mobile apple snapchat open --account <handle>
log mobile apple snapchat inspect --account <handle> [--tap <x,y>]
```

The same registry, the same recorder, the same rules: one phone per account,
one route per phone, nothing signed in by log. The serial on Apple is the
UDID.

## What it needs

An iPhone is reached over Apple's own device tooling, not over adb, and the
work runs on a Mac:

| Piece | What it is |
| --- | --- |
| The Mac | Xcode, with the phone paired and trusted, Developer Mode on, and the device's development certificate in place |
| The automation | Appium's XCUITest driver, over WebDriverAgent on the phone |
| Per phone | Its own `wdaLocalPort`, its own `mjpegServerPort` and its own `derivedDataPath`, so two iPhones never share a session |
| The driver | `src/mobile/apple/driver.ts`, which answers the same calls as the Android one |

The driver is `src/mobile/apple/driver.ts` and the app is
`src/mobile/apple/snapchat/app.ts`. The Apple driver exists, is wired into
the services, and refuses every call until the tooling is there. The platform
the OS runs is the same one Android runs, so the second platform on iPhone is
the same kind of work.

## The network on an iPhone

Same rule as Android: the route is on the phone. A Wi-Fi proxy is what a
bench phone can be given quickly, and a VPN is what covers the whole phone,
the same way it does on Android.

## Until it is wired

The Android route is the one that runs. Nothing in this layer claims an
iPhone exists, and no step is recorded against a device that was never
read.

