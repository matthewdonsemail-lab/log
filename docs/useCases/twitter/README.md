# X use cases

Everything we have done on X from @matthewsoldit, one page per job. Each page can be run from a fresh context: say "go on `docs/useCases/twitter/<page>.md`" and say what this round is for (the role, the post, the topic). The page tells the agent what to read, which tools to call in which order, and what counts as done.

| Page | The job | Sends? | Real runs |
| --- | --- | --- | --- |
| [recruiting.md](recruiting.md) | find people posting that they want work, reply with the job link | replies, through the queue | 2026-10-09, 10-24 (BDO + cold caller), recruitLoop every 6 h |
| [topicReplies.md](topicReplies.md) | reply to everyone posting about one topic, each reply about their own post | replies, through the queue | 2026-10-17 data brokering (156 replies) |
| [engagementReplies.md](engagementReplies.md) | answer the people who commented on our own posts | replies, through the queue | 2026-10-09 log launch, 2026-10-13 go getters VSL |
| [engagerDms.md](engagerDms.md) | DM the people who liked or reposted our post | dms, through the queue | 2026-10-13, the 203k post's likers (drafted) |
| [dmInbox.md](dmInbox.md) | read the DM inbox and list who is waiting on matt | nothing | 2026-10-13 (44 conversations), 2026-10-26 |
| [followers.md](followers.md) | check who really follows matt before saying so | nothing | 2026-10-15 ego map, 2026-10-19 new followers |

DMs are their own pages. Recruiting is public replies only.

## The parts every X page uses

| Part | What | Where |
| --- | --- | --- |
| The account | @matthewsoldit, a TWITTER row in Twenty `socialAccounts` (accountName `matthewsoldit`). Its cookies live there and nowhere else | Twenty |
| Session check | first call of every run, sends nothing | `twitterSessionCheck` / `log twitter session check --account matthewsoldit` |
| Finding people and posts | treg only, never X itself (rule 53). Say the price before a big sweep | treg `anyapi.x.search.posts`, `anyapi.x.user.profile`, `anyapi.x.user.posts`, `anyapi.x.post.comments` |
| House style | all lowercase, no commas, no full stops, no dashes. Urls are fine. `check` refuses anything else | `src/twitter/copy/style` |
| One send | dry run, then the `…Live` tool with `approvedBy` | `twitterReply`, `twitterQuote`, `twitterLike`, `twitterDm` (+ `…Live`) |
| The queue | any send to 2 or more people. Never a hand loop | `twitterQueueBuild` → `Show` → `Check` → `Approve` → `Plan` → `Run` → `RunLive`, `Nudge`, `Status` |
| Pacing | 40 writes a day per account, random gaps of at least 2 min, cool-offs on throttles | the account's governor, `~/.logCli/twitter/<account>` |

## The queue, step by step

The same seven calls on every sending page.

1. **Targets file**: a JSON list of `{handle, tweet_url, post_text}` for replies, or `{handle, user_id}` for dms.
2. **Lines file**: a JSON list of copy lines. Build needs at least one unique line per target.
3. `twitterQueueBuild` { targets, variations, out, account: "matthewsoldit", action: reply | dm }. Writes the queue, never overwrites one.
4. **Per-person copy**: if each line was written for one person, set each item's `text` in the queue file to that person's line now, before approval.
5. `twitterQueueShow` and `twitterQueueCheck`: house style and targets, contacts nothing. Post the table to matt.
6. `twitterQueueApprove` { by: "matt" } only after matt says yes. Any edit afterwards voids it.
7. `twitterQueuePlan` { window: "75m" (about 8 min a person), like: true } then `twitterQueueRun` (dry run) then `twitterQueueRunLive` { confirmLive: true, alertChannel, alertReplyTo, alertMention: matt's hex } when matt asked for the live send. Follow it with `jobStatus`. Start a Monitor on `~/.logCli/mcp/<UTC day>.log` first (rule 26).

What the run does when X pushes back: no tweet created or throttled waits 15 min doubling to 4 h, then retries once at the end. Daily limit (344) waits 24 h. Deleted post or replies off (385/433) is skipped. Dead session, or 5 waits in a row, stops and tags matt. Running it again resumes.

## Rules that hold on every page

- **matt approves the list before anything goes out.** Post a table (who, which post, the exact copy) and wait for a yes naming them.
- **One reply per person, ever.** Before approving, pull matt's recent replies (treg `anyapi.x.user.posts`, handle `matthewsoldit`), and skip anyone he already replied to. Check the send logs too. Dedupe handles inside the queue. If someone replies back to matt, answering them is fine.
- **Exclusions:** afahmy_dev (an ai recruiter) and anyone in an earlier send log.
- **Write in matt's voice:** short and casual, about their own post. No pay figures and no claim we can't back up.
- **Log every send:** the reply url (`https://x.com/matthewsoldit/status/<id>`) or X's event, in the page's send log.
