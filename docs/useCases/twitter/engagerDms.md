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
| 5 | One opening line per person on why they're on the list, then the base message. No link in the first DM. The link goes only after a yes | house style | passes `twitterQueueCheck` |
| 6 | Queue as dms: targets are `{handle, user_id, text}`, `action: "dm"`. Approve, plan, run live | README queue steps, `twitterQueueBuild` { action: "dm" } | `finished` |

## What an opening line looks like

> yo saw you liked the post on `<topic>` and you've done growth at `<their company>`

> yo appreciate the rt on the `<post>`

## What to know

- A DM only lands if the person accepts DMs from accounts they don't follow. X answers otherwise, and the queue logs it and moves on.
- Some chats live in X's encrypted Chat. Neither `twitterDms` nor a send can see or continue those, so the owner checks their X Chat for the names before approving, and messages friends from the app.

## Not built yet

- A `log twitter` read for a post's likers and reposts on the account's own session. Today it's treg (paid per person) or a script on the session.
