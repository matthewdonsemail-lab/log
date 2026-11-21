---
title: "Person facts"
---

# Person facts

log keeps lasting facts about the people the owner talks to: their job, where they work, what they are building, where they live, what they are into, how they know the owner, what the owner promised them, what they promised, and money owed either way. Without them every draft re-reads raw chats, and a reply can repeat a promise the owner already made to the same person. Each fact is an event in log.db with the exact message it came from, projected into the Relate graph in the shape of Relate's own agent memory, and checked by the voice gate before a draft goes out.

## Design and its sources

The design follows what the agent-memory papers converge on, in two tiers:

- **Tier 1, in the stream, on CPU.** A small local model screens each new message and marks the ones that carry a fact or a promise, with the slot and the people and things named. It writes nothing but a `factCandidate` mark and never calls a paid API. This is the online small-model pass of LightMem (arXiv 2510.18866; its follow-up, arXiv 2604.07798). The model is GLiNER2 (arXiv 2507.18546, Apache-2.0), a CPU encoder that does classification, entities and relations in one pass from one schema.
- **Tier 2, batched.** Only marked messages go to the decider, in batches: one setting, `LOG_FACTS_DECIDER`, names its model (default the hosted SubQ model `subq-snap-1.1`, the one generating model log already uses for its voice gate), so a local model can take its place later without touching the rest. It decides each one against the person's current facts in that slot: ADD, SUPERSEDE or NOOP, as in Mem0 (arXiv 2504.19413). This is LightMem's offline consolidation.
- **Validity windows, not edits.** A correction is a new fact that closes the old one, as in Zep/Graphiti's temporal knowledge graph (arXiv 2501.13956) and Designing Data-Intensive Applications ch. 11 (event sourcing; immutable events, ledger corrections).
- **Raw lines stay the evidence.** The LightMem reproduction (arXiv 2607.29104) found that constructed memories drop answer-relevant information and that retrieving raw turns often beats them. So a fact's text is the source line itself, every fact links its source Episode, and recall returns the raw line.
- **What a small model does for memory** (cognee, "small models in AI memory"): a fixed label bank (the slot list, since GLiNER needs the labels given); an endpoint check that keeps a relation only when both ends resolve to a known identity, person or the owner; judging by what it does for log (the repeated promise caught, recall returning the right fact) rather than by how the graph looks; batching on CPU threads.
- **Relationship state stays deterministic.** Follows, engagement, replies, being in a conversation and who is waiting come from events with no model, as they already do (the network rings, the person card, the conversation card).

## The record

### REQ-FACTS-01: A fact is an event with its source, and the table is derived from it

A fact is a `personFactRecorded` event under platform `log`, account `people`: `factId`, `personId` or an identity (`platform`, `userId`), `slot` (one of `FACT_SLOTS`: job, workplace, building, location, relationship, promisedByOwner, promisedByThem, owes, owedToOwner, interest), `text`, `quote`, `sourceMessageKeys`, `validFrom`, `confidence`, `extractedBy`, and the `supersedes` it names. `recordFact` refuses a fact with no source message, a source not in log.db, or a quote that isn't in its source message. `personFacts` is a derived table: `log storage rebuild` replays it from the events and gives the same rows (it is in `DERIVED_TABLES` and the fingerprint). `owes` is what the owner owes them; `owedToOwner` is what they owe the owner.

Checked by: code and SubQ

### REQ-FACTS-02: A correction supersedes, it never edits

