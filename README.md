<p align="center">
  <img src="banner.png" alt="log: run your social accounts from the command line or your AI agent" width="100%" />
</p>

<h3 align="center">One command for every social account you run.</h3>
<p align="center"><b>Read and answer X, Discord, Slack, Instagram, Reddit, LinkedIn and Facebook<br>
from your terminal, or let Claude Code, Codex or Cursor do it through the MCP server.</b><br>
<a href="docs/useCases/README.md">See every play, step by step →</a></p>

<p align="center">
  <a href="https://www.npmjs.com/package/@listeningkit/log"><img src="https://img.shields.io/npm/v/@listeningkit/log?color=cb3837&label=npm&logo=npm" alt="npm: @listeningkit/log" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <a href="docs/mcp.md"><img src="https://img.shields.io/badge/MCP-logMcp-7c3aed" alt="MCP server: logMcp" /></a>
  <a href="https://log.listeningkit.com/docs"><img src="https://img.shields.io/badge/docs-log.listeningkit.com-2ea44f" alt="Docs: log.listeningkit.com" /></a>
</p>

```bash
curl -fsSL https://log.listeningkit.com/install.sh | sh
claude mcp add log -- logMcp
```

<table>
<tr>
<td width="50%" valign="middle">

### X, from your agent

*"Read my X DMs and tell me who's waiting on me."*

The old inbox and the encrypted X Chat, read as one.

</td>
<td width="50%">

```bash
log twitter dms --account <name> --waiting
```

</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Discord, Slack and Instagram, live

Every new message is pushed to your agent the moment it lands.

</td>
<td width="50%">

```bash
log discord read --account <name> --channel "<chat>"
log slack read --account <name> --channel "<chat>"
log instagram dms --account <name>
```

</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Answers in your own voice

Every draft is checked against how you really write to that person before it goes.

</td>
<td width="50%">

```bash
log voice --to <handle> --text "<draft>"
```

</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Facebook Marketplace and groups

Listings kept live across local accounts, and groups read for people asking for a service.

</td>
<td width="50%">

```bash
log facebook listings
log facebook join group --account <name> --group <url>
```

</td>
</tr>
</table>

<p align="center">📖 <a href="https://log.listeningkit.com/docs"><b>Full documentation →</b></a></p>

log runs your social accounts from the command line, or from your AI agent. It reads DMs, group chats, replies and notifications, and it sends messages, replies, likes, follows, reactions and voice notes for you. It's one command, `log`, and one MCP server, `logMcp`, and it runs on your own machine with your own accounts. Nothing acts until you say so: every command that changes something is a dry run until you add `--live`. It's free and open source.

## Quick start

### Install

```bash
curl -fsSL https://log.listeningkit.com/install.sh | sh                        # macOS and Linux
irm https://log.listeningkit.com/install.ps1 | iex                             # Windows (PowerShell)
curl -fsSL https://log.listeningkit.com/install.sh | sh -s -- --skills all     # also every play as a skill
```

