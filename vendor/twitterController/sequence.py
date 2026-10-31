#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Sequencer for approved X replies, quotes and DMs: one at a time, a random gap apart.

Every send goes through send_approved_reply.py (house style check, cookie redaction, exit codes), so this file never
touches cookies itself. Nothing is sent until the owner approves the exact queue: the approval stores a fingerprint of
every recipient + copy, and any edit afterwards voids it.

  uv run sequence.py build   --targets T.json --variations A.json [B.json ...] --out Q.json [--account H] [--action reply]
  uv run sequence.py show    Q.json                 review table: who, which post, what copy
  uv run sequence.py check   Q.json                 style-checks every pending item (dry run, contacts nothing)
  uv run sequence.py approve Q.json --by NAME       records the owner's approval of the queue as it stands now
  uv run sequence.py run     Q.json [--min 90] [--max 150] [--limit N]   sends pending items in order
  uv run sequence.py run     Q.json --by NAME   approve + send in one command
  uv run sequence.py run     Q.json --fail-fast [--alert-channel UUID --alert-reply-to ID --alert-mention HEX]
                             no auto-recovery: the first block, deleted post, limit or error stops the run (exit 5)
                             and, with --alert-channel, posts the reason to buzz
  uv run sequence.py run     Q.json --timing human [--hours 9-23] [--like-first]
                             human: log-normal gaps around the middle of --min/--max with a long tail and the odd
                             10-35 min break, only inside --hours (local time). --like-first likes each post a
                             short read-time before replying to it
  uv run sequence.py plan    Q.json [same timing flags]   prints the gaps a run would use, contacts nothing
  uv run sequence.py status  Q.json

