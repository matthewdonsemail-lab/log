---
title: "Voice gate"
---

# Voice gate

Every message log sends as matt passes the voice gate first (`log voice`, MCP `voice`). The gate asks SubQ whether matt typed it himself, reading his own writing across all his conversations. Rules 90, 98, 111 and 112.

## Reading

### REQ-VOICE-01: Every draft is read against matt's writing

Every draft is sent to SubQ with matt's writing guide and the DMs he wrote himself. His real replies and closest wording from all his conversations go with them, unless he has written enough in this chat already (REQ-VOICE-20).

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

### REQ-VOICE-19: A task is gated as a brief, and its files go with it

`log discord send --brief` passes `brief` and the attached files to `gateSend`, which, after the sameness check, hands the draft to `gateBrief` instead of the voice reading. `gateBrief` refuses a draft the scrambler finds suspicious, then asks SubQ (`readBrief`, `src/voice/brief/client.ts`) the five `BRIEF_CHECKS` (`clear`, `why`, `doneWhen`, `kind`, `steerable`) and `fitsTheRoom` when there is a room, with the chat's ranked moments, matt's writing guide and each attached file (`attachedOf`: its name, and the first `ATTACHED_TEXT_CHARS` characters of a text file). It passes only when every answer is at least `BRIEF_PASS` (0.7); a refusal names each failed check (`briefFailedParts`). `--file` attaches files to the last message only (`filesOf`): each must be under OUTBOX or ~/.logCli and at most 10 MB, else `fileRefused` before anything is sent. matt, 2026-11-07. Rule 162.

Checked by: code and SubQ

### REQ-VOICE-20: A send reads one conversation card, kept up to date as messages land

Every chat has one conversation card in log.db (`conversationCards`, migration 19, `src/inbox/card`). `buildCard` makes it from the chat's own rows in `messages`, and for X merges the old DM and X Chat threads by their pair. It holds:

- who the chat is with and its kind;
- how many messages there are, and how many are matt's;
- who it is waiting on;
- how it started (`startedWith`);
- what they said that matt hasn't answered (`theyAskedOpen`);
- what matt asked that they haven't answered (`mattAskedOpen`);
- matt's last messages there (`mattSaid`);
- the last messages (`last`).

`cardFor` reads the stored card and rebuilds it only when the chat has messages past its `throughSeq`.

`appendEvent` refreshes the card in the background after each message it appends (`refreshWorkedCards`), but only for a chat being worked: one that already has a card, or one claimed now. Nothing runs for any other chat.

`log voice` with no text starts with the card (`renderCard`), then how matt writes in this chat, then at most `NEAR_WHEN_SCOPED` (4) of his real replies. It tells the agent to answer what is open in one or two short lines, never as a list of questions, never repeating what matt already asked or said, and with nothing from another conversation.

`gateSend` and the `voice` command pass the card to `gateReading`, which gives it to SubQ as `thisConversation`. Once matt has written `OWN_CHAT_MESSAGES` (5) or more messages in the chat (`scopedToThisChat`), `evidenceAnywhere` isn't read, so nothing from other conversations reaches the gate.

matt, 2026-11-12: "all of the things of other conversations is just all over the place"; the SubQ decision is in `docs/decisions/conversationContext`.

Checked by: code and SubQ

### REQ-VOICE-18: A draft that just passed is not sent to SubQ again

When `gateSend` or the `log voice` command passes a draft, it records the pass by the draft's text (`recordPass`, `src/voice/passes`). `gateSend` then answers a send of the same text as passed without asking SubQ (`recentPass`) when that pass is under `PASS_REUSE_MS` (10 minutes) old and nothing has come in on the chat since (`incomingSince`). The sameness check (REQ-VOICE-16) still runs first. On a Discord DM or group whose .db is current (`readSourceFor`), the room the gate reads comes from `chatMessages`, not a read from Discord. matt, 2026-11-07. Rule 161.

Checked by: code and SubQ

### REQ-VOICE-17: A refused draft says where to look before it is rewritten

When `gateSend` in `src/cli/twitter/helpers/voice.ts` refuses a draft with `voiceGateFailed`, or `sameAsSent` refuses it, the refusal ends with `rewriteSteps`: call `voice` with the person (and what they said) and no text, to read the chat's conversation card and matt's real replies in this chat. Then answer only what is open on the card, in one or two short lines, never as a list of questions and with nothing from another conversation, unlike anything sent today. matt, 2026-11-07: "you don't even try to look"; matt, 2026-11-12, against reading other conversations. Rule 158.

Checked by: code and SubQ

### REQ-VOICE-16: No two messages read alike

`sameAsSent` in `src/cli/twitter/helpers/voice.ts` reads what the account sent in the last `SAMENESS_WINDOW_HOURS` (24) from the .db (`ownTextsSince` in `src/inbox/store/client.ts`, one text per conversation) and refuses the draft when `samenessOf` in `src/voice/sameness/client.ts` finds half or more of its word pairs (`SAMENESS_LIMIT`, 0.5), with links left out, already in one of them; a draft with fewer than `SAMENESS_MIN_PAIRS` (3) word pairs is never refused. `gateSend` runs it through `gateDeps.same` before the voice gate's reading, and the twitter dm and Discord sends run it before their `overGate` skip, refusing `sameAsSent`. `itemProblems` in `src/twitter/queue/plan/client.ts` adds a `sameAsSent` problem for every pending item that `batchSameness` finds repeating an earlier item of the same queue. matt, 2026-11-07: the share-asks that day differed only in their first line. Rule 157.

Checked by: code and SubQ

### REQ-VOICE-15: Every send and voice note is gated against the room it goes to

`gateSend` in `src/cli/twitter/helpers/voice.ts` passes a room to `gateReading`: the one given (`room`), the one its `readRoom` reads, or one built with `roomOf` from the chat in the .db. `roomOf` in `src/voice/room/index.ts` gives the chat's kind, who else spoke in the last 24 hours, the last of them and how many days ago, how many of matt's messages end the chat, whether nobody else has spoken lately, and `addressTo`, which for a channel or group with nobody else lately says to talk to it as a whole. `readVoice` in `src/twitter/copy/voice/client.ts` gives it to SubQ as `theRoom` and asks `fitsTheRoom`, and a draft scoring under `CONTEXT_PASS` fails. The Discord send and voice note pass a `readRoom` that reads the chat's last 20 messages through the engine with `roomFromRead`. When nobody else has spoken lately in a channel or group (`nobodyToAnswer`), there is nothing to answer, so `inContext` doesn't count towards the pass and isn't named in a refusal; `fitsTheRoom`, `buildsOn` and the voice still do. In a direct message where matt sent the latest messages and they haven't answered yet, `fitsTheRoom` counts a follow-up that carries on from what matt just sent them (a question about their own post he just shared) as addressed to them as the chat really is, and fails it only when it acts as if they had replied. Rules 155, 156.

Checked by: code and SubQ
