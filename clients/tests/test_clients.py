import argparse
import json
import sys
import urllib.error
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import listeningkit_ingest as ingest  # noqa: E402
import reddit_push  # noqa: E402

RECORD = {
    "external_id": "1whys0s",
    "title": "The missing metric",
    "content": "Body text",
    "permalink": "/r/marketing/comments/1whys0s/the_missing_metric/",
    "url": "",
    "author": {"id": "", "name": "someone"},
    "occurred_at": "2026-09-16T14:26:42+00:00",
    "metrics": {"score": 12, "comments": 3, "upvote_ratio": 0.9},
}


class TestMapping:
    def test_maps_a_camofox_record_to_the_ingest_shape(self):
        assert reddit_push.to_ingest_post(RECORD) == {
            "externalId": "t3_1whys0s",
            "authorName": "someone",
            "body": ["Body text"],
            "url": "https://reddit.com/r/marketing/comments/1whys0s/the_missing_metric/",
            "likes": 12,
            "comments": 3,
            "title": "The missing metric",
            "timestamp": "2026-09-16T14:26:42+00:00",
        }

    def test_ids_match_the_server_mirror_so_sources_dedupe_together(self):
        assert reddit_push.reddit_post_id("t3_ABC123") == "t3_abc123"
        assert reddit_push.reddit_post_id("abc123") == "t3_abc123"
        for junk in (None, "", "  ", "bad id!", "t3_", "x" * 20):
            assert reddit_push.reddit_post_id(junk) is None

    def test_drops_junk_and_defaults_missing_fields(self):
        assert reddit_push.to_ingest_post({}) is None
        assert reddit_push.to_ingest_post({**RECORD, "permalink": "", "url": "javascript:alert(1)"}) is None
        bare = reddit_push.to_ingest_post({"external_id": "abc", "url": "https://reddit.com/r/a/comments/abc/"})
        assert bare == {"externalId": "t3_abc", "authorName": "unknown", "body": [], "url": "https://reddit.com/r/a/comments/abc/", "likes": 0, "comments": 0}
        weird = reddit_push.to_ingest_post({**RECORD, "metrics": {"score": "many", "comments": -4}})
        assert (weird["likes"], weird["comments"]) == (0, 0)


class TestPush:
    def ok(self, calls):
        def send(url, key, body):
            calls.append((url, key, body))
            return 200, json.dumps({"ingested": len(body["posts"]), "skipped": 0})
        return send

    def test_splits_into_batches_of_100(self):
        calls: list = []
        posts = [{"externalId": str(i)} for i in range(250)]
        totals = ingest.push("reddit", posts, endpoint="https://e/ingest", key="k", send=self.ok(calls))
        assert [len(c[2]["posts"]) for c in calls] == [100, 100, 50]
        assert totals == {"ingested": 250, "skipped": 0, "batches": 3}
        assert all(c[1] == "k" and c[2]["platform"] == "reddit" for c in calls)

    def test_client_errors_fail_fast_without_retry(self):
        calls: list = []

        def send(url, key, body):
            calls.append(1)
            return 401, json.dumps({"error": "Invalid ingest key"})

        with pytest.raises(ingest.IngestError) as raised:
            ingest.push("x", [{"a": 1}], endpoint="e", key="bad", send=send, sleep=lambda _: None)
        assert raised.value.status == 401 and "Invalid ingest key" in str(raised.value)
        assert len(calls) == 1

    def test_server_and_network_errors_retry_then_succeed_or_give_up(self):
        outcomes = iter([(500, "{}"), urllib.error.URLError("down"), (200, json.dumps({"ingested": 1, "skipped": 0}))])
        slept: list = []

        def flaky(url, key, body):
            outcome = next(outcomes)
            if isinstance(outcome, Exception):
                raise outcome
            return outcome

        totals = ingest.push("x", [{"a": 1}], endpoint="e", key="k", send=flaky, sleep=slept.append)
        assert totals["ingested"] == 1 and slept == [1, 2]
        with pytest.raises(ingest.IngestError):
            ingest.push("x", [{"a": 1}], endpoint="e", key="k", send=lambda *_: (503, "down"), sleep=lambda _: None)

    def test_rejects_unknown_platform(self):
        with pytest.raises(ValueError):
            ingest.push("myspace", [], endpoint="e", key="k")


