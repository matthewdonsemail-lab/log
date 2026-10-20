"""The error catalog's codes, for the Python side.

The catalog lives in TypeScript (src/errors/catalog/types.ts) and is exported
to errorCatalog.json next to this file (`bun run errors:export`). Both Python
processes send only codes from it. A code that isn't there still goes out, but
is flagged on stderr here, and the TypeScript boundary turns it into
`uncatalogued` so it can never pass as a known code. `catalog.test.ts` checks
every literal code in these files against the catalog before that can happen.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

CATALOG_PATH = Path(__file__).with_name("errorCatalog.json")


def _load_codes() -> frozenset[str]:
    try:
        return frozenset(json.loads(CATALOG_PATH.read_text(encoding="utf8")))
    except Exception as exc:
        print(f"errorCodes: could not read {CATALOG_PATH.name} ({exc})", file=sys.stderr, flush=True)
        return frozenset()


CODES = _load_codes()


def checked(code: str) -> str:
    """Return the code, warning on stderr when the catalog doesn't have it."""
    if CODES and code not in CODES:
        print(f"errorCodes: {code!r} is not in the error catalog", file=sys.stderr, flush=True)
    return code


# Values never to send or log: the proxy password and the username's account
# part (for 2Captcha they are the same string). proxyGate registers them.
_SECRETS: set[str] = set()


def register_secret(value: str | None) -> None:
    from urllib.parse import quote

    if value and len(value) >= 4:
        _SECRETS.update({value, quote(value, safe="")})


def redact(text: str) -> str:
    for secret in sorted(_SECRETS, key=len, reverse=True):
        text = text.replace(secret, "***")
    return text


def failure(code: str, detail: str = "", **extra: Any) -> dict[str, Any]:
    """The one failure shape both processes send: {"ok": false, "code", "detail", ...}."""
    return {"ok": False, "code": checked(code), "detail": redact(str(detail)), **extra}
