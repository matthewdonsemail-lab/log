"""OpenMagpie's `facebook_group` worker, answered by log-cli (obris-dev/openmagpie#178, #188).

OpenMagpie's connector (`apps/core/sources/connectors/facebook/client.py`) runs this file as
`[sys.executable, FACEBOOK_WORKER_PATH]`, writes one JSON request to stdin and reads one JSON
answer from stdout:

    in   {"action": "groups.search", "params": {"group_ids": [...], "terms": [...], "limit": 20},
          "account_id": ..., "cookies": [...], "proxy": ...}
    out  {"ok": true, "result": {"results": [record, ...], "errors": [...]}, "new_cookies": []}
         {"ok": false, "code": ..., "error": ...}

It only passes `action` and `params` on to `log facebook poll --request`. The cookies, proxy and account
OpenMagpie sends are dropped here: in log-cli the account, its session and its proxy come from Twenty,
and a read is a step in the account's open browser (rules 12, 13, 35). The run's lines go to stderr,
and to log-cli's live log (rule 26). Standard library only: OpenMagpie's Python runs it.

Point OpenMagpie at it with FACEBOOK_WORKER_PATH=<log-cli>/python/openMagpie/facebookWorker.py.
LOG_BUN picks the bun binary (default `bun`). LOG_WORKER_ENTRY replaces `bin/log.ts`, for tests.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# OpenMagpie gives up at 300 s; answering first keeps its error ours (worker_timeout).
TIMEOUT_S = 290


def answer(value: dict) -> int:
    sys.stdout.write(json.dumps(value) + "\n")
    sys.stdout.flush()
    return 0 if value.get("ok") else 1


def forwarded(raw: str) -> dict | None:
    """The request with only what log-cli reads: action and params. None when it isn't a JSON object."""
    try:
        request = json.loads(raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(request, dict):
        return None
    return {"action": request.get("action"), "params": request.get("params") or {}}


def main() -> int:
    request = forwarded(sys.stdin.read())
    if request is None:
        return answer({"ok": False, "code": "bad_request", "error": "the request is not a JSON object"})
    command = [os.environ.get("LOG_BUN", "bun"), os.environ.get("LOG_WORKER_ENTRY", "bin/log.ts"), "facebook", "poll", "--request", json.dumps(request)]
    try:
        # From log-cli's root, so Bun loads its .env.local (Twenty, LOG_PYTHON).
        proc = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, encoding="utf8", timeout=TIMEOUT_S)
    except subprocess.TimeoutExpired:
        return answer({"ok": False, "code": "worker_timeout", "error": f"log facebook poll --request took over {TIMEOUT_S} s"})
    except OSError as error:
        return answer({"ok": False, "code": "worker_spawn_failed", "error": f"could not run {command[0]}: {error} (set LOG_BUN)"})
    sys.stderr.write(proc.stderr)
    # The answer is the last line of stdout that is a JSON object.
    for line in reversed((proc.stdout or "").splitlines()):
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict) and "ok" in value:
            return answer(value)
    return answer({"ok": False, "code": "worker_bad_output", "error": f"log facebook poll --request exited {proc.returncode} without an answer: {(proc.stderr or proc.stdout)[-500:]}"})


if __name__ == "__main__":
    raise SystemExit(main())
