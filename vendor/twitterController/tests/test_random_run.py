import datetime, json, sys, types
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import random_run as rr
import sequence as seq


def test_draw_in_window_and_spaced():
    for _ in range(200):
        t = rr.draw(20, 1000.0, 3600, 120)
        assert t == sorted(t) and t[0] >= 1000 and t[-1] <= 4600
        assert all(b - a >= 120 - 1e-9 for a, b in zip(t, t[1:]))


def test_draw_refuses_impossible():
    with pytest.raises(SystemExit):
        rr.draw(40, 0, 3600, 120)


def test_interleave_keeps_like_before_reply():
    ev = [{"n": n, "kind": k} for n in range(30) for k in ("like", "reply")]
    out = rr.interleave(ev)
    assert len(out) == 60
    for n in range(30):
        kinds = [e["kind"] for e in out if e["n"] == n]
        assert kinds == ["like", "reply"]


def make_queue(tmp_path, n=3, kinds=("like", "reply")):
    items = [{"n": i, "action": "reply", "handle": f"h{i}", "tweet_url": f"https://x.com/h{i}/status/{i}",
              "text": "hi", "status": "pending"} for i in range(1, n + 1)]
    q = {"account": "me", "approval": None, "items": items}
    q["approval"] = {"by": "matt", "fingerprint": seq.fingerprint(q)}
    now = datetime.datetime.now()
    q["random_run"] = {"planned": "p1", "window": "1m", "min_gap": 0, "events": [
        {"n": i, "kind": k, "at": now.isoformat(timespec="seconds")} for i in range(1, n + 1) for k in kinds]}
    p = tmp_path / "q.json"; p.write_text(json.dumps(q)); return p


def args(p):
    return types.SimpleNamespace(queue=str(p), alert_channel=None, alert_reply_to=None, alert_mention=None)


def test_run_all_ok(tmp_path, monkeypatch):
    p = make_queue(tmp_path)
    calls = []
    def fake(a):
        calls.append(a[1])
        return 0, '{"result": {"liked": true}}' if a[1] == "like" else '{"result": {"tweet_id": "99"}}'
    monkeypatch.setattr(seq, "sender", fake)
    rr.cmd_run(args(p))
    q = json.loads(p.read_text())
    assert calls == ["like", "reply"] * 3
    assert all(it["status"] == "sent" for it in q["items"])


EMPTY = '{"ok": false, "error": "x created no tweet (empty result): reply not posted. x said: {\\"data\\": {\\"create_tweet\\": {\\"tweet_results\\": {}}}}"}'


def no_wait(monkeypatch):
    """cool-offs and planned waits return at once; records how long each would have been"""
    waits = []
    def fake_wait(qp, due):
        waits.append(due - rr.time.time()); return 0
    monkeypatch.setattr(rr, "wait_until", fake_wait)
    monkeypatch.setattr(rr.time, "sleep", lambda s: None)
    return waits


def test_block_cools_off_then_retries_and_carries_on(tmp_path, monkeypatch):
    p = make_queue(tmp_path)
    waits = no_wait(monkeypatch)
    calls = []; failed = []
    def fake(a):
        calls.append((a[1], a[a.index("--tweet-url") + 1][-1]))
        if a[1] == "reply" and calls[-1][1] == "1" and not failed:
            failed.append(1); return 3, EMPTY
        return 0, '{"result": {"liked": true}}' if a[1] == "like" else '{"result": {"tweet_id": "99"}}'
    monkeypatch.setattr(seq, "sender", fake)
    rr.cmd_run(args(p))
    q = json.loads(p.read_text())
    assert all(it["status"] == "sent" for it in q["items"])
    # post 1's reply failed, the others went, then post 1 was retried at the end
    assert calls == [("like", "1"), ("reply", "1"), ("like", "2"), ("reply", "2"), ("like", "3"), ("reply", "3"), ("reply", "1")]
    assert any(7.5 * 60 <= w <= 15 * 60 + 1 for w in waits)   # the first cool-off
    assert not Path(p).with_suffix(".lock").exists()


def test_post_failing_twice_is_skipped_not_halted(tmp_path, monkeypatch):
    p = make_queue(tmp_path, kinds=("reply", "like"))
    no_wait(monkeypatch)
    calls = []
    def fake(a):
        calls.append((a[1], a[a.index("--tweet-url") + 1][-1]))
        if a[1] == "reply" and calls[-1][1] == "2":
            return 3, EMPTY
        return 0, '{"result": {"liked": true}}' if a[1] == "like" else '{"result": {"tweet_id": "99"}}'
    monkeypatch.setattr(seq, "sender", fake)
    rr.cmd_run(args(p))
    q = json.loads(p.read_text())
    assert [it["status"] for it in q["items"]] == ["sent", "blocked", "sent"]
    assert ("like", "2") not in calls   # no like after a reply that never went out
    assert calls.count(("reply", "2")) == 2


def test_halts_after_max_cool_offs_in_a_row(tmp_path, monkeypatch):
    p = make_queue(tmp_path, n=6, kinds=("reply",))
    waits = no_wait(monkeypatch)
    monkeypatch.setattr(seq, "sender", lambda a: (3, EMPTY))
    with pytest.raises(SystemExit) as e:
        rr.cmd_run(args(p))
    assert e.value.code == 5
    cools = [w for w in waits if w > 7 * 60]
    assert len(cools) == rr.MAX_COOLS
    # each one doubles: 7.5-15m, 15-30m, 30-60m, 1-2h, 2-4h
    for k, w in enumerate(cools):
        step = min(rr.COOL_CAP, rr.COOL_BASE * 2 ** k)
        assert step / 2 - 1 <= w <= step + 1
    assert not Path(p).with_suffix(".lock").exists()


