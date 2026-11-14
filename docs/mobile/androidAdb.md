# Android over ADB

How the Android route reaches a phone, and what every call on it is. The
driver is `src/mobile/android/`: the transport (`src/mobile/android/adb/`),
the driver that turns that transport into phone answers
(`src/mobile/android/driver.ts`), and the platform's app
(`src/mobile/android/snapchat/app.ts`). What both operating systems share
is in `src/mobile/device/`: the registry, the recorder and the shapes.

## Which adb

In order: `LOG_ADB` if it is set, then MEmu's own adb at
`C:\Program Files\Microvirt\MEmu\adb.exe`, then MuMu Player's adb at
`C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe`, then `adb` from the
path. So a bench with MEmu, a bench with MuMu and a rack with platform-tools
all work without configuration.

Every adb client talks to the same adb server, so the phone one emulator
brought up is seen by all of them. A serial that is a host and a port is
connected before it is read: the layer asks adb to connect it, then asks
again, so a phone that was just restarted does not need a person to run
`adb connect` by hand.

## The serial is always named

Every call carries `-s <serial>`. There is no "the one phone" anywhere in
this layer: with two phones on the bench, a call that does not name its
serial would be a coin toss, and a coin toss between two accounts is a
session that lands on the wrong phone. The serial is also the first thing
checked when a phone is attached, so the binding and the transport cannot
drift apart.

In PowerShell the serial and its flag are two arguments, never one string:

```powershell
$s = @('-s', '127.0.0.1:21503')
& $adb @s shell getprop ro.product.model
```

`"-s 127.0.0.1:21503"` as a single string is not the same thing to adb and
does not connect.

## Every call, and what it is for

| Call | What it asks the phone | Used by |
| --- | --- | --- |
| `adb devices -l` | which phones are connected, and in what state | `devices`, `state` |
| `shell getprop ro.product.model` | the model | `state` |
| `shell getprop ro.build.version.release` | the OS version | `state` |
| `shell dumpsys activity activities` | the resumed activity, which is the app in the front | `state` |
| `shell dumpsys battery` | the battery level | `state` |
| `shell monkey -p <package> 1` | start the platform's app through the launcher | `open`, `inspect` |
| `exec-out screencap -p` | the screen, as a PNG | `inspect` |
| `shell uiautomator dump /sdcard/window.xml` then `exec-out cat` | the UI tree, as XML | `inspect` |
| `shell input tap <x> <y>` | one tap, in the screen's own pixels | `inspect --tap` |
| `shell which tcpdump` | whether the phone can capture its own traffic | `inspect` |
| `shell timeout 8 tcpdump -i any -A -s 0 -nn port 443` | the app's own calls over TLS | `inspect` |
| `shell logcat -d -v brief -t 300` | the fallback: the log, filtered for the app's hosts | `inspect` |

The screen is a fallback, not the source. A camera screen has almost no UI
tree, so a run records both: the XML when there is one, the PNG always.

The network capture is best-effort and says which way it read the traffic:
`tcpdump` when the phone has it (MEmu has `/system/xbin/tcpdump` and
`/system/bin/timeout`), and the log when it does not, filtered for
`snapchat.com`, `sc-cdn.net`, `kit.snapchat`, `okhttp` and `graphql`. A
capture that failed is recorded as a failure, not as an empty result.

## Timeouts

`shell` calls give up after 40 seconds, `exec-out` after 60. A phone that has
stopped answering must not hang the run.

## The local emulator

```powershell
& "C:\Program Files\Microvirt\MEmu\memuc.exe" start -i 0
& "C:\Program Files\Microvirt\MEmu\adb.exe" devices -l
```

Instance 0 is on `127.0.0.1:21503`. It is an Android 9 (SDK 28) x86_64 image
(`ASUS_Z01QD`), and its adb shell is root, which is what makes the tcpdump
capture possible there. The Snapchat app is installed on it, and its launcher
activity is `com.snapchat.android/com.snap.identity.loginsignup.ui.LoginSignupActivity`,
so the app opens to its own sign-in screen and waits for the account to be
signed in by hand.

## The other local emulator

MuMu Player 15 runs the same way, on its own port:

```powershell
& "C:\Program Files\Netease\MuMuPlayer\nx_main\mumu-cli.exe" control -v 0 launch
& "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe" connect 127.0.0.1:16384
& "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe" devices -l
```

Instance 0 is on `127.0.0.1:16384`. It is an Android 15 image
(`SM_A528B`), and it has no tcpdump, so the capture there is the log, not
the packets. MuMu's Android takes a while to come up after it is launched:
the port opens before the phone is ready, so the first state read can be
too early and the next one is right.

