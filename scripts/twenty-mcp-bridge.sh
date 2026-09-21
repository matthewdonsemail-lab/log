#!/bin/bash
# stdio->HTTP bridge for the Twenty MCP server (runs on node01).
# Reads JSON-RPC lines from stdin, POSTs each to the local MCP server,
# parses SSE responses, tracks mcp-session-id, writes one JSON result per line.
SESSION_ID=""
while IFS= read -r line; do
  [ -z "$line" ] && break
  HDRS_FILE="/tmp/mcp_hdrs_$$.txt"
  BODY_FILE="/tmp/mcp_body_$$.txt"
  if [ -n "$SESSION_ID" ]; then
    curl -sS --max-time 30 -X POST \
      -H 'Content-Type: application/json' \
      -H 'Accept: application/json, text/event-stream' \
      -H "mcp-session-id: $SESSION_ID" \
      --data "$line" \
      -D "$HDRS_FILE" \
      -o "$BODY_FILE" \
      http://127.0.0.1:13010/mcp || true
  else
    curl -sS --max-time 30 -X POST \
      -H 'Content-Type: application/json' \
      -H 'Accept: application/json, text/event-stream' \
      --data "$line" \
      -D "$HDRS_FILE" \
      -o "$BODY_FILE" \
      http://127.0.0.1:13010/mcp || true
  fi
  if [ -f "$HDRS_FILE" ]; then
    SESSION_ID=$(grep -i '^mcp-session-id:' "$HDRS_FILE" | tr -d '\r' | awk -F': ' '{print $2}')
    rm -f "$HDRS_FILE"
  fi
  if [ -f "$BODY_FILE" ]; then
    OUT=""
    while IFS= read -r resp_line; do
      case "$resp_line" in
        "data: "*)
          payload="${resp_line#"data: "}"
          OUT="$payload"
          ;;
      esac
    done < "$BODY_FILE"
    rm -f "$BODY_FILE"
    [ -n "$OUT" ] && echo "$OUT"
  fi
done
