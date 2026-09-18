import argparse
import asyncio
import json
import sys
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import listeningkit_ingest as ingest  # noqa: E402
import x_push  # noqa: E402


class TooManyRequests(Exception):
    pass


class Unauthorized(Exception):
    pass


def tweet(id="1790000000000000001", text="thinking about switching accountants", handle="pat", **over):
    base = dict(
        id=id, text=text, full_text=None, user=SimpleNamespace(screen_name=handle, name="Pat P"),
        favorite_count=4, reply_count=1, created_at_datetime=datetime(2026, 9, 18, 10, 0, tzinfo=timezone.utc),
    )
    base.update(over)
    return SimpleNamespace(**base)


def args(**over):
    base = dict(phrases=None, count=20, interval=0, dry_run=False, endpoint="https://e/ingest", key="k")
    base.update(over)
    return argparse.Namespace(**base)


class FakeClient:
    def __init__(self, results):
        self.results = results
        self.queries = []

    async def search_tweet(self, query, product, count=20):
        self.queries.append((query, product, count))
        outcome = self.results[len(self.queries) - 1] if isinstance(self.results, list) else self.results
        if isinstance(outcome, Exception):
            raise outcome
        return outcome


async def no_sleep(_):
    return None


def run(client, phrases, pushed=None, **over):
    pushed = pushed if pushed is not None else []

    def fake_push(platform, posts, **kw):
        pushed.append((platform, posts, kw))
        return {"ingested": len(posts), "skipped": 0, "batches": 1}

    status = asyncio.run(x_push.run_once(args(**over), client, phrases, push_posts=fake_push, sleep=no_sleep))
    return status, pushed


class TestMapping:
    def test_maps_a_tweet_to_the_ingest_shape(self):
        assert x_push.tweet_to_post(tweet()) == {
            "externalId": "1790000000000000001", "authorName": "pat",
            "body": ["thinking about switching accountants"],
            "url": "https://x.com/pat/status/1790000000000000001",
            "likes": 4, "comments": 1, "timestamp": "2026-09-18T10:00:00+00:00",
        }

    def test_prefers_full_text_and_survives_missing_fields(self):
        assert x_push.tweet_to_post(tweet(full_text="the long version"))["body"] == ["the long version"]
        bare = x_push.tweet_to_post(SimpleNamespace(id="5", text="hello"))
        assert bare == {"externalId": "5", "authorName": "unknown", "body": ["hello"], "url": "https://x.com/i/status/5", "likes": 0, "comments": 0}
        odd = x_push.tweet_to_post(tweet(favorite_count="many", reply_count=-3))
        assert (odd["likes"], odd["comments"]) == (0, 0)

    def test_drops_retweets_and_junk(self):
        assert x_push.tweet_to_post(tweet(text="RT @someone: hello")) is None
        assert x_push.tweet_to_post(tweet(id="not-a-number")) is None
        assert x_push.tweet_to_post(tweet(text="   ")) is None
        assert x_push.tweet_to_post(SimpleNamespace()) is None

    def test_builds_an_exact_phrase_search_that_a_quote_cannot_break(self):
        assert x_push.search_query("switching accountants") == '"switching accountants" -filter:retweets'
        assert x_push.search_query('say "hi" now') == '"say hi now" -filter:retweets'


class TestLogin:
    def jar(self, *cookies):
        return [{"name": n, "value": v, "domain": d} for n, v, d in cookies]

    def test_keeps_only_x_cookies_and_needs_both_keys(self):
        jar = self.jar(("auth_token", "a", ".x.com"), ("ct0", "c", ".x.com"), ("guest_id", "g", ".twitter.com"), ("stolen", "s", ".evil.com"))
        assert x_push.cookie_dict(jar) == {"auth_token": "a", "ct0": "c", "guest_id": "g"}
        with pytest.raises(ingest.SessionError, match="incomplete"):
            x_push.cookie_dict(self.jar(("auth_token", "a", ".x.com")))
        with pytest.raises(ingest.SessionError, match="incomplete"):
            x_push.cookie_dict(self.jar(("auth_token", "a", ".evil.com"), ("ct0", "c", ".evil.com")))
        with pytest.raises(ingest.SessionError):
            x_push.cookie_dict(["junk", None])

    def test_classifies_what_x_says(self):
        assert x_push.classify(TooManyRequests()) == "rate"
        assert x_push.classify(Unauthorized()) == "auth"
        assert x_push.classify(type("AccountLocked", (Exception,), {})()) == "auth"
        assert x_push.classify(ValueError()) == "other"


