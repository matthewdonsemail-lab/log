from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
VENDOR = ROOT.parent / "vendor"
for p in (str(ROOT), str(VENDOR / "rdvwr")):
    if p not in sys.path:
        sys.path.insert(0, p)

from platformKit import engine as kit

PLATFORM = "reddit"
LIBRARY = "vendor/rdvwr"
WRITES: tuple[str, ...] = ()


async def ping(spec: dict[str, Any], cookies: dict[str, str]) -> dict[str, Any]:
    from rdvwr import Forbidden, NotLoggedIn, RateLimited, RedditClient

    async with RedditClient(cookies, proxy=spec.get("proxy") or None) as client:
        try:
            me = await client.check()
        except NotLoggedIn as e:
            return {"ok": False, "code": "sessionDead", "detail": str(e), "loginState": "loggedOut", "httpStatus": e.status}
        except Forbidden as e:
            return {"ok": False, "code": "forbidden", "detail": str(e), "loginState": "unknown", "httpStatus": 403}
        except RateLimited as e:
            return {"ok": False, "code": "rateLimited", "detail": str(e), "loginState": "unknown", "httpStatus": 429, "event": "throttled"}
        refreshed = client.refreshed_cookies()
        if not me.get("loggedIn"):
            return {"ok": False, "code": "sessionDead", "detail": "Reddit's /api/me.json says these cookies aren't signed in", "loginState": "loggedOut"}
        if me.get("suspended"):
            return {"ok": False, "code": "accountRestricted", "detail": "Reddit marks the account suspended", "loginState": "restricted", "screenName": me.get("name")}
        out: dict[str, Any] = {"ok": True, "loginState": "loggedIn", "httpStatus": 200, "screenName": me.get("name"), "userId": me.get("id"), "linkKarma": me.get("linkKarma"), "commentKarma": me.get("commentKarma"), "inboxCount": me.get("inboxCount")}
        if refreshed:
            out["refreshedCookies"] = refreshed
        return out


ACTIONS = {"ping": ping}


if __name__ == "__main__":
    raise SystemExit(kit.main(ACTIONS, WRITES, LIBRARY))
