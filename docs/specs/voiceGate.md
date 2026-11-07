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

A draft passes only when the voice answer reaches its threshold, the context, friend-like and opener answers reach theirs, the chat answer reaches its threshold when there is a chat, the builds-on answer reaches its threshold when the draft is spoken (REQ-VOICE-13), no never-said phrase is found and the watermark finds no artifacts.

Checked by: code and SubQ

## His own phrasing and the scrambler

### REQ-VOICE-07: A draft written in word pairs matt has never written fails

Every reply in the voice index is cut into pairs of words. The gate counts how many of the draft's pairs matt has written at least twice, leaving out pairs that use words from what the other person said. A draft whose share is below matt's own 10th percentile fails, measured over his replies with each reply's own pairs left out. The pairs he has never written are named in the result and handed to SubQ, so "is wild" fails because matt never wrote it.

Checked by: code and SubQ

### REQ-VOICE-08: The vendored watermark scrambler reads every draft

The draft goes through `vendor/aiWatermarkScrambler` (novatechflow/ai-watermark-scrambler, layer A) for invisible and lookalike characters. A draft with any fails, and its count and kinds are handed to SubQ. The statistical watermark is not checked here.

Checked by: code and SubQ

### REQ-VOICE-09: The gate runs inside every send and refuses a failing draft

