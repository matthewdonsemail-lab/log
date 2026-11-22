# Relate graph: connected context for the agent

log reads the owner's inboxes into one local database, log.db. Text search over it answers "what was said". It can't answer how people connect: who already talks to someone, who engaged which post, which groups two people share, who could introduce you. log keeps a [Relate](https://github.com/relatedb/relate) graph of exactly those connections, projected from log.db, and its hook puts them in front of the agent the moment a prompt names someone.

```text
"can you intro me to @linus_k"
        │  UserPromptSubmit hook (Claude Code http hook, Codex curl, Hermes pre_llm_call)
        ▼
answerEvent → relateAnswer → relateContext ──► the graph owner (one process per log.db, graph in memory)
        │                                            ▲
        ▼                                            │ tails log.db's events from its offset, one
>>> RELATE GRAPH (connected context …)              │ transaction per 200 ms microbatch
@linus_k [2 ids merged by handle] (Linus) on twitter │
  talks: group on builderOwner …                     └── log.db (events → typed tables, the record)
  who could introduce: @ada_codes (1 shared group, the owner's DM last 5 h ago); @grace_ships …
  same orbit (engaged the same posts): @maya_ml (2), @ada_codes (1), @tom_builds (1)
```

## How it uses Relate

- **Mode: single file.** Each build writes a new `graph-<throughSeq>-<ms>.rl` beside log.db (`~/.logCli/relate/`), and log.db's `state` table points at the current one. A single file is one immutable snapshot: it is written whole, committed, and only then pointed at, so a reader never sees half a graph. It can be copied, inspected with the `relate` CLI, or thrown away.
- **One owner, in memory.** One graph owner process per log.db (`log relate owner start`, or the first hook or MCP server start) opens the current store once and keeps it. Every 200 ms it applies the events after the store's `throughSeq` in one Relate transaction that also stores the new `throughSeq`, so a restart resumes exactly where it stopped and re-applying a batch changes nothing. Nothing else writes the graph. A full build happens only on `log relate build`, new projector code, an identity merge, a new network import or more than 20,000 new events; the owner runs it on a snapshot in a child process, catches up the events since, and swaps.
- **Readers ask the owner.** The hook, `relateAsk`, `relateQuery`, `relateVerify`, `relateStatus` and the search prior ask the owner over loopback HTTP (the port and token in its `owners` row); each read runs on its own connection while a batch applies. On Windows a store held writable by one process can't be opened by another, so when the owner is down a reader opens the last file read-only for that one read, closes it, and says the answer is behind. A file that still can't be opened is a coded `graphUnreadable` outcome, never a hook error.
- **Fenced.** Taking ownership raises `owners.generation`; each batch commit checks it first, and the store records it, so an owner that was replaced can't write. Why each rule: [the design](decisions/graphOwner/design.md).
- **The same tick runs the CPU pass.** `indexStream` reads the conversations after its own cursor and, per conversation, embeds what changed for search, rebuilds the owner's voice for that chat and person from the same read, then screens the lines for facts, for every room kind. [one pass per conversation](indexPass.md).
- **Embedded:** `@relate/relate` runs in the same Bun process as the hook through its C ABI (koffi). No server. Per Relate's ADR-0079, only the CLI binary sends anonymous usage metrics; the embedded library never phones home.

## What the graph models

| Node | Key | From log.db |
| --- | --- | --- |
| `Account` | `platform:account` | `accounts`, `chats` |
| `Identity` | `platform:userId` | `identities`, `handleAliases` (handle, name and aliases copied for lookup; `owner` marks the owner's own ids) |
| `Room` | `chatId` | `chats` (DM, group, channel), with the channel's own name and server from the Discord channel catalog (`engineState`) |
| `Server` | `platform:server:<id>` | `chats.serverId`, named from the catalog |
| `Person` | `person:<personId>` | `persons`, `identityLinks` (from `log people link`) |
| `Post` | `platform:account:targetRef` | `interactions.targetRef`, `targetText` |
| `Snapshot` | `snapshot` | the event `seq`, schema and projector version it was built from |
| `Leader` | `leader:handle` | `networkLeaders`: the leaders whose circles your network is drawn around |
| `Community` | `community:id` | `networkCommunities`: the communities those leaders run |

| Edge | Meaning | From |
| --- | --- | --- |
| `(Account)-[:HAS_ROOM]->(Room)` | the account sees this chat | `chats` |
| `(Identity)-[:MEMBER_OF]->(Room)` | they are in it | `memberships` |
| `(Identity\|Account)-[:SAID {messages, firstAtMs, lastAtMs}]->(Room)` | how much each side said there, and when | `messages`, counted |
| `(Identity\|Account)-[:REPLIED_TO {room, times, firstAtMs, lastAtMs}]->(Identity\|Account)` | who replied to whom, the owner's side being the room's account | `messages.replyToKey` |
| `(Identity\|Account)-[:MENTIONED {room, times, firstAtMs, lastAtMs}]->(Identity\|Account)` | who named whom (`<@id>`, `@handle`) | `messages.text` |
| `(Room)-[:IN_SERVER]->(Server)` | the channel's server | `chats.serverId` |
| `(Identity)-[:LINKED_TO {linkedBy, linkedAt}]->(Person)` | identities the owner linked as one person | `identityLinks` |
| `(Identity)-[:ENGAGED {kind, times, lastAtMs}]->(Post)` | like, reply, repost, quote, mention | `interactions` |
| `(Identity)-[:FOLLOWED]->(Account)` | a follow | `interactions` |
| `(Account)-[:POSTED]->(Post)` | the owner's post | `interactions` |
| `(Identity)-[:IN_CIRCLE_OF]->(Leader)` | they sit in that leader's circle | `networkCircles` |
| `(Leader)-[:RUNS]->(Community)` | the leader runs it | `networkRuns` |
| `(Identity)-[:MENTIONED {source: 'network', times, lastAtMs}]->(Identity)` | one mentioned the other in a post | `networkMentions` |
| `(Identity)-[:FOLLOWS]->(Account)` | they follow the owner's X account | `networkPeople.followsOwner` |

Message text stays in log.db. The graph holds counts and times, plus the post text people engaged with, and the source lines of person facts (below).

## Person facts: Relate's agent-memory model

Lasting facts about people (job, workplace, what they are building, promises either way, money owed; the fixed slot list in `FACT_SLOTS`) are `personFactRecorded` events in log.db ([spec](specs/personFacts.md)). The same graph projection that both the full build and the in-place apply call (`writeMemory`, fed by `memoryProjectionOf`) writes them in the shape of Relate's agent memory ([Give an agent a memory](https://relatedb.ai/docs/get-started/agent-memory/)):

| Node or edge | Meaning | From |
| --- | --- | --- |
| `(:Episode {id, at, text, platform, room})` | one source message, quoted whole | `messages`, for each key in a fact's `sourceMessageKeys` |
| `(:Fact {id, text, slot, validFrom, validTo, closedAt, recordedAt, embedding})` | one fact; `closedAt` is set once a later fact replaced it | `personFacts` |
| `(Fact)-[:FROM]->(Episode)` | the evidence | `sourceMessageKeys` |
| `(Fact)-[:ABOUT]->(Person\|Identity)` | the person when the identity is linked, else the identity | `personFacts.personId`, else `platform:userId` |
| `(Fact)-[:SUPERSEDES]->(Fact)` | the correction and what it replaced; nothing is deleted | `personFacts.supersededBy` |
| `(Episode)-[:MENTIONS]->(Person\|Identity)` | who the message is about | the fact's subject |

`factEmbedding` is a vector index on `Fact.embedding` (log's MiniLM vectors, 384 dimensions, cosine) with `closedAt` declared on it, so recall skips replaced facts before it counts. `log people facts recall "<question>"` embeds the question with the same model and runs `RECALL_CYPHER`: the nearest current facts, each with its evidence line and the facts it replaced. The hook's connected context lists a person's current facts on a `lasting facts` line.


## Your network

Everyone who uses log has a network: the people around their own accounts. It needs no research files and names no offer or marketplace.

**Rings, live.** Every person log knows sits in one ring, kept in log.db (`networkRings`: ring, reason, since, whether they follow you, and who put them in ring 2):

| Ring | Who | From |
| --- | --- | --- |
| 1 | engaged with you: a like, reply, quote, repost, reaction or mention of you, or a DM from them in a one-to-one chat (more than two members is a group), on any platform | `interactions`, `messages` |
| 2 | talks to (replies to or names) one of your followers or a ring-1 person | `messages` replies and mentions (`networkTalks`) |
| 3 | follows you | `interactions` |
| 4 | known, none of these | `identities` |

The store's write path applies each event as a watcher stores it, inside the same transaction, so a new follower is ring 3 and their first reply moves them to ring 1 within the event, with no paid call. Ring 2 is kept from both sides: a reply to someone who is already a follower or ring 1, and an earlier reply to someone who later becomes one. The first `log network status`, `log relate build` or install computes them once from log.db; after that only events move them. `log network status` (`networkStatus`) shows the counts per ring and the last event applied, per person (accounts the owner linked count once, at their closest ring, with every account listed; suggested pairs stay apart) and per platform (`--platform <p>` for one alone). The who-to-talk-to query takes the same `$platform` through `log relate query --platform <p>`.

**An imported network.** `log network import [--from <dir>]` (MCP `networkImport`) reads a research folder (`final_scores.json` and `nicheMap.json`, from `LOG_NETWORK_DIR`, else `LOG_NICHE_MAP`'s folder) into log.db's `network*` tables, replacing the last import. Its field names are read in one import adapter, and its score is stored as a neutral `fit`. A person in it and a chat identity with the same X handle (any case) are one `Identity`, whose ring is the closer of the live one and the imported one.

**In the graph.** Every `Identity` other than the owner's carries `ring` (also as `degree`), `ringReason`, `ringSinceMs` and `followsOwner`; imported people also carry `band`, `fit`, `themes` (the top 3), `passesGates` and their last post. [network/whoToTalkTo.md](useCases/network/whoToTalkTo.md) ranks who to talk to with one query, with or without an import.

## The questions it answers

For each person a prompt names (`@handle`, a known handle without the @, or a display name the way `saidBy` matches one, e.g. `@Max Current` or `Design bakery`), from their node outwards:

1. **Talks:** which of the owner's accounts chat with them and how much each side said.
2. **Engaged the owner:** what they liked, replied to, reposted or followed, and when.
3. **Replied to or mentioned the owner:** where, how often and when last.
4. **In groups:** the groups and channels they are in, as `Server #channel`.
5. **Who could introduce:** people in those groups whom the owner already has a DM with (2 hops: person → room → member → DM room).
6. **Same orbit:** others who engaged the same posts (person → post → person).

Identities on one platform with the same handle are merged (a handle seen before its numeric id was known), and identities linked to one `Person` are one person across platforms. Nobody named means no context: silence beats a guess.

## Setup and run

```bash
bun install
log relate build                   # project ~/.logCli/log.db into a new graph
log relate status                  # which file, through which event, how far behind
log relate verify                  # every node and edge count against what log.db derives
log relate ask "intro me to @someone"
log relate query "MATCH (i:Identity)-[e:ENGAGED]->(p:Post) RETURN i.handle, e.kind, p.text LIMIT 5"
log relate owner status|start|stop # the one process that keeps the graph
```

Over MCP these are `relateBuild`, `relateStatus`, `relateVerify`, `relateAsk`, `relateQuery` and `relateStatus` { owner: start or stop } (CLI `log relate owner status|start|stop`). Install and `log update` build it once (the `relateGraph` after-install step, right after migrations). After that the graph owner keeps it current, and the hook only checks that the owner is alive and starts it when it isn't.

Measured on a copy of a real log.db (41k people, a 71 MB graph): a new event is visible to readers in 197 ms at p50 (360 ms p95), 100 new events in 0.98 s, and the hook's graph context takes 0.68 s at p50 instead of 2.66 s, because no reader opens the 71 MB file any more. A full rebuild through the owner took 56 s on a snapshot while reads kept being answered, and verify then matched log.db exactly. The numbers before and after are in [the design](decisions/graphOwner/design.md).

One query answers "who replied to the owner in a channel after a date":

```bash
log relate query "MATCH (i:Identity)-[r:REPLIED_TO]->(:Account) WHERE r.room ENDS WITH ':<channelId>' AND r.lastAtMs > <ms> RETURN coalesce(i.name, i.handle) AS who, r.times AS times"
log relate query "MATCH (i:Identity)-[:SAID]->(:Room)-[:IN_SERVER]->(s:Server {name: 'Some Server'}) RETURN DISTINCT i.handle"
```

To try it without any accounts, the demo store is in this repo:

```bash
bun scripts/relate/demoStore.ts    # rebuilds docs/relate/demoGraph.rl from a synthetic log.db
relate --read-only -d docs/relate/demoGraph.rl "MATCH (p:Identity {handleLower:'linus_k', platform:'twitter'})-[:MEMBER_OF]->(r:Room)<-[:MEMBER_OF]-(m:Identity) WHERE NOT m.owner AND m.key <> p.key MATCH (m)-[:MEMBER_OF|SAID]->(:Room {kind:'dm'}) RETURN DISTINCT r.name AS room, m.handle AS introducer"
```

## Where the data lives

- The record: `~/.logCli/log.db` (`LOG_DB` or `LOG_INBOX_STATE` moves it).
- The graph: `~/.logCli/relate/graph-<throughSeq>-<ms>.rl`, the last three kept. Private, never committed.
- The demo: `docs/relate/demoGraph.rl`, built from `src/relate/graph/fixtures/demoWorld.ts` (synthetic people only).

## Keeping it correct (Designing Data-Intensive Applications)

| Risk | What log does |
| --- | --- |
| A second source of truth | The graph is derived only; log.db's events stay the record (`docs/storageAgainstTheBook.md` item 2). Delete every `.rl` and `log relate build` brings it back. |
| Stale context | The store records the event it is through, in the same transaction as each batch; the context and `log relate status` say how many events it is behind. |
| Half-written reads | New file per build, pointer moved only after the commit and checkpoint. |
| Two writers | One owner per log.db, fenced by `owners.generation` checked before every commit and recorded in the store; a one-shot build takes the same claim. Re-applying a batch replaces whole rooms, so it can't double edges. |
| Re-keyed identities | An identity merge since the last build means a full build, so a merged handle can't leave a stale node. |
| An update that drifts from a build | The update recomputes whole rooms and people from log.db rather than adding counts, a test builds both ways and compares every node and edge, and `log relate verify` compares the counts. |
| A write-ahead log that grows | Updates write in batches without a checkpoint; once about 20,000 rows have gone in since the last one, the update checkpoints the file, keeping Relate's log well under its limit. |
| A writer that never lets go | Only the owner holds the file; readers that fall back close it after one read, and a silent owner is replaced after two stale readings 10 s apart. |
| Schema change | The pointer carries the projector version; a graph from other code is ignored and rebuilt. |
| Another workspace's data | The graph folder sits beside its own log.db and the pointer carries that log.db's workspace key. |
| Drift | `log relate verify` compares every count with log.db. |

What each part must do is in the spec, [Relate graph](specs/relateGraph.md).

## Related

- Up: [How log works](howItWorks.md) · [log's README](../README.md)
