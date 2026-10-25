#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["python-statemachine>=3.2,<4"]
# ///
"""Random-window runner for an approved sequence.py queue: every like and reply lands at a truly random moment
inside a window you pick, and a state machine (python-statemachine) walks the run so it can only ever be
planned -> waiting -> liking/replying -> waiting ... -> finished, or halted on the first problem. with --like the
system random source also picks, per post, whether it gets a like and whether that like comes before or after the reply.

  uv run random_run.py plan Q.json --limit 28 --window 5h [--start "2026-10-17 12:00"] [--min-gap 120] [--like]
      draws the times with the OS random source (secrets.SystemRandom), uniform across the window, at least
      --min-gap apart, saves them in the queue and prints them. contacts nothing. run plan again to re-draw
  uv run random_run.py run Q.json [--alert-channel UUID --alert-reply-to ID --alert-mention HEX]
      waits for each saved time and fires it. a block or throttle (x made no tweet, 429, 226, 344, network) cools
      off instead of stopping: 7.5-15 min, then 15-30, 30-60, 1-2h, 2-4h (doubling, system-random jitter, or x's own
      reset time when it sends one), moves the rest of the plan later by the pause and carries on. the failed post is
      retried once at the end; failing twice marks it blocked and skips it. a deleted post or replies-off (385/433)
      is skipped. it halts (exit 5, buzz alert) only on an auth failure or after 5 cool-offs in a row with nothing
      out. if it falls behind by more than 10 min for any other reason it halts too (re-plan)
  uv run random_run.py nudge Q.json [--replies 2]
      tells the run that's going to send the next N replies now instead of waiting for their times (any like
      due before them goes too, a random 20-60 s apart). the rest of the plan keeps its times

Sends go through send_approved_reply.py via sequence.py, so approval, style checks and cookie handling are the same.
"""
import argparse, datetime, os, re, secrets, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sequence as seq  # noqa: E402
from statemachine import State, StateMachine  # noqa: E402

RNG = secrets.SystemRandom()
LATE = 10 * 60   # an event this far past its time means the run fell behind
POLL = 5         # how often a waiting run checks for a nudge, seconds
COOL_BASE = 15 * 60   # first cool-off ceiling; doubles each time in a row
COOL_CAP = 4 * 3600   # longest single cool-off
MAX_COOLS = 5         # cool-offs in a row with nothing out: give up and halt
DAY = 24 * 3600       # x's daily limit (344) when it gives no reset time


class Run(StateMachine):
    planned = State(initial=True)
    waiting = State()
    liking = State()
    replying = State()
    cooling = State()
    finished = State(final=True)
    halted = State(final=True)

    begin = planned.to(waiting)
    like_due = waiting.to(liking)
    reply_due = waiting.to(replying)
    acted = liking.to(waiting) | replying.to(waiting)
    cool = liking.to(cooling) | replying.to(cooling)
    resume = cooling.to(waiting)
    complete = waiting.to(finished)
    fail = planned.to(halted) | waiting.to(halted) | liking.to(halted) | replying.to(halted) | cooling.to(halted)


def parse_span(s):
    m = re.fullmatch(r"(\d+(?:\.\d+)?)([hm])", s)
    if not m:
        sys.exit("--window looks like 5h or 90m")
    return float(m.group(1)) * (3600 if m.group(2) == "h" else 60)


def draw(n, start, span, min_gap, rng=RNG):
    """n uniform random moments in [start, start+span], sorted, each at least min_gap apart"""
    if n and (n - 1) * min_gap > span:
        sys.exit(f"{n} events {min_gap}s apart don't fit in {span / 3600:.1f}h: widen --window or lower --min-gap")
    # pick n points in the window shrunk by the gaps, then push each one along by its gaps: uniform and exact
    free = span - (n - 1) * min_gap
    pts = sorted(rng.uniform(0, free) for _ in range(n))
    return [start + p + i * min_gap for i, p in enumerate(pts)]