class TestRound:
    def test_searches_each_phrase_and_pushes_new_tweets_once(self):
        client = FakeClient([[tweet("1"), tweet("2")], [tweet("2"), tweet("3")]])
        status, pushed = run(client, ["switching accountants", "need a bookkeeper"])
        assert status == 0
        assert [q[0] for q in client.queries] == ['"switching accountants" -filter:retweets', '"need a bookkeeper" -filter:retweets']
        assert all(q[1] == "Latest" and q[2] == 20 for q in client.queries)
        assert [len(p[1]) for p in pushed] == [2, 1]  # tweet 2 is not pushed twice
        assert pushed[0][0] == "x" and pushed[0][2] == {"endpoint": "https://e/ingest", "key": "k"}

    def test_dry_run_never_pushes(self, capsys):
        status, pushed = run(FakeClient([[tweet()]]), ["a phrase"], dry_run=True)
        assert (status, pushed) == (0, [])
        assert "would push 1 tweets" in capsys.readouterr().out

    def test_a_refused_login_stops_with_plain_words(self, capsys):
        status, pushed = run(FakeClient(Unauthorized()), ["a", "b"])
        assert status == 1 and pushed == []
        assert "Reconnect X in ListeningKit" in capsys.readouterr().err

    def test_a_slow_down_from_x_ends_the_round_quietly(self, capsys):
        client = FakeClient([[tweet("1")], TooManyRequests(), [tweet("9")]])
        status, pushed = run(client, ["a", "b", "c"])
        assert status == 0 and len(pushed) == 1 and len(client.queries) == 2
        assert "slow down" in capsys.readouterr().out

    def test_one_odd_error_skips_that_phrase_only(self, capsys):
        client = FakeClient([RuntimeError("boom"), [tweet("7")]])
        status, pushed = run(client, ["bad", "good"])
        assert status == 0 and len(pushed) == 1
        err = capsys.readouterr().err
        assert "RuntimeError" in err and "boom" not in err

    def test_verbose_shows_why_with_cookie_values_hidden(self, capsys):
        secret = "SUPERSECRETCOOKIEVALUE"
        client = FakeClient([RuntimeError(f"Couldn't get KEY_BYTE indices for {secret}")])
        status, _ = run(client, ["a"], verbose=True, secrets=[secret])
        err = capsys.readouterr().err
        assert status == 0
        assert "RuntimeError: Couldn't get KEY_BYTE indices for <hidden>" in err
        assert secret not in err and "at test_x_push.py" in err

    def test_default_output_points_at_verbose_without_the_message(self, capsys):
        run(FakeClient([RuntimeError("secret detail")]), ["a"])
        err = capsys.readouterr().err
        assert "run again with --verbose" in err and "secret detail" not in err

    def test_a_rejected_ingest_key_stops_the_round(self, capsys):
        def rejected(*a, **k):
            raise ingest.IngestError(401, "Invalid ingest key")

        status = asyncio.run(x_push.run_once(args(), FakeClient([[tweet()]]), ["a"], push_posts=rejected, sleep=no_sleep))
        assert status == 1
        assert "Invalid ingest key" in capsys.readouterr().err

    def test_only_a_polite_number_of_phrases_per_round_and_no_pushing_empty_results(self):
        client = FakeClient([[] for _ in range(25)])
        status, pushed = run(client, [f"p{i}" for i in range(25)])
        assert status == 0 and pushed == [] and len(client.queries) == x_push.MAX_PHRASES_PER_ROUND

    def test_pauses_between_phrases_but_not_before_the_first(self):
        pauses = []

        async def record(seconds):
            pauses.append(seconds)

        asyncio.run(x_push.run_once(args(), FakeClient([[], [], []]), ["a", "b", "c"], push_posts=lambda *a, **k: {}, sleep=record))
        assert len(pauses) == 2 and all(2.0 <= p <= 5.0 for p in pauses)


