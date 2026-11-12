# How a send's context is assembled today (read from the code, 2026-11-12)

## What SubQ gets in one gate call

There is one SubQ call per gate: `readVoice` calls `decide()` (`src/twitter/copy/voice/client.ts`), model `subq-snap-1.1`.

| SubQ key | Source | Size | Scope |
|---|---|---|---|
| howMattWrites | `GUIDES/MATT_WRITING_STYLE.md` | 7,276 chars, the whole file | Global, written from his X posts |
| dmsMattWroteHimself | `MATT_DMS`, hard-coded | 3 DMs | Global |
| howMattWritesEverywhere, mattsRealRepliesEverywhere, mattsClosestWordingEverywhere | `evidenceAnywhere`: BM25 plus MiniLM over the voice index, searched to depth 400 | Up to 8 replies and 8 wordings, each with up to 3 of their messages | Every conversation on every platform, tiered sameChat > samePerson > samePlatform > anywhere |
| thisChat, howMattWritesInThisChat, mattsRealRepliesHere, mattsClosestRealWording, mattsLatestMessagesHere | `chatEvidence` → `evidenceFor` | Up to 8 replies, 8 wordings and 8 recent, plus a profile | The same voice index, tiered to this chat |
| thisConversationRankedForThisMoment | `rankedContext`: a 40-message cosine shortlist, then a Jina rerank | Top 12 messages in full, with media lines | This chat only, from log.db `events` |
| theRoom | `roomOf` | Small | This chat |
| howMattTalksInHisOwnVoiceNotes | AssemblyAI transcripts | Up to 1,500 chars each | Global, only for spoken drafts |
| wordPairsMattHasNeverWritten | `phrases.json` | A list with no cap | Global |
| Small items | phrasesMattNeverSays, scrambler, recipient, alreadyTalkedInThisChat, whatTheySaid, dm | Small | — |

The voice index on disk:

| File | Size | What it holds |
|---|---|---|
| `pairs.json` | 19.9 MB | 36,023 pairs, 22,523 with a reply from matt |
| `profiles.json` | 325 KB | 924 profiles |
| `phrases.json` | 2.98 MB | |
| MiniLM vectors and a BM25 index | | |

`log voice index` rebuilds it by hand.

## Computed at send time (inside `gateSendNow`), on every attempt

- **Sameness check:** a database read of the account's own messages from the last 24 hours.
- **`chatContextOf`:** loads every message and notification event for the account, then filters to this chat in JavaScript. It runs twice per gate.
- **`rankedContext`:** a Jina embedding of the moment and every message in the chat (cached in the `embeddings` table), then a Jina rerank.
- **`loadConversations()`:** reads the whole chats, messages, attachments and memberships tables. Its cache is keyed on `MAX(seq)` of events, so every new event forces a full reload.
- **`openVoiceIndex`:** parses the 19.9 MB `pairs.json`. `evidenceAnywhere` opens and parses it a second time.
- **Local MiniLM worker:** embeds the situation and the draft.
- **`ensurePhraseIndex`:** reads the 3 MB `phrases.json`.
- **The scrambler,** then the one SubQ call.
- **`readAiTells`:** a Jina embedding of the draft's chunks, then a Jina rerank. This check runs in code and is not sent to SubQ.
- **Discord `readRoom`:** reads the last 20 messages through the engine.

## Done when a message arrives (`appendEvent`, one transaction)

- Writes the events row and the derived chats, messages and attachments rows.
- Remembers people, when a handle is given.
- Adds the text to the FTS5 `searchIndex` keyword index.
- Marks the timing stages received, appended, named and indexed.

**Nothing is embedded on arrival.** No per-conversation summary, open questions or state is kept. The only background model work is the media describer, which turns images and video into text.

## What the drafter gets from `voice` with no text

- A profile line, up to 8 of matt's latest messages in the chat (each cut to 240 chars) and up to 8 nearest pairs. About 5 KB at most.
- The hook prompts tell the agent to pull "his messages to them first, then his whole history (every platform)". Agents read that as a reason to search and read widely before writing.

## What is needed to pass

voice ≥ 0.8. inContext, openerOnly, friendLike and toThem are each ≥ 0.7. fitsTheRoom (with a room) and buildsOn (spoken only) are also ≥ 0.7.

These checks run in code: the AI phrasing index, matt's phrase familiarity (his own p10 floor), the watermark, the scrambler and the never-says list.

## Timings from the log.db `spans` table, 7 to 12 November

| span | n | p50 ms | p95 ms | max ms |
|---|---|---|---|---|
| voice.gate | 73 | 3,883 | 8,945 | 26,099 |
| voice.sameness | 73 | 17 | 153 | 2,708 |
| voice.chatContext | 47 | 116 | 1,758 | |
| voice.rankedContext | 47 | 739 | 3,459 | 8,525 |
| voice.evidence | 47 | 1,005 | 2,819 | 8,175 |
| voice.reading | 47 | 2,864 | 5,069 | |

- The SubQ request itself has a p50 of 837 ms, under a third of `voice.reading`. The rest is local parsing and Jina calls.
- Each Jina call takes about 320 to 390 ms at p50.
- 26 of the 73 gates ended early: on sameness, on an earlier pass of the same text, or on the brief path.

## Rules that bind any design

| Rule | What it requires |
|---|---|
| 134 | log.db is the private record. Keep events, chats and messages, and their transaction boundaries. Only proven projections can be rebuilt. |
| 105, 123 | One owner per account keeps records current through its push channel. Nothing else polls the platform. |
| 137 | The voice and AI-artifact gates stay for every send as matt. |
| 109 | Read the full relevant chat before drafting. |
| 138 | Media is described once, in the background, by one process. |
| 172 | Private content stays in the workspace. |
| matt, 2026-11-12 | Background work shouldn't run unless it is needed. |
