# knowledgeAndSearch

Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

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
Describe every image, meme and video with one local vision model into the .db, so replies read what was sent
log media describer [--json]
Every image, meme, gif and video sent or received is described by one local vision model (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js) and the description, labelled with what the media is, is stored in the .db with its jina-embeddings-v5-omni vector, so the voice step reads what was sent before anyone replies (rule 138). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the model once, takes one item at a time from a queue of at most 20 (the overflow is marked not described yet and shown so in every context), describes a video from three frames, beats every 5 s, and stops loudly past its memory ceiling. describe puts one local file in the queue and waits for its description. status shows the queue. Audio goes to AssemblyAI (rule 126), never here.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 126, 131, 137, 138, 139, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `mediaDescribe`

Queue one local image or video for the describer and wait for its description.
Describe every image, meme and video with one local vision model into the .db, so replies read what was sent
log media describe <path> [--wait <seconds>] [--json]
Every image, meme, gif and video sent or received is described by one local vision model (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js) and the description, labelled with what the media is, is stored in the .db with its jina-embeddings-v5-omni vector, so the voice step reads what was sent before anyone replies (rule 138). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the model once, takes one item at a time from a queue of at most 20 (the overflow is marked not described yet and shown so in every context), describes a video from three frames, beats every 5 s, and stops loudly past its memory ceiling. describe puts one local file in the queue and waits for its description. status shows the queue. Audio goes to AssemblyAI (rule 126), never here.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 126, 131, 137, 138, 139, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `mediaStatus`

The media queue: how many wait, are described, not described yet or failed, and whether the describer runs.
Describe every image, meme and video with one local vision model into the .db, so replies read what was sent
log media status [--json]
Every image, meme, gif and video sent or received is described by one local vision model (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js) and the description, labelled with what the media is, is stored in the .db with its jina-embeddings-v5-omni vector, so the voice step reads what was sent before anyone replies (rule 138). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the model once, takes one item at a time from a queue of at most 20 (the overflow is marked not described yet and shown so in every context), describes a video from three frames, beats every 5 s, and stops loudly past its memory ceiling. describe puts one local file in the queue and waits for its description. status shows the queue. Audio goes to AssemblyAI (rule 126), never here.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 126, 131, 137, 138, 139, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `search`

Search every conversation by keyword and meaning at once, fused with reciprocal rank fusion.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search "<query>" [--limit <n>] [--platform <p>] [--account <a>] [--with <handle>] [--after <YYYY-MM-DD>] [--json]
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/collabMaxxing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/whoNeedsYou" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 88, 89, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `searchIndex`

Read every conversation through the platform's engine (X Chat decrypted with the saved PIN, Discord DMs and groups) and build the search indexes.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search index [--platform <twitter|discord>] [--account <a>] [--saved] [--rebuild]   (only the chunks that are new or changed are embedded, and the ones gone are removed, so the index stays deduplicated; --rebuild embeds everything again. --saved indexes the conversations already kept, reading nothing; otherwise reads every conversation through the platform's engine: X's DMs with X Chat decrypted with the saved PIN, and every Discord DM and group (its whole history, up to 20,000 messages each), keeps them in ~/.logCli/conversations, and builds the keyword and meaning indexes in ~/.logCli/search)
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 88, 89, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `searchBench`

Time realistic queries on the built index, cold and warm, with p50, p95 and p99 beside a linear scan.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search bench [--rounds <n>]   (times realistic queries on the built index, cold and warm, and prints p50, p95 and p99 beside a plain linear scan)
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 88, 89, 105, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbSearch`

Search the knowledge base (rules, skills, docs, infra, agent memory, page states, accounts, notes) by keyword and meaning at once.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb search "<query>" [--kind <kind>] [--limit <n>] [--json]
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbSync`

Collect every source into the knowledge base in Twenty and index what changed into Redis.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb sync [--noAccounts] [--json]   (collects AGENTS.md rules and sections, skills, docs, infra notes, every Claude memory file, the known page states and the accounts from log-cli's Twenty, writes them to the knowledge base in ListeningKit's Twenty, and indexes what changed into Redis)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbRemember`

Save an agent memory as a knowledge base note, in Twenty and Redis at once.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb remember "<text>" [--title <t>] [--tags <a,b>] [--json]   (saves an agent memory as a note in Twenty and Redis at once)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbShow`

