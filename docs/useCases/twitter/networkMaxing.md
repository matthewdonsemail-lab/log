# Network maxing: warm everyone up, then bring new people in

The goal is the network, not a deal. Everyone who messaged the owner gets something nice back that keeps the conversation going, with nothing asked of them. That holds even when they said it doesn't line up as a business thing: it isn't a business thing yet. Warm the relationship first, and the business comes later, from a follow-up and a good conversation. New people get pulled in the same way, through small positive interactions: on their phone they see that the owner followed them, liked their tweet, then messaged.

How the owner asks for it: "all them people messaging me, just message them something nice, get the ball moving with the networking", "we're not even trying to get anything out of these people, network max", "throw some new people in the mixer", "follow them before you cold message them, and like the tweet you send them".

## Run it from a fresh context

Say: **"go on docs/useCases/twitter/networkMaxing.md"**. The agent reads this page and [README.md](README.md), loads `getGuide({ topic: "xSending" })`, and runs the steps.

## The steps

### Everyone who messaged

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 1 | Who wrote last, message requests included | `twitterDms` { account, waiting: true, limit: "50" } | the list, newest first |
| 2 | Read each in full, old DM thread and X Chat merged. Drop spam, pitches and bots: a real person who said something real stays | `twitterDms` { account, with: "<handle>" } | what each one said, and whether they're real |
| 3 | How the owner writes to this person | `voice` { to, with, context: "<what they said>" } | the owner's own lines to draft from |
| 4 | Draft something nice that keeps it going and asks for nothing: answer what they said, say something true about them or their work, leave the door open. Never a pitch, never "let's hop on a call". Every draft reads differently | the agent | one draft per person |
| 5 | Gate each draft, rewrite until it passes | `voice` { to, with, context, text } | the gate passes |
| 6 | Send each one, one message per line, a few minutes between people | `twitterDm`, then `twitterDmLive` { userId, text, approvedBy, confirmLive: true } | X's answer is `sent` |

### New people in the mixer

| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 7 | Who: from a source the owner named (people who engaged with his post, a topic search) | [engagerDms.md](engagerDms.md) steps 1 to 4 | a short list, each with a user id and one recent tweet of theirs |
| 8 | Follow them first. Never send a cold message to someone the owner doesn't follow | `twitterFollow`, then `twitterFollowLive` { userId, approvedBy, confirmLive: true } | X's answer is `sent` (or already followed) |
| 9 | Like the tweet the message is about, before the message | `twitterLike`, then `twitterLikeLive` { tweet, approvedBy, confirmLive: true } | X's answer is `sent` |
| 10 | Then the message: their tweet forwarded first, then one informal line about it, the cold DM way in [engagerDms.md](engagerDms.md). The opener only, always relevant to them, never an ask (no pitch, no "you using `<tool>`"). Gated like every send | `voice`, then `twitterDmLive` | X's answer is `sent` |

## What to know

- Follow, like and message are each a write, and they all count against the account's writes for the day (each line of a message is one). Spend today's writes on the people who messaged first, then new people with what's left.
- Never act on the account in quick succession: a few minutes between people, the follow, like and message to one new person spread out, never back to back. A drop or a 429 stops the run, and the next action waits for the owner (rule 94).
- **The opener is never the ask.** A first message to someone new is about them and what they posted, nothing else. The ask comes once they've answered. On 2026-10-31 five openers went out ending "you using treg for anything", and the owner said: go in with the opener, never for the jugular.
- Answer what they actually said. Read far enough back first, and never ask something they already told the owner.
- A message the owner already sent, with them not answering yet, isn't waiting on him: leave it.
