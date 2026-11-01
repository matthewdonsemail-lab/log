<p align="center">
  <img src="banner.png" alt="log: run your social accounts from the command line or your AI agent" width="100%" />
</p>

# log

<p align="center">
  <a href="https://www.npmjs.com/package/@listeningkit/log"><img src="https://img.shields.io/npm/v/@listeningkit/log.svg?style=flat-square" alt="npm: @listeningkit/log" /></a>
  <a href="https://log.listeningkit.com"><img src="https://img.shields.io/badge/Site-log.listeningkit.com-success.svg?style=flat-square" alt="log.listeningkit.com" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="docs/mcp.md"><img src="https://img.shields.io/badge/Protocol-Model%20Context%20Protocol%20(MCP)-purple.svg?style=flat-square" alt="Model Context Protocol" /></a>
  <a href="https://app.ona.com/#https://github.com/matthewdonsemail-lab/log"><img src="https://ona.com/build-with-ona.svg" alt="Build with Ona" /></a>
</p>

**log runs your social accounts from the command line, or from your AI agent.** It reads and acts on X, Reddit, Facebook and Discord (conversations, replies, DMs, Marketplace listings and groups), and signs in to LinkedIn. It's one command, `log`, and one MCP server, `logMcp`. It runs on your own machine with your own accounts, and it's free and open source.

## Why use it

- **Find the people already asking for what you do.** Read your DMs, the replies under your posts, groups and Marketplace, and see who's waiting on you and what they want.
- **Answer them in your own voice.** Drafts are written from how you already talk to each person, and nothing is sent until you say so.
- **Run many accounts without paying for a SaaS.** Your accounts and sessions stay in `~/.logCli` on your machine.
- **Let your agent do the legwork.** Claude Code, Codex or Cursor runs the same commands through the MCP server.

## Install

macOS and Linux:

```bash
curl -fsSL https://log.listeningkit.com/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://log.listeningkit.com/install.ps1 | iex
```

This installs the `log` and `logMcp` commands, and Python with everything the platform engines need. It writes your settings to `~/.logCli/.env`. Already have [Bun](https://bun.sh)? Then `bun add -g @listeningkit/log` installs the commands on their own. More: [docs/install.md](docs/install.md).

## Get started

**1. Add an account and sign it in.** Export the account's cookies from your browser with a cookie extension, then paste them when log asks. They're typed into a masked prompt and never passed as flags.

```bash
log localAccount add --platform twitter --account <name>
log twitter cookies save --account <name>
log twitter session check --account <name>
```

The last line asks the platform itself whether the session is signed in.

**2. Use it.** For example:

```bash
log twitter dms --account <name>           # who's waiting on you, and what they asked
log twitter session check --account <name>
log --help                                 # every command
```

**3. Hand it to your agent.**

```bash
claude mcp add log -- logMcp
```

Then ask in plain words: *"read my X DMs and tell me who's waiting on me"*. Codex, Cursor and other clients: [docs/mcp.md](docs/mcp.md).

## How we use it

We run log every day from Claude Code. The agent loads log's guide, then works through the MCP tools:
- reading the X inbox and following up with everyone who's waiting
- answering the people who engaged with a post
- DMing the people who liked one
- keeping Marketplace listings live across local accounts
- listening to local Facebook groups for people asking for a service

Each of those is a [use case](docs/useCases/README.md), written step by step: what to run, and what tells you each step worked. So you can run the same play.

## Getting the most out of it

- **Start from a use case** and follow it, rather than calling commands one by one.
- **Nothing acts until you say so.** Every command that changes something on a platform is a dry run unless you add `--live`. Over MCP it's a separate `…Live` tool that needs your confirmation.
- **Keep it human.** Each account has its own daily limits, pacing and local waking hours, and log sticks to them.
- **Many accounts?** Keep them in [Twenty](docs/twenty.md), an open-source CRM. Every machine, agent and teammate then sees the same accounts, and you can edit them by hand.

## Documentation

The full docs are at [log.listeningkit.com/docs](https://log.listeningkit.com/docs), built from [docs/](docs/README.md):

| Tab | What's in it |
|---|---|
| Get started | [install](docs/install.md), [add your accounts](docs/accounts.md), [connect your agent](docs/mcp.md), [using log well](docs/usingLog.md) |
| Use cases | [the plays, step by step](docs/useCases/README.md) |
| Platforms | what you can do on [X](docs/platformGuides/x.md), [Reddit](docs/platformGuides/reddit.md), [Facebook](docs/platformGuides/facebook.md), [Discord](docs/platformGuides/discord.md) and [LinkedIn](docs/platformGuides/linkedin.md) |
| Reference | [every command, MCP tool and hook](docs/reference.md), [error codes](docs/errorCatalog.md), [agent guides](docs/guides) |
| How it works | [how log decides what happened](docs/howItWorks.md), Twenty, browsers, proxies, each platform's API and the diagrams |

Where each page sits is set in [docs/site.json](docs/site.json), and a commit check refuses a page that isn't placed.

## Contributing

```bash
git clone https://github.com/matthewdonsemail-lab/log
cd log
bun install    # also installs the git hooks
bun link       # puts this checkout's log and logMcp on your PATH
```

Every commit and push runs the same checks we do (lefthook). They check that:
- the docs and the reference match the code
- the naming and layout are right
- there are no comments in code
- the tests pass

The rules agents work by are in [AGENTS.md](AGENTS.md).

## License

MIT
