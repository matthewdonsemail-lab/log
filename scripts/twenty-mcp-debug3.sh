#!/bin/bash
# Debug: run bridge with set -x on stderr, capture all output
b64in='@@B64IN@@'
echo "$b64in" | base64 -d > /tmp/inp.json
cp /tmp/twenty-mcp-bridge.sh /tmp/dbg3.sh
sed -i '2a set -x' /tmp/dbg3.sh
bash /tmp/dbg3.sh < /tmp/inp.json 2>/tmp/dbg3.log
echo "=== DBG LOG ==="
cat /tmp/dbg3.log
