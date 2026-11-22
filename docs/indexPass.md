# One CPU pass per conversation

A conversation can land in log.db and sit there for days before anything reads it for meaning: search misses it, the owner's voice profile for that person is stale, and no fact is pulled. Before this pass those were three commands a person had to remember (`log search index`, `log voice index`, `log people facts extract`), and nothing chained them.

One job does all three, once, per conversation, in order:

1. **Index it for search.** Only the new or changed chunks of that conversation are embedded (MiniLM, 24 MB, local) and put in the verso HNSW collection; the chunk list and the BM25 file are written once per tick.
2. **Rebuild the owner's voice for that chat and that person.** His replies are paired with what came before them from the *same read of the conversation* the search stage embedded, so there is no second read. Pairs for that chat are replaced, the rest kept, and only new or changed replies are embedded.
3. **Pull durable facts from it.** GLiNER 2.5 screens the lines on CPU, and the SubQ decider turns marks into facts with their source message. It is the only step that calls out, and it stays off when `SUBQ_API_KEY` is missing, exactly as before.

Every platform and every room kind is read: DMs, group chats, server channels and forum posts, not DMs only.

## Where it runs

`indexStream` sits in the graph owner's tick ([relateGraph.md](relateGraph.md)), beside the fact stream, reading the conversations after its own saved cursor in the same `throughSeq` shape. It aims at a 200 ms slice: conversations are finished and the rest waits for the next tick, so a slow model never holds the stream, and the slice cuts on a conversation boundary so nothing is half-read. Cursors and the per-chat fact offsets are written in one transaction after the indexes are flushed, so a crash re-runs a slice instead of losing it. Re-running is idempotent: chunks are upserted by id, marks are inserted once per message, and a repeated fact is caught by the overlap check.

- On by default. `LOG_INDEX_STREAM=off` stops it.
- Only accounts with a signed-in session, as the platform itself answered. An account signed out is left alone and its lines are picked up once it signs in.
- `log relate owner status` prints a cost line per tick: conversations queued, embedded, voiced, screened, decided, and p50/p95 of a conversation.

## By hand

`log index [--platform <p>] [--account <a>] [--since <t>] [--limit <n>] [--only search|voice|facts]` runs the same code once over the backlog, and `log index status` shows what the owner's pass is doing. `log search index`, `log voice index` and `log people facts extract` stay, and now call into the same stages, so the three can't drift from the pass.

## The screen learns from its corrections

Every mark the decider settles is a labelled example: a fact in its slot, a repeat, or a rejection. `log facts train` learns from those, plus any correction the owner made, which always wins over what the machines said:

- It holds a slice back, reports the screen's own accuracy on that slice **before and after**, and runs on CPU in minutes.
- It writes the result as a **new pinned revision** under `python/facts/revisions/<sha>`, recorded in `python/facts/revisions.json` like every other local model: the base GLiNER 2.5 revision from the models manifest plus a LoRA adapter, never a second copy of the model.
- It runs as its own job, never inside a tick. The screen uses the newest revision on its next start, and a revision that fails to load is reported and ignored rather than stopping the pass.

`log facts status` says how many corrections are kept, which revision is in use, and what each round scored.

## Numbers

Measured on a copy of the owner's log.db (797 conversations, 140,676 messages), with every bench copy deleted afterwards.

The screen costs about 83 ms a line on 8 CPU threads, and it only screens a line long enough to carry a fact, so facts are what p95 is made of: a conversation of 1,000 new lines is roughly 80 s of screening, while embedding a 1,000-line conversation is about a second.