def test_auth_failure_still_halts_at_once(tmp_path, monkeypatch):
    p = make_queue(tmp_path, kinds=("reply",))
    no_wait(monkeypatch)
    calls = []
    def fake(a):
        calls.append(a[1]); return 2, '{"ok": false, "stage": "session-invalid"}'
    monkeypatch.setattr(seq, "sender", fake)
    with pytest.raises(SystemExit) as e:
        rr.cmd_run(args(p))
    assert e.value.code == 5 and calls == ["reply"]


def test_gone_post_is_skipped_without_cooling(tmp_path, monkeypatch):
    p = make_queue(tmp_path)
    waits = no_wait(monkeypatch)
    def fake(a):
        if a[1] == "like" and a[a.index("--tweet-url") + 1].endswith("1"):
            return 3, '{"ok": false, "error": "The tweet is unavailable (385)"}'
        return 0, '{"result": {"liked": true}}' if a[1] == "like" else '{"result": {"tweet_id": "99"}}'
    monkeypatch.setattr(seq, "sender", fake)
    rr.cmd_run(args(p))
    q = json.loads(p.read_text())
    assert [it["status"] for it in q["items"]] == ["gone", "sent", "sent"]
    assert not [w for w in waits if w > 7 * 60]


def test_cool_secs_uses_x_reset_time():
    reset = int(rr.time.time()) + 900
    assert 900 - 2 <= rr.cool_secs(0, reset) <= 900 + 181
    assert rr.cool_secs(0, daily=True) >= 24 * 3600


def test_reset_at_reads_twikit_and_headers():
    assert rr.reset_at('{"error": "status: 429", "kind": "TooManyRequests", "rate_limit_reset": 1792222222}') == 1792222222
    hit = ('{"error": "x created no tweet ... limits: {\\"x-rate-limit-limit\\": \\"300\\", '
           '\\"x-rate-limit-remaining\\": \\"0\\", \\"x-rate-limit-reset\\": \\"1792222333\\"}"}')
    assert rr.reset_at(hit) == 1792222333
    assert rr.reset_at(hit.replace('\\"0\\"', '\\"12\\"')) is None   # limit not hit: back off instead
    assert rr.reset_at(EMPTY) is None


def test_run_halts_when_behind(tmp_path, monkeypatch):
    p = make_queue(tmp_path)
    q = json.loads(p.read_text())
    q["random_run"]["events"][0]["at"] = (datetime.datetime.now() - datetime.timedelta(hours=1)).isoformat()
    p.write_text(json.dumps(q))
    monkeypatch.setattr(seq, "sender", lambda a: pytest.fail("must not send"))
    with pytest.raises(SystemExit):
        rr.cmd_run(args(p))


def test_pick_kinds_is_random_mix():
    seen = {tuple(rr.pick_kinds(True, 0.7)) for _ in range(500)}
    assert seen == {("reply",), ("like", "reply"), ("reply", "like")}
    assert {tuple(rr.pick_kinds(False, 0.7)) for _ in range(50)} == {("reply",)}


def test_run_like_after_reply(tmp_path, monkeypatch):
    p = make_queue(tmp_path, kinds=("reply", "like"))
    calls = []
    def fake(a):
        calls.append(a[1])
        return 0, '{"result": {"liked": true}}' if a[1] == "like" else '{"result": {"tweet_id": "99"}}'
    monkeypatch.setattr(seq, "sender", fake)
    rr.cmd_run(args(p))
    assert calls == ["reply", "like"] * 3


def test_nudge_sends_next_replies_now(tmp_path, monkeypatch):
    p = make_queue(tmp_path, n=3)
    q = json.loads(p.read_text())
    later = (datetime.datetime.now() + datetime.timedelta(hours=3)).isoformat(timespec="seconds")
    for e in q["random_run"]["events"]:
        e["at"] = later
    p.write_text(json.dumps(q))
    calls = []
    def fake(a):
        calls.append(a[1])
        return 0, '{"result": {"liked": true}}' if a[1] == "like" else '{"result": {"tweet_id": "99"}}'
    monkeypatch.setattr(seq, "sender", fake)
    slept = []
    def fake_sleep(s):
        slept.append(s)
        if len(calls) >= 4:   # nudged replies done: stop the run where the third post would wait
            raise KeyboardInterrupt
    monkeypatch.setattr(rr.time, "sleep", fake_sleep)
    p.with_suffix(".lock").touch()
    rr.cmd_nudge(types.SimpleNamespace(queue=str(p), replies=2))
    p.with_suffix(".lock").unlink()
    assert p.with_suffix(".nudge").read_text() == "2"
    rr.cmd_run(args(p))
    q = json.loads(p.read_text())
    assert calls == ["like", "reply", "like", "reply"]
    assert [it["status"] for it in q["items"]] == ["sent", "sent", "pending"]
    assert not p.with_suffix(".nudge").exists()
    assert all(20 <= s <= 60 for s in slept[1:4])   # nudged events still spaced 20-60 s


def test_nudge_needs_a_running_queue(tmp_path):
    p = make_queue(tmp_path)
    with pytest.raises(SystemExit):
        rr.cmd_nudge(types.SimpleNamespace(queue=str(p), replies=1))
