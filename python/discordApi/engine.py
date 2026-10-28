from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from platformKit import engine as kit

PLATFORM = "discord"
LIBRARY = None
WRITES: tuple[str, ...] = ()


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    return kit.not_built(PLATFORM, "ping")


ACTIONS = {"ping": ping}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
