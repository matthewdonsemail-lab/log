# X use cases

Everything log-cli does on X, one page per job. Each page can be run from a fresh context: say "go on `docs/useCases/twitter/<page>.md`" and say what this round is for (the role, the post, the topic). The page tells the agent what to read, which tools to call in which order, and what counts as done.

| Page | The job | Sends? |
| --- | --- | --- |
| [recruiting.md](recruiting.md) | find people posting that they want work, reply with the job link | replies, through the queue |
| [topicReplies.md](topicReplies.md) | reply to everyone posting about one topic, each reply about their own post | replies, through the queue |
| [engagementReplies.md](engagementReplies.md) | answer the people who commented on your own posts | replies, through the queue |
| [engagerDms.md](engagerDms.md) | DM the people who liked or reposted your post | dms, through the queue |
| [dmInbox.md](dmInbox.md) | read the DM inbox and list who is waiting on you | nothing |
| [affiliateMarketing.md](affiliateMarketing.md) | follow up the conversations about a tool you use, with your affiliate credit where it helps, and book the partner call | dms, one by one or through the queue |
| [followers.md](followers.md) | check who really follows you before saying so | nothing |
| [whoNeedsYou.md](whoNeedsYou.md) | find who needs something from you, or who matters, and how close each is to money | nothing |
| [followUps.md](followUps.md) | follow up the people you picked, each in your own voice | dms, one message per line, after you say yes |
| [networkMaxing.md](networkMaxing.md) | grow the network, the niche map: get to know everyone who messaged and new people from the niche map, each conversation about them | replies, follows, likes and openers, sent once the voice gate passes |

DMs are their own pages. Recruiting is public replies only.

## The parts every X page uses

| Part | What | Where |
| --- | --- | --- |
| The account | a TWITTER row in Twenty `socialAccounts`. Its cookies live there and nowhere else. A new account is added with `bun bin/log.ts twitter cookies save --account <handle>` in a terminal (`skills/xPosting/SKILL.md`) | Twenty |
| Copy style | the account's `copyStyle` (empty: house). Every send and queue check holds the copy to it | `src/twitter/copy/style` |
| Session check | first call of every run, sends nothing | `twitterSessionCheck` / `log twitter session check --account <account>` |
| Finding people and posts | an outside search, never X itself (rule 53). Say the price before a big sweep | treg's X search, profile, posts and comments reads |
| House style (`house`) | all lowercase, no commas, no full stops, no dashes. Urls are fine. `check` refuses anything else | `src/twitter/copy/style` |
| One send | dry run, then the `…Live` tool with `approvedBy` | `twitterReply`, `twitterQuote`, `twitterLike`, `twitterDm` (+ `…Live`) |
| The queue | any send to 2 or more people. Never a hand loop | `twitterQueueBuild` → `Show` → `Check` → `Approve` → `Plan` → `Run` → `RunLive`, `Nudge`, `Status` |
| Pacing | 2 minutes between sends by default (`minGap` 120), the window about 2 minutes per person; only longer when the owner asks. 240 writes a day per account, cool-offs on throttles | the account's governor, `~/.logCli/twitter/<account>`; `--force` goes past it only when the owner says so (rule 86) |

## The queue, step by step

The same calls on every sending page.

1. **Targets file**: a JSON list of `{handle, tweet_url, post_text}` for replies, or `{handle, user_id}` for dms. A target may carry its own `text`, a line written for that one person's post, and the queue keeps it.
2. **Lines file** (`variations`): a JSON list of copy lines for the targets without their own text. Build needs one unique line per such target, and isn't needed when every target has its own.
3. `twitterQueueBuild` { targets, variations, out, account, action: reply | dm }. Writes the queue, never overwrites one.
4. `twitterQueueShow` and `twitterQueueCheck`: house style and targets, contacts nothing. Show the table to the owner.
5. `twitterQueueApprove` { by: "<owner>" } only after the owner says yes. Any edit afterwards voids it.
6. `twitterQueuePlan` { window, minGap: 120, like: true }, with the window about 2 minutes per person (20 people: "40m"), then `twitterQueueRun` (dry run) then `twitterQueueRunLive` { confirmLive: true } when the owner asked for the live send. Follow it with `jobStatus`, and start a Monitor on `~/.logCli/mcp/<UTC day>.log` first (rule 26). `jobCancel` stops it at its next wait.

What the run does when X pushes back: no tweet created or throttled waits 15 min doubling to 4 h, then retries once at the end. Daily limit (344) waits 24 h. Deleted post or replies off (385/433) is skipped. Dead session, or 5 waits in a row, stops and alerts the owner. Running it again resumes.

## Rules that hold on every page

- **The owner approves the list before anything goes out.** Show a table (who, which post, the exact copy) and wait for a yes.
- **One reply per person, ever.** Before approving, read the account's recent replies and skip anyone it already answered. Dedupe handles inside the queue. If someone replies back, answering them is fine.
- **Personal beats generic.** A line about the person's own post goes through; the same generic line with a link sent to strangers tends to come back as "no tweet created". Write each line for its post.
- **No claims you can't back up,** and no pay figures in public replies.
- **Log every send:** the reply url (`https://x.com/<account>/status/<id>`) or X's event, kept with the queue.
