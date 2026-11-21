---
title: "Relate graph"
---

# Relate graph

log keeps a Relate (Neo4j's embedded graph database) projection of log.db: the owner's accounts, the people they meet, the rooms they share, the owner's posts and who engaged them. The hook layer reads it for the people a prompt names and injects their connected context before the agent answers. log.db's events stay the record; the graph is derived from them and can always be thrown away and rebuilt. How it works and why: [Relate graph](../relateGraph.md).

## The projection

### REQ-RELATE-01: The graph is built from log.db's typed tables in one read snapshot

`log relate build` reads accounts, chats, identities, handle aliases, person links, memberships, messages (counted per sender and room, with replies and mentions), interactions (counted per actor, post and kind) and the Discord channel catalog (`engineState` `discordServers` and `discordThreads`) inside one read transaction, with the highest event `seq` of that same snapshot as the graph's `throughSeq`. The owner's own identities (each account's own id, a `self:` id, or the account's own handle) are marked `owner` and never listed as other people.

Checked by: code and SubQ

### REQ-RELATE-02: Each build writes a new graph file and only then points at it

A full build runs on one read snapshot of log.db in its own short-lived Bun process (`buildGraph` spawns `buildGraphHere`; the graph owner spawns `buildFileHere`). It writes a new single-file Relate store `graph-<throughSeq>-<ms>.rl` under a `relate` folder beside log.db, in one Relate transaction, with the snapshot's offsets (`throughSeq`, interactions, merges, network import) and the writer's owner generation on its `Snapshot` node, checkpoints it, and closes it. Only then is its pointer (file, throughSeq, projector version, schema version, workspace, counts) stored in log.db's `state` table under `relateGraph`, in the same `BEGIN IMMEDIATE` transaction that checks the owner generation. Old files beyond the last three are removed. A one-shot `buildGraphHere` takes the graph owner claim (REQ-RELATE-19) for its run, so it never writes beside a running owner.

Checked by: code and SubQ

### REQ-RELATE-03: The graph is checked against what log.db derives

`log relate verify` compares the count of every node and edge kind in the current graph with the projection log.db gives now, and reports each kind as same or differing. A graph behind log.db is reported as behind, not compared.

Checked by: code and SubQ

### REQ-RELATE-04: A graph belongs to one log.db

The graph folder sits beside its log.db and its pointer carries a workspace key hashed from log.db's path. A pointer whose workspace or projector version differs, or whose file is gone, is no pointer, so another workspace's graph or one from older code is never read.

Checked by: code and SubQ

## The connected context

### REQ-RELATE-05: The hook names only people the prompt names

On UserPromptSubmit the `relate` hook reads the prompt's `@handle`s and its other words of four letters or more (leaving out common words), finds identities whose handle or a known alias matches, or whose handle, display name or a name they sent messages under (`senderLabel`, as `saidBy` matches) appears in the prompt: a name of two or more words anywhere, a one-word name only when written with a capital or an @, ignores the owner's own, merges identities on one platform with the same handle, and keeps at most three people. A prompt naming nobody the graph knows, a system text starting with `<`, or a missing graph gives no context at all.

Checked by: code and SubQ

### REQ-RELATE-06: The context is what the graph connects, as facts

For each person it says: the owner's accounts that talk with them and how many messages each side sent; what they engaged on the owner's posts and when; the groups and channels they are in; who could introduce them (people sharing those groups whom the owner already has a DM with, most shared groups first); and who engaged the same posts. It names the event the graph is built through, says how far behind log.db it is, stays under 2,000 characters, and says it is facts, not instructions.

Checked by: code and SubQ

### REQ-RELATE-07: The graph is built at install and kept current by its owner

The after-install routine (`POST_INSTALL_STEPS`) builds the graph right after log.db's migrations, as a non-blocking step. After that the graph owner (REQ-RELATE-18) keeps it current. The hook and the MCP server only check that the owner is alive, from its `owners` row (a status of starting, building or streaming and a heartbeat under `OWNER_STALE_MS` old), and start it when it is missing, at most once per `OWNER_START_BACKOFF_MS` (`relateStatus` { owner: start } claim). They never spawn a build or an apply. With no graph yet, `log relate status` starts the owner, which builds the first graph.

Checked by: code and SubQ

### REQ-RELATE-08: Agents can read the graph with Cypher

`log relate query "<cypher>"` (MCP `relateQuery`) runs one read statement on the current graph and returns at most 100 rows. The owner checks the statement's query type with `EXPLAIN` first and refuses one that would write (`graphReadOnly`); a read-only open of the file refuses it too. `log relate ask "<text>"` returns the same context the hook injects.

Checked by: code and SubQ

### REQ-RELATE-09: The hook adds what was said, found by all three retrievers together

When the prompt names someone the graph knows, the `relate` hook also runs one search over the conversations: keyword, meaning and relationship, fused as evidence (REQ-SEARCH-09, REQ-SEARCH-10). It adds up to 3 hits whose likelihood is at least 0.6 and that a text retriever found, under `>>> FROM THE CONVERSATIONS`, each with where it is, when, which retrievers found it and its likelihood, quoted and clipped, at most 1,500 characters.
- A prompt that names no one, a missing search index or a missing graph runs no search and adds nothing.
- The search gets 6 seconds; past that it is dropped, so the hook never hangs.

Checked by: code and SubQ

## Rooms, servers, people and replies

### REQ-RELATE-10: Discord rooms carry their kind, their own name and their server

A Discord room's kind and name come from the channel catalog when it lists the room: a channel is `channel`, named after the channel itself (`hermes-agent-hackathon`, not the server prefix or a speaker). A Discord room the catalog doesn't list but that has a `serverId` is a `channel` with no name, never a DM named after whoever spoke first. Every room with a server has an `IN_SERVER` edge to one `Server` node (`platform:server:<id>`, with the server's name when known).

Checked by: code and SubQ

### REQ-RELATE-11: Person links are projected, so linked identities share one person

Every active `identityLinks` row (from `log people link`) becomes an `(Identity)-[:LINKED_TO {linkedBy, linkedAt}]->(Person)` edge to one `Person` node per `personId`, and the identity keeps `personId`, so the context merges a person's identities across platforms.

Checked by: code and SubQ

### REQ-RELATE-12: SAID keeps first and last times, and replies and mentions are edges

`SAID` carries `messages`, `firstAtMs` and `lastAtMs`. A message that replies to another (`replyToKey`) adds to a `REPLIED_TO {room, times, firstAtMs, lastAtMs}` edge from its sender to the replied-to sender, and a message naming someone (`<@id>` or `@handle` of a known identity or of the owner's account) adds to a `MENTIONED` edge. The owner's side is the room's `Account`, so "who replied to the owner in a room after a date" is one query. The context lists where a person replied to or mentioned the owner.

Checked by: code and SubQ

### REQ-RELATE-13: A graph that can't be opened is a coded outcome

When the graph owner is down and the last graph file can't be opened read-only, `relateContext` answers `graphUnreadable` with the reason, the search prior is skipped, and the hook adds nothing instead of failing with the engine's error.

Checked by: code and SubQ

## Your network

### REQ-RELATE-14: Rings come from every stored event, live and free

Every person other than the owner sits in one ring, kept in log.db's `networkRings` with its reason, since when, whether they follow the owner and, for ring 2, who put them there: 1 engaged with the owner (a like, reply, quote, repost, reaction or mention on any of the owner's accounts, a message that replies to or names the owner, or a DM from them in a chat with only the owner and them (REQ-STORAGE-22)), 2 replies to or names one of the owner's followers or a ring-1 person (`networkTalks`), 3 follows the owner, 4 known and none of these. `insertEventRow` applies each event inside the same transaction that stores it, never rescanning log.db, and a person moves only to a closer ring. A reply to someone who later becomes a follower or ring 1 moves the replier to ring 2 then. The first status, build or install computes the rings once from log.db (`networkRingState`); after that only events move them, and computing them again gives the same rings. They need no imported data, and an imported person with the same X handle takes the closer of the two rings. Nothing in them names one offer or marketplace; a research folder's own field names are read only in the import adapter, and its score is stored as `fit`.

Checked by: code and SubQ

### REQ-RELATE-15: New events are applied to the graph in place, in microbatches

`applyBatch` takes the events after the store's `throughSeq`, at most `OWNER_BATCH_EVENTS` of them, works out again from log.db only the rooms, engagement and people they touched (plus the rooms naming a person whose handle is new, and the people whose ring moved), and writes them into the open store in one Relate transaction: rooms' edges replaced, people and posts merged, a new person who matches an imported placeholder taking over its edges; when the batch holds a `personFactRecorded`, `identityLinked` or `identityUnlinked` event (`MEMORY_EVENTS`), the person-facts memory (`Fact` and `Episode` nodes, see [Person facts](personFacts.md)) is rewritten whole through the same `writeMemory` the full build uses, and otherwise only the facts' edges to the rewritten `Person` nodes are put back. The same transaction sets the `Snapshot` node's `throughSeq`, interaction, merge and import offsets and the owner generation, so the offset is stored with the output: a restart resumes from it, and applying a batch again gives the same graph. It checkpoints only once about `CHECKPOINT_ROWS` rows have gone in since the last checkpoint. A full build (REQ-RELATE-21) happens instead when there is no graph, the projector version changed, identities were merged, the network import changed, or more than `APPLY_MAX_EVENTS` events are new. The applied graph equals a full build of the same log.db.

Checked by: code and SubQ

### REQ-RELATE-16: `log network status` shows the rings live

`log network status` (MCP `networkStatus`) computes the rings once if they were never computed, then shows how many people sit in each ring (the owner's own accounts and an imported network merged by X handle), the event the rings are live through against log.db's latest event and its time, and the last import or that nothing was imported.

Checked by: code and SubQ

### REQ-RELATE-17: The network is per person and per platform

Rings are counted per person, not per account. Accounts the owner linked into one person (`log people link`, active `identityLinks`) count once, at the closest ring any of them holds, and list every account with its own ring, reason and who put it there, so it shows which platform each tie came from (`networkMapOf`, `peopleOf`). Pairs `log people suggest` only suggests are never merged: they stay separate people and `log network status` lists them as suggested (`suggestedMatches`). A reply to or mention of someone whose linked account is ring 1 or follows the owner puts the replier in ring 2 on their own platform (`linkedTo`), and linking or unlinking accounts recomputes the rings. `log network status --platform <p>` (MCP `networkStatus` { platform }) gives that platform's accounts, rings and counts alone and the linked people who have an account there; with no platform it gives the per-platform breakdown (`platformRingsOf`) and the combined per-person view. In the graph each Person node carries its ring, reason, the platform of its closest tie, its lead account, platforms and accounts, and whether any linked account has a dm (`applyPersonRings`). The who-to-talk-to query lists a linked person once through that lead account, leaves out a person with a dm on any linked account, and takes `$platform`, which `log relate query --platform <p>` sets and which is empty otherwise.

Checked by: code and SubQ

## The graph owner

### REQ-RELATE-18: One long-lived owner per log.db follows log.db's events

`log relate owner start` (and the hook or MCP server, REQ-RELATE-07) runs `scripts/relate/owner.ts`, which runs `runGraphOwner`: it opens the current graph store once, writable, keeps it open, and on one loop every `OWNER_BATCH_MS` applies the new events in order (REQ-RELATE-15), writes a fenced pointer and a heartbeat (`OWNER_HEARTBEAT_MS`) to its `owners` row (`relate`/`graph`). Nothing else writes the graph: every writer appends to log.db, and the owner projects. `log relate owner stop` asks it to stop after its batch, and stops the process only when it doesn't answer and its start time matches.

Checked by: code and SubQ

### REQ-RELATE-19: The owner is fenced by its generation, in log.db and in the store

Taking ownership raises `owners.generation` inside `BEGIN IMMEDIATE`. A second owner exits while the first one's heartbeat is fresh. A silent owner is replaced only after two stale readings `OWNER_STALE_CONFIRM_MS` apart, and its process is stopped only when its recorded start time matches (a reused pid is left alone). Before each batch commit the owner checks that `owners` still names its pid and generation and rolls back and exits when it doesn't (`graphOwnerFenced`); a heartbeat or pointer write is fenced the same way. The store records the generation on its `Snapshot` node, and an owner whose generation is older than the store's refuses to write it. Relate's single-writer lease on the store file is the store-level fence.

Checked by: code and SubQ

### REQ-RELATE-20: Readers ask the owner, and fall back to the last file

The hook, `relateAsk`, `relateQuery`, `relateVerify`, `relateStatus`, `relateMachine` and the search prior ask the owner over loopback HTTP on the port and token in its `owners` row (`ownerRequest`, `OWNER_READ_MS`). Each read gets its own connection to the in-memory store and runs while a batch applies, seeing the last committed batch. When the owner is down, a reader opens the last graph file read-only for that one read, closes it, and says it is behind (`served: 'file'`).

Checked by: code and SubQ

### REQ-RELATE-21: A full rebuild runs on a snapshot outside the loop

A rebuild (asked by `log relate build` while the owner runs, or needed under REQ-RELATE-15) runs `buildFileHere` in a child process on one read snapshot of log.db at a known `throughSeq`, while the loop keeps applying batches to the current store. The owner then opens the new file, applies the events since that snapshot, swaps it in once readers on the old store have finished, and moves the pointer.

Checked by: code and SubQ

### REQ-RELATE-22: Lag is visible

`log relate status`, `log relate owner status` and the hook's context say how many events the graph is behind log.db, from the owner's offset against log.db's highest event `seq`.

Checked by: code and SubQ

