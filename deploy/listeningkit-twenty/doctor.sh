#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

[[ -f .env ]] || { echo "missing .env"; exit 1; }

echo "Docker services:"
compose_profiles=()
if grep -q '^CLOUDFLARED_TOKEN=' .env; then
  compose_profiles+=(--profile cloudflare)
elif grep -q '^NEWSLETTER_RELAY_TOKEN=' .env && grep -q '^TWENTY_API_KEY=' .env; then
  compose_profiles+=(--profile relay)
fi
if grep -q '^BUZZ_BRIDGE_PRIVATE_KEY=' .env; then
  compose_profiles+=(--profile bridge)
fi
docker compose "${compose_profiles[@]}" ps

echo
echo "Local HTTP check:"
status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:3000 || true)"
[[ "$status" =~ ^(200|301|302|307|308)$ ]] || { echo "failed (HTTP ${status:-none})"; exit 1; }
echo "ok (HTTP $status)"

echo
echo "Tailscale Serve:"
tailscale serve status

if grep -q '^NEWSLETTER_RELAY_TOKEN=' .env; then
  echo
  echo "Newsletter relay:"
  relay_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8787/healthz || true)"
  [[ "$relay_status" == "200" ]] || { echo "failed (HTTP ${relay_status:-none})"; exit 1; }
  echo "local health ok"
fi

if grep -q '^CLOUDFLARED_TOKEN=' .env; then
  echo
  echo "Cloudflare routes:"
  dashboard_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 https://twenty.listeningkit.com || true)"
  relay_public_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 \
    -X POST -H 'Content-Type: application/json' --data '{}' \
    https://newsletter-relay.listeningkit.com/v1/newsletter/subscribe || true)"
  [[ "$dashboard_status" == "401" ]] || { echo "dashboard gate failed (HTTP ${dashboard_status:-none})"; exit 1; }
  [[ "$relay_public_status" == "401" ]] || { echo "relay gate failed (HTTP ${relay_public_status:-none})"; exit 1; }
  echo "dashboard and relay reject unauthenticated requests"
elif grep -q '^NEWSLETTER_RELAY_TOKEN=' .env; then
  tailscale funnel status
fi

if grep -q '^BUZZ_BRIDGE_PRIVATE_KEY=' .env; then
  echo
  echo "Buzz-Twenty bridge:"
  bridge_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:8790/healthz || true)"
  [[ "$bridge_status" == "200" ]] || { echo "failed (HTTP ${bridge_status:-none})"; exit 1; }
  echo "local health ok"
fi

echo
echo "Capacity:"
free -h | awk 'NR <= 2'
df -h . | awk 'NR <= 2'
