from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TIMEOUT_S = 290


def answer(value: dict) -> int:
    sys.stdout.write(json.dumps(value) + "\n")
    sys.stdout.flush()
    return 0 if value.get("ok") else 1


def forwarded(raw: str) -> dict | None:
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
        proc = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, encoding="utf8", timeout=TIMEOUT_S)
    except subprocess.TimeoutExpired:
        return answer({"ok": False, "code": "worker_timeout", "error": f"log facebook poll --request took over {TIMEOUT_S} s"})
    except OSError as error:
        return answer({"ok": False, "code": "worker_spawn_failed", "error": f"could not run {command[0]}: {error} (set LOG_BUN)"})
    sys.stderr.write(proc.stderr)
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