Show one knowledge base article in full.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb show <key> [--json]   (one article in full, e.g. rule:73, skill:inspect, pageState:messengerPinCreate)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `transcribe`

Transcribe every voice note in the saved X and Discord conversations with AssemblyAI and write them into the conversation store.
Transcribe every voice note in the saved X and Discord conversations with AssemblyAI, written into the conversation store for search, voice and SubQ
log transcribe [--platform twitter|discord] [--account <a>] [--list] [--noIndex] [--json]
Transcribes every voice note in the saved conversations with AssemblyAI (upload, transcript, polled until done) and writes each into the conversation store as (voice note: "<what was said>") in place of its (audio: <name>) marker, so log search, voice and SubQ matrices see what was said. X voice notes come from the X Chat files the account's one session saved, and a missing one is fetched through that session (the conversation read again, its audio events reopened). Discord voice notes are found with Discord's own sound search, one chat at a time through log's Discord engine, and each file is fetched from its fresh attachment url there; any refusal stops it (rule 94). Each transcript is kept once by its file's hash in ~/.logCli/transcripts, so nothing is sent to AssemblyAI twice. The search index is then updated with what changed (--noIndex skips it).
--list only lists the voice notes the store holds and which have their file, calling nothing. The key is ASSEMBLYAI_API_KEY or ASSEMBLY_AI_KEY (the environment, .env.local, ~/.buzz/.env.local or ~/filmcraft/.env.local), never printed; without it the command refuses with assemblyAiKeyMissing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 88, 89, 94, 105, 106, 126, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `transcribeFile`

