# reddit

A Reddit account: its session, reading subreddits, the home feed and posts with their comments, and posting, commenting and voting.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "reddit/contributorMaxxing" })` | Contributor maxxing: finding talented builders through what they share | "contributormaxxing", "find talented people who are out there who are interested in the same things that we're interested in", "use our reddit to load up gotomarketengineering", "find people who are posting on github inside of that subreddit", "find me all of the best githubs that have been posted in the past 7 days" |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `redditSessionCheck` | Check that Reddit still accepts one account's saved session, sending… | `log reddit session check --account <accountName> [--json]` |
| `redditReadSubreddits` | Find subreddits by words, with their members and what each is about | `log reddit read subreddits --account <accountName> --query <words> [--json]` |
| `redditReadPosts` | A subreddit's newest posts back a number of days, each with its… | `log reddit read posts --account <accountName> --subreddit <name> [--days <n>] [--linksTo <host>] [--json]` |
| `redditReadHome` | The account's home feed, one page, each post with its links | `log reddit read home --account <accountName> [--json]` |
| `redditReadPost` | One post with its comments, each comment with the id a reply takes | `log reddit read post --account <accountName> --url <permalink> [--limit <n>] [--json]` |
| `redditPost` | Post a text post to a subreddit | `log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]` |
| `redditPostLive` | Post a text post to a subreddit, live on Reddit | `log reddit post --account <accountName> --subreddit <name> --title <title> [--text <markdown>] [--flair <flair>] [--approvedBy <who>] [--live] [--json]` |
| `redditReply` | Comment on a post or reply to one of its comments | `log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]` |
| `redditReplyLive` | Comment on a post or reply to one of its comments, live on Reddit | `log reddit reply --account <accountName> --url <post permalink> --text <text> [--comment <t1_id>] [--approvedBy <who>] [--live] [--json]` |
| `redditVote` | Vote on a post or comment | `log reddit vote --account <accountName> (--url <post permalink> \| --target <t3_id\|t1_id>) [--direction up\|down\|none] [--approvedBy <who>] [--live] [--json]` |
| `redditVoteLive` | Vote on a post or comment, live on Reddit | `log reddit vote --account <accountName> (--url <post permalink> \| --target <t3_id\|t1_id>) [--direction up\|down\|none] [--approvedBy <who>] [--live] [--json]` |

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 53.** Verify current external facts from sources.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 109.** Read the full relevant chat and current private context before drafting or sending.
