# facebookGroups

Facebook groups: joining and answering their questions, reading posts and members, and serving OpenMagpie's polls.

Load next, when the work needs it: getGuide({ topic: "facebookBrowser" }) (A Facebook account's browser for its day: preflight, opening and signing in, the host and its lifecycle, the profile and Messenger PIN, its accounts and the account checks).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/groups" })` | Listening to local Facebook groups | "join the local facebook groups in <town>", "listen to the facebook groups for people asking for <service>", "read the posts in the facebook group", "poll the facebook group for new posts", "find the business owners in the facebook group". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `facebookJoin` | Join a Facebook group as one account, in its open browser | `log facebook join group --account <a> --group <g> [--live] \| --show \| --answer [--set n=v]... [--agree] \| --fill [--live [--submit]] [--bypass] [--json]` |
| `facebookJoinLive` | Join a Facebook group as one account, in its open…, live on Facebook | `log facebook join group --account <a> --group <g> [--live] \| --show \| --answer [--set n=v]... [--agree] \| --fill [--live [--submit]] [--bypass] [--json]` |
| `facebookReadGroup` | Read a Facebook group's new posts and the comments of the new posts… | `log facebook read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]` |
| `facebookReadGroupLive` | Read a Facebook group's new posts and the comments of…, live on Facebook | `log facebook read group --account <accountName> --group <group url or id> [--scrolls <n>] [--commentPosts <n>] [--live] [--bypass] [--json]` |
| `facebookReadMembers` | Read a Facebook group's newest members | `log facebook read members --account <accountName> --group <group url or id> --count <n> [--secondsPerScroll <s>] [--maxScrolls <n>] [--owners] [--bypass] [--json]` |
| `facebookPoll` | Poll a Facebook group from one account, in its open browser, for a… | `log facebook poll <group> <account> [<how long to poll>] [--bypass] \| --request <json>` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 19.** Every browser action records its raw HAR and timed step evidence, with no switch to disable capture.
- **Rule 25.** Fix failed or unfamiliar behavior from its own recorded action/request/response timeline.
- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 29.** Record a browser page with the existing inspect tool before implementing actions on it.
- **Rule 30.** Complete the authorized task.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
