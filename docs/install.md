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

## Setup

When the installer finishes in a terminal, it runs `log launch --setup`, the setup wizard. Run it again any time:

```bash
log launch --setup
```

It goes in this order:

1. **Platforms.** Tick the platforms you want with Space, then press Enter. For each one you add the account and sign it in: the masked cookie prompt for X, LinkedIn and Slack, the account's browser on Reddit, Discord and Instagram, and connecting a Facebook account.
2. **AdsPower,** when a platform you ticked runs in a browser. It opens AdsPower's sign-up page ([adspower.com/share/pD25Iu](https://www.adspower.com/share/pD25Iu)), asks for its Local API key (leave it empty if the Local API has none), and checks that the Local API answers.
3. **Extensions.** Tick the ones you want. Each opens its sign-up page in your browser, then signs in or asks for its key:

| Extension | Sign up | How it connects | Saved as |
| --- | --- | --- | --- |
| [treg](extensions/treg.md) | [treg.to](https://treg.to/?ref=matthewdonse-aebsh) | `treg login` opens your browser to sign in | treg's own sign-in |
| [Memelord](extensions/memelord.md) | [memelord.com](https://www.memelord.com/sign-up?ref=kfwut9wc) | API key, from Settings, Developer | `MEMELORD_API_KEY` |
| [Inworld](extensions/inworld.md) | [inworld.ai](https://inworld.ai/signup?ref=FSNLMJ2H) (subscribe through it for $10 in credits) | API key, from Settings, API Keys | `INWORLD_API_KEY` |
| [Fish Audio](extensions/fishAudio.md) | [fish.audio](https://fish.audio/?aff=Q6W4DNSLJCSXG) | API key, from API Keys | `FISH_API_KEY` |

4. **Summary.** What was set up, what was skipped and how to finish it.

Keys go in `~/.logCli/.env` and are never printed. Set `LOG_SETUP=0` to install without the wizard. There's no log account to sign in to. To add accounts by hand, read [add your accounts](accounts.md).

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
