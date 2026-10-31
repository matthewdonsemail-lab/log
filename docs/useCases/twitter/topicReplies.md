# Replying to everyone posting about one topic

Pick a topic you have something real to say about, find everyone on X posting about it, and reply to each person with one line about their own post, backed by one of your own facts. Each reply can point at your article or video on the topic. The owner approves the list, then the queue sends it over days, inside the 40 a day limit.

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/topicReplies.md for <topic>, linking <article or video url>"**. The agent then:

1. Reads this page and [README.md](README.md).
2. Gets the owner's facts on the topic from their own posts, article or video. Every number in a reply has to come from there.
3. Runs the steps below and shows the full list with the copy for the owner's yes.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Session check | `twitterSessionCheck` | `loggedIn` |
| 1 | Find the posts: the topic's words, latest first, original posts and replies with a real take | treg's X post search | a pool of posts, newest first |
| 2 | One post per person. Drop anyone the account already replied to, and accounts that only repost news | treg's posts read on the account, for its past replies | a unique list |
| 3 | For each post, a one-line summary of what they said, and a reply that answers it with one of your facts. Mark which link it carries (article or video) | house style | every line passes `twitterQueueCheck` |
| 4 | Write the list somewhere the owner can read it on a phone: number, handle, link type, post url, "they said", the reply | a shared page | the owner says yes |
| 5 | Queue it: each target carries its own `text`, build, check, approve, plan, run live. Plan only what fits today's limit (`limit`), and plan the rest on later days | README queue steps, `twitterQueuePlan` { limit } | the queue's `pending` reaches 0 |

## What one item looks like

> they said: thinks it's a get rich quick scheme
>
> theres a course crowd on it for sure but the buyers are real and here's what one actually pays `<your fact>`

## What the runs taught

- **Check past replies before approving.** One run replied to someone the account had already answered several times; that's where the one-reply-per-person rule came from.
- **Big lists take days.** At 240 writes a day, a list of a hundred and more is planned day by day with `limit`.

## Not built yet

- The queue only plans up to a limit. Spreading a long list over several days means planning it again each day.
