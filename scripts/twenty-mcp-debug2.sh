#!/bin/bash
# Debug: run the bridge with set -x to see what happens on each iteration.
b64in='@@B64IN@@'
echo "$b64in" | base64 -d > /tmp/inp.json
cat > /tmp/dbg-bridge.sh <<'EOF'
#!/bin/bash
set -x
SESSION_ID=""
while IFS= read -r line; do
  [ -z "$line" ] && break
  echo "--- line: $line" >&2
  curl -sS --max-time 30 -X POST \
    -H 'Content-Type: application/json' \
    -H 'Accept: application/json, text/event-stream' \
    ${SESSION_ID:+-H "mcp-session-id: $SESSION_ID"} \
    --data "$line" \
    -D /tmp/h.txt \
    -o /tmp/b.txt \
    http://127.0.0.1:13010/mcp || true
  echo "--- headers:" >&2
  cat /tmp/h.txt >&2
  SESSION_ID=$(grep -i '^mcp-session-id:' /tmp/h.txt | tr -d '\r' | awk -F': ' '{print $2}')
  echo "--- session: $SESSION_ID" >&2
  OUT=""
  while IFS= read -r resp_line; do
    case "$resp_line" in
      "data: "*)
        payload="${resp_line#"data: "}"
        OUT="$payload"
        ;;
    esac
  done < /tmp/b.txt
  [ -n "$OUT" ] && echo "$OUT"
done
EOF
bash /tmp/dbg-bridge.sh < /tmp/inp.json
