#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "twikit @ git+https://github.com/unclecode/twikit",
# ]
# ///
"""Twitter controller — send-only. Sends one approved reply or DM on X via Twikit.

Hard rules enforced here:
  * Discovery is NOT here. Recipients and posts come from Treg and are approved
    by the owner before this script runs.
  * Cookies are read from Twenty and never printed, logged or echoed back.
  * Text must pass the house style check (lowercase, no commas, no full stops,
    no em dashes) unless --skip-style-check is passed.

Usage (uv manages the environment):
  uv run send_approved_reply.py --action ping
  uv run send_approved_reply.py --action reply --tweet-url <url> --text "<copy>" --approved-by <who>
  uv run send_approved_reply.py --action dm --user-id <id> --text "<copy>" --approved-by <who>
  uv run send_approved_reply.py --action like --tweet-url <url> --approved-by <who>
  uv run send_approved_reply.py --action reply --tweet-url <url> --text "<copy>" --approved-by <who> --dry-run

Exit codes: 0 ok, 1 user error (args/style), 2 auth/account error (incl. expired X session), 3 send failed.
"""

import argparse
import asyncio
import json
import os
import re
import sys
from urllib.parse import unquote, urlparse

URL_RE = re.compile(r"https?://\S+")
SECRET_KEYS = ("auth_token", "ct0", "password", "emailPassword", "cookie")


def load_env_file(path):
    """Read KEY=VALUE lines from a .env file into os.environ (no overwrite)."""
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def secret_values(cookies):
    """Literal cookie values to scrub from any error text.

    Accepts the normalised dict, the raw list-of-objects Twenty may store, or a
    header string, so the error path never crashes while reporting a failure.
    """
    raw = []
    if isinstance(cookies, dict):
        raw = list(cookies.values())
    elif isinstance(cookies, (list, tuple)):
        for item in cookies:
            if isinstance(item, dict):
                raw.append(item.get("value"))
            elif isinstance(item, (list, tuple)) and len(item) == 2:
                raw.append(item[1])
            else:
                raw.append(item)
    elif isinstance(cookies, str):
        raw = [part.split("=", 1)[-1] for part in cookies.split(";") if "=" in part]
    return [str(v) for v in raw if v and len(str(v)) >= 8]


def redact(text, secrets=()):
    """Remove anything that looks like a secret from a string."""
    if not text:
        return text
    out = str(text)
    for value in secrets:
        if not value:
            continue
        out = out.replace(value, "***")
    for key in SECRET_KEYS:
        out = re.sub(
            rf'("{key}"\s*:\s*)"[^"]*"',
            r'\1"***"',
            out,
            flags=re.IGNORECASE,
        )
        out = re.sub(rf"{key}=[^&;\s]+", f"{key}=***", out, flags=re.IGNORECASE)
    return out


def check_style(text):
    """House style: lowercase, no commas, no full stops, no em dashes.
    URLs are exempt (they legitimately contain dots and slashes)."""
    stripped = URL_RE.sub(" ", text)
    problems = []
    upper = [ch for ch in stripped if ch.isupper()]
    if upper:
        problems.append("uppercase characters: " + "".join(sorted(set(upper))))
    for ch, label in ((",", "comma"), (";", "semicolon"), (".", "full stop"),
                      ("\u2014", "em dash"), ("\u2013", "en dash")):
        if ch in stripped:
            problems.append(f"{label} ({ch})")
    return problems


def rest_base():
    """TWENTY_BASE_URL may or may not already include the /rest suffix."""
    base = os.environ.get("TWENTY_BASE_URL", "").rstrip("/")
    if base.endswith("/rest"):
        return base
    return base + "/rest"


