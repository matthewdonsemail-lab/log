#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
umask 077

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

command -v docker >/dev/null || fail "Docker Engine is not installed."
command -v tailscale >/dev/null || fail "Tailscale is not installed inside this Ubuntu VM."
command -v openssl >/dev/null || fail "openssl is not installed."
command -v python3 >/dev/null || fail "python3 is not installed."
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is not available."
docker info >/dev/null 2>&1 || fail "This user cannot access Docker."

read -r memory_kb < <(awk '/MemTotal/ { print $2 }' /proc/meminfo)
(( memory_kb >= 6 * 1024 * 1024 )) || fail "Allocate at least 8 GB RAM to the VM."
read -r available_kb < <(df -Pk . | awk 'NR == 2 { print $4 }')
(( available_kb >= 40 * 1024 * 1024 )) || fail "At least 40 GB free disk space is required."

tailscale_ip="$(tailscale ip -4 2>/dev/null || true)"
[[ -n "$tailscale_ip" ]] || fail "Connect this VM to Tailscale before running the installer."

dns_name="$(tailscale status --json | python3 -c 'import json,sys; print(json.load(sys.stdin).get("Self", {}).get("DNSName", "").rstrip("."))')"
[[ -n "$dns_name" ]] || fail "Tailscale MagicDNS did not provide a hostname."
twenty_url="https://${dns_name}"

if [[ ! -f .env ]]; then
  cat > .env <<EOF
TWENTY_IMAGE=twentycrm/twenty:v2.49.0
TWENTY_URL=${twenty_url}
POSTGRES_PASSWORD=$(openssl rand -hex 32)
ACCESS_TOKEN_SECRET=$(openssl rand -hex 32)
LOGIN_TOKEN_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
FILE_TOKEN_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
APP_SECRET=$(openssl rand -hex 32)
EOF
  chmod 600 .env
  echo "Generated .env with local secrets. Back it up securely; never commit or share it."
else
  configured_url="$(awk -F= '$1 == "TWENTY_URL" { sub(/^[^=]*=/, ""); print; exit }' .env)"
  [[ "$configured_url" == "$twenty_url" ]] || fail ".env belongs to ${configured_url:-an unknown host}, not ${twenty_url}."
  echo "Reusing the existing .env."
fi

mkdir -p backups
chmod 700 backups

docker compose pull
docker compose up -d

printf 'Waiting for Twenty at http://127.0.0.1:3000'
for _ in $(seq 1 360); do
  if curl --fail --silent --max-time 3 http://127.0.0.1:3000 >/dev/null 2>&1; then
    echo
    break
  fi
  printf '.'
  sleep 2
done
curl --fail --silent --max-time 5 http://127.0.0.1:3000 >/dev/null \
  || fail "Twenty did not become ready. Run: docker compose logs --tail=100 server worker"

if ! tailscale serve status 2>/dev/null | grep -Fq "proxy http://127.0.0.1:3000"; then
  if sudo -n true 2>/dev/null; then
    sudo tailscale serve --bg --https=443 http://127.0.0.1:3000 >/dev/null
  else
    cat >&2 <<EOF
Twenty is healthy, but publishing it requires one interactive administrator command:
  sudo tailscale serve --bg --https=443 http://127.0.0.1:3000
Run that command, then rerun ./doctor.sh.
EOF
    exit 2
  fi
fi

cat <<EOF

ListeningKit Twenty is running at:
  ${twenty_url}

Next steps:
  1. Open that address from a device on your tailnet.
  2. Create the first workspace and name it ListeningKit.
  3. Create an API key under Settings > MCP & APIs.
  4. Run ./migrate-newsletter.sh and enter that key when prompted.

No database or Redis port is exposed outside Docker. Twenty itself listens only
on localhost and is published through Tailscale Serve.
EOF
