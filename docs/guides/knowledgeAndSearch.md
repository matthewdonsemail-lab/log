# knowledgeAndSearch

Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 55). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Current scope

This guide describes the current command implementation. Legacy storage names and deferred features in procedure text do not define the native hosted schema. Active rules 171, 172 and 175 govern the target: existing private workspace log.db, central identity/team authorization and minimal routing metadata, with no required Twenty or agency/CRM model. Preserve current execution gates while migrating legacy dependencies explicitly.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on deepman and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with lior whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask ben if i could become a contributor", "look on my twitter for missed opportunities". |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | see the page |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters | "look through my messages and find someone who clearly needs something off me", "summarise everything on my twitter, how likely is it we make money", "who's worth following up". |

## The tools in this guide

| Tool | What it does |
|---|---|
| `mediaDescriber` | Run the one media describer on this machine |
| `mediaDescribe` | Queue one local image or video for the describer and wait for its… |
| `mediaStatus` | The media queue |
| `mediaView` | One media item |
| `search` | Search every conversation by keyword and meaning at once, fused with… |
| `searchIndex` | Read every conversation through the platform's engine |
| `searchBench` | Time realistic queries on the built index, cold and warm, with p50… |
| `kbSearch` | Search the knowledge base |
| `kbSync` | Collect every source into the knowledge base in Twenty and index what… |
| `kbRemember` | Save an agent memory as a knowledge base note, in Twenty and Redis at… |
| `kbShow` | Show one knowledge base article in full |
| `transcribe` | Transcribe every voice note in the saved X and Discord conversations… |
| `transcribeFile` | Transcribe one audio file with AssemblyAI, kept by its hash |

## The work, step by step: knowledgeBase

From `skills/knowledgeBase/SKILL.md`.

## knowledgeBase

The knowledge base is one place for everything log-cli knows: matt's rules,
the skills, the docs, the infra notes, every agent's memory files, the known
page states, the accounts, and the notes agents save. Twenty holds it, Redis
searches it.

### Hard boundaries

- **Never write a secret into it.** No password, token, API key, PIN, cookie,
  proxy URL or private key, in a note or anywhere else. Say where a login
  lives (a file path), never what it is. The scrubber hides what it can
  recognise, but it is a safety net, not permission.
- **Never mention Meta's or Facebook's rules from it** (rule 38).
  `docs/vendors` and the enforcement research are never collected.
- **Rows are never deleted by log-cli.** An article removed from the repo
  stays in Twenty; Redis drops only what Twenty no longer has.

### Where it lives

- **Twenty:** ListeningKit's workspace on node02, object `knowledgeArticles`
  (Knowledge base): `name` (title), `key`, `kind`, `body` (Markdown),
  `source`, `tags`, `author`, `contentHash`, `syncedAt`. log-cli reaches it at
  `https://node02.tail4fcf85.ts.net` (Tailscale Serve, tailnet only). People
  read and edit it at `https://twenty.listeningkit.com` (Basic Auth first).
