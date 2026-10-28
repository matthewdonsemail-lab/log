# DMing the people who liked or reposted your post

A post that does well leaves hundreds of people who liked or reposted it and were never followed up. This page turns them into a short list the owner knows is worth it, writes each one a DM that opens on why they're on the list, and sends them through the queue as dms.

This is outbound DMs. Reading the inbox and answering people who are waiting is [dmInbox.md](dmInbox.md).

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/engagerDms.md for <post url>, pitching <what>"**. The agent then reads this page and [README.md](README.md) and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Session check | `twitterSessionCheck` | `loggedIn` |
| 1 | Who liked and reposted the post. X only shows likers of your own post to your own session | treg's likers read (paid per person, so short lists only), or a read on the account's own session | the list, with each person's user id |
| 2 | Score them: their bio matches who you want, they reposted (a bonus) or engaged with more than one post, and a sensible follower count. Few followers and no bio is a bot | treg's X profile read | a ranked list |
| 3 | The owner checks the top of the list: drop the team, people they don't want to contact, and friends (friends get a personal note, not a template) | a table | the owner's corrections applied |
| 4 | Check for an existing thread with each person, and DMs already waiting | `twitterDms` { account, limit: 200 } | no one gets a cold template where a chat already exists |
| 5 | Write each DM the cold DM way below: their own tweet forwarded first, then one informal line | house style | passes `twitterQueueCheck` |
| 6 | Queue as dms: targets are `{handle, user_id, text}`, `action: "dm"`. Approve, plan, run live | README queue steps, `twitterQueueBuild` { action: "dm" } | `finished` |

## How a cold DM opens

Never open cold with a line built from their bio. Build the context of the conversation from what they posted:

1. **Find one of their own recent tweets that's relevant** (an original post, not a reply or a repost), with treg's posts read for that handle.
2. **Forward it into the DM:** the tweet's link goes first, so X shows it as a card in the chat.
3. **Then one informal line:** "saw this", then what's true about how you're connected ("also saw we follow each other but never chatted", or "saw you followed me but we ain't chatted yet" when you don't follow them back; check with `twitterFollows`), then something brief about their tweet, then the ask.
4. **No usable tweet:** don't forward anything. Send the plain opener: "mate we follow each other but ain't chatted yet lad whats up".

Never: "saw you're `<bio thing>`", their name, made-up camaraderie, or "thanks for following".

> `https://x.com/<them>/status/<id>` saw this and noticed we follow each other but haven't spoken 4249 live ads for one product is insane you using `<tool>` for pulling ad data yet

> mate we follow each other but ain't chatted yet lad whats up

## What to know

- A DM only lands if the person accepts DMs from accounts they don't follow. X answers otherwise, and the queue logs it and moves on.
- Some chats live in X's encrypted Chat. `twitterDms` reads them once the account's X Chat PIN is saved, and step 4 must include them: a person you already talk to in X Chat never gets a cold template. A send still goes out as an old-style DM, which shows in their X Chat too.

## Not built yet

- A `log twitter` read for a post's likers and reposts on the account's own session. Today it's treg (paid per person) or a script on the session.
