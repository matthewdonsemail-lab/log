---
name: log-discord-channel-reply
description: "Answering someone in a Discord DM or group DM. A log play (docs/useCases/discord/channelReply.md): Answer what someone said to the account in a Discord DM or group DM, with words: a question about what matt is building, a reply to something he posted. A group DM is a private chat of a few people with no server; a channel inside a server (\"pennyserver #general\") is a different place, read and answered differently, and is [serverReply](serverReply.md). The chat is read first, the answer is written from what was said there and what matt has told you, gated like every send, and sent through the account's one session. No meme and no voice note (those are [memeReply](memeReply.md) and [voiceNote](../inbox/voiceNote.md))."
when_to_use: "Use when matt asks for this, in words like: \"reply to <someone> on discord\", \"reply to <someone> in <group>\", \"explain what I'm trying to do to <someone> in <group>\", \"answer the group\""
metadata:
  summary: "Answering someone in a Discord DM or group DM"
---

# Answering someone in a Discord DM or group DM

This is the log play `discord/channelReply`. Before anything else, call the log MCP tool `getGuide({ useCase: "discord/channelReply" })`: it returns this page and makes it the session's play, so every log tool's answer says which step you are on and a send with no play loaded is refused (rules 157, 158). Then follow the steps in order.

Draft every message from that person's own thread and matt's real replies (`voice` with no text, `search`), never from memory, and never send two that read alike (`sameAsSent`).

Answer what someone said to the account in a Discord DM or group DM, with words: a question about what matt is building, a reply to something he posted. A group DM is a private chat of a few people with no server; a channel inside a server ("pennyserver #general") is a different place, read and answered differently, and is [serverReply](../log-discord-server-reply/SKILL.md). The chat is read first, the answer is written from what was said there and what matt has told you, gated like every send, and sent through the account's one session. No meme and no voice note (those are [memeReply](../log-discord-meme-reply/SKILL.md) and [voiceNote](../log-inbox-voice-note/SKILL.md)).

How the owner asks for it: "reply to <someone> on discord", "reply to <someone> in <group>", "explain what I'm trying to do to <someone> in <group>", "answer the group"

## Run it from a fresh context

Say: **"go on docs/useCases/discord/channelReply.md for <chat>"**. The agent reads this page and runs the steps.

## The steps


| # | Step | Tool | Done when |
| --- | --- | --- | --- |
| 1 | Claim the chat, so no other session answers it | `inboxClaim` { platform: "discord", account, chat: "<chat id>", event: "<event id from the hook>" } | this session holds the chat |
| 2 | Read the chat around what they said, by its name | `discordRead` { account, channel: "<chat as matt says it>", limit: "25" } | what they said, what came before it, and who it answers |
| 3 | Write the answer from what they asked and what matt said to tell them, in his words and length, then gate it | `voice` { to: "<who>", context: "<what they said and what came before>", text: "<draft>" } | `PASS`, or matt's own words he gave for this message |
| 4 | Send it to the chat by its name | `discordSendLive` { account, channel: "<chat as matt says it>", text: "<draft>", approvedBy: "matt", confirmLive: true } | Discord answers `sent` with the message id |

## What to know

- **matt's own words.** When matt says what to tell them, the answer is his words, kept as close to how he said them as reads right. When the gate still refuses his own words, `overGate` on `discordSendLive` sends that exact message: the gate's read is skipped and the AI artifact check still runs (rule 152).
- **A server channel is not a group DM.** When the message came from a channel in a server (the hook says "mentioned you in a server channel" or "replied to you in a server channel"), use [serverReply](../log-discord-server-reply/SKILL.md).
- **One message per line.** A draft on several lines goes out one message per line, and the send stops the moment they write back (rules 90, 130).
- **X links embed as fixupx.** Share an X post on Discord as https://fixupx.com/<user>/status/<id>, never x.com: Discord only embeds the post and its video from fixupx. `discordSendLive` turns any x.com or twitter.com post link into fixupx.com itself (matt, 2026-11-13).
- **Name the chat.** A DM by the person, a group DM by its name or its members' names, never its id (rule 154).