Transcribe one audio file with AssemblyAI, kept by its hash.
Transcribe every voice note in the saved X and Discord conversations with AssemblyAI, written into the conversation store for search, voice and SubQ
log transcribe file <path> [--json]   (one audio file, transcribed and kept by its hash)
Transcribes every voice note in the saved conversations with AssemblyAI (upload, transcript, polled until done) and writes each into the conversation store as (voice note: "<what was said>") in place of its (audio: <name>) marker, so log search, voice and SubQ matrices see what was said. X voice notes come from the X Chat files the account's one session saved, and a missing one is fetched through that session (the conversation read again, its audio events reopened). Discord voice notes are found with Discord's own sound search, one chat at a time through log's Discord engine, and each file is fetched from its fresh attachment url there; any refusal stops it (rule 94). Each transcript is kept once by its file's hash in ~/.logCli/transcripts, so nothing is sent to AssemblyAI twice. The search index is then updated with what changed (--noIndex skips it).
--list only lists the voice notes the store holds and which have their file, calling nothing. The key is ASSEMBLYAI_API_KEY or ASSEMBLY_AI_KEY (the environment, .env.local, ~/.buzz/.env.local or ~/filmcraft/.env.local), never printed; without it the command refuses with assemblyAiKeyMissing.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base, the conversation search (keyword and meaning at once) and every voice note transcribed into it).
AGENTS.md (log://agents): rules 26, 41, 88, 89, 94, 105, 106, 126, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

## The rules these tools fall under, in full

From AGENTS.md (`log://agents`). The newest rules are at the bottom of AGENTS.md and win.

**Rule 13.** 2026-10-18 · Twenty is the only place accounts and listings live: Facebook accounts are `socialAccounts` (platform FACEBOOK), listings are `agencyListings`. Never delete either: a banned or dead account keeps its record with its status, and its campaign listings get replacement accounts in the same country (`docs/accountsAndListings.md`). Fields are only ever added (`scripts/twenty/twentySetup.mjs`), never renamed or retyped, so the twitter-controller keeps working.

**Rule 26.** 2026-10-19 · matt: "I always want to see what is going on." Every process that runs over time writes a progress line per stage as it happens (never only at the end) and to a log file in its folder. Agents run long commands so the lines stream live (Claude Code: Monitor, never piped through `tail`/`head`).

**Rule 30.** 2026-10-19 · matt: "If I tell you to do something, do it completely." When matt gives a plan, it is carried out to the end in the same turn, not stopped to ask again or to say what won't be done. `log inspect start --now` (and `log connect --now`, and since 2026-10-19 `log publish --now`, matt: "run it now") skips rule 24's 10-minute gap (the 8 a day still holds) so a recording continues at once. Recording a sign-in or a checkpoint with `log inspect` (signIn, code, solve, click) is the intended work: it is how each state gets documented from rea. The run on 2026-10-19 was interrupted once because a snapshot printed the account's email and password; snapshots now redact every typed field value (`redact_fields`), and signIn/code read only the private login.json (rule 21), so no credential reaches any output.

**Rule 38.** 2026-10-19 · matt: never mention or discuss Meta's or Facebook's rules, terms, policies, eligibility or account ownership with him unless he raises them first. Research text that does is not his, and is never repeated to him. Top of this file.

**Rule 39.** 2026-10-19 · matt: "If I never mentioned it, if I never inferred it, if I never outlined it as an option, therefore it is not an option." Deep research prompts, searches, SubQ matrices, plans and write-ups use only what matt said, or clearly meant through a misspelling. Nothing added, nothing steered towards. Top of this file.

**Rule 40.** 2026-10-19 · matt: no physical options. He is in Vietnam with no physical access. Phones, SIMs, mini PCs, laptops, phone farms and home devices are never options unless he names them. In scope: hosted and cloud options, the tools he named and their competitors, and what our four projects already use.

**Rule 41.** 2026-10-19 · matt: "any time any task correlates to money, and I never say something, that means you shouldn't do what you think. You should do what I say." Paid work (deep research, SubQ, proxies, captcha, vendors) does exactly what he asked, nothing more. Ask before anything else.

**Rule 63.** 2026-10-22 · matt: the platform comes first. Every command that acts on one platform is `log <platform> <command> …` (`log facebook warmup reel`, `log facebook join group`); there is no form without it. The poll is `log facebook poll <group> <account> <how long to poll>`. Old forms are refused with the form they became. This replaces rule 60's `log warmup <platform> <activity>` and settles issue #20. OpenMagpie's worker is `log facebook poll --request` (it was `read group --worker`), a read in the account's open browser. `bun run check:docs` refuses a usage line without the platform first. Top of this file; the table is `docs/commandNaming.md`.

**Rule 64.** 2026-10-22 · matt: the code is by platform first, as the commands are, "because each has different approaches": `src/<platform>/<area>/<domain>`. Facebook's groups are `src/facebook/group/{join,read,answer}` (were `src/group/…`, rule 45) and its warm-up `src/facebook/warmup/activities` and `src/facebook/warmup/stages` (were `src/warmup/facebook` and `src/warmup/facebookStages`, rule 49). What every platform's warm-up draws from stays shared: `src/warmup/persona`, `src/warmup/viewer`. Each area has an `index.ts` (`check:naming`). Top of this file.

**Rule 88.** 2026-10-26 · matt: "DONT OPEN IT IN MY CHROME WE FUCKING BUILT IT OUT BECAUSE THE vendor/twikit hasnt been updated." X Chat (encrypted DMs) is read through log only, in the same shapes as the legacy DMs, never by opening x.com in a browser. X's own encryption SDK is vendored at `vendor/chatXdk` (xdevplatform/chat-xdk v0.5.2: its Rust source and the prebuilt Python wheel, installed from there). `vendor/twikit` reads the account's keys and Juicebox token map (`GetPublicKeysQuery`), unlocks them with the account's X Chat PIN (`client.unlock_xchat`) and decrypts every conversation's events (`client.get_xchat_messages`). The PIN is saved by matt once in a masked Clack prompt, `log twitter chat pin --account <a>`, kept in Twenty (`socialAccounts.messengerPin` on the X row) and handed to the engine only in the run's private folder. `log twitter dms` fills each X Chat thread's last message, and `--with <handle>` merges a person's legacy and X Chat threads into one timeline. Nobody is answered on X without reading their X Chat side first.

**Rule 89.** 2026-10-26 · matt: finding context in conversations is a search, never reading every thread. `log search "<query>"` (MCP `search`) runs BM25 (bm25s) and meaning search (verso-db HNSW over local all-MiniLM-L6-v2 embeddings, `@huggingface/transformers`) in parallel and fuses them with reciprocal rank fusion, with `--platform`, `--account`, `--with` and `--after` filters. `log search index` reads every conversation through the platform's engine in one export read (X Chat decrypted with the saved PIN, rule 88), keeps them in `~/.logCli/conversations` and the indexes in `~/.logCli/search`, which survive restarts. `log search bench` prints p50, p95 and p99, cold and warm, beside a linear scan. `src/search/conversations`.

**Rule 93.** 2026-10-27 · matt: "we need to build a knowledge base inside of it", all of it, agent memory too, with Redis. The knowledge base lives in ListeningKit's Twenty on node02 (`knowledgeArticles`: key, kind, body, source, tags, author, content hash; reached over the tailnet at `node02.tail4fcf85.ts.net`, never through the public login gate) and is searched through Redis 8 on node02 (`kb-redis`, the search module's `kbIdx`: BM25 keyword and HNSW meaning over local all-MiniLM-L6-v2, fused with reciprocal rank fusion). `log kb sync` collects AGENTS.md's rules and sections, every skill, every doc (`docs/infra/` as infra, never `docs/vendors`), every Claude memory file, the known page states and the accounts from log-cli's Twenty (no credential, proxy URL or cookie), writes what changed to Twenty and re-indexes what changed into Redis; an article a person writes or edits in Twenty is indexed on the next sync. `log kb search "<query>" [--kind]` is how an agent finds context, `log kb remember "<text>"` saves an agent memory to both at once, `log kb show <key>` reads one in full. Secrets are scrubbed before anything is written (named keys, URLs with a login, JWTs, private keys, long random strings). The logins are files in `~/.config/listeningkit/`, never in the repo or the knowledge base. `src/knowledge/base`, `docs/knowledgeBase.md`.

