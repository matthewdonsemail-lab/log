"""Poll subreddits through reddit-camofox-client and push new posts to ListeningKit.

    LISTENINGKIT_INGEST_URL=https://<deployment>.convex.site/ingest \
    LISTENINGKIT_INGEST_KEY=lk_ingest_... \
    python clients/reddit_push.py marketing smallbusiness --interval 300

It uses the Reddit login you connected in ListeningKit (onboarding or Settings).
To use a local cookies file instead, set REDDIT_COOKIES_FILE=state/cookies.json.

The camofox client (`uvicorn reddit_camofox_client.api.app:app --port 8001`)
must be running. Use --dry-run to print what would be sent without pushing.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Callable

sys.path.insert(0, str(Path(__file__).parent))
from listeningkit_ingest import IngestError, SessionError, fetch_session, push  # noqa: E402

REDDIT = "https://reddit.com"
_BASE36 = re.compile(r"^[a-z0-9]{1,12}$")


def reddit_post_id(raw: object) -> str | None:
    """Same id the server-side mirror uses (`t3_<base36>`), so both sources dedupe together."""
    value = str(raw or "").strip().lower()
    if value.startswith("t3_"):
        value = value[3:]
    return f"t3_{value}" if _BASE36.match(value) else None


def to_ingest_post(record: dict) -> dict | None:
    """Map a camofox NormalizedPostRecord to the /ingest post shape. None for junk."""
    external_id = reddit_post_id(record.get("external_id"))
    link = str(record.get("permalink") or record.get("url") or "").strip()
    if link.startswith("/"):
        link = REDDIT + link
    if not external_id or not link.startswith(("http://", "https://")):
        return None
    author = record.get("author")
    name = author.get("name") if isinstance(author, dict) else author
    metrics = record.get("metrics") if isinstance(record.get("metrics"), dict) else {}
    content = str(record.get("content") or "").strip()
    post: dict = {
        "externalId": external_id,
        "authorName": str(name or "unknown"),
        "body": [content[:4000]] if content else [],
        "url": link,
        "likes": _count(metrics.get("score")),
        "comments": _count(metrics.get("comments")),
    }
    title = str(record.get("title") or "").strip()
    if title:
        post["title"] = title[:500]
    if record.get("occurred_at"):
        post["timestamp"] = str(record["occurred_at"])
    return post


def _count(value: object) -> int:
    return max(0, int(value)) if isinstance(value, (int, float)) and value == value else 0


def _post_json(url: str, body: dict, headers: dict) -> dict:
    request = urllib.request.Request(
        url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", **headers}, method="POST"
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        return json.loads(response.read().decode())


def fetch_records(
    client_url: str,
    subreddit: str,
    *,
    cookies: list[dict] | None,
    limit: int = 25,
    api_key: str | None = None,
    post: Callable[[str, dict, dict], dict] = _post_json,
) -> list[dict]:
    """One posts.listen call. The client reads only the first subreddit per call."""
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    body = {"account_id": "listeningkit", "cookies": cookies, "input": {"subreddits": [subreddit], "limit": limit}}
    response = post(f"{client_url.rstrip('/')}/api/posts/listen", body, headers)
    result = response.get("result") or {}
    return [row for row in result.get("new_posts", []) if isinstance(row, dict)]


def run_once(args: argparse.Namespace, cookies: list[dict] | None) -> int:
    for subreddit in args.subreddits:
        try:
            records = fetch_records(
                args.client_url, subreddit, cookies=cookies, limit=args.limit, api_key=os.getenv("REDDIT_API_KEY")
            )
        except (urllib.error.URLError, TimeoutError, ValueError) as error:
            print(f"r/{subreddit}: camofox client unreachable or failed: {error}", file=sys.stderr)
            continue
        posts = [mapped for mapped in map(to_ingest_post, records) if mapped]
        skipped = len(records) - len(posts)
        if not records:
            print(f"r/{subreddit}: no new posts (if this is unexpected, check the cookie jar is logged in)")
            continue
        if args.dry_run:
            print(f"r/{subreddit}: would push {len(posts)} posts, skip {skipped}")
            print(json.dumps(posts[:2], indent=2))
            continue
        try:
            totals = push("reddit", posts, endpoint=args.endpoint, key=args.key)
        except IngestError as error:
            print(f"r/{subreddit}: {error}", file=sys.stderr)
            return 1
        print(f"r/{subreddit}: pushed {totals['ingested']} posts, {skipped + totals['skipped']} skipped")
    return 0


def load_cookies(path: str | None) -> list[dict] | None:
    if not path:
        return None
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    return data.get("cookies") if isinstance(data, dict) else data


def resolve_cookies(args: argparse.Namespace) -> list[dict] | None:
    """REDDIT_COOKIES_FILE wins; otherwise use the Reddit login connected in ListeningKit."""
    path = os.getenv("REDDIT_COOKIES_FILE")
    if path:
        return load_cookies(path)
    if args.endpoint and args.key:
        return fetch_session("reddit", endpoint=args.endpoint, key=args.key)
    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("subreddits", nargs="+", help="subreddit names, without r/")
    parser.add_argument("--limit", type=int, default=25)
    parser.add_argument("--interval", type=int, default=0, help="seconds between polls; 0 runs once")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--client-url", default=os.getenv("REDDIT_CLIENT_URL", "http://localhost:8001"))
    args = parser.parse_args(argv)
    args.endpoint = os.getenv("LISTENINGKIT_INGEST_URL", "")
    args.key = os.getenv("LISTENINGKIT_INGEST_KEY", "")
    if not args.dry_run and not (args.endpoint and args.key):
        parser.error("set LISTENINGKIT_INGEST_URL and LISTENINGKIT_INGEST_KEY (or use --dry-run)")
    try:
        cookies = resolve_cookies(args)
    except SessionError as error:
        print(f"reddit login: {error}", file=sys.stderr)
        return 1
    while True:
        status = run_once(args, cookies)
        if not args.interval or status != 0:
            return status
        time.sleep(args.interval)


if __name__ == "__main__":
    raise SystemExit(main())
