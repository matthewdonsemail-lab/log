"""Read Facebook for the phrases you are listening for and push the posts to ListeningKit.

    LISTENINGKIT_INGEST_URL=https://<deployment>.convex.site/ingest \\
    LISTENINGKIT_INGEST_KEY=lk_ingest_... \\
    python clients/facebook_push.py --interval 300

It uses the Facebook login you connected in ListeningKit (onboarding or Settings): no password,
no cookies file. It asks ListeningKit which Facebook phrases you have, searches Facebook's recent
posts for each one in real Google Chrome logged in with that login, and pushes the newest posts to
/ingest. Use --dry-run to print what would be sent, --phrases "a" "b" to search specific phrases
instead, and --show to watch the browser.

Facebook only shows you posts your account is allowed to see: public posts and posts in groups you
have joined. Join the groups where your customers ask for help.

Heads up: this automates a logged-in Facebook session. That can go against Facebook's terms, and
Facebook may ask for a security check or lock accounts that automate. Use an account you can afford
to lose, and keep the interval at 5 minutes or more.
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path
from typing import Any
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).parent))
from listeningkit_ingest import SessionError, fetch_phrases, fetch_session  # noqa: E402
from x_push import HelperError, run_once  # noqa: E402

FACEBOOK_DOMAINS = ("facebook.com",)
REQUIRED_COOKIES = ("c_user", "xs")
MIN_INTERVAL = 120
NOTICE = (
    "Note: this reads Facebook through your own logged-in session. That can go against Facebook's terms and "
    "Facebook may lock accounts that automate. Use an account you can afford to lose."
)


def cookie_dict(jar: list[dict]) -> dict[str, str]:
    """name -> value for the cookies on Facebook's own domain. Refuses a login that is missing its two key cookies."""
    cookies: dict[str, str] = {}
    for cookie in jar:
        if not isinstance(cookie, dict):
            continue
        domain = str(cookie.get("domain", "")).lstrip(".").lower()
        if any(domain == d or domain.endswith(f".{d}") for d in FACEBOOK_DOMAINS) and cookie.get("name") and cookie.get("value"):
            cookies[str(cookie["name"])] = str(cookie["value"])
    if not all(name in cookies for name in REQUIRED_COOKIES):
        raise SessionError("Your connected Facebook login is incomplete. Reconnect Facebook in ListeningKit, then try again.")
    return cookies


def post_to_ingest(post: Any) -> dict | None:
    """Map a scraped Facebook post to the /ingest post shape. None for anything unusable."""
    post_id = str(getattr(post, "id", "") or "").strip()
    text = str(getattr(post, "text", "") or "").strip()
    if not post_id or not text:
        return None
    url = str(getattr(post, "url", "") or "").strip()
    author = str(getattr(post, "author", "") or "").strip()
    return {
        "externalId": post_id,
        "authorName": author or "Facebook user",
        "body": [text[:4000]],
        # No address could be read for this post: link to a Facebook search for its opening words, which finds it.
        "url": url if url.startswith("https://") else "https://www.facebook.com/search/posts?q=" + quote(f'"{text[:80]}"'),
        "likes": max(0, int(getattr(post, "likes", 0) or 0)),
        "comments": max(0, int(getattr(post, "comments", 0) or 0)),
    }


async def search(client: Any, phrase: str, count: int) -> Any:
    return await client.search_posts(phrase.replace('"', "").strip(), count)


def make_client(jar: list[dict], show: bool = False) -> Any:
    from facebook_browser import BrowserFacebookClient

    return BrowserFacebookClient(jar, show=show)


async def round_of(args: argparse.Namespace, client: Any, phrases: list[str]) -> int:
    return await run_once(args, client, phrases, platform="facebook", search=search, to_post=post_to_ingest)


async def loop_rounds(args: argparse.Namespace, client: Any) -> int:
    while True:
        phrases = args.phrases or fetch_phrases("facebook", endpoint=args.endpoint, key=args.key)
        if not phrases:
            print("You have no Facebook phrases yet. Add one on the Keywords page (choose Facebook), then this will pick it up.")
            status = 0
        else:
            status = await round_of(args, client, phrases)
        if not args.interval or status != 0:
            return status
        await asyncio.sleep(args.interval)


async def main_async(args: argparse.Namespace) -> int:
    print(NOTICE)
    jar = fetch_session("facebook", endpoint=args.endpoint, key=args.key)
    cookies = cookie_dict(jar)
    args.secrets = [value for value in cookies.values() if len(value) >= 8]
    client = make_client(jar, getattr(args, "show", False))
    try:
        return await loop_rounds(args, client)
    finally:
        await client.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--phrases", nargs="+", help="search these instead of the phrases saved in ListeningKit")
    parser.add_argument("--count", type=int, default=20, help="posts per phrase, 1-20")
    parser.add_argument("--interval", type=int, default=0, help=f"seconds between rounds (at least {MIN_INTERVAL}); 0 runs once")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--verbose", action="store_true", help="show why a search failed (cookie values are hidden)")
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
        print(f"facebook helper: {error}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
