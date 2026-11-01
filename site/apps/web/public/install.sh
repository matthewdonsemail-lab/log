#!/bin/sh
set -eu

say() { printf '\033[1mlog:\033[0m %s\n' "$1"; }
fail() { printf '\033[31mlog:\033[0m %s\n' "$1" >&2; exit 1; }

LOG_HOME="${LOG_HOME:-$HOME/.logCli}"
PACKAGE="${LOG_PACKAGE:-@listeningkit/log}"
mkdir -p "$LOG_HOME"

if ! command -v bun >/dev/null 2>&1; then
  say "installing Bun"
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  export PATH="$BUN_INSTALL/bin:$PATH"
fi
command -v bun >/dev/null 2>&1 || fail "Bun didn't install. Install it from https://bun.sh and run this again."

say "installing $PACKAGE"
bun add -g "${LOG_PACKAGE_SOURCE:-$PACKAGE}"
GLOBAL_DIR=$(bun pm ls -g 2>/dev/null | head -n 1 | sed 's/ node_modules .*$//')
ROOT="$GLOBAL_DIR/node_modules/$PACKAGE"
[ -f "$ROOT/package.json" ] || ROOT="${BUN_INSTALL:-$HOME/.bun}/install/global/node_modules/$PACKAGE"
[ -f "$ROOT/package.json" ] || fail "couldn't find $PACKAGE in Bun's global folder ($GLOBAL_DIR)"

if ! command -v uv >/dev/null 2>&1; then
  say "installing uv (it installs and manages Python)"
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
fi
command -v uv >/dev/null 2>&1 || fail "uv didn't install. Install it from https://docs.astral.sh/uv and run this again."

say "setting up Python 3.12 for the engines in $LOG_HOME/python"
uv python install 3.12
[ -d "$LOG_HOME/python" ] || uv venv --python 3.12 "$LOG_HOME/python"
PYTHON="$LOG_HOME/python/bin/python"
uv pip install --python "$PYTHON" -r "$ROOT/vendor/twikit/requirements.txt" "$ROOT/vendor/fbk" "$ROOT/vendor/endcord"

ENV_FILE="$LOG_HOME/.env"
touch "$ENV_FILE"
grep -q '^LOG_PYTHON=' "$ENV_FILE" || printf 'LOG_PYTHON=%s\n' "$PYTHON" >> "$ENV_FILE"
grep -q '^LOG_ACCOUNTS=' "$ENV_FILE" || printf 'LOG_ACCOUNTS=local\n' >> "$ENV_FILE"

say "done. Your settings are in $ENV_FILE and your accounts will live in $LOG_HOME."
say "next: log localAccount add --platform twitter --account <name>"
log --help >/dev/null 2>&1 && say "log is on your PATH" || say "open a new terminal so 'log' is on your PATH"