Queue file: {"account": handle, "approval": null, "items": [{"n", "action", "tweet_url" | "user_id", "text",
"handle"?, "status": "pending" | "sent" | "blocked" | "gone" | "failed" | "skipped"}]}. Set an item's status to "skipped" to leave it out.
run saves after every item, so Ctrl-C and run again resumes. Auto-recovery: one blocked reply (x made no tweet,
usually the author's reply limits) is skipped; 6 blocked in a row re-queues them and cools down 2h, then 6h, then 12h;
x's daily limit (344) waits 24h; 3 errors in a row re-queue them and wait 30 min. After 3 cooldowns with nothing sent,
or on an auth failure (exit 2), it stops. Log: <queue>.log next to the queue."""
import argparse, datetime, hashlib, json, math, os, random, re, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
SENDER = "send_approved_reply.py"
ACTIONS = ("reply", "quote", "dm")


def now():
    return datetime.datetime.now(datetime.UTC).isoformat(timespec="seconds")


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def save(p, q):
    p = Path(p); tmp = p.with_suffix(p.suffix + ".tmp")
    tmp.write_text(json.dumps(q, ensure_ascii=False, indent=1), encoding="utf-8"); tmp.replace(p)


def log(qp, msg):
    line = f"{datetime.datetime.now():%Y-%m-%d %H:%M:%S} {msg}"
    print(line, flush=True)
    with Path(qp).with_suffix(".log").open("a", encoding="utf-8") as f:
        f.write(line + "\n")


def target(it):
    return it.get("tweet_url") if it["action"] in ("reply", "quote") else it.get("user_id")


def fingerprint(q):
    """what the owner approved: account + every non-skipped item's action, target and exact copy"""
    rows = [[it["n"], it["action"], target(it), it["text"]] for it in q["items"] if it["status"] != "skipped"]
    return hashlib.sha256(json.dumps([q["account"], rows], ensure_ascii=False).encode()).hexdigest()


def sender(args):
    p = subprocess.run(["uv", "run", "--quiet", SENDER, *args], cwd=HERE, capture_output=True, text=True, encoding="utf-8")
    return p.returncode, (p.stdout + p.stderr).strip()[-600:]


def sent_id(out):
    """the new tweet id (or dm conversation id) from the sender's json line, else None"""
    m = re.search(r'"(?:tweet_id|conversation_id)": "?(\d+)', out)
    return m.group(1) if m else None


def sender_args(it, approved_by, account, dry):
    a = ["--action", it["action"], "--text", it["text"], "--approved-by", approved_by]
    a += ["--tweet-url", it["tweet_url"]] if it["action"] in ("reply", "quote") else ["--user-id", str(it["user_id"])]
    return a + (["--dry-run"] if dry else ["--account", account])


def human_gap(lo, hi, rng=random):
    """seconds until the next send: log-normal around the geometric middle of [lo, hi] so most gaps sit near it,
    a few are quick and some run long, plus a 12% chance of stepping away for 10-35 min. never under lo"""
    g = rng.lognormvariate(math.log(math.sqrt(lo * hi)), 0.45)
    if rng.random() < 0.12:
        g += rng.uniform(10 * 60, 35 * 60)
    return int(max(lo, min(g, hi * 3 + 35 * 60)))


def read_gap(rng=random):
    """seconds between liking a post and replying to it: reading it and typing, 15 s to 3 min, mostly ~45 s"""
    return int(max(15, min(rng.lognormvariate(math.log(45), 0.5), 180)))


def next_gap(a, rng=random):
    return human_gap(a.min, a.max, rng) if a.timing == "human" else rng.randint(a.min, a.max)


def until_active(hours, at=None):
    """seconds to wait until the --hours window (local, "9-23") opens, 0 if inside it now"""
    if not hours:
        return 0
    start, end = (int(x) for x in hours.split("-"))
    at = at or datetime.datetime.now()
    if start <= at.hour < end:
        return 0
    nxt = at.replace(hour=start, minute=0, second=0, microsecond=0)
    if at.hour >= end:
        nxt += datetime.timedelta(days=1)
    return int((nxt - at).total_seconds()) + random.randint(0, 40 * 60)


def cmd_plan(a):
    q = load(a.queue); rng = random.Random()
    todo = [it for it in q["items"] if it["status"] == "pending"][: a.limit or None]
    t = 0
    for i, it in enumerate(todo):
        gap = 0 if i == 0 else next_gap(a, rng)
        t += gap
        rd = read_gap(rng) if a.like_first else 0
        print(f"+{gap // 60:>3}m{gap % 60:02d}s  at {t // 3600}h{t % 3600 // 60:02d}m  #{it['n']} @{it.get('handle')}"
              + (f"  (like, reply {rd}s later)" if a.like_first else ""))
        t += rd
    print(f"\n{len(todo)} replies over about {t / 3600:.1f} h ({a.timing} timing{', hours ' + a.hours if a.hours else ''})")


def cmd_build(a):
    out = Path(a.out)
    if out.exists():
        sys.exit(f"{out} exists; not overwriting")
    t = load(a.targets); targets = t["items"] if isinstance(t, dict) else t
    pool = []
    for f in a.variations:
        v = load(f); pool += v["messages"] if isinstance(v, dict) else v
    pool = list(dict.fromkeys(pool))
    if len(pool) < len(targets):
        sys.exit(f"{len(pool)} unique lines for {len(targets)} targets: add more variations")
    random.Random(a.seed).shuffle(pool)
    items = []
    for i, (tg, text) in enumerate(zip(targets, pool), 1):
        it = {"n": i, "action": a.action, "handle": tg.get("handle"), "text": text, "status": "pending"}
        if a.action == "dm":
            it["user_id"] = tg["user_id"]
        else:
            it["tweet_url"] = tg.get("tweet_url") or tg["post_url"]; it["post_text"] = (tg.get("post_text") or "")[:200]
        items.append(it)
    save(out, {"created": now(), "account": a.account, "approval": None, "sources": [str(a.targets), *map(str, a.variations)], "items": items})
    print(f"built {out}: {len(items)} {a.action} items from {len(pool)} lines, nothing sent. next: show, check, approve")


def cmd_show(a):
    q = load(a.queue)
    for it in q["items"]:
        print(f"{it['n']:>4} {it['status']:<8} @{it.get('handle') or '?':<20} {target(it)}\n       {it['text']}")
    print(f"\naccount @{q['account']} | approval: {q['approval']['by'] + ' at ' + q['approval']['at'] if q.get('approval') else 'none'}")


def cmd_check(a):
    q = load(a.queue); bad = 0
    todo = [it for it in q["items"] if it["status"] == "pending"]
    for it in todo:
        if it["action"] not in ACTIONS or not target(it):
            bad += 1; log(a.queue, f"BAD ITEM #{it['n']}: needs action in {ACTIONS} and its target"); continue
        code, out = sender(sender_args(it, "check", q["account"], dry=True))
        if code:
            bad += 1; log(a.queue, f"STYLE/ARG FAIL #{it['n']} @{it.get('handle')}: {out[-200:]}")
    log(a.queue, f"checked {len(todo)} pending: {bad} failed (nothing sent)")
    sys.exit(1 if bad else 0)


def cmd_approve(a):
    q = load(a.queue)
    q["approval"] = {"by": a.by, "at": now(), "fingerprint": fingerprint(q),
                     "count": sum(it["status"] == "pending" for it in q["items"])}
    save(a.queue, q); log(a.queue, f"approved by {a.by}: {q['approval']['count']} pending items as they stand now")


def cmd_status(a):
    q = load(a.queue); c = {}
    for it in q["items"]:
        c[it["status"]] = c.get(it["status"], 0) + 1
    print(json.dumps({"account": q["account"], "approved_by": (q.get("approval") or {}).get("by"), **c}))


THROTTLE_COOLDOWNS = (2 * 3600, 6 * 3600, 12 * 3600)   # pauses after a streak of blocks, longer each time
LIMIT_COOLDOWN = 24 * 3600                               # X daily send limit (344)
FAIL_COOLDOWN = 30 * 60                                  # 3 send errors in a row (network, X hiccup)
MAX_STRIKES = 3                                          # cool-downs in a row with nothing sent: give up


def cooldown(qp, q, secs, why):
    save(qp, q)
    back = datetime.datetime.now() + datetime.timedelta(seconds=secs)
    log(qp, f"COOLDOWN {secs // 60} min: {why}. resuming at {back:%Y-%m-%d %H:%M}")
    time.sleep(secs)
    log(qp, "RESUMED after cooldown")


def alert(a, qp, msg):
    """fail-fast stop: shout in the log and, when asked, in a buzz channel"""
    log(qp, "!" * 60); log(qp, f"STOPPED: {msg}"); log(qp, "!" * 60)
    if not getattr(a, "alert_channel", None):
        return
    cmd = ["buzz", "messages", "send", "--channel", a.alert_channel, "--content", f"x reply queue stopped: {msg}"]
    if a.alert_reply_to:
        cmd += ["--reply-to", a.alert_reply_to]
    for m in a.alert_mention or []:
        cmd += ["--mention", m]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        log(qp, f"buzz alert {'sent' if r.returncode == 0 else 'FAILED: ' + (r.stderr or r.stdout)[-160:]}")
    except Exception as e:
        log(qp, f"buzz alert FAILED: {e}")


def cmd_run(a):
    if a.by:   # approve and send in one go: the owner typing --by is the approval of the queue as it stands now
        cmd_approve(a)
    q = load(a.queue); ap = q.get("approval")
    if not ap:
        sys.exit("not approved: review with show, then approve --by <owner>")
    if ap["fingerprint"] != fingerprint(q):
        sys.exit("the queue changed after it was approved: review it again and re-approve")
    lock = Path(a.queue).with_suffix(".lock")
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY); os.write(fd, str(os.getpid()).encode()); os.close(fd)
    except FileExistsError:
        sys.exit(f"another run holds {lock}; delete it only if no run is going")
    try:
        todo = [it for it in q["items"] if it["status"] == "pending"][: a.limit or None]
        log(a.queue, f"sending {len(todo)} from @{q['account']}, approved by {ap['by']}, {a.timing} gaps {a.min}-{a.max} s"
                     + (f", hours {a.hours}" if a.hours else "") + (", like first" if a.like_first else "") + ", "
                     + ("fail-fast: stop on the first problem" if a.fail_fast else "auto-recovery on"))
        fails = strikes = 0
        streak = []          # items blocked in a row since the last send
        errs = []
        first = True
        while todo:
            it = todo.pop(0)
            if not first:
                wait = next_gap(a)
                log(a.queue, f"next in {wait} s (#{it['n']} @{it.get('handle')})"); time.sleep(wait)
            first = False
            off = until_active(a.hours)
            if off:
                log(a.queue, f"outside hours {a.hours}, waiting {off // 60} min"); time.sleep(off)
            if a.like_first and it["action"] in ("reply", "quote") and not it.get("liked_at"):
                lc, lout = sender(["--action", "like", "--tweet-url", it["tweet_url"], "--approved-by", ap["by"], "--account", q["account"]])
                if lc or '"liked": true' not in lout:
                    it["result"] = lout[-200:]; save(a.queue, q)
                    alert(a, a.queue, f"#{it['n']} @{it.get('handle')} like failed (exit {lc}), nothing replied. {lout[-160:]}")
                    sys.exit(5)
                it["liked_at"] = now(); save(a.queue, q)
                rd = read_gap()
                log(a.queue, f"LIKED #{it['n']} @{it.get('handle')}, replying in {rd} s"); time.sleep(rd)
            code, out = sender(sender_args(it, ap["by"], q["account"], dry=False))
            it["attempted_at"] = now()
            if code == 0 and not sent_id(out):
                code, out = 3, "x created nothing (no id came back): " + out   # never count a missing id as sent
            if code == 0:
                it["status"] = "sent"; it["sent_id"] = sent_id(out); fails = strikes = 0; streak = []; errs = []
                it["sent_url"] = f"https://x.com/{q['account']}/status/{it['sent_id']}" if it["action"] != "dm" else None
                it["result"] = out[-200:]
                log(a.queue, f"SENT #{it['n']} @{it.get('handle')} {it['sent_url'] or 'dm ' + it['sent_id']} "
                             f"({sum(i['status'] == 'sent' for i in q['items'])} sent)")
            elif a.fail_fast:
                kind = ("auth" if code == 2 else "daily limit 344" if re.search(r"\b344\b", out)
                        else "post gone or replies off" if re.search(r"\((385|433)\)", out)
                        else "x made no tweet (blocked/throttled)" if "x created no" in out else f"error exit {code}")
                it["status"] = "failed"; it["result"] = out[-200:]; save(a.queue, q)
                sent = sum(i["status"] == "sent" for i in q["items"])
                alert(a, a.queue, f"#{it['n']} @{it.get('handle')} {kind} after {sent} sent. {out[-160:]}")
                sys.exit(5)
            elif code == 2:
                save(a.queue, q); log(a.queue, f"STOP: session/auth failure, log in to x again by hand: {out[-160:]}"); sys.exit(2)
            elif re.search(r"\b344\b", out):
                todo.insert(0, it); strikes += 1
                if strikes > MAX_STRIKES:
                    save(a.queue, q); log(a.queue, f"STOP: {MAX_STRIKES} cooldowns with nothing sent"); sys.exit(4)
                cooldown(a.queue, q, LIMIT_COOLDOWN, "x daily send limit (344)"); first = True
            elif re.search(r"\((385|433)\)", out):
                # 385 = their post is deleted or hidden, 433 = they turned replies off: nothing to retry, skip them
                it["status"] = "gone"; it["result"] = out[-200:]
                log(a.queue, f"GONE #{it['n']} @{it.get('handle')}: post deleted, hidden or replies off, skipping")
            elif "x created no tweet" in out or "x created nothing" in out:
                # one block = that author limits replies: skip them. 6 in a row = x is throttling the account: those 6
                # were probably fine, so put them back at the end, cool down, then test again with one reply.
                it["status"] = "blocked"; it["result"] = out[-200:]; streak.append(it)
                log(a.queue, f"BLOCKED #{it['n']} @{it.get('handle')}: x made no tweet, skipping ({len(streak)} in a row)")
                if len(streak) >= 6:
                    for b in streak:
                        b["status"] = "pending"; todo.append(b)
                    strikes += 1
                    if strikes > MAX_STRIKES:
                        save(a.queue, q); log(a.queue, f"STOP: {MAX_STRIKES} cooldowns with nothing sent, x is throttling the account"); sys.exit(4)
                    cooldown(a.queue, q, THROTTLE_COOLDOWNS[strikes - 1], f"{len(streak)} blocked in a row, x is likely throttling; re-queued them")
                    streak = streak[-5:]; first = True   # after the pause one more block means still throttled
                    for b in streak:
                        b["status"] = "pending"
            else:
                it["status"] = "failed"; it["result"] = out[-200:]; fails += 1; errs.append(it)
                log(a.queue, f"FAILED #{it['n']} @{it.get('handle')} (exit {code}): {out[-160:]}")
                if fails >= 3:
                    for e in errs[-3:]:   # errors in a row are likely on our side or x's, not the person: retry them later
                        e["status"] = "pending"; todo.append(e)
                    errs = []
                    strikes += 1
                    if strikes > MAX_STRIKES:
                        save(a.queue, q); log(a.queue, f"STOP: {MAX_STRIKES} cooldowns with nothing sent"); sys.exit(3)
                    cooldown(a.queue, q, FAIL_COOLDOWN, "3 send errors in a row"); fails = 2; first = True
            save(a.queue, q)
        c = {s_: sum(i["status"] == s_ for i in q["items"]) for s_ in ("sent", "blocked", "gone", "failed", "pending")}
        log(a.queue, f"done: {c['sent']} sent, {c['blocked']} blocked, {c['gone']} gone, {c['failed']} failed, {c['pending']} pending")
    except KeyboardInterrupt:
        save(a.queue, q); log(a.queue, "stopped by Ctrl-C; run the same command to carry on")
    finally:
        lock.unlink(missing_ok=True)


