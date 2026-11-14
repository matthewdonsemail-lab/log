# linkedin

A LinkedIn account: saving its cookies, checking its session, posting or deleting its own posts, inviting people LinkedIn suggests, liking posts, and reading its inbox and conversations.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "linkedin/network" })` | Growing a LinkedIn network and reading its inbox | "connect with people on linkedin", "who does linkedin suggest", "read my linkedin messages", "what did <someone> say on linkedin" |
| `getGuide({ useCase: "linkedin/posts" })` | Posting on LinkedIn, and liking or taking a post down | "post this on linkedin", "put this up on linkedin with the picture", "like <someone>'s post on linkedin", "delete that linkedin post" |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `linkedinSessionCheck` | Check that LinkedIn still accepts one account's saved session… | `log linkedin session check --account <accountName> [--json]` |
| `linkedinSessionScripts` | Read the signed-in feed page once and save the LinkedIn app's bundle… | `log linkedin session scripts --account <accountName> [--json]` |
| `linkedinPost` | Post to the account's LinkedIn feed, with an optional image | `log linkedin post --account <accountName> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]` |
| `linkedinPostLive` | Post to the account's LinkedIn feed, with an optional…, live on LinkedIn | `log linkedin post --account <accountName> --text "<post>" [--image <path>] [--approvedBy <who>] [--live] [--json]` |
| `linkedinDelete` | Delete one of the account's own LinkedIn posts | `log linkedin delete --account <accountName> --activity <activityId\|post url> [--approvedBy <who>] [--live] [--json]` |
| `linkedinDeleteLive` | Delete one of the account's own LinkedIn posts, live on LinkedIn | `log linkedin delete --account <accountName> --activity <activityId\|post url> [--approvedBy <who>] [--live] [--json]` |
| `linkedinSuggestions` | List the people LinkedIn suggests on the account's My Network page | `log linkedin suggestions --account <accountName> [--json]` |
| `linkedinConnect` | Send one connection invitation to someone LinkedIn suggests | `log linkedin connect --account <accountName> --profile <publicId\|profile url> [--approvedBy <who>] [--live] [--json]` |
| `linkedinConnectLive` | Send one connection invitation to someone LinkedIn…, live on LinkedIn | `log linkedin connect --account <accountName> --profile <publicId\|profile url> [--approvedBy <who>] [--live] [--json]` |
| `linkedinLike` | Like one LinkedIn post | `log linkedin like --account <accountName> --post <activityId\|post url> [--approvedBy <who>] [--live] [--json]` |
| `linkedinLikeLive` | Like one LinkedIn post, live on LinkedIn | `log linkedin like --account <accountName> --post <activityId\|post url> [--approvedBy <who>] [--live] [--json]` |
| `linkedinInbox` | List the account's newest LinkedIn conversations | `log linkedin inbox --account <accountName> [--json]` |
| `linkedinMessages` | Read one LinkedIn conversation in full | `log linkedin messages --account <accountName> (--with <name\|profileId\|publicId> \| --conversation <urn>) [--json]` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 137.** Preserve current context-aware voice and AI-artifact gates for messages sent as the owner.
