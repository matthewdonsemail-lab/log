# DMing the people who liked or reposted our post

A post that does well leaves hundreds of people who liked or reposted it and were never followed up. This page turns them into a short list matt knows is worth it, writes each one a DM that opens on why they're on the list, and sends them through the queue as dms.

This is outbound DMs. Reading the inbox and answering people who are waiting is [dmInbox.md](dmInbox.md).

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/engagerDms.md for <matt's post url>, pitching <what>"**. The agent then reads this page and [README.md](README.md) and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 0 | Session check | `twitterSessionCheck` | `loggedIn` |
| 1 | Who liked and reposted the post. X only shows likers of your own post to that account's own session | treg `x.x.get-posts-liking-users` ($0.01 per person, so short lists only), or a read on matt's session (see below) | the list, with each person's user id |
| 2 | Score them: their bio matches who we want, they reposted (a bonus), or engaged with more than one post, and have 200 to 50k followers. Under 15 followers and no bio is a bot | treg `anyapi.x.user.profile` | a ranked list |
| 3 | matt checks the top 20: drop team, people he doesn't know, friends (they get a personal note from matt, not a template) | buzz table | matt's corrections applied |
| 4 | Check for an old thread with each person, and DMs waiting on matt | `twitterDms` { account, limit: 200 } | no one gets a cold template where a chat already exists |
| 5 | One opening line per person on why they're on the list, then the base message. No link in the first DM. The link goes only after a yes | house style | passes `twitterQueueCheck` |
| 6 | Queue as dms: targets are `{handle, user_id}`, `action: "dm"`. Approve, plan, run live | README queue steps, `twitterQueueBuild` { action: "dm" } | `finished` |

## A real run: the 203k post's likers (2026-10-13)

- **Post:** `2107455222209724636` (the treg "$10 → 30 conversations" post, 203k views), plus the go getters VSL `2109844147343687795`.
- **Read:** 437 unique people across both posts (419 likers and 24 reposts on the 203k post). 89 scored 3 or more, 20 scored 5 or more, 33 looked like bots. Likers were read on matt's session with twikit. Replies came from treg.
- **matt's corrections:** dropped @KennedyThe63021 (works with us) and @_mshrq_ (matt doesn't know them). @Nefer_L is a friend, so a personal note from matt went in their existing chat. That left 17 templated DMs.
- **Opening lines**, one per person:

  > yo saw you liked the treg post and you've done growth at encord and jiminny

  > yo appreciate the rt on the go getters video

- **State:** drafted for matt's approval. No send recorded.

Files: `RESEARCH/GO_GETTERS_ENGAGERS_2026-10-13.md`, `RESEARCH/go-getters-offer/engagersRanked_2026-10-13.tsv`, `.scratch/gg-engagers/read_engagers.py` (all in `~/.buzz`).

## What to know

- A DM only lands if the person accepts DMs from accounts they don't follow. X answers otherwise, and the queue logs it and moves on.
- Some of matt's chats are in X's encrypted Chat (XChat). Neither `twitterDms` nor a send can see or continue those. matt checks his X Chat for the names before approving, and messages friends from the app himself.

## Not built yet

- A `log twitter` read for a post's likers and reposts on the account's own session. Today it's treg (paid per person) or the 2026-10-13 script.
