# Mobile: one phone per account

A device layer for real phones. `log mobile android …` reaches Android phones
and emulators over ADB; `log mobile apple …` is the same shape for iPhones.
The OS comes first, because it decides how every call is made, then the
platform the phone is running. Snapchat is the platform that works today.

The rule the whole layer runs on: **one account, one phone**. The phone keeps
that account's app, that account's sign-in and that account's network route,
and the serial that says which phone it is is kept with the account, the way
each account keeps one AdsPower profile. Two accounts never share a phone,
and an account is never moved onto a phone that still carries another
account's app.

## The route

```
log mobile <android|apple> <platform> <command>
```

`<platform>` is `snapchat` today. `<command>` is one of:

| Command | What it does |
| --- | --- |
| `devices` | The phones that are connected, and which account each one belongs to |
| `attach` | One phone attached to one account, with the phone's own network route kept with it |
| `state` | The account's own phone: online, its model, its OS version, the app in the front, its battery |
| `open` | The platform's app opened on the account's own phone |
| `inspect` | The app opened and every step recorded: the screen, the UI tree, what was tapped, the app's own network calls |

Every form takes `--account`, except `devices`. `attach` also takes `--serial`
and `--network`. `--tap x,y` taps one point of the screen, in the screen's own
pixels. `--json` prints the answer as JSON.

```bash
log mobile android snapchat devices
log mobile android snapchat attach --account <handle> --serial 127.0.0.1:21503 --network us-gridpanel-01
log mobile android snapchat state --account <handle>
log mobile android snapchat open --account <handle>
log mobile android snapchat inspect --account <handle> --tap 360,1200
```

## What the phone says is what happened

`inspect` records a run the way a browser step is recorded: what the phone was
told to do, what was on the screen, what the UI tree said, and the calls the
app made that could be read. The run lands in
`~/.logCli/mobile/<runId>_<account>/`:

| File | What is in it |
| --- | --- |
| `steps.json` | Every step: what was done, when, on which serial, the foreground app, and the network lines that were read |
| `step1.png`, `step2.png` | The screen after each step |
| `step1.xml`, `step2.xml` | The UI tree after each step |
| `README.md` | Which account the run was for |

Nothing is signed in for you. You sign in on the phone by hand; log never
asks for a credential and never keeps one. `open`, `state`, `attach` and
`inspect` do not post anything, so a run on this layer is always read-only
towards the platform.

## The pages here

| Page | What it is |
| --- | --- |
| [One phone per account](./onePhonePerAccount.md) | The model: which phones, which OS versions, what each one carries |
| [Attaching a phone](./attachingPhones.md) | The registry, how a phone is attached, what is refused and why |
| [Android over ADB](./androidAdb.md) | How the Android route reaches a phone, call by call |
| [The network on the phone](./networkPerPhone.md) | The rack, the per-phone proxy, where the egress check goes |
| [Isolation and reputation](./isolationAndReputation.md) | What a phone of its own does, and what it does not do |
| [The Apple route](./appleRoute.md) | The same shape on iPhone, and what it needs before it runs |

The command is also in the generated [reference](../reference.md) and in the
[mobile guide](../guides/mobile.md).

