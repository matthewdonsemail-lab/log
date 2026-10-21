#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
umask 077

BUZZ_VERSION="0.5.28"
BUZZ_DEB_URL="https://github.com/block/buzz/releases/download/desktop-v${BUZZ_VERSION}/Buzz_${BUZZ_VERSION}_amd64.deb"
BUZZ_DEB_SHA256="53609fa586a787871f080b0bfce679633e457f650982411c81ba104648c388cb"
DEFAULT_RELAY_URL="https://listeningkitorg.communities.buzz.xyz"
DEFAULT_CHANNEL_ID="3fc0d09e-36bf-4bf6-8def-de22a42630ac"

[[ -f .env ]] || { echo "Run ./install.sh first." >&2; exit 1; }
[[ -f buzz-twenty-bridge.mjs ]] || { echo "buzz-twenty-bridge.mjs is missing." >&2; exit 1; }
[[ -f setup_buzz_bridge.py ]] || { echo "setup_buzz_bridge.py is missing." >&2; exit 1; }

if [[ "${BUZZ_BRIDGE_CONFIG_STDIN:-0}" == "1" ]]; then
  IFS= read -r bridge_private_key
  IFS= read -r bridge_auth_tag
  IFS= read -r bridge_pubkey
  IFS= read -r bridge_twenty_key
else
  read -rsp "Dedicated Buzz bridge private key: " bridge_private_key; echo
  read -rsp "Buzz owner auth tag JSON (blank only if not required): " bridge_auth_tag; echo
  read -rp "Dedicated Buzz bridge public key: " bridge_pubkey
  read -rsp "Dedicated Twenty Buzz Bridge API key: " bridge_twenty_key; echo
fi

[[ "$bridge_private_key" =~ ^([0-9a-fA-F]{64}|nsec1[[:alnum:]]+)$ ]] || {
  echo "The Buzz private key is invalid." >&2; exit 1;
}
[[ "$bridge_pubkey" =~ ^[0-9a-fA-F]{64}$ ]] || {
  echo "The Buzz public key is invalid." >&2; exit 1;
}
[[ -n "$bridge_twenty_key" ]] || { echo "The Twenty API key is required." >&2; exit 1; }
for value in "$bridge_private_key" "$bridge_auth_tag" "$bridge_pubkey" "$bridge_twenty_key"; do
  [[ "$value" != *"'"* && "$value" != *$'\n'* && "$value" != *$'\r'* ]] || {
    echo "Bridge configuration contains unsupported quote or newline characters." >&2
    exit 1
  }
done
if [[ -n "$bridge_auth_tag" ]]; then
  AUTH_TAG="$bridge_auth_tag" python3 - <<'PY'
import json
import os
value = json.loads(os.environ["AUTH_TAG"])
if not isinstance(value, list):
    raise SystemExit("The Buzz auth tag must be a JSON array.")
PY
fi

mkdir -p bin bridge-data
chmod 700 bin bridge-data
if [[ ! -x bin/buzz ]]; then
  temporary_deb="$(mktemp --suffix=.deb)"
  temporary_extract="$(mktemp -d)"
  cleanup_download() { rm -f "$temporary_deb"; rm -rf "$temporary_extract"; }
  trap cleanup_download EXIT
  curl -fsSL --retry 3 --proto '=https' --tlsv1.2 -o "$temporary_deb" "$BUZZ_DEB_URL"
  printf '%s  %s\n' "$BUZZ_DEB_SHA256" "$temporary_deb" | sha256sum --check --status
  dpkg-deb --extract "$temporary_deb" "$temporary_extract"
  cli_path="$(find "$temporary_extract" -type f -name buzz -print -quit)"
  [[ -n "$cli_path" ]] || { echo "The pinned Buzz package did not contain the CLI." >&2; exit 1; }
  install -m 700 "$cli_path" bin/buzz
  cleanup_download
  trap - EXIT
fi

# The node image's unprivileged user is uid/gid 1000.
chown 1000:1000 bridge-data
chmod 700 bridge-data

export BRIDGE_PRIVATE_KEY="$bridge_private_key"
export BRIDGE_AUTH_TAG="$bridge_auth_tag"
export BRIDGE_PUBKEY="${bridge_pubkey,,}"
export BRIDGE_TWENTY_KEY="$bridge_twenty_key"
export BRIDGE_STARTED_AT="$(date +%s)"
export BRIDGE_RELAY_URL="${BUZZ_RELAY_URL:-$DEFAULT_RELAY_URL}"
export BRIDGE_CHANNEL_ID="${BUZZ_BRIDGE_CHANNEL_ID:-$DEFAULT_CHANNEL_ID}"
python3 - <<'PY'
import os
from pathlib import Path

path = Path(".env")
updates = {
    "BUZZ_RELAY_URL": os.environ["BRIDGE_RELAY_URL"],
    "BUZZ_BRIDGE_CHANNEL_ID": os.environ["BRIDGE_CHANNEL_ID"],
    "BUZZ_BRIDGE_PRIVATE_KEY": os.environ["BRIDGE_PRIVATE_KEY"],
    "BUZZ_BRIDGE_AUTH_TAG": os.environ["BRIDGE_AUTH_TAG"],
    "BUZZ_BRIDGE_PUBKEY": os.environ["BRIDGE_PUBKEY"],
    "BUZZ_BRIDGE_MENTION_LABEL": "Twenty CRM Bridge",
    "BUZZ_BRIDGE_STARTED_AT": os.environ["BRIDGE_STARTED_AT"],
    "BUZZ_BRIDGE_TWENTY_API_KEY": os.environ["BRIDGE_TWENTY_KEY"],
}
lines = path.read_text().splitlines()
seen = set()
out = []
for line in lines:
    name = line.split("=", 1)[0].strip() if "=" in line else ""
    if name in updates:
        value = updates[name]
        out.append(f"{name}='{value}'")
        seen.add(name)
    else:
        out.append(line)
for name, value in updates.items():
    if name not in seen:
        out.append(f"{name}='{value}'")
path.write_text("\n".join(out) + "\n")
path.chmod(0o600)
PY
unset bridge_private_key bridge_auth_tag bridge_pubkey bridge_twenty_key
unset BRIDGE_PRIVATE_KEY BRIDGE_AUTH_TAG BRIDGE_PUBKEY BRIDGE_TWENTY_KEY
unset BRIDGE_STARTED_AT BRIDGE_RELAY_URL BRIDGE_CHANNEL_ID

TARGET_TWENTY_URL="http://127.0.0.1:3000" \
TARGET_TWENTY_API_KEY="$(python3 - <<'PY'
from pathlib import Path
for line in Path('.env').read_text().splitlines():
    if line.startswith('BUZZ_BRIDGE_TWENTY_API_KEY='):
        value = line.split('=', 1)[1].strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        print(value)
        break
PY
)" python3 setup_buzz_bridge.py

docker compose --profile bridge config >/dev/null
docker compose --profile bridge up -d buzz-twenty-bridge
for _ in $(seq 1 30); do
  if curl -fsS --max-time 3 http://127.0.0.1:8790/healthz >/dev/null; then
    echo "Buzz-Twenty bridge is healthy."
    exit 0
  fi
  sleep 2
done

echo "Buzz-Twenty bridge did not become healthy." >&2
exit 1