For the one-value slots (`SINGLE_SLOTS`: job, workplace, building, location, relationship), a later fact closes the current one: the old row keeps its text and gets `validTo` (the new fact's `validFrom`), `closedAt` and `supersededBy`. A fact whose `validFrom` is older than the current one is recorded closed. In the many-value slots (promises, money, interests), a fact closes only the facts its event names in `supersedes`. Nothing is deleted.

Checked by: code and SubQ

### REQ-FACTS-03: A fact follows the identity onto the person

A fact attaches to the person when its identity is linked (`identityLinks`), else to the identity. When the identity is linked later, `factsFollowLink` moves its facts to the person, and in the one-value slots the newest current fact wins and closes the others. An unlink takes the person off that identity's facts again.

Checked by: code and SubQ

## Extraction

### REQ-FACTS-04: Two tiers over new lines only

`log people facts extract [--who <who>] [--since <t>] [--limit <n>] [--platform <p>]` reads the DMs of one person, or the `DEFAULT_CHATS` most recent DMs with a reply from the owner, grouped by the person on the other side (the same person's chats are read together, and a line stored twice is read once). It keeps an offset per chat (state `factOffsets`) and reads only lines after it. Tier 1 (`gliner2Screener`, `python/facts/screen.py`) runs one GLiNER2 schema per batch of `SCREEN_BATCH`: a `kind` classification over the fixed label bank plus `none`, the entities person, company, product, project, place, money and date, and the relations promised, owes, works at, building and met. A line is a candidate when its kind isn't `none`, its confidence is at least `MARK_MIN` (`PROMISE_MARK_MIN` for promises and debts, the priority slots, so recall stays high where it matters) and it has at least `SCREEN_MIN_CHARS` characters (`isCandidate`); the mark goes to `factCandidates`, with relations kept only when both ends resolve to the speaker, the listener or the person (`endpointsOf`). `screenLines` is a pure function over lines. The graph owner process (the one serial consumer of log.db, see [the Relate graph](relateGraph.md)) runs tier 1 in the stream: after each microbatch it applied, `factStream` calls `screenStream`, which reads the DM lines that arrived after its own `factOffsets` offset (`stream`, started at the newest line the first time, so the stream reads new lines only), at most `STREAM_LINES` at a time, screens them and writes their marks. It never waits on the graph, starts the GLiNER2 process only when there is a line to screen, stops it after `STREAM_IDLE_MS` with nothing new, backs off `STREAM_RETRY_MS` when the screen fails, and is off with `LOG_FACTS_SCREEN=off` or when the facts model isn't fetched. A chat the extract command has read before has its offset moved on with it, so a line is screened once.

Tier 2 reads the marks still queued (`decided` empty) for the person's chats, whichever tier 1 wrote them, with the `DECIDE_CONTEXT_LINES` lines before each from log.db; a line stored twice is decided once. When the decider has no key or names a model log can't call (`factDecider`), the command refuses with `factDeciderUnavailable` after tier 1 has run: the marks stay queued and the next run with a decider decides them without screening again. A candidate that repeats a current fact of the same person, said by the same side, is a NOOP with no model call. The rest go to the decider in batches of `DECIDE_BATCH` (`decideBatch`): for each line, whether it states something concrete that still matters in a week (a `noul`, kept at `LASTING_MIN`; banter, jokes and polite filler are no), which slot it states (or none, kept at `SLOT_MIN`), and ADD, SUPERSEDE or NOOP against the current facts, with the lines before it as context. A slot the speaker can't state is dropped (`sideAllows`: the owner's own promises and debts only from the owner; their job, workplace, building, location, interest and promises only from them). Each fact is recorded with its line as both text and quote, and its vector is stored with log's MiniLM embedder.

Checked by: code and SubQ

### REQ-FACTS-05: Promises the owner made are checked before a draft goes out

The voice gate reads the facts of the person the draft is for (`factsForChats` over the conversation card's chats), adds the open promises to the card SubQ reads (`promiseLines`), and holds a draft that says an open promise again (`repeatedPromise`: `REPEAT_OVERLAP` of the same words, or a MiniLM cosine of at least `REPEAT_COSINE`) with an `already promised` block naming the line and its date. The person card (`log people show`, the `relate` hook's cards) lists open promises first, then the current facts, each with its date and source.

Checked by: code and SubQ

## Reading and recall

### REQ-FACTS-06: Projected into Relate's agent-memory model, recalled with evidence

The shared graph projection (`memoryProjectionOf`, written by `writeMemory` in both the full build and the in-place apply) turns each source message into `(:Episode {id, at, text, platform, room})`, each fact into `(:Fact {id, text, slot, validFrom, validTo, closedAt, recordedAt, embedding})`, with `FROM` its episodes, `ABOUT` its person or identity, `SUPERSEDES` the fact it replaced, and `(Episode)-[:MENTIONS]->` the same subject. `factEmbedding` is a vector index on `Fact.embedding` with `closedAt` declared on it, and `RECALL_CYPHER` returns the nearest current facts with their evidence lines and what they replaced. `log people facts <who>` reads log.db directly; `log people facts recall "<q>"` uses the graph; the hook's connected context adds a `lasting facts` line.

Checked by: code and SubQ

## Measured on the owner's data

A read-only copy of log.db, the 20 most recent X DMs and 20 most recent Discord DMs the owner answered in, on this machine's CPU (8 threads):

<!-- measured -->

A read-only copy of log.db, one linked person's DMs over two weeks plus five other linked people's DMs over seven weeks, on this machine's CPU, 2026-11-22:

| Measure | Value |
|---|---|
| New DM lines read | 8,474 (7,485 long enough to screen) |
| Tier 1, GLiNER2 per message (batches of `SCREEN_BATCH`) | 85 ms p50, 137 ms p95 |
| Marked as candidates | 716 (8.4%) |
| Tier 2 decider calls (`subq-snap-1.1`, batches of `DECIDE_BATCH`) | 94 calls, about 430k input tokens |
| Facts recorded, each with its source message | 68 |
| Candidates found to say a current fact again (no new fact) | 14 |

Almost every fact recorded was a promise one way or the other; the one-value slots (job, workplace, location) were rare in these DMs. Recall by meaning over the projected graph returned the matching promise first with its source line as evidence.

## Not built yet

- A promise marked kept or taken back by its own slot (today a SUPERSEDE in a promise slot closes it).
- Facts from group chats (only DMs are read).
- Tier 2 in the stream: the decider runs when `log people facts extract` is run, not on its own schedule, so marks wait in the queue until then.
- A local decider model: `LOG_FACTS_DECIDER` takes only SubQ model names today.

## Related

- Up: [Specs](README.md)
- [People across platforms](people.md)
- [The Relate graph](../relateGraph.md)
- [The play](../useCases/people/facts.md)
