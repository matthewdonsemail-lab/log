#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
umask 077

[[ -f .env ]] || { echo "Run ./install.sh first." >&2; exit 1; }
mkdir -p backups
chmod 700 backups
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
tmp="backups/.${stamp}.partial"
out="backups/listeningkit-twenty-${stamp}"
mkdir "$tmp"

cleanup() { rm -rf "$tmp"; }
trap cleanup EXIT

docker compose exec -T postgres pg_dump -U twenty -d twenty | gzip -9 > "$tmp/database.sql.gz"
docker run --rm \
  -v listeningkit-twenty_local-storage:/source:ro \
  alpine:3 tar -C /source -czf - . > "$tmp/local-storage.tar.gz"
cp .env "$tmp/runtime.env"
chmod 600 "$tmp"/*
mv "$tmp" "$out"
trap - EXIT

cat <<EOF
Backup created at $out

It contains secrets and customer data. Move it to encrypted off-machine storage,
then remove the local copy after verifying the transfer.
EOF
