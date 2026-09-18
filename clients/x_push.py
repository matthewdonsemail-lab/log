"""Read X for the phrases you are listening for and push the tweets to ListeningKit.

    LISTENINGKIT_INGEST_URL=https://<deployment>.convex.site/ingest \\
    LISTENINGKIT_INGEST_KEY=lk_ingest_... \\
    python clients/x_push.py --interval 300

It uses the X login you connected in ListeningKit (onboarding or Settings): no password,
no cookies file. It asks ListeningKit which X phrases you have, searches X for each one
in a real browser window (Camoufox) logged in with that login, and pushes the newest tweets
to /ingest. Use --dry-run to print what would be sent, --phrases "a" "b" to search specific
phrases instead, and --show to watch the browser.

It reads X's pages the way a person does, so it survives changes to X's private API. The older
twikit engine (--engine twikit) is kept but is currently broken by X's site changes.

Heads up: this automates a logged-in X session. That can go against X's terms, and X may
rate-limit or lock accounts that automate. Use an account you can afford to lose, and keep
the interval at 5 minutes or more.
"""
from __future__ import annotations

import argparse
import asyncio
import os
import random
import sys
import traceback
from datetime import datetime
from pathlib import Path
from typing import Any, Awaitable, Callable

sys.path.insert(0, str(Path(__file__).parent))
from listeningkit_ingest import IngestError, SessionError, fetch_phrases, fetch_session, push  # noqa: E402

X_DOMAINS = ("x.com", "twitter.com")
REQUIRED_COOKIES = ("auth_token", "ct0")
MIN_INTERVAL = 120
MAX_PHRASES_PER_ROUND = 10
NOTICE = (
    "Note: this reads X through your own logged-in session. That can go against X's terms and X may "
    "lock accounts that automate. Use an account you can afford to lose."
)


class HelperError(RuntimeError):
    pass


def cookie_dict(jar: list[dict]) -> dict[str, str]:
    """name -> value for the cookies on X's own domains. Refuses a login that is missing its two key cookies."""
    cookies: dict[str, str] = {}
    for cookie in jar:
        if not isinstance(cookie, dict):
            continue
        domain = str(cookie.get("domain", "")).lstrip(".").lower()
        if any(domain == d or domain.endswith(f".{d}") for d in X_DOMAINS) and cookie.get("name") and cookie.get("value"):
            cookies[str(cookie["name"])] = str(cookie["value"])
    if not all(name in cookies for name in REQUIRED_COOKIES):
        raise SessionError("Your connected X login is incomplete. Reconnect X in ListeningKit, then try again.")
    return cookies


def _count(value: object) -> int:
    return max(0, int(value)) if isinstance(value, (int, float)) and value == value else 0


def tweet_to_post(tweet: Any) -> dict | None:
    """Map a twikit Tweet to the /ingest post shape. None for retweets and anything unusable."""
    tweet_id = str(getattr(tweet, "id", "") or "").strip()
    text = str(getattr(tweet, "full_text", None) or getattr(tweet, "text", None) or "").strip()
    if not tweet_id.isdigit() or not text or text.startswith("RT @"):
        return None
    user = getattr(tweet, "user", None)
    handle = str(getattr(user, "screen_name", "") or "").strip()
    name = str(getattr(user, "name", "") or "").strip()
    post: dict = {
        "externalId": tweet_id,
        "authorName": handle or name or "unknown",
        "body": [text[:4000]],
        "url": f"https://x.com/{handle}/status/{tweet_id}" if handle else f"https://x.com/i/status/{tweet_id}",
        "likes": _count(getattr(tweet, "favorite_count", 0)),
        "comments": _count(getattr(tweet, "reply_count", 0)),
    }
    stamp = getattr(tweet, "created_at_datetime", None)
    if isinstance(stamp, datetime):
        post["timestamp"] = stamp.isoformat()
    return post


def search_query(phrase: str) -> str:
    """The exact phrase, without retweets. Quotes inside the phrase are dropped so it cannot break the query."""
    return f'"{phrase.replace(chr(34), "").strip()}" -filter:retweets'


def contains_phrase(text: str, phrase: str) -> bool:
    """True when the tweet says the phrase, ignoring case and runs of spaces."""
    squash = lambda value: " ".join(value.lower().split())  # noqa: E731
    return squash(phrase.replace(chr(34), "")) in squash(text)


def classify(error: BaseException) -> str:
    """'rate' when X asks us to slow down, 'auth' when it refused the login, otherwise 'other'."""
    name = type(error).__name__
    if name == "TooManyRequests":
        return "rate"
    if name in {"Unauthorized", "Forbidden", "AccountLocked", "AccountSuspended"}:
        return "auth"
    return "other"


def describe_error(error: BaseException, secrets: list[str] | None = None) -> str:
    """Type, message and where it happened, with every cookie value blanked out, for --verbose."""
    message = str(error) or "(no message)"
    for secret in secrets or []:
        if secret:
            message = message.replace(secret, "<hidden>")
    frames = traceback.extract_tb(error.__traceback__)
    where = f" at {Path(frames[-1].filename).name}:{frames[-1].lineno}" if frames else ""
    return f"{type(error).__name__}: {message[:300]}{where}"