**Rule 94.** 2026-10-29 · matt: "whatever you did in such quick succession lead to my account getting disabled, never do that again." Never act on an account in quick succession. What happened (matt's Discord, `sourcedandsoldtothehighestbidder`, 2026-10-29 00:47-01:00 UTC): in about 13 minutes an agent replied in 3 chats, read 1,400 messages from a server (Finn Automated) with a scratch script that went around log-cli (`.scratch/finn/dc.ts`: its own fetch to `discord.com/api/v9` with the session token, pages back to back, retrying straight through 429s), pulled the account's relationships, then opened new DMs to strangers from that server 30 s apart. Discord disabled the account. From now on: - Every call to a platform goes through log-cli's own commands and their governor. Never a hand-rolled script with an account's token or cookies. - A 429 or a failed send stops the run. It is never retried through, and the next action waits for matt. - Reading a server, group or member list in bulk is its own session. It never runs in the same session as sending. - Cold DMs to people the account has never talked to go out at most a few a day, minutes apart, never back to back. Each new DM channel opened counts as a write. - After a block, disable, captcha or cooldown, nothing resumes on that account until matt says so.

**Rule 105.** 2026-11-01 · matt: "we cannot be opening multiple sessions there, that defeats the core purpose of what we use this tool for ... it should always be one, and then it needs to loudly create issues". An X account has one session, always. Every X call (CLI, MCP, hooks, the queue, the X Chat watch) goes through the account's one engine host (`python/twitterApi/host.py`, started on the first call, closed after 30 idle minutes or when the engine code changes): one twikit client, one connection, one cookie jar and one transaction key, the way X's own web app keeps one page and signs every call from it (x-web `startup-dynamic`, read with rea 2026-11-01). A second host can't start (`host.lock`); a call that can't reach the host is refused with `xSessionHostDown` and sends nothing, never falls back to a session of its own. The hook's account line shows the open session (pid, since, calls). `LOG_TWITTER_HOST=inline` runs the old way, for tests only.

**Rule 106.** 2026-11-01 · matt: "when doing stuff like changing the code or anything, ensure that there hasn't been any changes to it locally, like to the engine ... you're not allowed hand-rolled commands, it always has to be through the MCP basically". Two things, enforced by the hooks: - **Through the MCP only.** Every log action an agent takes goes through the log MCP tools (`mcp__log__…`), never a hand-run `log …` or `bun bin/log.ts …` from a shell. The PreToolUse hook (`liveLogs`, `handRunDenial` in `src/agentHooks/liveLog`) refuses one and names the MCP instead. Only the terminal-only prompts (`TERMINAL_ONLY`: launch, login, mcp, chat pin, cookies save, messenger pin) are run in a terminal, by matt. A stale MCP server is said to matt (restart the app), never worked around. - **Local changes first.** Before changing code, check what is already changed and uncommitted in the checkout. The engines hook says it loudly at session start and whenever it changes (`>>> UNCOMMITTED LOCAL CHANGES`, `localChangesLine` in `src/mcp/freshness`): read each one's diff, and never overwrite, revert, stage, publish or ship someone else's uncommitted work without matt.

**Rule 126.** 2026-11-03 · matt: every voice note he was sent or sent, transcribed with AssemblyAI, and "inside of the discord layer we have that and then the social media platforms at large, how can we detect when we have audio". Audio is detected once, in the shared message layer (`python/platformKit/media.py`, `src/platformKit/media`), never per platform: a content type of `audio/*` or `video/ogg`, an extension (`.ogg .oga .opus .m4a .mp3 .wav .aac .webm`), or the platform's own flag (Discord's voice-message flag 8192 with its duration and waveform, X Chat's audio media, Slack's `slack_audio` file). Every platform's messages keep their attachments, and an audio one adds `(audio: <name>)` to the text. Whatever is audio goes through one AssemblyAI path (`log transcribe`, MCP `transcribe`; `src/media/voiceNotes`): kept once by its file's hash in `~/.logCli/transcripts`, written into the conversation store as `(voice note: "<what was said>")` so search, voice and SubQ see it, and done as they come in `discordRead`, `twitterDms`, `slackRead` and the inbox. Files come only through the platform's own engine and session (X's one session, Discord's sound search, Slack's own transport), and any refusal stops the run (rule 94). The key is `ASSEMBLYAI_API_KEY` or `ASSEMBLY_AI_KEY` (`.env.local`, `~/.buzz/.env.local` or `~/filmcraft/.env.local`), never printed. `log new platform` writes the attachments into a new platform's message shape, and `check:platforms` refuses an engine whose messages drop them. Spec: `docs/specs/voiceNotes.md`.

