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
    if CODES and code not in CODES:
        print(f"errorCodes: {code!r} is not in the error catalog", file=sys.stderr, flush=True)
    return code


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
    return {"ok": False, "code": checked(code), "detail": redact(str(detail)), **extra}
