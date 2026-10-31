# Install

## One line

macOS and Linux:

```bash
curl -fsSL https://log.listeningkit.com/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://log.listeningkit.com/install.ps1 | iex
```

The installer is safe to run again. It:

- installs [Bun](https://bun.sh) if you don't have it
- installs the `log` and `logMcp` commands
- installs its own Python 3.12 in `~/.logCli/python`, for the platform engines
- writes your settings to `~/.logCli/.env`, with your accounts kept locally on your machine

Check it worked:

```bash
log --help
```

On macOS the system already has a `log` command. After installing Bun, Bun's folder (`~/.bun/bin`) comes first on your PATH, so `log` is this one. Check with `which log`.

## With npm or Bun

If you already have Bun, install just the commands:

```bash
bun add -g @listeningkit/log
```

This skips the Python setup, so the one-line installer is the easier route.

## Settings

Settings live in `~/.logCli/.env`. Two are set for you:

- `LOG_PYTHON`: the Python the engines run on
- `LOG_ACCOUNTS=local`: your accounts live in `~/.logCli/localAccounts.json`

Everything else is optional: captcha solvers, proxies, AdsPower (for platforms that run in a browser) and [Twenty](twenty.md) (for many accounts). Every key is listed in [`.env.example`](../.env.example). A `.env.local` in the folder you run from wins over `~/.logCli/.env`.

Next: [add your accounts](accounts.md).

## From source

To work on log itself:

```bash
git clone https://github.com/matthewdonsemail-lab/log
cd log
bun install                      # also installs the git hooks
uv venv --python 3.12 .venv
uv pip install --python .venv -r vendor/twikit/requirements.txt ./vendor/fbk ./vendor/endcord
cp .env.example .env.local       # set LOG_PYTHON to .venv's python, and LOG_ACCOUNTS=local
bun link                         # puts this checkout's log and logMcp on your PATH
log --help
```

Claude Code and Codex opened in the checkout pick up `.mcp.json`, which runs the MCP server from the source. Encrypted X Chat also needs its wheel from `vendor/chatXdk`.