def cmd_plan(a):
    q = seq.load(a.queue)
    todo = [it for it in q["items"] if it["status"] == "pending"][: a.limit or None]
    start = (datetime.datetime.strptime(a.start, "%Y-%m-%d %H:%M") if a.start else datetime.datetime.now()).timestamp()
    span = parse_span(a.window)
    # system random decides per post: like it before the reply, after the reply, or not at all
    plans = {it["n"]: pick_kinds(a.like, a.like_chance) for it in todo}
    times = draw(sum(map(len, plans.values())), start, span, a.min_gap)
    # random order across the slots, but each post's like still comes before its own reply
    events = interleave([{"n": n, "kind": k} for n, ks in plans.items() for k in ks])
    for e, t in zip(events, times):
        e["at"] = datetime.datetime.fromtimestamp(t).isoformat(timespec="seconds")
    q["random_run"] = {"planned": seq.now(), "window": a.window, "min_gap": a.min_gap, "events": events}
    seq.save(a.queue, q)
    by_n = {it["n"]: it for it in q["items"]}
    prev = None
    for e in events:
        t = datetime.datetime.fromisoformat(e["at"])
        gap = "" if prev is None else f"+{int((t - prev).total_seconds()) // 60}m"
        print(f"{t:%H:%M:%S} {gap:>6}  {e['kind']:<5} #{e['n']} @{by_n[e['n']].get('handle')}")
        prev = t
    print(f"\n{len(events)} events ({len(todo)} posts) across {a.window} from {datetime.datetime.fromtimestamp(start):%H:%M}, "
          f"min {a.min_gap}s apart. saved in {a.queue}, nothing sent")


def pick_kinds(like, chance, rng=RNG):
    """which actions one post gets and in what order, all drawn from the system random source"""
    if not like or rng.random() >= chance:
        return ["reply"]
    return ["like", "reply"] if rng.random() < 0.5 else ["reply", "like"]


def interleave(events):
    """random order of all events, keeping each post's own actions in the order picked for it"""
    pending = {}
    for e in events:
        pending.setdefault(e["n"], []).append(e)
    out = []
    while pending:
        n = RNG.choice(list(pending))
        out.append(pending[n].pop(0))
        if not pending[n]:
            del pending[n]
    return out


def cool_secs(k, reset=None, daily=False, rng=RNG):
    """length of the k-th cool-off in a row (0 = first). x's own reset time wins when it gave one; otherwise
    exponential backoff with equal jitter: half the step fixed, the other half from the system random source,
    so a pause is never near zero and never falls into a pattern"""
    if reset:
        return max(reset - time.time(), 60) + rng.uniform(30, 180)
    if daily:
        return DAY + rng.uniform(0, 1800)
    step = min(COOL_CAP, COOL_BASE * 2 ** k)
    return step / 2 + rng.uniform(0, step / 2)


def classify(code, out):
    """what a failed like or reply means: auth (halt), gone (skip the post) or throttle (cool off and retry)"""
    if code == 2:
        return "auth"
    if re.search(r"\((385|433)\)", out):
        return "gone"
    return "throttle"


def reset_at(out):
    """unix time x said its limit resets, only when x says the limit is actually hit: twikit's
    TooManyRequests.rate_limit_reset (http 429) or the create call's x-rate-limit-reset with 0 remaining"""
    m = re.search(r'"rate_limit_reset": (\d{9,})', out)
    if m:
        return int(m.group(1))
    if re.search(r'x-rate-limit-remaining\\?": \\?"0\\?"', out):
        m = re.search(r'x-rate-limit-reset\\?": \\?"(\d{9,})', out)
        return int(m.group(1)) if m else None
    return None


def shift_rest(todo, gap_from=60, gap_to=300):
    """after a pause, move the rest of the plan later by one amount so its random gaps stay as drawn"""
    if not todo:
        return
    first = datetime.datetime.fromisoformat(todo[0]["at"]).timestamp()
    by = time.time() + RNG.uniform(gap_from, gap_to) - first
    if by > 0:
        for e in todo:
            t = datetime.datetime.fromisoformat(e["at"]).timestamp() + by
            e["at"] = datetime.datetime.fromtimestamp(t).isoformat(timespec="seconds")


def requeue(todo, events, n, min_gap):
    """move a post's remaining events to the end of the plan, its own like/reply order kept, for one retry"""
    mine = [x for x in todo if x["n"] == n]
    for x in mine:
        todo.remove(x)
    gap = max(min_gap, 60)
    last = max([datetime.datetime.fromisoformat(x["at"]).timestamp() for x in todo] or [time.time()])
    for x in mine:
        last += RNG.uniform(gap, 2 * gap)
        x["at"] = datetime.datetime.fromtimestamp(last).isoformat(timespec="seconds")
        events.remove(x); events.append(x)
    todo.extend(mine)


def drop(todo, n, why):
    """skip every remaining event of one post"""
    for x in [x for x in todo if x["n"] == n]:
        x["skipped"] = why; todo.remove(x)


def note(a, qp, msg):
    """log, and post quietly (no mention) to the alert thread: the run carries on"""
    seq.log(qp, msg)
    if not getattr(a, "alert_channel", None):
        return
    cmd = ["buzz", "messages", "send", "--channel", a.alert_channel, "--content", f"x reply queue: {msg}"]
    if a.alert_reply_to:
        cmd += ["--reply-to", a.alert_reply_to]
    try:
        seq.subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except Exception as ex:
        seq.log(qp, f"buzz note FAILED: {ex}")


