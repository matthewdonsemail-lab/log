#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
umask 077

[[ -f .env ]] || { echo "Run ./install.sh first." >&2; exit 1; }
docker compose ps --status running server >/dev/null 2>&1 \
  || { echo "Twenty is not running." >&2; exit 1; }

source_host="${SOURCE_TWENTY_HOST:-deepman@node01.tail4fcf85.ts.net}"
source_url="${SOURCE_TWENTY_URL:-http://127.0.0.1:3005}"
source_key="${SOURCE_TWENTY_API_KEY:-}"

read -rsp "New ListeningKit Twenty API key: " target_key
echo
[[ -n "$target_key" ]] || { echo "The new API key is required." >&2; exit 1; }

cat <<EOF
This will create the Newsletter Members schema in the new local Twenty and
copy the existing newsletter list from node01. Email addresses will not be
printed or written to an export file.
EOF
read -rp "Type MIGRATE to continue: " confirmation
[[ "$confirmation" == "MIGRATE" ]] || { echo "Cancelled."; exit 0; }

if [[ -n "$source_key" ]]; then
  SOURCE_TWENTY_URL="$source_url" \
  SOURCE_TWENTY_API_KEY="$source_key" \
  TARGET_TWENTY_URL="http://127.0.0.1:3000" \
  TARGET_TWENTY_API_KEY="$target_key" \
  python3 ./migrate_newsletter.py
else
  echo "Streaming source records through Tailscale SSH without an export file."
  tailscale ssh "$source_host" '
    set -euo pipefail
    key=$(awk -F= '\''$1 == "TWENTY_API_KEY" { sub(/^[^=]*=/, ""); gsub(/^[\047\042]|[\047\042]$/, ""); print; exit }'\'' /home/deepman/services/twenty/.env.local)
    curl -fsS --max-time 60 -H "Authorization: Bearer $key" "http://127.0.0.1:3005/rest/agencyNewsletterMembers?limit=1000"
    unset key
  ' | SOURCE_TWENTY_STDIN=1 \
    TARGET_TWENTY_URL="http://127.0.0.1:3000" \
    TARGET_TWENTY_API_KEY="$target_key" \
    python3 ./migrate_newsletter.py
fi

unset source_key target_key SOURCE_TWENTY_API_KEY TARGET_TWENTY_API_KEY
echo "Migration complete. Verify Newsletter Members in the new dashboard before changing production integrations."
