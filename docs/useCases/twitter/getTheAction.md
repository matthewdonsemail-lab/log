# Getting people to do the thing: retweet, like, try it

The owner needs people to do one action for him: retweet a post, like it, try the tool. This page goes through everyone talking to him, tells him in plain words what each conversation is about, and gets each of them a message that answers what they said and asks for the action. All of it goes out through the account's one queue.

The owner should never be blind to a conversation. Before anything is sent, he gets one line per person: who they are, what the conversation is about, and where it's at. Without that line, nothing goes out for that person.

How the owner asks for it: "get me all them people who liked it ... yo cool to see that you liked that, would you give that a wee retweet", "notifications: people who like, comment, reply", "go through all the people there who need a message", "get them to retweet the thing", "would you do me a favour and give it a wee retweet", "I need them to retweet it so I can get some inbound leads", "I don't know what they're even talking about, explain the context", "make them do the action I need".

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/getTheAction.md"**, with the action and its link (for example: retweet https://x.com/matthewsoldit/status/2116868115028120050). The agent reads this page and [README.md](README.md), loads `getGuide({ topic: "xSending" })`, and runs the steps.

## The steps

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 1 | Everyone waiting on the owner, plus the people who opened or reacted to his last message | `twitterDms` { account, waiting: true, limit: "200", json: true } | the list, with followUps |
| 1b | Everyone who engaged with the post: who liked it, reposted it, replied or quoted it. Likes are private on X's public API, so the likers come from the account's own notifications; reposters, replies and quotes also come from treg's X reads (`/2/tweets/<id>/retweeted_by`, a `conversation_id:<id>` search, `/2/tweets/<id>/quote_tweets`) | `twitterNotifications` { account, type }, treg | every engager, with what they did |
| 2 | Drop the noise: spam, someone pitching their own tool, notification bots, a group the owner didn't start. Say in one line what was dropped and why | the agent | a list of real people |
| 3 | Read each real person in full, old DM thread and X Chat merged. One `twitterDms` call at a time, never a burst of reads (rule 104) | `twitterDms` { account, with: "<handle>" } | everything they've said |
| 4 | **Tell the owner what each conversation is about**: one table row per person with who they are (their work), what the conversation is about (what each side offered or asked), and where it's at (their last message, word for word). Facts from the thread only | the agent, in chat | the owner can see every conversation at a glance |
| 5 | Someone who engaged with the post gets it said back to them and the next small action: liked it, "yo cool to see you liked that, would you give it a wee retweet"; reposted it, "cheers for the retweet, give it a try if you get a minute <the tool's link>"; replied to it, answer the reply then ask. They started it, so the small ask can go in the first message (matt, 2026-11-01): the gate's openerOnly score doesn't hold these back, but every other score must pass. Draft one message per person: first answer what they last said, in a line about them or their work, then the ask in the owner's words ("would you do me a favour and give the video a wee retweet <link>", plus why, "trying to get it in front of the right people"). Every draft reads differently | `voice` { to, with, context } for the owner's lines first | one draft per person |
| 6 | Gate each draft against the same person, and rewrite until it passes. If a draft fails twice for asking too soon (a thin conversation), hold that person and say so in step 4's table | `voice` { to, with, context, text } | the gate passes, or the person is held |
| 7 | Everyone who passed goes into the account's **one** queue as dms, together with anything else that queue is already sending. Never a second queue or run beside it (rule 107), never a loop of single sends (rule 104), never a hand-run command (rule 106) | `twitterQueueAdd` { queue, targets, action: "dm", by: "matt" }, or with no queue going `twitterQueueBuild`, `twitterQueueApprove`, `twitterQueuePlan`, `twitterQueueRunLive` { keepOpen: true } | the run is going, every item planned |
| 8 | When someone answers, tell the owner what they said; when they've done the action, say so | the inbox hook, `twitterDms` { with } | the owner knows who did it |

## What to know

- **The owner's ask is the point.** Don't drop it to make a message softer. Put it after a line that answers them, so it reads like a mate asking a favour.
- **The context line comes first, every time.** The owner has said he doesn't know what half the conversations are about. Step 4's table is what he reads, so keep it plain and short.
- A meeting, a deal or a promise is never made for the owner here. If someone asks for one, say it in step 4 and leave it to him.
- Use only facts from the thread. Never invent where a deal is up to.
- The link goes in as a plain URL. Every line of a draft is one message (rule 90).
- Everything is sent through the account's one X session (rule 105), and the answer's `xSession` names it.