This installs the `log` and `logMcp` commands, and Python with everything the platform engines need. It writes your settings to `~/.logCli/.env`. Already have [Bun](https://bun.sh)? `bun add -g @listeningkit/log` installs just the commands. Already have log? `--skills all --skillsOnly` adds only the skills; on Windows, set `$env:LOG_SKILLS = "all"` before the PowerShell line. More: [docs/install.md](docs/install.md).

### Connect your accounts

Add the account once, sign it in, then check that the platform still accepts it:

| Platform | How to sign in |
|---|---|
| X | `log twitter cookies save --account <handle>`: paste `auth_token`, `ct0` and `twid` from a cookie-export extension |
| LinkedIn | `log linkedin cookies save --account <publicId>`: paste `li_at` and `JSESSIONID` |
| Slack | `log slack cookies save --account <name>`: paste the `d` cookie |
| Discord, Reddit, Instagram | `log localAccount add --platform <platform> --account <name>`, then `log inspect start --account <name>`, sign in by hand in the window that opens, and `log inspect do stop --account <name>` to save the session |
| Facebook | `log localAccount add --platform facebook --account <name>`, then `log facebook connect --account <name>` |

Then check it with `log <platform> session check --account <name>`, which sends nothing. The answer is `loggedIn`, `loggedOut` or `restricted`. Cookies are always typed into a masked prompt and never passed as flags. More: [docs/accounts.md](docs/accounts.md).

### Connect your agent

| Agent | How to connect |
|---|---|
| Claude Code | `claude mcp add log -- logMcp` |
| Codex, Cursor and other MCP clients | add `logMcp` as a stdio MCP server: [docs/mcp.md](docs/mcp.md) |

Then ask in plain words: *"read my X DMs and tell me who's waiting on me"*. The agent loads log's guide first, then follows the matching play.

## Platforms

| Platform | What log does | How it talks to the platform |
|---|---|---|
| [X](docs/platformGuides/x.md) | DMs and X Chat, notifications, followers, replies, posts, likes, follows, lists, reactions, voice notes, queues | its own API client, one session per account, no browser |
| [Discord](docs/platformGuides/discord.md) | DMs, groups and server channels, live; sends, reactions, voice notes, files | its own API client and the live gateway, no browser |
| [Slack](docs/platformGuides/slack.md) | DMs and group DMs in every workspace, live; sends, reactions, voice notes | its own API client and the live socket, no browser |
| [Instagram](docs/platforms/instagram/README.md) | DM threads, live; sends, photos, reactions, voice notes | its own API client and the realtime connection, no browser |
| [Facebook](docs/platformGuides/facebook.md) | Marketplace listings, groups, warm-up | the account's own browser, opened once a day through a proxy in its home country |
| [Reddit](docs/platformGuides/reddit.md) | session check (new) | its own API client |
| [LinkedIn](docs/platformGuides/linkedin.md) | session check (new) | its own API client |

## Highlights

- **Start from a play.** Each [use case](docs/useCases/README.md) is a workflow written step by step: what to run, and what tells you each step worked. With `--skills all`, your agent picks the right one from what you say.
- **Your voice, checked.** A draft is read against how you really write to that person, for AI phrasing and for hidden characters, before it can be sent.
- **One session per account.** Each account keeps one connection open, the way the platform's own app does, never a new one per command.
- **Live inbox.** New messages are pushed into your agent's context as they arrive, and two agents never answer the same chat.
- **Kept human.** Every account has its own daily limits, pacing and local waking hours. A refusal from the platform stops the run, and nothing is retried.
- **Your machine, your data.** Accounts and sessions stay in `~/.logCli`. Many accounts? Keep them in [Twenty](docs/twenty.md), an open-source CRM, so every machine, agent and teammate sees the same ones.

## How it works

log keeps everything it needs to answer you on your own machine, in one local database, `~/.logCli/log.db`. The platforms push what happens to it as it happens. So when you or your agent asks "what did they say?", log reads its own database in about a millisecond instead of asking the platform again, which takes seconds.

### The whole picture

```mermaid
flowchart LR
  subgraph platforms["The platforms"]
    X["X and X Chat"]
    D["Discord"]
    S["Slack"]
    I["Instagram"]
  end
  subgraph machine["Your machine"]
    H["One session per account<br/>like the platform's own app"]
    W["One live watcher per account<br/>holds the platform's push channel"]
    DB[("log.db<br/>every event, once")]
    V["Derived tables<br/>messages, people, media text,<br/>transcripts, search"]
    P["logMcp<br/>reload proxy"]
    M["log MCP server"]
    K["Hooks<br/>put new messages in front of the agent"]
  end
  subgraph agents["Your agent"]
    C["Claude Code, Codex or Cursor"]
  end
  X & D & S & I -- "push: new message, reaction, media" --> W
  W -- "append once" --> DB
  DB --> V
  C -- "tool call" --> P --> M
  M -- "reads in about 1 ms" --> V
  M -- "send, react, voice note" --> H --> X & D & S & I
  V --> K --> C
```

In plain words:
1. **One session per account.** Each account keeps one open session, the same way the platform's own app does. log never opens a new one for each command.
2. **One watcher per account.** It holds the platform's own push channel (X Chat's socket, Discord's gateway, Slack's socket, Instagram's realtime connection). Everything that arrives is written to `log.db` once, as an event.
3. **Everything else is worked out from those events.** That covers the chats, who said what, what a picture or video shows, what a voice note said, and the search index. The chats and messages can be rebuilt from the events at any time.
4. **Your agent asks the database, not the platform.** A tool call reads the database. The platform is only called to send something, or to catch up after a gap.
5. **Hooks push new things to your agent.** When someone writes, the agent sees it in its context straight away, without asking.

### How your agent connects, and why you never restart it

```mermaid
sequenceDiagram
  participant C as Claude Code
  participant P as logMcp, the reload proxy
  participant A as log server, old code
  participant B as log server, new code
  C->>P: initialize, then tool calls over stdio
  P->>A: passes every call through
  Note over P: log's code changes on disk
  P->>P: waits until no call or job is running
  P->>B: starts the new server and replays initialize
  B-->>P: ready
  P->>A: stops the old server
  P-->>C: tools/list_changed
  C->>P: next tool call
  P->>B: runs on the new code
```

Claude Code starts `logMcp` once. `logMcp` is a small proxy that never exits, and it runs the real server as a child process. When log's code changes, it waits until nothing is running, starts the new code, and swaps it in. A long job, like a queue sending over an hour, is never cut off. Your agent keeps working without a restart. This design was picked from four open-source options by a SubQ matrix ([`docs/decisions/mcpReload`](docs/decisions/mcpReload)).

### What happens when someone messages you

```mermaid
sequenceDiagram
  participant F as Their app
  participant W as Your account's watcher
  participant DB as log.db
  participant K as Hook
  participant A as Your agent
  participant H as Your account's session
  F->>W: new message, pushed by the platform
  W->>DB: append the event once, with its id
  K->>DB: read what is new since this agent last looked
  K-->>A: NEW MESSAGE, who said what
  A->>DB: claim the chat, so no other agent answers it
  A->>DB: read the conversation, about 1 ms
  A->>H: send the reply through the one session
  H-->>DB: the platform's answer, recorded with the reply
```

Two agents can work at the same time. Only the one that claims a chat can answer it, and every claim, send and release is written down in `log.db`.

### Pictures, voice notes and videos

Every model can read text, even one that can't see images. So every piece of media is turned into text when it arrives and kept in `log.db` with one small preview picture. No media file stays on disk.

```mermaid
flowchart LR
  IN["A picture, voice note or video arrives"] --> REC["Kept in log.db: size, length, a small preview"]
  REC --> PIC["Picture: what is in it,<br/>its words read out"]
  REC --> AUD["Voice note: what was said"]
  REC --> VID["Video: cut where the picture changes,<br/>each scene described,<br/>its sound transcribed"]
  PIC & AUD & VID --> TXT["One line of text<br/>any model can read"]
  TXT --> DEL["The downloaded file is deleted"]
  TXT --> VIEW["A model that can see<br/>asks media view for the preview"]
```

A video with someone talking reads like this:

```text
[video 0:32, 4 scenes, speech: [0:00-0:08] screen: a whiteboard that says "Q4 plan" | speech: "so this is the plan" · ...]
```

A video with no sound, like motion graphics, says `no sound` and is told by what changes on screen. This design takes the best part of three open-source systems that a SubQ matrix ranked out of 17 found on GitHub:
- [openclaw](https://github.com/openclaw/openclaw): every piece is turned into text when it arrives, with a fallback when one model fails.
- [screenpipe](https://github.com/screenpipe/screenpipe): the text rows stay and the media goes.
- [RAG-Anything](https://github.com/HKUDS/RAG-Anything): a video is told scene by scene, with the words on screen.

### The models it uses

Two models run on your own machine, with no key. Four are hosted, and each needs its key:

| Model | Runs | What it does |
|---|---|---|
| all-MiniLM-L6-v2 (23 MB) | your machine | meaning search over every conversation, your voice index, matching what you typed to a play |
| LFM2.5-VL-450M (352 MB) | your machine | describes every picture and video frame as text |
| SubQ `subq-snap-1.1` | hosted, `SUBQ_API_KEY` | the voice gate: does a draft sound like you |
| Jina embeddings v5 and reranker v3.5 | hosted, `JINA_API_KEY` | the AI tells check, and ranking a chat's history for the gate |
| AssemblyAI | hosted, `ASSEMBLYAI_API_KEY` | what was said in a voice note or a video |
| Inworld or Fish Audio | hosted, `INWORLD_API_KEY` or `FISH_API_KEY` | a voice note in your cloned voice, only when you ask |

```mermaid
flowchart LR
  IN["A message arrives"] --> DB[("log.db")]
  IN -->|picture or video| VL["LFM2.5-VL, your machine"] --> DB
  IN -->|voice| AA["AssemblyAI"] --> DB
  DB --> ML["MiniLM, your machine"] --> IDX["search and voice indexes"]
  IDX --> DRAFT["your agent drafts"] --> GATE["voice gate: SubQ and Jina"] --> SEND["sent as you"]
```

**What your machine needs,** measured here on 2026-11-09 (16 threads, CPU only):
- **A 64-bit machine.** There's no GPU: both local models run on the CPU.
- **About 2 GB of free memory.** The picture model peaked at 1.25 GB and takes 6 to 7 s a picture. It stops itself past 4 GB.
- **About 400 MB of disk** for the two models, downloaded the first time they're needed.
- **ffmpeg on your PATH** for videos and voice notes.

**Building the indexes** on a new machine, in this order:
1. `log search index` reads every conversation once and builds the keyword and meaning indexes.
2. `log voice index` builds your voice from what step 1 saved.
3. `log voice aiIndex` builds the AI tells check.

After that, new messages are added as they arrive, and pictures are described as they land.

Each model, its numbers and how each index works: [docs/models.md](docs/models.md).

### Built on Designing Data-Intensive Applications

The storage follows the ideas in Martin Kleppmann's *Designing Data-Intensive Applications* (DDIA):

| DDIA idea | What it means | Where it is in log |
|---|---|---|
| The system of record | One place holds the truth, written once | the `events` table: every message, reaction and notification, appended once by its id |
| Derived data | Everything else is worked out from the record, and can be rebuilt | chats, messages, people and who did what, checked and rebuilt from the events by `log storage verify` and `log storage rebuild`; media text and transcripts are kept beside them |
| Idempotence | Doing something twice has the same effect as once | an event is stored by its id, a transcript by its audio's hash, a media row by its message and name |
| Fencing | An old process that wakes up late can't overwrite the new one's work | each account's watcher holds a generation number, and a replaced one's writes are refused |
| Big files outside the database | Keep the bytes in a file store and only a small pointer in the database | log goes one step further: it keeps only the text and a small preview, and drops the file |

### How fast it is

Measured on this project's own `log.db` on 2026-11-08, not estimated:

| What | p50 | p95 | p99 | p99.9 | Measured with |
|---|---|---|---|---|---|
| Read a Discord chat from `log.db` (1,000 reads) | 0.6 ms | 1.1 ms | 1.6 ms | 3.1 ms | `bun scripts/inbox/benchDbRead.ts` |
| Claim a chat so no other agent answers it | 1 ms | 5 ms | 16 ms | 27 ms | `log timing` (79 claims) |
| Lock the account for one call | 0.2 ms | 0.3 ms | 0.4 ms | 0.5 ms | `log timing` (62 calls) |
| Match what you typed to a play (in the warm service) | 12 ms | 36 ms | 47 ms | n/a | `bun scripts/useCases/benchRouter.ts` |
| Read the same Discord chat from Discord itself | 2.3 s | 3.6 s | 5.1 s | 6.0 s | `log timing` (190 reads) |

That last row is why log reads its own database: asking the platform takes thousands of times longer. Sends are slower again, on purpose. Each account keeps human pacing between actions, and a refusal from a platform stops the run.

Every call is timed: `log timing` shows p50, p95 and p99 for every tool and each step inside it, and `log timing --call <id>` shows one call step by step.

### Why local first

- **Fast.** Your agent reads a conversation in milliseconds, not seconds.
- **Gentle on your accounts.** The platform isn't asked again every time your agent looks something up. One account was disabled after an agent read a server too much, too fast (rule 94), and reading from `log.db` keeps that from happening.
- **Yours.** Your messages, sessions and media text stay on your machine in one file you can back up.
- **Shareable when you need it.** Accounts can live in [Twenty](docs/twenty.md) so several machines share them. A hosted version, with a login per user, is planned.

## CLI

```bash
log --help                                        # every command
log <platform> session check --account <a>        # is the session still signed in?
log twitter dms --account <a> [--with <handle>]   # the inbox, or one person in full
log twitter dm --account <a> --userId <id> --text "<message>" [--live --approvedBy <who>]
log twitter queue build|plan|run                  # several sends, at random times
log discord read|send --account <a> --channel "<chat>"
log slack read|send --account <a> --channel "<chat>"
log instagram dms|send --account <a>
log voice --to <handle> --text "<draft>"          # check a draft against your voice
log search "<query>"                              # search every conversation
log inbox                                         # claim a chat, see what was done in it
```

Every command, flag, MCP tool and hook: [docs/reference.md](docs/reference.md).

## Documentation

The full docs are at **[log.listeningkit.com/docs](https://log.listeningkit.com/docs)**, built from [docs/](docs/README.md):

| Tab | What's in it |
|---|---|
| Get started | [install](docs/install.md), [add your accounts](docs/accounts.md), [connect your agent](docs/mcp.md), [using log well](docs/usingLog.md) |
| Use cases | [the plays, step by step](docs/useCases/README.md) |
| Platforms | [X](docs/platformGuides/x.md), [Discord](docs/platformGuides/discord.md), [Slack](docs/platformGuides/slack.md), [Facebook](docs/platformGuides/facebook.md), [Reddit](docs/platformGuides/reddit.md) and [LinkedIn](docs/platformGuides/linkedin.md) |
| Reference | [every command, MCP tool and hook](docs/reference.md), [error codes](docs/errorCatalog.md), [agent guides](docs/guides) |
| How it works | [how log decides what happened](docs/howItWorks.md), [the models it uses](docs/models.md), Twenty, browsers, proxies, each platform's API and the diagrams |

Where each page sits is set in [docs/site.json](docs/site.json), and a commit check refuses a page that isn't placed.

## Development

```bash
git clone https://github.com/matthewdonsemail-lab/log
cd log
bun install    # also installs the git hooks
bun link       # puts this checkout's log and logMcp on your PATH
bun run check
```

Every commit and push runs the same checks CI does (lefthook): the docs and reference match the code, the naming and layout are right, there are no comments in code, the specs hold, and the tests pass. The rules agents work by are in [AGENTS.md](AGENTS.md).

## License

MIT

## Star history

<a href="https://star-history.com/#matthewdonsemail-lab/log&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=matthewdonsemail-lab/log&type=Date&theme=dark" />
    <img src="https://api.star-history.com/svg?repos=matthewdonsemail-lab/log&type=Date" alt="Stargazers of matthewdonsemail-lab/log over time" width="100%" />
  </picture>
</a>
