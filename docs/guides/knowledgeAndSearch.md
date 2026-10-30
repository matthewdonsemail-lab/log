# knowledgeAndSearch

Finding context: the knowledge base and the conversation search, keyword and meaning at once.

Written by `bun run docs:build` from the code, the skills and AGENTS.md (rule 56). Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | see the page |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | see the page |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters | "look through my messages and find someone who clearly needs something off me", "summarise everything on my twitter, how likely is it we make money", "who's worth following up". |

## The tools in this guide

| Tool | What it does |
|---|---|
| `search` | Search every conversation by keyword and meaning at once, fused with… |
| `searchIndex` | Read every conversation through the platform's engine |
| `searchBench` | Time realistic queries on the built index, cold and warm, with p50… |
| `kbSearch` | Search the knowledge base |
| `kbSync` | Collect every source into the knowledge base in Twenty and index what… |
| `kbRemember` | Save an agent memory as a knowledge base note, in Twenty and Redis at… |
| `kbShow` | Show one knowledge base article in full |

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

```bash
log kb search "why did the tunnel go down"            # best articles, keyword + meaning
log kb search "messenger pin" --kind pageState --limit 3
log kb show rule:73                                    # one article in full
log kb remember "node02's Twenty API keys need ENCRYPTION_KEY from Oct 21" --tags infra,node02
log kb sync                                            # refresh from every source (Monitor it, rule 26)
log kb sync --noAccounts                               # without reading log-cli's Twenty
```

MCP: `kbSearch`, `kbShow`, `kbRemember`, `kbSync`.

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

```bash
log kb remember "Twenty v2.49 signs API keys with a key encrypted by ENCRYPTION_KEY; a changed ENCRYPTION_KEY gives 'No encryption key matches keyId'. Fixed 2026-10-27 by restoring the Oct 21 secrets." --title "Twenty API keys need the original ENCRYPTION_KEY" --tags twenty,node02
```

## Every tool, in full

### `search`

Search every conversation by keyword and meaning at once, fused with reciprocal rank fusion.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search "<query>" [--limit <n>] [--platform <p>] [--account <a>] [--with <handle>] [--after <YYYY-MM-DD>] [--json]
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }), getGuide({ useCase: "twitter/followUps" }), getGuide({ useCase: "twitter/whoNeedsYou" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base and the conversation search, keyword and meaning at once).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 88, 89, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `searchIndex`

Read every conversation through the platform's engine (X Chat decrypted with the saved PIN, Discord DMs and groups) and build the search indexes.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search index [--platform <twitter|discord>] [--account <a>] [--saved] [--rebuild]   (only the chunks that are new or changed are embedded, and the ones gone are removed, so the index stays deduplicated; --rebuild embeds everything again. --saved indexes the conversations already kept, reading nothing; otherwise reads every conversation through the platform's engine: X's DMs with X Chat decrypted with the saved PIN, and every Discord DM and group (its whole history, up to 20,000 messages each), keeps them in ~/.logCli/conversations, and builds the keyword and meaning indexes in ~/.logCli/search)
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Use cases that call it, each a workflow the owner asks for, tool by tool: getGuide({ useCase: "twitter/affiliateMarketing" }), getGuide({ useCase: "twitter/dmInbox" }).
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base and the conversation search, keyword and meaning at once).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 88, 89, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `searchBench`

Time realistic queries on the built index, cold and warm, with p50, p95 and p99 beside a linear scan.
Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes
log search bench [--rounds <n>]   (times realistic queries on the built index, cold and warm, and prints p50, p95 and p99 beside a plain linear scan)
Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base and the conversation search, keyword and meaning at once).
AGENTS.md (log://agents): rules 13, 26, 63, 64, 88, 89, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbSearch`

Search the knowledge base (rules, skills, docs, infra, agent memory, page states, accounts, notes) by keyword and meaning at once.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb search "<query>" [--kind <kind>] [--limit <n>] [--json]
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base and the conversation search, keyword and meaning at once).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbSync`

Collect every source into the knowledge base in Twenty and index what changed into Redis.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb sync [--noAccounts] [--json]   (collects AGENTS.md rules and sections, skills, docs, infra notes, every Claude memory file, the known page states and the accounts from log-cli's Twenty, writes them to the knowledge base in ListeningKit's Twenty, and indexes what changed into Redis)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base and the conversation search, keyword and meaning at once).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbRemember`

Save an agent memory as a knowledge base note, in Twenty and Redis at once.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb remember "<text>" [--title <t>] [--tags <a,b>] [--json]   (saves an agent memory as a note in Twenty and Redis at once)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base and the conversation search, keyword and meaning at once).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

### `kbShow`

Show one knowledge base article in full.
The knowledge base: search it, sync every source into Twenty and Redis, remember a note, show an article
log kb show <key> [--json]   (one article in full, e.g. rule:73, skill:inspect, pageState:messengerPinCreate)
Kinds: rule, section, skill, doc, infra, memory, pageState, account, note. Twenty (node02, over the tailnet) holds every article and can be edited there; Redis 8 holds the search index: BM25 keyword and HNSW meaning (local all-MiniLM-L6-v2) fused with reciprocal rank fusion. Secrets are scrubbed before anything is written.
Fill the named fields; each value goes through whole.
Before first using this tool in a session, load its guide: getGuide({ topic: "knowledgeAndSearch" }) (Finding context: the knowledge base and the conversation search, keyword and meaning at once).
AGENTS.md (log://agents): rules 13, 26, 30, 93, 30, 38, 39, 40, 41. When matt says to do something, do it completely (rule 30).

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