- **Redis:** `kb-redis` on node02 (Redis 8.2.11 with the search module),
  tailnet `node02.tail4fcf85.ts.net:6380`, index `kbIdx` over
  `kb:chunk:*` hashes (title, text, key, kind, source, a 384-dimension
  vector) and `kb:article:*` (each article's hash and chunk ids).
- **Logins:** `~/.config/listeningkit/twenty-listeningkit-api-key.txt` and
  `~/.config/listeningkit/kb-redis-url.txt` (or `KB_TWENTY_API_KEY`,
  `KB_REDIS_URL`, `KB_TWENTY_URL`).

### Kinds

| Kind | From |
| --- | --- |
| `rule` | each numbered rule in AGENTS.md (`rule:73`) |
| `section` | each other AGENTS.md section (`agents:howWeFixProblems…`) |
| `skill` | `skills/*/SKILL.md` (`skill:inspect`) |
| `doc` | `docs/**/*.md`, the request docs included (`doc:docs/adsPower.md`) |
| `infra` | `docs/infra/*.md` (`doc:docs/infra/node02.md`) |
| `memory` | every Claude Code memory file in `~/.claude/projects/*/memory` (`memory:log-cli/cloudflare-access`) |
| `pageState` | `PAGE_STATES` (`pageState:messengerPinCreate`) |
| `account` | log-cli's Twenty socialAccounts, status and setup only (`account:61594285317994`) |
| `note` | `log kb remember`, or written by a person in Twenty |

### Commands

Agents call the MCP tools, never a hand-run `log kb …` (rule 106):

```
kbSearch { query: "why did the tunnel go down" }               best articles, keyword + meaning
kbSearch { query: "messenger pin", kind: "pageState", limit: "3" }
kbShow { key: "rule:73" }                                      one article in full
kbRemember { text: "…", tags: "infra,node02" }                 a note, in Twenty and Redis at once
kbSync {}                                                      refresh from every source (Monitor it, rule 26)
kbSync { noAccounts: true }                                    without reading log-cli's Twenty
```

In a terminal the same commands are `log kb search|show|remember|sync`. What
each one must do is in the spec, [Knowledge base](../../docs/specs/knowledgeBase.md).

### How a sync works

1. Collect every source (about 600 articles, under a second), scrubbing
   secrets from each body.
2. Read what Twenty holds, compare each article's content hash, then create
   the new ones in batches of 60 and update the changed ones one by one.
   Twenty allows 100 API requests a minute; a 429 waits a minute and
   retries, so a first sync takes a few minutes and later ones seconds.
3. Index into Redis every article whose hash differs from what Redis holds,
   including the ones a person wrote or edited in Twenty, in chunks of about
   1,200 characters embedded with all-MiniLM-L6-v2 on this machine; drop
   from Redis what Twenty no longer has.

### When a session learns something

Save it before the session ends, in one or two plain sentences with where it
came from:

```
kbRemember { text: "Twenty v2.49 signs API keys with a key encrypted by ENCRYPTION_KEY; a changed ENCRYPTION_KEY gives 'No encryption key matches keyId'. Fixed 2026-10-27 by restoring the Oct 21 secrets.", title: "Twenty API keys need the original ENCRYPTION_KEY", tags: "twenty,node02" }
```

## Every tool, in full

### `mediaDescriber`

Run the one media describer on this machine: the vision model loaded once, describing the queue one item at a time.
Turn every image, meme and video into text any model reads, kept in the .db with a small preview, so replies read what was sent
log media describer [--json]
Every image, meme, gif and video sent or received becomes text any model can read, kept in log.db with a small preview (rules 138, 169). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the vision model once (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js, the first of an ordered list that falls back to the next), takes one item at a time from a queue of at most 20 (the overflow waits and is described when there is room), and for each keeps its size, length, hash and a small JPEG preview (a contact sheet of frames for a video), describes an image with its text word for word, and a video scene by scene (ffmpeg scene changes, one keyframe per scene with its on-screen words, its sound transcribed through AssemblyAI) as timestamped lines, labels it, stores its jina-embeddings-v5-omni vector, then deletes the engine's downloaded copy, so no media file is kept. A voice note shows its transcript. describe puts one local file in the queue and waits for its description. status shows the queue. view shows one item's line, and over MCP returns its preview as an image for a model that can see.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 138, 105, 137, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `mediaDescribe`

Queue one local image or video for the describer and wait for its description.
Turn every image, meme and video into text any model reads, kept in the .db with a small preview, so replies read what was sent
log media describe <path> [--wait <seconds>] [--json]
Every image, meme, gif and video sent or received becomes text any model can read, kept in log.db with a small preview (rules 138, 169). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the vision model once (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js, the first of an ordered list that falls back to the next), takes one item at a time from a queue of at most 20 (the overflow waits and is described when there is room), and for each keeps its size, length, hash and a small JPEG preview (a contact sheet of frames for a video), describes an image with its text word for word, and a video scene by scene (ffmpeg scene changes, one keyframe per scene with its on-screen words, its sound transcribed through AssemblyAI) as timestamped lines, labels it, stores its jina-embeddings-v5-omni vector, then deletes the engine's downloaded copy, so no media file is kept. A voice note shows its transcript. describe puts one local file in the queue and waits for its description. status shows the queue. view shows one item's line, and over MCP returns its preview as an image for a model that can see.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 138, 105, 137, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `mediaStatus`

The media queue: how many wait, are described, not described yet or failed, and whether the describer runs.
Turn every image, meme and video into text any model reads, kept in the .db with a small preview, so replies read what was sent
log media status [--json]
Every image, meme, gif and video sent or received becomes text any model can read, kept in log.db with a small preview (rules 138, 169). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the vision model once (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js, the first of an ordered list that falls back to the next), takes one item at a time from a queue of at most 20 (the overflow waits and is described when there is room), and for each keeps its size, length, hash and a small JPEG preview (a contact sheet of frames for a video), describes an image with its text word for word, and a video scene by scene (ffmpeg scene changes, one keyframe per scene with its on-screen words, its sound transcribed through AssemblyAI) as timestamped lines, labels it, stores its jina-embeddings-v5-omni vector, then deletes the engine's downloaded copy, so no media file is kept. A voice note shows its transcript. describe puts one local file in the queue and waits for its description. status shows the queue. view shows one item's line, and over MCP returns its preview as an image for a model that can see.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 138, 105, 137, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `mediaView`

One media item: what it is as text, and its kept preview picture (returned as an image over MCP).
Turn every image, meme and video into text any model reads, kept in the .db with a small preview, so replies read what was sent
log media view <id> [--json]
Every image, meme, gif and video sent or received becomes text any model can read, kept in log.db with a small preview (rules 138, 169). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the vision model once (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js, the first of an ordered list that falls back to the next), takes one item at a time from a queue of at most 20 (the overflow waits and is described when there is room), and for each keeps its size, length, hash and a small JPEG preview (a contact sheet of frames for a video), describes an image with its text word for word, and a video scene by scene (ffmpeg scene changes, one keyframe per scene with its on-screen words, its sound transcribed through AssemblyAI) as timestamped lines, labels it, stores its jina-embeddings-v5-omni vector, then deletes the engine's downloaded copy, so no media file is kept. A voice note shows its transcript. describe puts one local file in the queue and waits for its description. status shows the queue. view shows one item's line, and over MCP returns its preview as an image for a model that can see.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 138, 105, 137, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `search`

Search every conversation by keyword and meaning at once, fused with reciprocal rank fusion.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search "<query>" [--limit <n>] [--platform <p>] [--account <a>] [--with <handle>] [--after <YYYY-MM-DD>] [--json]
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/collabMaxxing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/whoNeedsYou" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 175, 26, 63, 2, 89, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `searchIndex`

Read every conversation through the platform's engine (X Chat decrypted with the saved PIN, Discord DMs and groups) and build the search indexes.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search index [--platform <twitter|discord>] [--account <a>] [--saved] [--rebuild]   (only the chunks that are new or changed are embedded, and the ones gone are removed, so the index stays deduplicated; --rebuild embeds everything again. --saved indexes the conversations already kept, reading nothing; otherwise reads every conversation through the platform's engine: X's DMs with X Chat decrypted with the saved PIN, and every Discord DM and group (its whole history, up to 20,000 messages each), keeps them in ~/.logCli/conversations, and builds the keyword and meaning indexes in ~/.logCli/search)
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 175, 26, 63, 2, 89, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `searchBench`

Time realistic queries on the built index, cold and warm, with p50, p95 and p99 beside a linear scan.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search bench [--rounds <n>]   (times realistic queries on the built index, cold and warm, and prints p50, p95 and p99 beside a plain linear scan)
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 175, 26, 63, 2, 89, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbSearch`

Search the knowledge base (rules, skills, docs, infra, agent memory, page states, accounts, notes) by keyword and meaning at once.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb search "<query>" [--kind <kind>] [--limit <n>] [--json]
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 175, 26, 30, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbSync`

Collect every source into the knowledge base in Twenty and index what changed into Redis.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb sync [--noAccounts] [--json]   (collects AGENTS.md rules and sections, skills, docs, infra notes, every Claude memory file, the known page states and the accounts from log-cli's Twenty, writes them to the knowledge base in ListeningKit's Twenty, and indexes what changed into Redis)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 175, 26, 30, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbRemember`

Save an agent memory as a knowledge base note, in Twenty and Redis at once.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb remember "<text>" [--title <t>] [--tags <a,b>] [--json]   (saves an agent memory as a note in Twenty and Redis at once)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 175, 26, 30, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbShow`

Show one knowledge base article in full.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb show <key> [--json]   (one article in full, e.g. rule:73, skill:inspect, pageState:messengerPinCreate)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 175, 26, 30, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `transcribe`

Transcribe every voice note in the saved X and Discord conversations with AssemblyAI and write them into the conversation store.
Transcribe every voice note in the saved X and Discord conversations with AssemblyAI, written into the conversation store for search, voice and SubQ
log transcribe [--platform twitter|discord] [--account <a>] [--list] [--noIndex] [--json]
Transcribes every voice note in the saved conversations with AssemblyAI (upload, transcript, polled until done) and writes each into the conversation store as (voice note: "<what was said>") in place of its (audio: <name>) marker, so log search, voice and SubQ matrices see what was said. X voice notes come from the X Chat files the account's one session saved, and a missing one is fetched through that session (the conversation read again, its audio events reopened). Discord voice notes are found with Discord's own sound search, one chat at a time through log's Discord engine, and each file is fetched from its fresh attachment url there; any refusal stops it (rule 94). Each transcript is kept once by its file's hash in ~/.logCli/transcripts, so nothing is sent to AssemblyAI twice. The search index is then updated with what changed (--noIndex skips it).
--list only lists the voice notes the store holds and which have their file, calling nothing. The key is ASSEMBLYAI_API_KEY or ASSEMBLY_AI_KEY (the environment, .env.local, ~/.buzz/.env.local or ~/filmcraft/.env.local), never printed; without it the command refuses with assemblyAiKeyMissing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 89, 94, 105, 163, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `transcribeFile`

Transcribe one audio file with AssemblyAI, kept by its hash.
Transcribe every voice note in the saved X and Discord conversations with AssemblyAI, written into the conversation store for search, voice and SubQ
log transcribe file <path> [--json]   (one audio file, transcribed and kept by its hash)
Transcribes every voice note in the saved conversations with AssemblyAI (upload, transcript, polled until done) and writes each into the conversation store as (voice note: "<what was said>") in place of its (audio: <name>) marker, so log search, voice and SubQ matrices see what was said. X voice notes come from the X Chat files the account's one session saved, and a missing one is fetched through that session (the conversation read again, its audio events reopened). Discord voice notes are found with Discord's own sound search, one chat at a time through log's Discord engine, and each file is fetched from its fresh attachment url there; any refusal stops it (rule 94). Each transcript is kept once by its file's hash in ~/.logCli/transcripts, so nothing is sent to AssemblyAI twice. The search index is then updated with what changed (--noIndex skips it).
--list only lists the voice notes the store holds and which have their file, calling nothing. The key is ASSEMBLYAI_API_KEY or ASSEMBLY_AI_KEY (the environment, .env.local, ~/.buzz/.env.local or ~/filmcraft/.env.local), never printed; without it the command refuses with assemblyAiKeyMissing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 89, 94, 105, 163, 138, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From the current AGENTS.md (`log://agents`). Historical citations are consolidated; archived instructions do not override the active scope.

**Rule 2.** 2026-10-18 · Put platform code under src/<platform>/<area>/<domain>; shared code stays in its shared library/domain. Use index.ts, types.ts, client.ts, machine.ts and helpers where appropriate. Keep scripts and Python in domain folders.

**Rule 26.** 2026-10-19 · Stream progress while work runs, one meaningful line per stage, with the run log retained. Explain stages in plain words; do not leave the user waiting silently for a final buffered result.

**Rule 30.** 2026-10-19 · Complete the authorized task. Do not repeatedly request confirmation already given. Distinguish implemented behavior, proposed contracts and unverified assumptions.

**Rule 38.** 2026-10-19 · Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless Matt raises them.

**Rule 39.** 2026-10-19 · Use only the scope, options and intent Matt stated or implied. Do not add unrelated alternatives to research, comparisons, plans or implementation.

**Rule 40.** 2026-10-19 · Do not propose physical infrastructure unless Matt asks. His available implementation scope is hosted/cloud environments and the tools already selected.

**Rule 41.** 2026-10-19 · Paid work must stay within the authorized task and spend. Ask before adding a paid operation he did not authorize; do not substitute a new paid provider implicitly.

**Rule 63.** 2026-10-22 · Platform commands are log <platform> <command> <what>. Shared commands remain shared. Preserve the naming boundary described in docs/commandNaming.md.

**Rule 89.** 2026-10-26 · Find conversational context by scoped search and existing private records. Do not reread every thread for a single person or task.

**Rule 94.** 2026-10-29 · Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies. A refusal, failed send, 429, block, disable, captcha or cooldown stops that run/account until Matt authorizes continuation. Do not retry through refusals. Bulk reading and sending are separate sessions; cold DMs stay a few a day, minutes apart, and opening a DM counts as a write.

**Rule 105.** 2026-11-01 · One platform/account owns one continuous engine session and push connection. Reads, writes, queues and watches share that owner through existing relay/serialization. Never open a parallel client to bypass the owner or its governor.

**Rule 137.** 2026-11-04 · Preserve current context-aware voice and AI-artifact gates for messages sent as Matt. Rework refused drafts from the stated cause. Exact-message overrides and dictated/translated voice-note exceptions require Matt's request and preserve remaining artifact checks. Do not treat an exception as permanent permission.

**Rule 138.** 2026-11-04 · Media and voice-note context uses the existing private media descriptions and transcripts. Do not claim to have understood undescribed media. Preserve hash-based deduplication, private storage and the one describer process.

**Rule 163.** 2026-11-07 · Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients. Terminal-only credential prompts remain for Matt. Expose discoverable command contracts through the existing Log catalog: search the job, get exact inputs, then call. Keep tool descriptions concise and accurate to the current implementation.

**Rule 175.** 2026-11-11 · Use existing log.db and platform-agnostic engine contracts for native schemas. Do not copy Twenty agency prefixes or CRM/SMS structures. Old listing/campaign functionality is deferred. Add only missing account/credential and hosted execution contracts; preserve existing identity, message, queue, job and governor authorities.