class TestFetchAndRun:
    def test_fetch_records_calls_listen_once_per_subreddit(self):
        seen: list = []

        def post(url, body, headers):
            seen.append((url, body, headers))
            return {"result": {"new_posts": [RECORD, "junk"], "cursor_advanced": True}}

        rows = reddit_push.fetch_records(
            "http://localhost:8001/", "marketing", cookies=[{"name": "token_v2"}], limit=10, api_key="secret", post=post
        )
        assert rows == [RECORD]
        url, body, headers = seen[0]
        assert url == "http://localhost:8001/api/posts/listen"
        assert body["input"] == {"subreddits": ["marketing"], "limit": 10}
        assert headers == {"Authorization": "Bearer secret"}

    def test_run_once_pushes_mapped_posts_and_skips_junk(self, monkeypatch, capsys):
        monkeypatch.setattr(reddit_push, "fetch_records", lambda *a, **k: [RECORD, {"external_id": "!!"}])
        pushed: list = []
        monkeypatch.setattr(reddit_push, "push", lambda platform, posts, **kw: pushed.append((platform, posts, kw)) or {"ingested": len(posts), "skipped": 0, "batches": 1})
        args = argparse.Namespace(subreddits=["marketing"], limit=25, client_url="http://c", endpoint="https://e/ingest", key="k", dry_run=False)
        assert reddit_push.run_once(args, None) == 0
        assert pushed[0][0] == "reddit" and len(pushed[0][1]) == 1
        assert pushed[0][2] == {"endpoint": "https://e/ingest", "key": "k"}
        assert "pushed 1 posts, 1 skipped" in capsys.readouterr().out

    def test_dry_run_never_pushes(self, monkeypatch, capsys):
        monkeypatch.setattr(reddit_push, "fetch_records", lambda *a, **k: [RECORD])
        monkeypatch.setattr(reddit_push, "push", lambda *a, **k: pytest.fail("dry run must not push"))
        args = argparse.Namespace(subreddits=["marketing"], limit=25, client_url="http://c", endpoint="", key="", dry_run=True)
        assert reddit_push.run_once(args, None) == 0
        assert "would push 1 posts" in capsys.readouterr().out

    def test_a_rejected_key_stops_the_run_with_a_failure_code(self, monkeypatch, capsys):
        monkeypatch.setattr(reddit_push, "fetch_records", lambda *a, **k: [RECORD])

        def rejected(*a, **k):
            raise ingest.IngestError(401, "Invalid ingest key")

        monkeypatch.setattr(reddit_push, "push", rejected)
        args = argparse.Namespace(subreddits=["marketing"], limit=25, client_url="http://c", endpoint="e", key="k", dry_run=False)
        assert reddit_push.run_once(args, None) == 1
        assert "Invalid ingest key" in capsys.readouterr().err

    def test_unreachable_client_is_reported_not_fatal(self, monkeypatch, capsys):
        def down(*a, **k):
            raise urllib.error.URLError("refused")

        monkeypatch.setattr(reddit_push, "fetch_records", down)
        args = argparse.Namespace(subreddits=["a", "b"], limit=25, client_url="http://c", endpoint="e", key="k", dry_run=False)
        assert reddit_push.run_once(args, None) == 0
        assert capsys.readouterr().err.count("unreachable") == 2

    def test_cookie_files_accept_a_bare_list_or_playwright_storage_state(self, tmp_path):
        bare = tmp_path / "a.json"
        bare.write_text(json.dumps([{"name": "token_v2", "value": "fake"}]))
        state = tmp_path / "b.json"
        state.write_text(json.dumps({"cookies": [{"name": "token_v2", "value": "fake"}], "origins": []}))
        assert reddit_push.load_cookies(str(bare)) == reddit_push.load_cookies(str(state))
        assert reddit_push.load_cookies(None) is None

    def test_main_requires_endpoint_and_key_unless_dry_run(self, monkeypatch):
        monkeypatch.delenv("LISTENINGKIT_INGEST_URL", raising=False)
        monkeypatch.delenv("LISTENINGKIT_INGEST_KEY", raising=False)
        with pytest.raises(SystemExit):
            reddit_push.main(["marketing"])


class TestSession:
    def test_session_url_sits_beside_ingest(self):
        assert ingest.session_url("https://x.convex.site/ingest", "reddit") == "https://x.convex.site/session?platform=reddit"
        assert ingest.session_url("https://x.convex.site", "x") == "https://x.convex.site/session?platform=x"

    def test_fetches_the_connected_cookie_jar(self):
        seen: list = []

        def get(url, key):
            seen.append((url, key))
            return 200, json.dumps({"platform": "reddit", "cookies": [{"name": "token_v2"}], "expiresAt": None})

        jar = ingest.fetch_session("reddit", endpoint="https://x.convex.site/ingest", key="k", get=get)
        assert jar == [{"name": "token_v2"}]
        assert seen == [("https://x.convex.site/session?platform=reddit", "k")]

    def test_explains_each_failure_in_plain_words(self):
        def failing(status, body="{}"):
            return lambda url, key: (status, body)

        with pytest.raises(ingest.SessionError, match="Connect it in ListeningKit"):
            ingest.fetch_session("reddit", endpoint="e", key="k", get=failing(404))
        with pytest.raises(ingest.SessionError, match="ingest key was rejected"):
            ingest.fetch_session("reddit", endpoint="e", key="k", get=failing(401))
        with pytest.raises(ingest.SessionError, match="500"):
            ingest.fetch_session("reddit", endpoint="e", key="k", get=failing(500))
        with pytest.raises(ingest.SessionError, match="empty"):
            ingest.fetch_session("reddit", endpoint="e", key="k", get=failing(200, json.dumps({"cookies": []})))

        def offline(url, key):
            raise urllib.error.URLError("down")

        with pytest.raises(ingest.SessionError, match="could not reach"):
            ingest.fetch_session("reddit", endpoint="e", key="k", get=offline)
        with pytest.raises(ValueError):
            ingest.fetch_session("myspace", endpoint="e", key="k")

    def test_a_cookies_file_wins_over_the_connected_login(self, monkeypatch, tmp_path):
        path = tmp_path / "c.json"
        path.write_text(json.dumps([{"name": "from_file"}]))
        monkeypatch.setenv("REDDIT_COOKIES_FILE", str(path))
        monkeypatch.setattr(reddit_push, "fetch_session", lambda *a, **k: pytest.fail("must not fetch"))
        args = argparse.Namespace(endpoint="e", key="k")
        assert reddit_push.resolve_cookies(args) == [{"name": "from_file"}]

    def test_without_a_file_it_uses_the_connected_login(self, monkeypatch):
        monkeypatch.delenv("REDDIT_COOKIES_FILE", raising=False)
        monkeypatch.setattr(reddit_push, "fetch_session", lambda platform, endpoint, key: [{"name": platform}])
        assert reddit_push.resolve_cookies(argparse.Namespace(endpoint="e", key="k")) == [{"name": "reddit"}]
        assert reddit_push.resolve_cookies(argparse.Namespace(endpoint="", key="")) is None