class TestPhrasesFetch:
    def test_reads_the_phrase_list_and_drops_blanks_and_duplicates(self):
        seen = []

        def get(url, key):
            seen.append((url, key))
            return 200, json.dumps({"platform": "x", "phrases": [{"phrase": "a b", "subreddit": None}, {"phrase": " "}, {"phrase": "a b"}, "junk", {"phrase": "c"}]})

        assert ingest.fetch_phrases("x", endpoint="https://e.convex.site/ingest", key="k", get=get) == ["a b", "c"]
        assert seen == [("https://e.convex.site/phrases?platform=x", "k")]

    def test_explains_failures(self):
        def fail(status):
            return lambda url, key: (status, "{}")

        with pytest.raises(ingest.SessionError, match="rejected"):
            ingest.fetch_phrases("x", endpoint="e", key="k", get=fail(401))
        with pytest.raises(ingest.SessionError, match="500"):
            ingest.fetch_phrases("x", endpoint="e", key="k", get=fail(500))
        with pytest.raises(ingest.SessionError, match="unexpected shape"):
            ingest.fetch_phrases("x", endpoint="e", key="k", get=lambda u, k: (200, json.dumps({"phrases": "no"})))

        def offline(url, key):
            raise urllib.error.URLError("down")

        with pytest.raises(ingest.SessionError, match="could not reach"):
            ingest.fetch_phrases("x", endpoint="e", key="k", get=offline)
        with pytest.raises(ValueError):
            ingest.fetch_phrases("myspace", endpoint="e", key="k")


class TestMain:
    def test_needs_the_endpoint_and_key(self, monkeypatch):
        monkeypatch.delenv("LISTENINGKIT_INGEST_URL", raising=False)
        monkeypatch.delenv("LISTENINGKIT_INGEST_KEY", raising=False)
        with pytest.raises(SystemExit):
            x_push.main([])

    def test_a_missing_x_login_is_reported_in_plain_words(self, monkeypatch, capsys):
        monkeypatch.setenv("LISTENINGKIT_INGEST_URL", "https://e/ingest")
        monkeypatch.setenv("LISTENINGKIT_INGEST_KEY", "k")

        def not_connected(*a, **k):
            raise ingest.SessionError("No x account is connected. Connect it in ListeningKit (onboarding or Settings), then try again.")

        monkeypatch.setattr(x_push, "fetch_session", not_connected)
        assert x_push.main([]) == 1
        assert "Connect it in ListeningKit" in capsys.readouterr().err

    def test_a_polite_interval_floor_and_count_range(self, monkeypatch):
        monkeypatch.setenv("LISTENINGKIT_INGEST_URL", "https://e/ingest")
        monkeypatch.setenv("LISTENINGKIT_INGEST_KEY", "k")
        captured = {}

        async def fake_main(parsed):
            captured["args"] = parsed
            return 0

        monkeypatch.setattr(x_push, "main_async", fake_main)
        assert x_push.main(["--interval", "10", "--count", "500"]) == 0
        assert (captured["args"].interval, captured["args"].count) == (x_push.MIN_INTERVAL, 20)
        x_push.main(["--count", "0"])
        assert captured["args"].count == 1 and captured["args"].interval == 0

    def test_twikit_missing_gives_the_install_command(self, monkeypatch):
        monkeypatch.setitem(sys.modules, "twikit", None)
        with pytest.raises(x_push.HelperError, match="pip install -r apps/twikit/requirements.txt"):
            x_push.make_client({"auth_token": "a", "ct0": "c"}, engine="twikit")
