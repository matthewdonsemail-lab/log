#!/bin/bash
# Test raw curl with and without session
INIT='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}'
TOOLS='{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

SID=$(curl -sS -X POST -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d "$INIT" http://127.0.0.1:13010/mcp -D /tmp/h1.txt -o /dev/null 2>/dev/null | true)
SID=$(grep -i '^mcp-session-id' /tmp/h1.txt | awk -F': ' '{print $2}' | tr -d '\r')
echo "SID=$SID"
echo "=== tools/list WITH session ==="
curl -sS -X POST -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H "mcp-session-id: $SID" -d "$TOOLS" http://127.0.0.1:13010/mcp | head -c 3000
echo
echo "=== tools/list WITHOUT session ==="
curl -sS -X POST -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d "$TOOLS" http://127.0.0.1:13010/mcp | head -c 500
