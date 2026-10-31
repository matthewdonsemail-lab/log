from __future__ import annotations

import sys
import threading
from pathlib import Path
from typing import Any

FBK_SRC = Path(__file__).resolve().parents[2] / "vendor" / "fbk" / "src"
if str(FBK_SRC) not in sys.path:
    sys.path.insert(0, str(FBK_SRC))

from governor import GovernorBlockedError, GovernorConfig, RequestGovernor

STATE_DIR = Path.home() / ".logCli" / "fbk"
_lock = threading.Lock()
_governors: dict[str, RequestGovernor] = {}


def governor_for(account: str, config: GovernorConfig | None = None) -> RequestGovernor:
    with _lock:
        found = _governors.get(account)
        if found is None:
            folder = STATE_DIR / account
            folder.mkdir(parents=True, exist_ok=True)
            found = RequestGovernor(config or GovernorConfig.from_env(), folder / "governor_state.json")
            _governors[account] = found
        return found


def gate(account: str, is_mutation: bool = False) -> dict[str, Any]:
    try:
        slept = governor_for(account).before_request(is_mutation=is_mutation, quiet=True)
        return {"ok": True, "slept": slept}
    except GovernorBlockedError as error:
        return {"ok": False, "code": "governorBlocked", "detail": str(error)}


def soft_block(account: str) -> None:
    governor_for(account).observe_soft_block()


def checkpoint(account: str) -> None:
    governor_for(account).observe_checkpoint()


def status(account: str) -> dict[str, Any]:
    return governor_for(account).status()