**Rule 131.** 2026-11-04 · matt: "WE NEED TO LOUDLY ALERT THAT THIS CANNOT HAPPEN ... WE CAN ONLY HAVE ONE PROCESS PER ACTUAL THING". On 2026-11-04 every watcher was running two or three times (X Chat for both X accounts, Discord and Slack): each new Claude session's hook started them again, the cleanup only killed the pid in `watch.pid`, which the new one had overwritten, and the doubled X watchers polled X's badge counts in bunches until X answered 429 on both accounts. One watcher process per account per platform, always, and every Claude session subscribes to it through the inbox (`pending.jsonl`), never by starting its own. Each watcher takes `watch.lock` (exclusive create, its pid) before it opens anything (`claimWatcher`, `src/inbox/watch`); a second one is refused with `watcherAlreadyRunning` and exits, and the refusal goes to `~/.logCli/inbox/alerts.jsonl`, which the inbox hook puts first in the agent's context (`>>> ONE PROCESS PER ACCOUNT, NEVER TWO`) to be told to matt. A dead holder's lock is taken over, only the holder releases it, the hook never starts a watcher while a live one holds the lock, and the stale-code cleanup stops the holder as well as the pid file's process. Tests run the Instagram engine inline (`LOG_INSTAGRAM_HOST=inline` in the preload) so they never leave a real session host behind. Spec: `docs/specs/agentHooks.md` (REQ-HOOKS-13).

