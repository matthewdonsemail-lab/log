# mobile

One phone per account: the phones that are connected, the phone attached to each account, and the screen, the UI tree and the app's own network calls read off one phone.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `mobileAndroidSnapchatDevices` | List the Android phones connected, and which account each one belongs… | `log mobile android snapchat devices [--json]` |
| `mobileAndroidSnapchatAttach` | Attach one Android phone to one account, and keep its network route… | `log mobile android snapchat attach --account <accountName> --serial <serial> [--network <label>] [--json]` |
| `mobileAndroidSnapchatState` | Read one account's own phone | `log mobile android snapchat state --account <accountName> [--json]` |
| `mobileAndroidSnapchatOpen` | Open Snapchat on the account's own phone | `log mobile android snapchat open --account <accountName> [--json]` |
| `mobileAndroidSnapchatInspect` | Open Snapchat on the account's own phone and record each step | `log mobile android snapchat inspect --account <accountName> [--tap <x,y>] [--json]` |
| `mobileAppleSnapchatDevices` | List the iPhones connected, and which account each one belongs to | `log mobile apple snapchat devices [--json]` |
| `mobileAppleSnapchatAttach` | Attach one iPhone to one account, and keep its network route with it | `log mobile apple snapchat attach --account <accountName> --serial <serial> [--network <label>] [--json]` |
| `mobileAppleSnapchatState` | Read one account's own iPhone | `log mobile apple snapchat state --account <accountName> [--json]` |
| `mobileAppleSnapchatOpen` | Open Snapchat on the account's own iPhone | `log mobile apple snapchat open --account <accountName> [--json]` |
| `mobileAppleSnapchatInspect` | Open Snapchat on the account's own iPhone and record each step | `log mobile apple snapchat inspect --account <accountName> [--tap <x,y>] [--json]` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 25.** Fix failed or unfamiliar behavior from its own recorded action/request/response timeline.
- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 29.** Record a browser page with the existing inspect tool before implementing actions on it.
- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