def nudge_path(qp):
    return Path(qp).with_suffix(".nudge")


def take_nudge(qp):
    """replies asked for by nudge since the last check (0 if none), and clears the request"""
    p = nudge_path(qp)
    try:
        n = int(p.read_text().strip() or 0)
    except (FileNotFoundError, ValueError):
        return 0
    p.unlink(missing_ok=True)
    return max(n, 0)


def wait_until(qp, due):
    """sleep until due, waking early with the reply count if a nudge comes in"""
    while (left := due - time.time()) > 0:
        time.sleep(min(POLL, left))
        if n := take_nudge(qp):
            return n
    return 0


def cmd_nudge(a):
    if not Path(a.queue).with_suffix(".lock").exists():
        sys.exit("no run is going on this queue: start one with run first")
    p = nudge_path(a.queue)
    try:
        have = int(p.read_text().strip() or 0)
    except (FileNotFoundError, ValueError):
        have = 0
    p.write_text(str(have + a.replies))
    seq.log(a.queue, f"nudge: send the next {have + a.replies} replies now")
    print(f"nudged: the run sends the next {have + a.replies} replies now (log: {Path(a.queue).with_suffix('.log')})")


def cmd_run(a):
    q = seq.load(a.queue); ap = q.get("approval"); rr = q.get("random_run")
    if not ap:
        sys.exit("not approved: review with sequence.py show, then approve --by <owner>")
    if ap["fingerprint"] != seq.fingerprint(q):
        sys.exit("the queue changed after it was approved: review it again and re-approve")
    if not rr:
        sys.exit("no random plan: run plan first")
    lock = Path(a.queue).with_suffix(".lock")
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY); os.write(fd, str(os.getpid()).encode()); os.close(fd)
    except FileExistsError:
        sys.exit(f"another run holds {lock}; delete it only if no run is going")
    by_n = {it["n"]: it for it in q["items"]}
    sm = Run()
    try:
        todo = [e for e in rr["events"] if not e.get("done") and not e.get("skipped")]
        seq.log(a.queue, f"random run: {len(todo)} events from @{q['account']}, approved by {ap['by']}, "
                         f"window {rr['window']}, cool-off on blocks")
        sm.begin()
        nudged = take_nudge(a.queue)   # replies still to fire early because of a nudge
        cools = 0                      # cool-offs in a row with nothing out
        while todo:
            e = todo.pop(0)
            it = by_n[e["n"]]
            due = datetime.datetime.fromisoformat(e["at"]).timestamp()
            if nudged:
                time.sleep(RNG.uniform(20, 60))
                seq.log(a.queue, f"[{sm.current_state.id}] nudged: {e['kind']} #{e['n']} @{it.get('handle')} now "
                                 f"(was {e['at']}, {nudged} replies left in the nudge)")
            else:
                wait = due - time.time()
                if wait < -LATE:
                    return halt(a, q, sm, f"fell behind: {e['kind']} #{e['n']} was due at {e['at']}, re-plan before running again")
                if wait > 0:
                    seq.log(a.queue, f"[{sm.current_state.id}] next {e['kind']} #{e['n']} @{it.get('handle')} at {e['at']}")
                    if nudged := wait_until(a.queue, due):
                        seq.log(a.queue, f"[{sm.current_state.id}] nudged: {e['kind']} #{e['n']} @{it.get('handle')} now "
                                         f"(was {e['at']}, {nudged} replies in the nudge)")
            if it["status"] != ("sent" if e["kind"] == "like" and it.get("sent_at_run") == rr["planned"] else "pending"):
                return halt(a, q, sm, f"#{e['n']} is {it['status']}, not ready for its {e['kind']}: re-plan")
            if e["kind"] == "like":
                sm.like_due()
                code, out = seq.sender(["--action", "like", "--tweet-url", it["tweet_url"],
                                        "--approved-by", ap["by"], "--account", q["account"]])
                ok = not code and '"liked": true' in out
                if ok:
                    it["liked_at"] = seq.now()
                    seq.log(a.queue, f"LIKED #{e['n']} @{it.get('handle')}")
            else:
                sm.reply_due()
                code, out = seq.sender(seq.sender_args(it, ap["by"], q["account"], dry=False))
                it["attempted_at"] = seq.now()
                sid = seq.sent_id(out)
                ok = not code and bool(sid)
                if ok:
                    it.update(status="sent", sent_id=sid, sent_url=f"https://x.com/{q['account']}/status/{sid}",
                              result=out[-200:], sent_at_run=rr["planned"])
                    seq.log(a.queue, f"SENT #{e['n']} @{it.get('handle')} {it['sent_url']}")
                    nudged = max(nudged - 1, 0)
            if ok:
                cools = 0
                e["done"] = seq.now(); sm.acted(); seq.save(a.queue, q)
                continue
            it["result"] = out[-200:]
            what = f"{e['kind']} #{e['n']} @{it.get('handle')}"
            kind = classify(code, out)
            if kind == "auth":
                return halt(a, q, sm, f"{what} auth failed, log in to x again by hand. {out[-200:]}")
            if kind == "gone":
                if it["status"] == "pending":
                    it["status"] = "gone"
                e["skipped"] = "gone"; drop(todo, e["n"], "gone")
                seq.log(a.queue, f"GONE {what}: post deleted, hidden or replies off, skipping it")
                sm.acted(); seq.save(a.queue, q)
                continue
            # block or throttle: retry this event once at the end. failing twice means it's that post, not the pace
            e["fails"] = e.get("fails", 0) + 1
            if e["fails"] >= 2:
                e["skipped"] = "blocked"
                if e["kind"] == "reply":   # no reply means no like-after-reply either
                    it["status"] = "blocked"; drop(todo, e["n"], "blocked")
                retry = "failed twice, skipping it"
            else:
                todo.insert(0, e); requeue(todo, rr["events"], e["n"], rr.get("min_gap", 120))
                retry = "retrying it once at the end"
            if cools >= MAX_COOLS:
                return halt(a, q, sm, f"{what} still blocked after {MAX_COOLS} cool-offs in a row with nothing out. {out[-200:]}")
            reset = reset_at(out)
            secs = cool_secs(cools, reset, daily=bool(re.search(r"\b344\b", out)))
            cools += 1
            sm.cool(); seq.save(a.queue, q)
            back = datetime.datetime.now() + datetime.timedelta(seconds=secs)
            note(a, a.queue, f"[cooling] {what} x made no tweet or throttled ({retry}). cool-off {cools} of {MAX_COOLS}: "
                             f"{secs / 60:.0f} min{' (x reset time)' if reset else ''}, back at {back:%H:%M}. x said: {out[-160:]}")
            if nudged := wait_until(a.queue, time.time() + secs):
                seq.log(a.queue, f"nudge ended the cool-off early ({nudged} replies)")
            shift_rest(todo)
            sm.resume(); seq.save(a.queue, q)
            seq.log(a.queue, f"[{sm.current_state.id}] back from cool-off {cools}, {len(todo)} events left, "
                             f"next at {todo[0]['at'] if todo else '-'}")
        sm.complete()
        sent = sum(1 for e in rr["events"] if e["kind"] == "reply" and e.get("done"))
        skipped = sum(1 for e in rr["events"] if e["kind"] == "reply" and e.get("skipped"))
        seq.log(a.queue, f"[{sm.current_state.id}] random run done: {sent} replies sent, {skipped} skipped")
    except KeyboardInterrupt:
        seq.save(a.queue, q); seq.log(a.queue, "stopped by Ctrl-C; run the same command to carry on (re-plan if it's late)")
    finally:
        lock.unlink(missing_ok=True)