def fetch_cookies(account_id):
    import urllib.request

    base = rest_base()
    key = os.environ.get("TWENTY_API_KEY", "")
    if not base or not key:
        raise RuntimeError("TWENTY_BASE_URL and TWENTY_API_KEY must be set (see .env.local)")
    req = urllib.request.Request(
        f"{base}/socialAccounts/{account_id}",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "twitter-controller/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    record = unwrap(payload)
    stored = record.get("cookies")
    cookies = normalize_cookies(stored)
    if not cookies:
        raise RuntimeError("account record has no cookies - session must be refreshed first")
    return cookies, stored, record.get("name") or record.get("accountName") or "account"


def twenty_get(path):
    import urllib.request

    key = os.environ.get("TWENTY_API_KEY", "")
    if not os.environ.get("TWENTY_BASE_URL") or not key:
        raise RuntimeError("TWENTY_BASE_URL and TWENTY_API_KEY must be set (see .env.local)")
    req = urllib.request.Request(
        f"{rest_base()}{path}",
        headers={"Authorization": f"Bearer {key}", "User-Agent": "twitter-controller/1.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def pick_account(payload, handle):
    """Exactly one TWITTER socialAccounts record for the handle, else an error."""
    data = payload.get("data") if isinstance(payload, dict) else None
    rows = (data or {}).get("socialAccounts", []) if isinstance(data, dict) else []
    rows = [r for r in rows if (r.get("platform") or "TWITTER") == "TWITTER"]
    if len(rows) != 1:
        raise RuntimeError(f"expected exactly one TWITTER socialAccounts record for {handle!r}, found {len(rows)}")
    return rows[0]["id"]


def resolve_account_id(handle):
    from urllib.parse import quote

    handle = handle.lstrip("@")
    flt = quote(f'accountName[eq]:"{handle}"')
    return pick_account(twenty_get(f"/socialAccounts?filter={flt}&limit=5"), handle)


def normalize_cookies(raw):
    """Twikit wants {name: value}. Twenty may hold that or a browser export
    (list of {name, value, domain, ...})."""
    if isinstance(raw, str):
        raw = json.loads(raw)
    if isinstance(raw, list):
        raw = {c["name"]: c["value"] for c in raw if c.get("name") and c.get("value") is not None}
    if isinstance(raw, dict):
        # Cloudflare re-issues __cf_bm per request; a stale copy collides with
        # the fresh one in the cookie jar ("Multiple cookies exist").
        raw = {k: v for k, v in raw.items() if k != "__cf_bm"}
    return raw


def merge_for_storage(stored, cookies):
    """Write refreshed values back in the shape the record already uses."""
    if isinstance(stored, list):
        seen = set()
        for entry in stored:
            if entry.get("name") in cookies:
                entry["value"] = cookies[entry["name"]]
                seen.add(entry["name"])
        extra = [{"name": k, "value": v, "domain": ".x.com", "path": "/"} for k, v in cookies.items() if k not in seen]
        return stored + extra
    return {**(stored or {}), **cookies}


def unwrap(payload):
    """Twenty REST wraps single records as {data: {socialAccount: {...}}}."""
    data = payload.get("data") if isinstance(payload, dict) else None
    if isinstance(data, dict):
        if len(data) == 1 and isinstance(next(iter(data.values())), dict):
            return next(iter(data.values()))
        return data
    return payload if isinstance(payload, dict) else {}


def normalize_cookies(raw):
    """Return {name: value} for twikit from any shape stored in Twenty.

    The `cookies` field may hold a plain dict, a browser extension export (a
    list of {name, value, domain, ...} objects), a list of pairs, a JSON string
    of either of those, or a raw `a=b; c=d` header. Twikit's set_cookies only
    accepts the dict, so every other shape must be converted here.
    """
    if isinstance(raw, str):
        text = raw.strip()
        if text[:1] in "[{":
            try:
                return normalize_cookies(json.loads(text))
            except json.JSONDecodeError:
                pass
        out = {}
        for part in re.split(r";\s*", text):
            if "=" in part:
                name, _, value = part.partition("=")
                out[name.strip()] = value.strip()
        return out
    if isinstance(raw, dict):
        return {str(k): str(v) for k, v in raw.items() if v is not None}
    if isinstance(raw, (list, tuple)):
        pairs = [item for item in raw if isinstance(item, dict) and "name" in item]
        pairs.sort(key=lambda item: _domain_rank(item.get("domain")))
        out = {}
        for item in pairs:
            out[str(item["name"])] = str(item.get("value") or "")
        for item in raw:
            if isinstance(item, (list, tuple)) and len(item) == 2:
                out[str(item[0])] = str(item[1])
        return out
    raise RuntimeError(f"unsupported cookies shape: {type(raw).__name__}")


def _domain_rank(domain):
    """Prefer x.com/twitter.com over unrelated domains for duplicate names."""
    host = str(domain or "").lower()
    if "x.com" in host or "twitter.com" in host:
        return 0
    return 1 if host else 2


def merge_cookie_shape(raw, refreshed):
    """Merge refreshed name->value pairs back into the stored shape.

    Twenty keeps whatever the owner pasted in (a browser export list stays a
    list), so the write back does not silently change the field's format.
    """
    if isinstance(raw, list):
        merged = []
        seen = set()
        for item in raw:
            if isinstance(item, dict) and item.get("name") in refreshed:
                item = {**item, "value": refreshed[item["name"]]}
                seen.add(item["name"])
            merged.append(item)
        for name, value in refreshed.items():
            if name not in seen:
                merged.append({"name": name, "value": value, "domain": ".x.com", "path": "/"})
        return merged
    base = raw if isinstance(raw, dict) else {}
    return {**base, **refreshed}


def store_cookies(account_id, cookies):
    """Write refreshed cookies back so the session survives to the next run."""
    import urllib.request

    base = rest_base()
    key = os.environ.get("TWENTY_API_KEY", "")
    body = json.dumps({"cookies": cookies}).encode("utf-8")
    req = urllib.request.Request(
        f"{base}/socialAccounts/{account_id}",
        data=body,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "twitter-controller/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status
    except Exception:
        return None


def own_user_id(cookies):
    twid = unquote(str(cookies.get("twid", "")))
    match = re.search(r"u=(\d+)", twid)
    if not match:
        raise RuntimeError("twid cookie missing or malformed - cannot identify the account")
    return match.group(1)


def tweet_id_from_url(url):
    path = urlparse(url).path.rstrip("/")
    if "/status/" in path:
        return path.split("/status/")[-1]
    return path.split("/")[-1]


class SessionInvalid(RuntimeError):
    """X rejected the stored cookies (not a logged-in session)."""


async def check_session(client):
    """Read-only check that X accepts the stored cookies.

    Twikit's transaction-id init scrapes x.com with these cookies. If X does not
    treat them as logged in it serves the logged-out shell, which has no
    ondemand.s chunk, and twikit fails with "Couldn't get KEY_BYTE indices".
    Checking first turns that into an accurate error.
    """
    from twikit.constants import TOKEN

    cookies = client.get_cookies()
    resp = await client.http.request(
        "GET",
        "https://api.x.com/1.1/account/settings.json",
        headers={
            "authorization": f"Bearer {TOKEN}",
            "x-csrf-token": cookies.get("ct0", ""),
            "x-twitter-auth-type": "OAuth2Session",
            "x-twitter-active-user": "yes",
            "User-Agent": client._user_agent,
        },
    )
    # The probe's response may set Cloudflare cookies on api.x.com that collide
    # with the ones twikit gets from x.com; restore the jar to what we sent.
    client.set_cookies(cookies, clear_cookies=True)
    if resp.status_code in (401, 403):
        raise SessionInvalid(
            f"X rejected the stored cookies (HTTP {resp.status_code}) - "
            "the stored session is expired or revoked and must be refreshed"
        )
    # Without an x-client-transaction-id X answers 404 (code 34) to a request
    # whose cookies it accepted, and 401 (code 32) to one it did not. So 404
    # here means "auth accepted"; twikit adds the transaction id itself.
    if resp.status_code not in (200, 404):
        raise RuntimeError(f"session check returned HTTP {resp.status_code}")


async def run_send(args, cookies):
    from twikit import Client

    client = Client(language="en-US")
    client.set_cookies(cookies, clear_cookies=True)
    await check_session(client)

    if args.action == "ping":
        # twikit's client.user() relies on the v1.1 settings endpoint, which X
        # now 404s. The account id is in the twid cookie (u%3D<id>).
        user = await client.get_user_by_id(own_user_id(cookies))
        return {
            "session": "ok",
            "screen_name": getattr(user, "screen_name", None),
        }, client.get_cookies()

    # keep x's raw CreateTweet body so an empty result can be shown as it came back
    raw = {}
    gql_create = client.gql.create_tweet

    async def keep_raw(*a, **k):
        r = await gql_create(*a, **k)
        raw["body"] = r[0]
        # x's own rate-limit headers on the create call, so a cool-off can wait for the real reset
        raw["limits"] = {h: r[1].headers.get(h) for h in ("x-rate-limit-limit", "x-rate-limit-remaining", "x-rate-limit-reset")
                         if r[1].headers.get(h) is not None}
        return r

    client.gql.create_tweet = keep_raw

    if args.action == "like":
        if not args.tweet_url:
            raise ValueError("--tweet-url is required for like")
        tweet_id = tweet_id_from_url(args.tweet_url)
        data, _ = await client.gql.favorite_tweet(tweet_id)
        errors = data.get("errors") if isinstance(data, dict) else None
        if errors and any(e.get("code") == 139 for e in errors):   # 139 = already liked
            return {"liked": True, "already": True, "tweet_id": tweet_id}, client.get_cookies()
        if errors or (data.get("data") or {}).get("favorite_tweet") != "Done":
            raise RuntimeError(f"x did not like the post: {json.dumps(data)[:300]}")
        return {"liked": True, "tweet_id": tweet_id}, client.get_cookies()

    if args.action == "reply":
        if not args.tweet_url:
            raise ValueError("--tweet-url is required for reply")
        tweet_id = tweet_id_from_url(args.tweet_url)
        tweet = await client.create_tweet(text=args.text, reply_to=tweet_id)
        if not getattr(tweet, "id", None):
            # X answered 200 with empty tweet_results: nothing was posted (reply limits, spam filter or a soft block)
            raise RuntimeError("x created no tweet (empty result): reply not posted. x said: "
                               + json.dumps(raw.get("body"))[:300] + " limits: " + json.dumps(raw.get("limits")))
        return {
            "sent": True,
            "mode": "reply",
            "tweet_id": getattr(tweet, "id", None),
            "reply_to": tweet_id,
        }, client.get_cookies()

    if args.action == "quote":
        if not args.tweet_url:
            raise ValueError("--tweet-url is required for quote")
        # X turns a tweet url passed as attachment_url into a quote tweet.
        tweet = await client.create_tweet(text=args.text, attachment_url=args.tweet_url)
        if not getattr(tweet, "id", None):
            raise RuntimeError("x created no tweet (empty result): quote not posted. x said: "
                               + json.dumps(raw.get("body"))[:300] + " limits: " + json.dumps(raw.get("limits")))
        return {
            "sent": True,
            "mode": "quote",
            "tweet_id": getattr(tweet, "id", None),
            "quoted": args.tweet_url,
        }, client.get_cookies()

    if args.action == "dm":
        if not args.user_id:
            raise ValueError("--user-id is required for dm (id must come from Treg research)")
        message = await client.send_dm(args.user_id, args.text)
        return {
            "sent": True,
            "mode": "dm",
            "conversation_id": str(getattr(message, "conversation_id", "")) or None,
        }, client.get_cookies()

    if args.action == "follows":
        # read-only (matt, 15 Oct 2026): does each handle follow this account? One friendships/show call per handle, nothing is sent.
        me = getattr(await client.get_user_by_id(own_user_id(cookies)), "screen_name", None)
        out = []
        for h in [x.strip().lstrip("@") for x in args.handles.split(",") if x.strip()]:
            try:
                data, _ = await client.get("https://x.com/i/api/1.1/friendships/show.json",
                                           params={"source_screen_name": me, "target_screen_name": h}, headers=client._base_headers)
                rel = (data or {}).get("relationship") or {}
                out.append({"handle": h, "follows_you": bool((rel.get("target") or {}).get("following")),
                            "you_follow": bool((rel.get("source") or {}).get("following"))})
            except Exception as exc:
                out.append({"handle": h, "error": str(exc)[:200]})
            await asyncio.sleep(1.5)
        return {"account": me, "checked": out}, client.get_cookies()

    raise ValueError(f"unknown action: {args.action}")


def main():
    parser = argparse.ArgumentParser(description="Send one approved X reply or DM (send-only)")
    parser.add_argument("--action", required=True, choices=["reply", "quote", "dm", "like", "ping", "follows"])
    parser.add_argument("--tweet-url", help="target post URL (from Treg research)")
    parser.add_argument("--user-id", help="recipient user id (from Treg research)")
    parser.add_argument("--text", help="message copy, must pass house style")
    parser.add_argument("--handles", help="follows: comma-separated handles to check against the account (read-only)")
    parser.add_argument("--approved-by", help="who approved this message (required to send)")
    parser.add_argument("--account", default=os.environ.get("TWITTER_ACCOUNT_HANDLE"),
                        help="X handle of the sending account, matched on socialAccounts.accountName (or set TWITTER_ACCOUNT_HANDLE)")
    parser.add_argument("--account-id", help="socialAccounts record id (skips the handle lookup)")
    parser.add_argument("--skip-style-check", action="store_true")
    parser.add_argument("--dry-run", action="store_true", help="validate only, do not contact X")
    args = parser.parse_args()

    load_env_file(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env.local"))
    load_env_file(os.path.join(os.getcwd(), ".env.local"))

    if args.action in ("reply", "quote", "dm") and not args.text:
        print(json.dumps({"ok": False, "error": "--text is required"}))
        sys.exit(1)

    if args.action in ("reply", "quote", "dm", "like") and not args.dry_run and not args.approved_by:
        print(json.dumps({"ok": False, "error": "--approved-by is required to send"}))
        sys.exit(1)

    if args.text and not args.skip_style_check:
        problems = check_style(args.text)
        if problems:
            print(json.dumps({
                "ok": False,
                "error": "style check failed",
                "problems": problems,
                "hint": "lowercase only, remove commas full stops em dashes (URLs exempt) or pass --skip-style-check",
            }))
            sys.exit(1)

    if args.action == "follows" and not args.handles:
        print(json.dumps({"ok": False, "error": "--handles is required for follows"}))
        sys.exit(1)

    target = args.tweet_url or args.user_id or args.handles or "session"
    if args.dry_run:
        print(json.dumps({
            "ok": True,
            "dry_run": True,
            "action": args.action,
            "target": target,
            "approved_by": args.approved_by,
            "text_chars": len(args.text or ""),
            "style": "pass" if not args.skip_style_check else "skipped",
        }))
        sys.exit(0)

    stored_cookies = None
    try:
        if not args.account_id:
            if not args.account:
                raise RuntimeError("--account <handle> (or --account-id) is required")
            args.account_id = resolve_account_id(args.account)
        cookies, stored_cookies, account_name = fetch_cookies(args.account_id)
        cookies = normalize_cookies(stored_cookies)
        if not cookies:
            raise RuntimeError("account record has no usable cookies - session must be refreshed first")
    except Exception as exc:
        print(json.dumps({
            "ok": False,
            "stage": "auth-read",
            "error": redact(str(exc), secret_values(stored_cookies) + [os.environ.get("TWENTY_API_KEY", "")]),
        }))
        sys.exit(2)

    if os.name == "nt":
        import warnings

        with warnings.catch_warnings():
            warnings.simplefilter("ignore", DeprecationWarning)
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    try:
        result, refreshed = asyncio.run(run_send(args, cookies))
    except SessionInvalid as exc:
        print(json.dumps({
            "ok": False,
            "stage": "session-invalid",
            "action": args.action,
            "target": target,
            "error": redact(str(exc), secret_values(cookies)),
        }))
        sys.exit(2)
    except Exception as exc:
        # twikit raises TooManyRequests (http 429) with x's x-rate-limit-reset as rate_limit_reset (unix time)
        print(json.dumps({
            "ok": False,
            "stage": "send",
            "action": args.action,
            "target": target,
            "error": redact(str(exc), secret_values(cookies))[:300],
            "kind": type(exc).__name__,   # last, so the sequencer's 600-char tail always keeps them
            "rate_limit_reset": getattr(exc, "rate_limit_reset", None),
        }))
        sys.exit(3)

    cookie_writeback = None
    if refreshed and refreshed != cookies:
        cookie_writeback = store_cookies(
            args.account_id, merge_cookie_shape(stored_cookies, refreshed)
        )

    out = {
        "ok": True,
        "action": args.action,
        "target": target,
        "approved_by": args.approved_by,
        "account": account_name,
        "cookie_writeback": cookie_writeback,
        "result": result,
    }
    print(json.dumps(out, default=str))
    sys.exit(0)


if __name__ == "__main__":
    main()
