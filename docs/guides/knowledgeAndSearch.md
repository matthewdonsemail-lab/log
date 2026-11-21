# knowledgeAndSearch

Knowledge base, search, Relate graph, people, voice notes.

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "discord/serverReply" })` | Replying in a Discord server channel | "reply to <someone> in <server>", "answer him in the general", "message the guy in <server> #<channel> who mentioned me", "reply in the <server> server", "find what <someone> said in <server> and answer it" |
| `getGuide({ useCase: "discord/serverSearch" })` | Finding a conversation in a Discord server | "find the conversation I had with <someone> in <server> about <thing>", "what did <someone> say in <server> about <thing>", "search <server> for <words>", "read through the <server> server and find <thing>" |
| `getGuide({ useCase: "inbox/saidBy" })` | Someone's messages on every platform, found by name, newest first | "what did he say", "find his messages", "everything they said" |
| `getGuide({ useCase: "inbox/scopeAJob" })` | Scoping a job out of someone in a DM | "probe <person> so we can scope out what the task is", "scope it out with him", "find out what he actually wants done", "go through and then scope it out". |
| `getGuide({ useCase: "log/toolFromOneOff" })` | Turning a hand-rolled one-off into a log tool | "turn that one-off into a tool", "make that script a log command", "stop hand-rolling that", "vendor that query into log" |
| `getGuide({ useCase: "network/relationshipMachine" })` | Relationship state machine | "where am I with <person>", "how do I reach <person>". |
| `getGuide({ useCase: "network/whoToTalkTo" })` | Who to talk to next | "who in my network should I talk to", "who's in my network", "who do I need to speak to". |
| `getGuide({ useCase: "people/facts" })` | Person facts | "what did I promise them", "what do I know about them". |
| `getGuide({ useCase: "twitter/affiliateMarketing" })` | Affiliate marketing through your DMs | "answer the people asking about <tool> in my dms with my affiliate link", "turn the dms about <tool> into affiliate money", "follow up everyone who asked about the tool", "get me onto <company>'s affiliate program and book the call". |
| `getGuide({ useCase: "twitter/collabMaxxing" })` | Collab maxxing: turn open conversations into collabs | "position a collab first then be like just a few quid so i can make a video about it", "start network maxxing and collab maxxing and trying to see what hes doing get him to reveal it all", "follow up on <someone> and the other people, small commitment from deals, not just new people but already open convos", "respond with the collabmaxxing", "selling the outcome", "let him name it", "check in with <someone> whats good there he is keen but isnt liquid", "just be nice to them there the poor people", "ask <someone> if i could become a contributor", "look on my twitter for missed opportunities". |
| `getGuide({ useCase: "twitter/dmInbox" })` | Reading the DM inbox: who is waiting on you | "who is waiting on me", "check my x dms", "go through my twitter inbox and tell me who needs a reply", "who am I waiting on in my dms". |
| `getGuide({ useCase: "twitter/followUps" })` | Following up in your own voice | "follow up with these, not for anything in particular, just warming up the relationship", "say it was cool to meet him", "ask him for some advice on what he's doing", "take him up on the doc he offered". |
| `getGuide({ useCase: "twitter/whoNeedsYou" })` | Finding who needs something from you, or who matters | "look through my messages and find someone who clearly needs something off me", "summarise everything on my twitter, how likely is it we make money", "who's worth following up". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `routerIndex` | Is the prompt router's meaning index of plays, tools and skills… | `log router index [--apply] [--json]   (is the prompt router's meaning index current; --apply builds it)` |
| `relateBuild` | Project log.db into a new current Relate graph | `log relate build [--json]` |
| `relateStatus` | The Relate graph and how far behind log.db it is | `log relate status [--owner start\|stop] [--json]` |
| `relateVerify` | Check every Relate graph count against log.db | `log relate verify [--json]` |
| `relateAsk` | The connected context | `log relate ask "<text>" [--json]` |
| `relateMachine` | A relationship state machine | `log relate machine [--person\|--to <h>] [--view <v>] [--platform <p>] [--json]` |
| `relateQuery` | A read-only Cypher query on the Relate graph | `log relate query "<cypher>" [--platform <p>] [--json]` |
| `people` | List everyone linked across platforms, with each person's identities | `log people [--json]` |
| `peopleShow` | The person card for someone across every platform | `log people show <who> [--json]` |
| `peopleSuggest` | Accounts on different platforms that are probably one person, with… | `log people suggest [--limit <n>] [--check] [--json]   (--check asks SubQ)` |
| `peopleLink` | Make these identities one person, after the owner says yes | `log people link <identity> <identity>... --approvedBy "<the owner's words>" [--name "<name>"] [--evidence "<why>"]` |
| `peopleUnlink` | Take an identity out of its person, after the owner says so | `log people unlink <identity> --approvedBy "<the owner's words>"` |
| `peopleFacts` | Someone's lasting facts | `log people facts <who> [--all]` |
| `peopleFactsExtract` | Find facts in new DM lines and record them as events | `log people facts extract [--who <w>] [--since <t>] [--limit <n>] [--platform <p>]` |
| `peopleFactsRecall` | Recall current facts by meaning, with evidence | `log people facts recall "<q>" [--limit <n>]` |
| `peopleDifferent` | Record that two identities are not the same person, after the owner… | `log people different <identity> <identity> --approvedBy "<the owner's words>"` |
| `networkImport` | Read your network into log.db, replacing the last import | `log network import [--from <dir>] [--account <handle>] [--json]` |
| `networkStatus` | Your network's rings per person, live | `log network status [--platform <p>] [--json]` |
| `mediaDescriber` | Run the one media describer on this machine | `log media describer [--json]` |
| `mediaDescribe` | Queue one local image or video for the describer and wait for its… | `log media describe <path> [--wait <seconds>] [--json]` |
| `mediaStatus` | The media queue | `log media status [--json]` |
| `mediaView` | One media item | `log media view <id> [--json]` |
| `search` | Find where someone talked about something | `log search "<query>" [--limit <n>] [--fusion <rrf\|bayes>] [--platform <p>] [--account <a>] [--with <handle>] [--after <YYYY-MM-DD>] [--kind <k>] [--server <s>] [--channel <c>] [--full] [--json]` |
| `searchIndex` | Read every conversation through the platform's engine | `log search index [--platform <twitter\|discord>] [--account <a>] [--saved] [--rebuild]   (embeds only new or changed chunks, --rebuild all; --saved indexes what log.db holds, else reads every DM and group through the platform's engine first)` |
| `searchBench` | Time realistic queries on the built index, cold and warm, with p50… | `log search bench [--rounds <n>]   (times realistic queries on the built index, cold and warm, and prints p50, p95 and p99 beside a plain linear scan)` |
| `kbSearch` | Search the knowledge base | `log kb search "<query>" [--kind <kind>] [--limit <n>] [--json]` |
| `kbSync` | Collect every source into the knowledge base in Twenty and index what… | `log kb sync [--noAccounts] [--json]   (collects rules, skills, docs, infra notes, memory files, page states and accounts into the knowledge base, and indexes what changed into Redis)` |
| `kbRemember` | Save an agent memory as a knowledge base note, in Twenty and Redis at… | `log kb remember "<text>" [--title <t>] [--tags <a,b>] [--json]   (saves an agent memory as a note in Twenty and Redis at once)` |
| `kbShow` | Show one knowledge base article in full | `log kb show <key> [--json]   (one article in full, e.g. rule:73, skill:inspect, pageState:messengerPinCreate)` |
| `transcribe` | Transcribe every voice note in the saved X and Discord conversations… | `log transcribe [--platform twitter\|discord] [--account <a>] [--list] [--noIndex] [--json]` |
| `transcribeFile` | Transcribe one audio file with AssemblyAI, kept by its hash | `log transcribe file <path> [--json]   (one audio file, transcribed and kept by its hash)` |
| `saidBy` | Someone's messages on every platform, found by name, newest first | `log saidBy [--name <name>] [--limit <n>] [--json]` |

## The work, step by step: knowledgeBase

From `skills/knowledgeBase/SKILL.md`.

## knowledgeBase

The knowledge base is one place for everything log-cli knows: the owner's rules,
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

- **Twenty:** your own Twenty workspace, object `knowledgeArticles`
  (Knowledge base): `name` (title), `key`, `kind`, `body` (Markdown),
  `source`, `tags`, `author`, `contentHash`, `syncedAt`. log-cli reaches it at
  `KB_TWENTY_URL` (`https://<your-twenty-host>`, over a private network such
  as Tailscale). There is no default host. People read and edit it in Twenty's
  own web app.
