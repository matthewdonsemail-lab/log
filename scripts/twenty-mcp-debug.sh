#!/bin/bash
# Debug script: test bridge, then raw curl with session
b64in='@@B64IN@@'
echo "$b64in" | base64 -d > /tmp/inp.json
rm -f /tmp/mcp_hdrs_* /tmp/mcp_body_*
bash /tmp/twenty-mcp-bridge.sh < /tmp/inp.json > /tmp/out.txt 2>/dev/null
echo "OUT:"
cat /tmp/out.txt
echo
echo "===raw curl with session==="
SID=$(curl -sS --max-time 10 -X POST -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}' http://127.0.0.1:13010/mcp -D - -o /dev/null 2>/dev/null | grep -i '^mcp-session-id' | awk -F': ' '{print $2}' | tr -d '\r')
echo "SID=$SID"
curl -sS --max-time 10 -X POST -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -H "mcp-session-id: $SID" --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' http://127.0.0.1:13010/mcp 2>&1 | head -c 4000
