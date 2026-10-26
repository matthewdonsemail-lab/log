# Replying to everyone posting about one topic

Pick a topic matt has something real to say about, find everyone on X posting about it, and reply to each person from @matthewsoldit with one line about their own post, backed by one of matt's own numbers. Each reply can point at matt's article or video on the topic. matt approves the list, then the queue sends it over days, inside the 40 a day limit.

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/topicReplies.md for <topic>, linking <article or video url>"**. The agent then:

1. Reads this page and [README.md](README.md).
2. Gets matt's facts on the topic from his own posts, article or video. Every number in a reply has to come from there.
3. Runs the steps below and posts the full list with the copy for matt's yes.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Session check | `twitterSessionCheck` | `loggedIn` |
| 1 | Find the posts: the topic's words, latest first, original posts and replies with a real take | treg `anyapi.x.search.posts` | a pool of posts, newest first |
| 2 | One post per person. Drop anyone matt already replied to, and accounts that are only reposting news | treg `anyapi.x.user.posts` on matthewsoldit for his past replies | a unique list |
| 3 | For each post, a one-line summary of what they said, and a reply that answers it with one of matt's facts. Mark which link it carries (A = article, V = video) | matt's voice, house style | every line passes `twitterQueueCheck` |
| 4 | Write the list to a page matt can read on his phone: number, handle, link type, post url, "they said", the reply | `OUTBOX/<topic>Replies/ALL_REPLIES.md` | matt says yes |
| 5 | Queue it: build, set each text, check, approve, plan, run live. Plan only what fits today's limit (`limit`), and plan the rest on later days | README queue steps, `twitterQueuePlan` { limit } | the queue's `pending` reaches 0 |

## A real run: data brokering (2026-10-17)

- **Topic:** data brokering, selling company data to AI labs.
- **matt's facts used:** 6 years of China shipping records turned into 4,946 companies and 1,304 named bosses for $111. 12,468 posts read from people actually closing. A buyer (Troy at Pewter) wants 150 GB, 20 staff and 3 years of trading, and pays 10% per company.
- **Size:** 156 replies, each about the person's own post.
- **One of them:**

  > they said: thinks it is a get rich quick course scheme
  >
  > theres defo a course crowd on it but the buyers are real troy at pewter has $30m to buy company data for the labs and pays 10% per company

- **Where it stands (read 2026-10-26 with `twitterQueueStatus`):** 35 sent, 115 pending, 4 skipped, 1 blocked, 1 failed.
- **Lesson:** reply #59 went to @troyaitken_, who matt had already replied to 5 times. That's where the one-reply-per-person rule came from: check matt's past replies before approving.

Files: `OUTBOX/databrokerReplies/ALL_REPLIES.md` (the list), `.scratch/dbreply/queue_final.json` (the queue), both in `~/.buzz`.

## Not built yet

- The queue only plans up to a limit. Spreading 156 replies over several days means planning it again each day, by hand.