- **Redis:** `kb-redis` (Redis 8.2.11 with the search module), on the same
  private network at `<your-redis-host>:6380`, index `kbIdx` over
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
| `infra` | `docs/infra/*.md` (`doc:docs/infra/server.md`) |
| `memory` | every Claude Code memory file in `~/.claude/projects/*/memory` (`memory:log-cli/cloudflare-access`) |
| `pageState` | `PAGE_STATES` (`pageState:messengerPinCreate`) |
| `account` | log-cli's Twenty socialAccounts, status and setup only (`account:10000000000001`) |
| `note` | `log kb remember`, or written by a person in Twenty |

### Commands

Agents call the MCP tools, never a hand-run `log kb …` (rule 163):

```
kbSearch { query: "why did the tunnel go down" }               best articles, keyword + meaning
kbSearch { query: "messenger pin", kind: "pageState", limit: 3 }
kbShow { key: "rule:73" }                                      one article in full
kbRemember { text: "…", tags: ["infra", "server"] }                 a note, in Twenty and Redis at once
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
kbRemember { text: "Twenty v2.49 signs API keys with a key encrypted by ENCRYPTION_KEY; a changed ENCRYPTION_KEY gives 'No encryption key matches keyId'. Fixed 2026-10-27 by restoring the Oct 21 secrets.", title: "Twenty API keys need the original ENCRYPTION_KEY", tags: ["twenty", "server"] }
```

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 30.** Complete the authorized task.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless The owner raises them.
- **Rule 39.** Use only the scope, options and intent The owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless The owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 89.** Find conversational context by scoped search and existing private records.
- **Rule 94.** Every platform call goes through Log and its governor, never a scratch client with account tokens/cookies.
- **Rule 105.** One platform/account owns one continuous engine session and push connection.
- **Rule 134.** Existing workspace log.db is the native private record/coordination foundation.
- **Rule 137.** Preserve current context-aware voice and AI-artifact gates for messages sent as The owner.
- **Rule 138.** Media and voice-note context uses the existing private media descriptions and transcripts.
- **Rule 154.** Show people/chats by meaningful names and handles; keep routing ids internal unless needed for the specific technical artifact.
- **Rule 163.** Agent Log actions go through Log MCP tools; never work around a stale or unavailable MCP with shell Log commands or scratch clients.