Every send as matt (Discord, Slack, an X dm, the X queue's dms, replies and quotes, Instagram text) runs the whole gate right before it goes out, after the account has caught up and before the chat is claimed, whether or not `log voice` ran first. A failing draft is refused with `voiceGateFailed` and nothing is sent; in the X queue the item is held with what failed. A pass is one line; a fail names only the checks that failed and why. Rule 137.

Checked by: code and SubQ

### REQ-VOICE-10: The chat's context is ranked for the moment and given in full

The gate takes the chat's messages from the .db (both ways), embeds them and what is being answered, keeps the closest 40 by cosine, reranks those with `jina-reranker-v3.5`, and gives SubQ the top 12 in full, in time order, with its question on whether the draft answers them in this conversation. Rule 137.

Checked by: code and SubQ

### REQ-VOICE-11: Only embeddings are stored, each once, in the .db

A vector is stored in the .db's `embeddings` table by the text's hash, the model and the dimensions, and an embedder looks there first and embeds only what has no vector yet. The AI tells index's phrase list and matt's baseline are in `aiIndexes`. No reading, score or verdict is saved. Rule 137.

Checked by: code and SubQ

### REQ-VOICE-12: The gate inside a send reads matt's real replies in that chat

The gate inside a send finds the chat in matt's saved conversations by what the send knows (`chatIdFor`): its conversation id on that platform, or, on X, the conversation whose pair holds the person's user id, or their handle on that platform only. It gives SubQ his real replies there, the same evidence `log voice --with` gives. When the chat isn't there, the gate still reads his writing everywhere. On 2026-11-04 drafts that `voice` passed at 0.99 were refused inside the send at 0.36, because the send gave SubQ none of them. The opener rule (rule 98) only reads a first message: a chat with matt's own messages in its history, or his replies from that chat or that person, is already talking (`alreadyTalkedIn`), and openerOnly is not asked. What the send answers (`momentAnswered`) is every message they sent after matt last spoke, oldest first, one per line, so a run of messages is answered as a whole; the chat is ranked for the gate against that together with the draft itself, so the earlier moment a draft builds on is in front of SubQ (on 2026-11-05 a pitch to kewlkid passed `voice` at 0.89 and was refused in the send at 0.34, ranked against his last line alone). When matt's own message is the newest, the send is news of his own, so nothing is passed as what they said and the gate asks whether it picks up on something specific about them. Rules 98 and 137.

Checked by: code and SubQ

### REQ-VOICE-13: A voice note is graded as spoken and must build on the conversation

`readVoice` in `src/twitter/copy/voice/client.ts` takes `spoken`. With it the `voice` question asks whether matt would say it himself in a voice note, its length and punctuation never counting against it; `toThem` asks the same of how he talks in this chat; and a `buildsOn` question asks whether it takes what they are talking about further, across the whole conversation, rather than repeating what matt already told them, which must reach `CONTEXT_PASS` to pass. Without `spoken` there is no `buildsOn` (it is `null`). `gateReading` in `src/cli/twitter/helpers/voice.ts` passes `spoken` on and skips `offProfile` for it, `gateSend` takes `spoken`, `failedParts` names a low `buildsOn`, and `log voice --spoken` gates a voice note the same way. With `spoken`, `gateReading` also hands `readVoice` `howMattTalks()`: the AssemblyAI transcripts of matt's own voice notes (`mattsOwnVoiceNotes` in `src/extensions/voiceClone/helpers/recordings.ts`, only the ones recorded before `firstClonedAt`, so none the clone made), given to SubQ as `howMattTalksInHisOwnVoiceNotes`, which the spoken voice question reads first. Rule 149.

Checked by: code and SubQ

### REQ-VOICE-14: matt can send one dm over the gate's refusal

`log twitter dm` takes `--overGate` (`OVER_GATE` in `src/cli/twitter/helpers/send.ts`). With it, the send skips `gateDeps.gate` and says so on its error stream; without it the gate runs and a refusal is `voiceGateFailed`. The copy's AI artifact check (`planSend`, `aiArtifacts`) runs either way, before the gate. `log discord send` takes `--overGate` the same way (its flag in `DISCORD_SEND_INPUT`, `src/cli/discord/index.ts`): with it the send skips `gateDeps.gate` and says so, without it a refusal is `voiceGateFailed`, and its AI artifact check still runs first. matt, 2026-11-05: a message to kewlkid in his own words, and even his GitHub username on its own, were refused by the gate. Rule 152.

Checked by: code and SubQ

### REQ-VOICE-16: No two messages read alike

`sameAsSent` in `src/cli/twitter/helpers/voice.ts` reads what the account sent in the last `SAMENESS_WINDOW_HOURS` (24) from the .db (`ownTextsSince` in `src/inbox/store/client.ts`, one text per conversation) and refuses the draft when `samenessOf` in `src/voice/sameness/client.ts` finds half or more of its word pairs (`SAMENESS_LIMIT`, 0.5), with links left out, already in one of them; a draft with fewer than `SAMENESS_MIN_PAIRS` (3) word pairs is never refused. `gateSend` runs it through `gateDeps.same` before the voice gate's reading, and the twitter dm and Discord sends run it before their `overGate` skip, refusing `sameAsSent`. `itemProblems` in `src/twitter/queue/plan/client.ts` adds a `sameAsSent` problem for every pending item that `batchSameness` finds repeating an earlier item of the same queue. matt, 2026-11-07: the share-asks that day differed only in their first line. Rule 157.

Checked by: code and SubQ

### REQ-VOICE-15: Every send and voice note is gated against the room it goes to

`gateSend` in `src/cli/twitter/helpers/voice.ts` passes a room to `gateReading`: the one given (`room`), the one its `readRoom` reads, or one built with `roomOf` from the chat in the .db. `roomOf` in `src/voice/room/index.ts` gives the chat's kind, who else spoke in the last 24 hours, the last of them and how many days ago, how many of matt's messages end the chat, whether nobody else has spoken lately, and `addressTo`, which for a channel or group with nobody else lately says to talk to it as a whole. `readVoice` in `src/twitter/copy/voice/client.ts` gives it to SubQ as `theRoom` and asks `fitsTheRoom`, and a draft scoring under `CONTEXT_PASS` fails. The Discord send and voice note pass a `readRoom` that reads the chat's last 20 messages through the engine with `roomFromRead`. When nobody else has spoken lately in a channel or group (`nobodyToAnswer`), there is nothing to answer, so `inContext` doesn't count towards the pass and isn't named in a refusal; `fitsTheRoom`, `buildsOn` and the voice still do. In a direct message where matt sent the latest messages and they haven't answered yet, `fitsTheRoom` counts a follow-up that carries on from what matt just sent them (a question about their own post he just shared) as addressed to them as the chat really is, and fails it only when it acts as if they had replied. Rules 155, 156.

Checked by: code and SubQ
