# Attaching a phone

Attaching is the one thing this layer writes. It says which account runs on
which phone, and it keeps the phone's network route with the pair, so the
route is never guessed later.

## The commands

```bash
log mobile android snapchat devices
log mobile android snapchat attach --account <handle> --serial <serial> [--network <label>]
```

`devices` lists two things: the phones adb can see right now, and the
attachments the registry holds.

| Column | What it is |
| --- | --- |
| `serial` | The phone's own serial: the adb serial on Android, the UDID on Apple |
| `state` | `online`, `offline` or `unauthorized` |
| `model` | What the phone says it is (`getprop ro.product.model`) |
| `android` | Its OS version (`getprop ro.build.version.release`) |
| `foreground app` | The app in the front, read from the phone's own activity list |
| `battery` | Its battery level |

The attachments table reads the other way: `account`, `serial`, `os`,
`platform`, `network`, `attached`.

## The rules

The registry holds one phone per account, and one account per phone. It is
refused, with a reason, when:

| What was tried | What is said | The error code |
| --- | --- | --- |
| The serial is already attached to an account | that serial is already attached to that account | `phoneAlreadyAttached` |
| The account already has a phone | that account already runs on that serial | `phoneAlreadyAttached` |
| The serial is not connected | that serial is not connected | `phoneNotFound` |
| The serial is connected but not usable | that serial is offline or unauthorized | `phoneNotOnline` |
| A command needs a phone and the account has none | that account has no phone of its own; attach one | `noPhoneAttached` |
| A command needs a phone and the account has two | that account has two phones; name one with `--serial` | `noPhoneSelected` |
| The account does not exist, or is deactivated | the account cannot be used | `accountNotUsable` |

The last two are the important ones. `state`, `open` and `inspect` never pick
a phone for you: if the account has no phone, or has more than one, the
command says so and stops. A silent choice is how an account's session ends
up on the wrong phone.

## Moving a phone

There is no `detach` command yet. To move a phone to another account, remove
its row from `~/.logCli/mobileDevices.json` and attach it again. The file is
small and readable for exactly this reason. The registry path can be moved
with `LOG_MOBILE_DEVICES`, and the run directory with `LOG_MOBILE_RUNS`.

## Checking the phone is really there

```bash
log mobile android snapchat state --account <handle>
```

The answer names the serial it read, the model, the OS version, the app in the
front and the battery. If the app in the front is not the platform's app,
the phone is signed in to something else, or the app was left open by
something else: that is what `state` is for, before any step is recorded.

