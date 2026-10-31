# Install and settings

## Install in one line

macOS and Linux:

```bash
curl -fsSL https://log.listeningkit.com/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://log.listeningkit.com/install.ps1 | iex
```

What the installer does (it's safe to run again):
1. installs [Bun](https://bun.sh) if you don't have it
2. installs the `log` and `logMcp` commands (`bun add -g @listeningkit/log`)
3. installs Python 3.12 with [uv](https://docs.astral.sh/uv), in its own folder at `~/.logCli/python`, with everything the X, Reddit, Discord and Facebook engines need
4. writes your settings to `~/.logCli/.env`: `LOG_PYTHON` pointing at that Python, and `LOG_ACCOUNTS=local` so your accounts live in `~/.logCli/localAccounts.json` on your machine

Nothing leaves your machine. Already have Bun? `bun add -g @listeningkit/log` installs the commands on their own.

On macOS, the system already has a `log` command. Bun's folder (`~/.bun/bin`) comes first on your PATH after installing Bun, so `log` is this one. Check with `which log`.

## Add an account, then check it's signed in

The cookies are typed into a masked prompt, never passed as flags.

```bash
log localAccount add --platform twitter --account <name>
log twitter cookies save --account <name>      # paste the account's cookies when it asks
log twitter session check --account <name>     # X's own answer: loggedIn, loggedOut or restricted
```

## Use it from your agent

Add the MCP server to Claude Code, Codex or any MCP client. The command is `logMcp`. The first call is `getGuide({ topic: "logMcpInstructions" })`, which lists every use case.

```bash
claude mcp add log -- logMcp
```

Every command takes `--json` and never prompts, so scripts and agents can call it. `log launch` gives a guided menu. Every command and flag is in [the reference](reference.md), generated from the code.

## Settings

Settings come from `~/.logCli/.env`. A `.env.local` in the folder you run from wins over it. Every key is in [`.env.example`](../.env.example), and every one beyond `LOG_PYTHON` and `LOG_ACCOUNTS` is optional:
- captcha solvers
- proxies
- AdsPower, for the platforms that run in a browser
- Twenty, for many accounts

## From source (to work on log)

```bash
git clone https://github.com/matthewdonsemail-lab/log
cd log
bun install      # also installs the git hooks (lefthook): every commit runs the same checks we do
uv venv --python 3.12 .venv
uv pip install --python .venv -r vendor/twikit/requirements.txt ./vendor/fbk ./vendor/endcord
cp .env.example .env.local      # set LOG_PYTHON to .venv's python, and LOG_ACCOUNTS=local
bun link       # puts this checkout's log and logMcp on your PATH
log --help
```

`.mcp.json` runs the MCP server from the checkout (`bun bin/logMcp.ts`), so Claude Code or Codex opened in the folder sees every tool. X Chat (encrypted DMs) also needs its wheel, `vendor/chatXdk/wheels/` on Windows, or built from `vendor/chatXdk` elsewhere.

`LOG_PYTHON` points at the Python with the vendored clients' dependencies
(curl_cffi and the rest); the direct-API engines and their tests run on it.