def halt(a, q, sm, msg):
    sm.fail(); seq.save(a.queue, q)
    sent = sum(i["status"] == "sent" for i in q["items"])
    seq.alert(a, a.queue, f"[{sm.current_state.id}] {msg} ({sent} sent in total)")
    sys.exit(5)


def main():
    p = argparse.ArgumentParser(description="Fire an approved queue at random moments inside a window")
    s = p.add_subparsers(dest="cmd", required=True)
    pl = s.add_parser("plan"); pl.add_argument("queue"); pl.add_argument("--limit", type=int, default=0)
    pl.add_argument("--window", required=True, help="how long to spread it over, e.g. 5h or 90m")
    pl.add_argument("--start", help='local start "YYYY-MM-DD HH:MM", default now')
    pl.add_argument("--min-gap", type=int, default=120, help="seconds between any two events, at least 30")
    pl.add_argument("--like", action="store_true", help="randomly like posts too, each at its own random moment")
    pl.add_argument("--like-chance", type=float, default=0.7, help="chance a post gets a like (before or after the reply)")
    r = s.add_parser("run"); r.add_argument("queue")
    r.add_argument("--alert-channel"); r.add_argument("--alert-reply-to"); r.add_argument("--alert-mention", action="append")
    nd = s.add_parser("nudge"); nd.add_argument("queue")
    nd.add_argument("--replies", type=int, default=1, help="how many replies to send now, default 1")
    a = p.parse_args()
    if a.cmd == "plan" and a.min_gap < 30:
        sys.exit("--min-gap must be at least 30 s")
    if a.cmd == "nudge" and a.replies < 1:
        sys.exit("--replies must be at least 1")
    {"plan": cmd_plan, "run": cmd_run, "nudge": cmd_nudge}[a.cmd](a)


if __name__ == "__main__":
    main()