def make_client(cookies: dict[str, str], jar: list[dict] | None = None, engine: str = "browser", show: bool = False) -> Any:
    if engine == "browser":
        from x_browser import BrowserXClient

        return BrowserXClient(jar or [], show=show)
    try:
        from twikit import Client
    except ImportError:
        sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "apps" / "twikit"))
        try:
            from twikit import Client  # type: ignore[no-redef]
        except ImportError as error:
            raise HelperError("twikit is not installed. Run: pip install -r apps/twikit/requirements.txt") from error
    client = Client("en-US")
    client.set_cookies(cookies)
    return client


async def run_once(
    args: argparse.Namespace,
    client: Any,
    phrases: list[str],
    *,
    push_posts: Callable[..., dict] = push,
    sleep: Callable[[float], Awaitable[None]] = asyncio.sleep,
) -> int:
    """One round: search each phrase, push the new tweets. 0 ok, 1 a problem the person must fix."""
    seen: set[str] = set()
    for index, phrase in enumerate(phrases[:MAX_PHRASES_PER_ROUND]):
        if index:
            await sleep(random.uniform(2.0, 5.0))  # spaced out so a round never looks like a burst
        try:
            found = await client.search_tweet(search_query(phrase), "Latest", count=args.count)
            tweets = list(found)
        except Exception as error:  # noqa: BLE001 - twikit raises many types; classified below
            kind = classify(error)
            if kind == "auth":
                print("X refused the saved login. Reconnect X in ListeningKit (Settings), then run this again.", file=sys.stderr)
                return 1
            if kind == "rate":
                print("X asked us to slow down, so this round stops here. It will try again next time.")
                return 0
            detail = describe_error(error, list(getattr(args, "secrets", []))) if getattr(args, "verbose", False) else type(error).__name__
            hint = "" if getattr(args, "verbose", False) else " (run again with --verbose for details)"
            print(f'"{phrase}": could not read X ({detail}), skipping{hint}', file=sys.stderr)
            continue
        posts = []
        for tweet in tweets:
            post = tweet_to_post(tweet)
            # X can pad a quiet search with unrelated timeline posts; only a tweet that really says the phrase is a match.
            if post and not contains_phrase(post["body"][0], phrase):
                continue
            if post and post["externalId"] not in seen:
                seen.add(post["externalId"])
                posts.append(post)
        if not posts:
            print(f'"{phrase}": no new tweets')
            continue
        if args.dry_run:
            print(f'"{phrase}": would push {len(posts)} tweets')
            continue
        try:
            totals = push_posts("x", posts, endpoint=args.endpoint, key=args.key)
        except IngestError as error:
            print(f'"{phrase}": {error}', file=sys.stderr)
            return 1
        print(f'"{phrase}": pushed {totals["ingested"]} tweets, {len(posts) - totals["ingested"]} skipped')
    return 0


async def main_async(args: argparse.Namespace) -> int:
    print(NOTICE)
    jar = fetch_session("x", endpoint=args.endpoint, key=args.key)
    cookies = cookie_dict(jar)
    args.secrets = [value for value in cookies.values() if len(value) >= 8]
    client = make_client(cookies, jar, getattr(args, "engine", "browser"), getattr(args, "show", False))
    try:
        return await loop_rounds(args, client)
    finally:
        close = getattr(client, "close", None)
        if close is not None:
            await close()


async def loop_rounds(args: argparse.Namespace, client: Any) -> int:
    while True:
        phrases = args.phrases or fetch_phrases("x", endpoint=args.endpoint, key=args.key)
        if not phrases:
            print("You have no X phrases yet. Add one on the Keywords page (choose X), then this will pick it up.")
            status = 0
        else:
            status = await run_once(args, client, phrases)
        if not args.interval or status != 0:
            return status
        await asyncio.sleep(args.interval)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--phrases", nargs="+", help="search these instead of the phrases saved in ListeningKit")
    parser.add_argument("--count", type=int, default=20, help="tweets per phrase, 1-20")
    parser.add_argument("--interval", type=int, default=0, help=f"seconds between rounds (at least {MIN_INTERVAL}); 0 runs once")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--verbose", action="store_true", help="show why a search failed (cookie values are hidden)")
    parser.add_argument("--engine", choices=["browser", "twikit"], default="browser", help="browser (default) reads X's pages; twikit uses its private API and is currently broken")
    parser.add_argument("--show", action="store_true", help="show the browser window instead of hiding it")
    args = parser.parse_args(argv)
    args.count = max(1, min(20, args.count))
    if args.interval:
        args.interval = max(MIN_INTERVAL, args.interval)
    args.endpoint = os.getenv("LISTENINGKIT_INGEST_URL", "")
    args.key = os.getenv("LISTENINGKIT_INGEST_KEY", "")
    if not (args.endpoint and args.key):
        parser.error("set LISTENINGKIT_INGEST_URL and LISTENINGKIT_INGEST_KEY")
    try:
        return asyncio.run(main_async(args))
    except (SessionError, HelperError) as error:
        print(f"x helper: {error}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