def main():
    p = argparse.ArgumentParser(description="Sequence owner-approved X replies, quotes and DMs")
    s = p.add_subparsers(dest="cmd", required=True)
    b = s.add_parser("build"); b.add_argument("--targets", required=True); b.add_argument("--variations", nargs="+", required=True)
    b.add_argument("--out", required=True); b.add_argument("--account", default=os.environ.get("TWITTER_ACCOUNT_HANDLE"), required=not os.environ.get("TWITTER_ACCOUNT_HANDLE"))
    b.add_argument("--action", choices=ACTIONS, default="reply"); b.add_argument("--seed", type=int, default=1)
    for name in ("show", "check", "status"):
        s.add_parser(name).add_argument("queue")
    pl = s.add_parser("plan"); pl.add_argument("queue")
    ap = s.add_parser("approve"); ap.add_argument("queue"); ap.add_argument("--by", required=True)
    r = s.add_parser("run"); r.add_argument("queue"); r.add_argument("--min", type=int, default=90); r.add_argument("--max", type=int, default=150)
    r.add_argument("--limit", type=int, default=0, help="send at most N this run")
    r.add_argument("--by", help="owner name: approve the queue as it stands and send in one command")
    r.add_argument("--fail-fast", action="store_true", help="no auto-recovery: stop on the first problem of any kind")
    r.add_argument("--alert-channel", help="buzz channel uuid to post the stop reason to (fail-fast)")
    r.add_argument("--alert-reply-to", help="buzz event id to thread the alert under")
    r.add_argument("--alert-mention", action="append", help="pubkey to mention in the alert, repeatable")
    for x in (r, pl):
        if x is pl:
            x.add_argument("--min", type=int, default=90); x.add_argument("--max", type=int, default=150); x.add_argument("--limit", type=int, default=0)
        x.add_argument("--timing", choices=("uniform", "human"), default="uniform")
        x.add_argument("--hours", help="only send inside these local hours, e.g. 9-23")
        x.add_argument("--like-first", action="store_true", help="like each post a short read-time before replying")
    a = p.parse_args()
    if a.cmd in ("run", "plan") and a.hours and not re.fullmatch(r"\d{1,2}-\d{1,2}", a.hours):
        sys.exit("--hours looks like 9-23")
    if a.cmd in ("run", "plan") and not 30 <= a.min <= a.max:
        sys.exit("--min must be at least 30 s and not above --max")
    {"build": cmd_build, "show": cmd_show, "check": cmd_check, "approve": cmd_approve, "status": cmd_status, "run": cmd_run, "plan": cmd_plan}[a.cmd](a)


if __name__ == "__main__":
    main()
