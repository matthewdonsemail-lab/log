---
name: outreach
description: Reply under posts and keep conversations going on X with log, in the user's own voice. Use when the user asks to reply to a post, quote it, follow up with people who opened a DM, or find posts to engage with.
---

# Replies and follow-ups with log

## Find posts worth answering

- `search` finds past conversations by meaning and keyword across every platform the user has synced, so check what was already said to someone before writing.
- For a live topic, ask the user for the post links, or use the posts they name. log does not invent targets.

## Reply or quote

1. Read the post and, for a reply, the thread around it.
2. Draft in the user's voice: run `voice` with `context` set to the post, without `text`, and draft from the examples it returns.
3. Check the draft with `voice` plus `text`, and show it to the user.
4. On their go: `twitterReplyLive` (reply) or `twitterQuoteLive` (quote) with the post link as `tweet`, `confirmLive: true` and `approvedBy` set to the user's name. Each send is approved in Hermes first.

## Follow up

- `twitterDms` with `waiting: true` lists people who reacted to or opened the user's last message without answering. A follow-up is about them and what they are doing, never a repeat of the opener and never the ask.

## Limits

log enforces each account's daily write budget and stops on any platform refusal (rate limit, block, captcha). Report it and stop; do not route around it.
