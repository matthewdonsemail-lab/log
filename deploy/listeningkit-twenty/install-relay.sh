#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
umask 077

[[ -f .env ]] || { echo "Run ./install.sh first." >&2; exit 1; }
[[ -f newsletter-relay.mjs ]] || { echo "newsletter-relay.mjs is missing." >&2; exit 1; }

if ! grep -q '^TWENTY_API_KEY=' .env; then
  read -rsp "ListeningKit Twenty API key: " twenty_api_key
  echo
  [[ -n "$twenty_api_key" ]] || { echo "The Twenty API key is required." >&2; exit 1; }
  printf '\nTWENTY_API_KEY=%s\n' "$twenty_api_key" >> .env
  unset twenty_api_key
fi

if ! grep -q '^NEWSLETTER_RELAY_TOKEN=' .env; then
  printf 'NEWSLETTER_RELAY_TOKEN=%s\n' "$(openssl rand -hex 32)" >> .env
fi
chmod 600 .env

node --test newsletter-relay.test.mjs
docker compose --profile relay pull newsletter-relay
docker compose --profile relay up -d newsletter-relay

printf 'Waiting for the local newsletter relay'
for _ in $(seq 1 60); do
  if curl -fsS --max-time 3 http://127.0.0.1:8787/healthz >/dev/null; then
    echo
    break
  fi
  printf '.'
  sleep 2
done
curl -fsS --max-time 3 http://127.0.0.1:8787/healthz >/dev/null \
  || { echo "Newsletter relay did not become healthy." >&2; exit 1; }

if grep -q '^CLOUDFLARED_TOKEN=' .env; then
  endpoint="https://newsletter-relay.listeningkit.com/v1/newsletter/subscribe"
else
  if ! tailscale funnel status 2>/dev/null | grep -Fq 'proxy http://127.0.0.1:8787'; then
    if sudo -n true 2>/dev/null; then
      sudo tailscale funnel --yes --bg --https=8443 http://127.0.0.1:8787 >/dev/null
    else
      cat >&2 <<EOF
The relay is healthy locally, but publishing its narrow endpoint requires:
  sudo tailscale funnel --yes --bg --https=8443 http://127.0.0.1:8787
Run that command, then rerun ./doctor.sh.
EOF
      exit 2
    fi
  fi
  endpoint="https://$(tailscale status --self --json | python3 -c 'import json,sys; print(json.load(sys.stdin)["Self"]["DNSName"].rstrip("."))'):8443/v1/newsletter/subscribe"
fi

cat <<EOF
Newsletter relay is running at:
  $endpoint

The relay requires its generated bearer token. The token and Twenty API key remain
only in the mode-600 .env file.
EOF
