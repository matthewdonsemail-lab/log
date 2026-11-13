---
name: dm-inbox
description: Work the user's social DMs with log. Use when the user asks who messaged them, what needs a reply, to catch up on DMs on X or Discord, or to answer someone.
---

# DM inbox with log

log reads and sends from the user's own X, Discord, Slack, Instagram and Reddit accounts. LinkedIn currently has a session check only. Its tools come from the `log` MCP server (`mcp__log__*`). Reads are free to run. Anything that sends needs the user's approval, and Hermes asks before each one.

## Find what needs a reply

1. Check the account is signed in before reading: `twitterSessionCheck` or `discordSessionCheck` with the account. If it says `loggedOut`, tell the user to sign it in with `log` and stop for that platform.
2. Read the inboxes:
   - X: `twitterDms` with the account. Add `waiting: true` to get only the threads where the other person wrote last, plus those who opened or reacted without replying.
   - Discord: `discordChats` with the account, then `discordRead` with a chat to read it.
3. Report back in a short list: who, which platform, when, and what they said in one line. Group the ones that need an answer first.

## Answer someone

1. Read the whole conversation first (`twitterDms` with `with: <handle>`, or `discordRead` with the chat). Never answer from the inbox preview alone.
2. Pull how the user really writes to this person: `voice` with `to` and `with` set to them and `context` set to what they said, without `text`. It returns the user's own past messages.
3. Draft from those messages, in the user's words and length, answering what was actually asked. Use only facts the user has stated.
4. Check the draft: `voice` again with the same fields plus `text: <draft>`. Rewrite until it passes.
5. Show the user the draft and send only when they say so: `twitterDmLive` (with the person's `userId`) or `discordSendLive` (with the `channel`), passing `confirmLive: true` and `approvedBy` set to the user's name. Hermes asks for approval on these too, and they refuse in unattended runs.

## Rules

- One message per line of the draft goes out as its own message unless the user asks for one block.
- Never message someone the user has not talked to as a cold pitch. A first message is about the other person and something they posted, never the ask.
- A rate limit, a block or a failed send stops the run. Tell the user; do not retry.
- log keeps each account's limits (writes per day, active hours). If a tool refuses for a limit, say so and stop.
