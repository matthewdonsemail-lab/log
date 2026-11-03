---
title: "Voice gate"
---

# Voice gate

Every message log sends as matt passes the voice gate first (`log voice`, MCP `voice`). The gate asks SubQ whether matt typed it himself, reading his own writing across all his conversations. Rules 90, 98, 111 and 112.

## Reading

### REQ-VOICE-01: Every draft is read against matt's writing across all his conversations

Every draft is sent to SubQ with matt's writing guide, the DMs he wrote himself, and his real replies and closest wording from all his conversations, whether or not there is a chat with the person.

Checked by: code and SubQ

### REQ-VOICE-02: A chat with the person adds that chat's evidence

When there is a chat with the person, the draft is also read against matt's replies, closest wording and latest messages in that chat, and SubQ is asked whether it reads like him writing in that chat.

Checked by: SubQ

### REQ-VOICE-03: Phrases matt never says fail the draft

A draft that contains a phrase from the list of phrases matt never says fails, whatever SubQ answers.

Checked by: code and SubQ

## Opener

### REQ-VOICE-04: A first message is only the opener

A first message to someone matt has never talked with fails when it carries an ask: a pitch, a question about a tool, product or service of his, a call, or a link to his own stuff. Rule 98. A chat where matt has already sent messages (the voice index's latest messages in that chat) is never judged as a first message: SubQ is told so (`alreadyTalkedInThisChat`) and the opener check passes.

Checked by: SubQ

## Watermark

### REQ-VOICE-05: A draft with AI artifacts fails

A draft whose watermark reading finds artifacts (zero-width or other hidden characters, odd spaces, pasted Claude HTML) fails. Rule 111.

Checked by: code and SubQ

## Pass

### REQ-VOICE-06: A draft passes only when every answer passes

A draft passes only when the voice answer reaches its threshold, the context, friend-like and opener answers reach theirs, the chat answer reaches its threshold when there is a chat, no never-said phrase is found and the watermark finds no artifacts.

Checked by: code and SubQ

## His own phrasing and the scrambler

### REQ-VOICE-07: A draft written in word pairs matt has never written fails

Every reply in the voice index is cut into pairs of words. The gate counts how many of the draft's pairs matt has written at least twice, leaving out pairs that use words from what the other person said. A draft whose share is below matt's own 10th percentile fails, measured over his replies with each reply's own pairs left out. The pairs he has never written are named in the result and handed to SubQ, so "is wild" fails because matt never wrote it.

Checked by: code and SubQ

### REQ-VOICE-08: The vendored watermark scrambler reads every draft

The draft goes through `vendor/aiWatermarkScrambler` (novatechflow/ai-watermark-scrambler, layer A) for invisible and lookalike characters. A draft with any fails, and its count and kinds are handed to SubQ. The statistical watermark is not checked here.

Checked by: code and SubQ