**Rule 137.** 2026-11-04 · matt: keep every part of the voice gate ("necessary") and run it "as the whole voice process on the new .db", required inside every send, only at send time, scoped to that send, quiet; then "Yes, both" to jina-embeddings-v5-omni and the local media model. The voice gate is one step (`gateSend`, `src/cli/twitter/helpers/voice.ts`) inside `log discord send`, `log slack send`, `log twitter dm`, the queue's sends and `log instagram send`, after the account has caught up (rule 135) and before the chat is claimed (rule 133): a draft that fails is refused with `voiceGateFailed` whether or not `log voice` ran first, and in the X queue the item is held to be rewritten with `twitterQueueEdit`. All five checks stay: SubQ's read of matt's voice, the AI tells index with its reranker (rule 112), his own phrasing (rule 127), the watermark checker (rule 111) and the scrambler (rule 127). It reads the chat's context from the .db (rule 136), embeds it, ranks it against the moment being answered (cosine, then `jina-reranker-v3.5`) and gives SubQ the top moments in full (`rankedContext`, `thisConversationRankedForThisMoment`). Only embeddings are kept, in the .db (`embeddings`: the text's hash, model, dimensions and vector, each made once), with the AI tells index's phrase list and matt's baseline (`aiIndexes`); every result is worked out fresh for each send, never saved. Jina is `jina-embeddings-v5-omni-small` at 1024 dimensions (`text-matching`), and an index made with another model is rebuilt. The local embedder stays loaded in its process. A pass is one line; a fail names only what failed and why. Spec: `docs/specs/voiceGate.md` (REQ-VOICE-09 to 11), `docs/specs/aiTells.md` (REQ-AITELLS-05, 10, 12).

**Rule 138.** 2026-11-04 · matt: "a smaller local model" turns every piece of media into "a text representation", labelled with what it is, after a message went out answering only the text around a video someone sent; then "Yes, both" to downloading it. One media describer per machine (`log media describer`, `src/media/describer`), started by the inbox hook and locked like an owner (rule 131, a second is refused), loads `onnx-community/LFM2.5-VL-450M-ONNX` once (SubQ's pick, q4, on the transformers.js runtime log already uses) and keeps it warm. Every image, meme, gif and video a watch receives goes into the .db's `media` queue (`enqueueAttachments`). The describer takes one at a time, describes a video from three frames (ffmpeg), labels each description with its kind, stores it with its `jina-embeddings-v5-omni-small` vector, beats every 5 s, and stops loudly past its memory ceiling (`describerMemory`). The queue holds 20 at most: past that, an item is marked not described yet and alerted (`mediaQueueFull`). Media with no description is shown as `[video clip.mp4 not described yet: …]` in the inbox hook and in the voice gate's ranked context, so nobody replies to it blind; a description reaches both in its place. Audio stays with AssemblyAI (rule 126). A file the platform engine hasn't saved locally yet is listed as not described, with why. `log media describe <path>` queues one local file, and `log media status` shows the queue. Spec: `docs/specs/mediaDescriber.md`.

**Rule 139.** 2026-11-04 · matt: "Yes, do it here", having the engines save the images and videos the describer needs (rule 138). Each platform engine keeps a local copy of every image, gif and video someone sends, fetched through the account's own session, at most 50 MB, in its media folder (`is_visual`, `python/platformKit/media.py`): Slack's watch through its authenticated session (`file_of`, `saved_visuals`), Instagram's realtime watch through instagrapi's private session on curl_cffi, never its plain-requests downloads (`media_ref_of`, `saved_media`, under the engine's one-call lock), and X Chat through the files its one session already decrypts and saves. Each watch passes the saved path with the attachment, so the describer gets it at once; a fetch that fails is listed with why. Discord's watch keeps them too (matt, "Yes, do it here", once its engine's uncommitted work was committed as his), for the messages that reach the inbox only (DMs, mentions and replies to the account), through its REST session as it already does for voice notes (`with_visuals`, `visual_file_of`). Spec: `docs/specs/mediaDescriber.md` (REQ-MEDIA-06).
