# One phone per account

The model the mobile layer is built on, and the reason it exists: every
account gets a phone of its own. Not a profile inside one phone, not a second
app in the same app, not the same phone switched between accounts. A phone.

Switching accounts inside one app is what loses accounts. The app keeps one
piece of state per install: the session, the device id it was installed with,
the push token, the cache, the permissions the user granted, the media
gallery. Two accounts in one install share all of it, and the platform sees
one install behaving like several people. One account per install fixes that.
One phone per account fixes the rest of it too, because the network route, the
SIM, the device id and the app's own storage all belong to that account alone.

## What each account gets

| Layer | What belongs to the account |
| --- | --- |
| The phone | One Android phone or Android 14 cloud phone, one serial |
| The app | One install of the platform's app, signed in as that account and nobody else |
| The network | One route out, the phone's own proxy, on the phone itself |
| The record | The serial, the platform and the network label, kept with the account in the registry |

## The phones

Two places a phone comes from, and they run the same driver over the same
ADB transport. Which one a phone is does not change the account's binding: an
account is bound to a serial, and a phone that moves from the rack to a cloud
provider keeps its account.

### The rack

Real Android phones plugged into a rack, each on its own port. This is what
matt is buying. The rack is described in [the network page](./networkPerPhone.md).

### GeeLark cloud phones

Android cloud phones, reached the same way: over ADB. The provider gives an
address and a port, `adb connect` takes it, and the same Android driver does
the rest. The provider is behind the transport, so the account binding, the
steps and the evidence are the same whether a phone is on the bench or in the
cloud.

What the provider states about itself, and what log does not claim: the cloud
phones are ARM devices with Android 11 to 16 available, billed per minute of
use with a daily cap per phone. What log checks is never the vendor's word
but the phone's own answers: the model and the OS version come from the phone
(`getprop`), the app in the front comes from the phone's own activity list
(`dumpsys`), and the network comes from what the phone actually sends.

### The local emulator

MEmu, for development and for the pilot. It is an Android 9 (SDK 28) x86_64
image, model `ASUS_Z01QD`, on serial `127.0.0.1:21503`, with `adb shell` as
root. It is the phone the first end-to-end Snapchat run was done on, so the
shape of the layer is proved on a phone that is not a real handset. A real
handset is the same route with a different serial.

| Phone | Where | OS | Reached by |
| --- | --- | --- | --- |
| MEmu instance 0 | local, `127.0.0.1:21503` | Android 9 (SDK 28), x86_64 | ADB over the loopback |
| Rack handsets | the rack | Android 14 (the current target) | ADB over USB |
| GeeLark cloud phones | the cloud | Android 11 to 16 (the provider's range) | ADB over the provider's address and port |

## The app on the phone

One install, one account. On Android the platform's app is its package name
(`com.snapchat.android` for Snapchat), and the driver starts it with
`monkey -p <package> 1`, which is the launcher asking for the app's own
launcher activity. The app that answers is the one the account is signed in
to, because the sign-in was done by hand on that phone and the registry says
which phone that is.

The sign-in is done by hand, on the phone, once. log never asks for a
password, a PIN, a session cookie or a two-factor code, and never stores one.
That is a deliberate limit: the phone holds the session, the way a real
person's phone holds it, and log only drives the phone.

## What is kept, and where

The binding is a small JSON file, `~/.logCli/mobileDevices.json`, one row per
attached phone:

```json
{
  "devices": [
    {
      "id": "android:127.0.0.1:21503",
      "os": "android",
      "serial": "127.0.0.1:21503",
      "accountName": "matt.snap",
      "platform": "snapchat",
      "network": "us-gridpanel-01",
      "attachedAt": "2026-11-14T09:41:00.000Z"
    }
  ]
}
```

It is written atomically (a temporary file, then a rename), and it is the
only thing that says which phone is whose. Read [attaching a
phone](./attachingPhones.md) for the rules the registry enforces.

