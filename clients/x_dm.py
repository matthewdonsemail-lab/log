"""Read your X direct messages and send the ones queued in the ListeningKit dashboard.

    LISTENINGKIT_INGEST_URL=https://<deployment>.convex.site/ingest \\
    LISTENINGKIT_INGEST_KEY=lk_ingest_... \\
    python clients/x_dm.py --interval 300

It uses the X login you connected in ListeningKit: no password, no cookies file. Each round it
opens x.com/messages in a real Chrome window (Playwright, logged in with that login), reads your
recent conversations and pushes any new messages to ListeningKit, then sends any reply you queued
on the Messages page and reports back that it sent. Use --dry-run to only read, not send;
--show to watch the browser.

Heads up: this automates a logged-in X session. That can go against X's terms, and X may
rate-limit or lock accounts that automate. Use an account you can afford to lose, and keep
the interval at 5 minutes or more.
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from listeningkit_ingest import (  # noqa: E402
    IngestError, SessionError, fetch_pending_dms, fetch_proxy, fetch_session,
    push_dms, report_dm_failed, report_dm_sent,
)
from x_browser import AccountLocked, BrowserXClient, TooManyRequests, Unauthorized, X_DOMAINS  # noqa: E402

MIN_INTERVAL = 120
NOTICE = (
    "Note: this reads and sends your X direct messages through your own logged-in session. That can go "
    "against X's terms and X may lock accounts that automate. Use an account you can afford to lose."
)


class HelperError(RuntimeError):
    pass


def cookie_dict(jar: list[dict]) -> dict[str, str]:
    cookies: dict[str, str] = {}
    for cookie in jar:
        if not isinstance(cookie, dict):
            continue
        domain = str(cookie.get("domain", "")).lstrip(".").lower()
        if any(domain == d or domain.endswith(f".{d}") for d in X_DOMAINS) and cookie.get("name") and cookie.get("value"):
            cookies[str(cookie["name"])] = str(cookie["value"])
    if not all(name in cookies for name in ("auth_token", "ct0")):
        raise SessionError("Your connected X login is incomplete. Reconnect X in ListeningKit, then try again.")
    return cookies


async def one_round(args: argparse.Namespace, client: BrowserXClient) -> int:
    try:
        threads = await client.list_dm_threads()
    except Unauthorized:
        print("X refused the saved login. Reconnect X in ListeningKit (Settings), then run this again.", file=sys.stderr)
        return 1
    except AccountLocked:
        print("X wants this account checked or unlocked by hand before it will show messages.", file=sys.stderr)
        return 1
    except TooManyRequests:
        print("X asked us to slow down, so this round stops here.")
        threads = []
    if threads:
        if args.dry_run:
            print(f"would push {len(threads)} conversation(s)")
        else:
            try:
                totals = push_dms("x", threads, endpoint=args.endpoint, key=args.key)
                print(f"read {len(threads)} conversation(s), {totals['messagesAdded']} new message(s)")
            except IngestError as error:
                print(f"could not push messages: {error}", file=sys.stderr)
                return 1
    else:
        print("no conversations with new messages")

    if args.dry_run:
        return 0
    try:
        pending = fetch_pending_dms("x", endpoint=args.endpoint, key=args.key)
    except SessionError as error:
        print(str(error), file=sys.stderr)
        return 1
    if not pending:
        print("nothing queued to send")
        return 0
    for item in pending:
        try:
            external_id = await client.send_dm(item["peerHandle"], item["text"])
            report_dm_sent(item["id"], external_id, endpoint=args.endpoint, key=args.key)
            print(f"sent to @{item['peerHandle']}")
        except Unauthorized:
            print("X refused the saved login while sending. Reconnect X in ListeningKit.", file=sys.stderr)
            return 1
        except Exception as error:  # noqa: BLE001 - reported to the dashboard, not swallowed
            message = str(error)[:200] or type(error).__name__
            report_dm_failed(item["id"], message, endpoint=args.endpoint, key=args.key)
            print(f"could not send to @{item['peerHandle']}: {message}", file=sys.stderr)
    return 0


async def main_async(args: argparse.Namespace) -> int:
    print(NOTICE)
    jar = fetch_session("x", endpoint=args.endpoint, key=args.key)
    cookies = cookie_dict(jar)
    proxy = fetch_proxy(endpoint=args.endpoint, key=args.key)
    client = BrowserXClient(jar, show=args.show, proxy=proxy)
    try:
        while True:
            status = await one_round(args, client)
            if not args.interval or status != 0:
                return status
            await asyncio.sleep(args.interval)
    finally:
        await client.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--interval", type=int, default=0, help=f"seconds between rounds (at least {MIN_INTERVAL}); 0 runs once")
    parser.add_argument("--dry-run", action="store_true", help="only read messages, never send")
    parser.add_argument("--show", action="store_true", help="show the browser window instead of hiding it")
    args = parser.parse_args(argv)
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
