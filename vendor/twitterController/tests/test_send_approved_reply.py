import asyncio
import json
import os
import subprocess
import sys
import importlib.util
import unittest
from types import SimpleNamespace

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)

import send_approved_reply as s  # noqa: E402

SCRIPT = os.path.join(ROOT, "send_approved_reply.py")


def run_cli(*argv):
    env = {k: v for k, v in os.environ.items() if not k.startswith("TWENTY_")}
    proc = subprocess.run(
        [sys.executable, SCRIPT, *argv], capture_output=True, text=True, env=env, cwd=HERE
    )
    return proc.returncode, proc.stdout


class CookieShapeTests(unittest.TestCase):
    EXPORT = [{"name": "ct0", "value": "aaa", "domain": ".x.com"}, {"name": "auth_token", "value": "bbb", "domain": ".x.com"}]

    def test_normalize_list_dict_and_json(self):
        want = {"ct0": "aaa", "auth_token": "bbb"}
        self.assertEqual(s.normalize_cookies(self.EXPORT), want)
        self.assertEqual(s.normalize_cookies(want), want)
        self.assertEqual(s.normalize_cookies(json.dumps(self.EXPORT)), want)

    def test_writeback_keeps_list_shape(self):
        out = s.merge_for_storage([dict(c) for c in self.EXPORT], {"ct0": "new", "extra": "x"})
        self.assertEqual([c["name"] for c in out], ["ct0", "auth_token", "extra"])
        self.assertEqual(out[0]["value"], "new")
        self.assertEqual(out[0]["domain"], ".x.com")


class StyleTests(unittest.TestCase):
    def test_clean_copy_passes(self):
        self.assertEqual(s.check_style("hola vi tu post https://example.com/a.b"), [])

    def test_violations(self):
        for bad in ("Hola", "a, b", "fin.", "a — b", "a; b"):
            self.assertTrue(s.check_style(bad), bad)


class RedactTests(unittest.TestCase):
    def test_literal_values_and_patterns(self):
        out = s.redact('boom auth_token=abc123def ct0 "ct0": "zzz" tok SECRETVALUE1', ["SECRETVALUE1"])
        self.assertNotIn("abc123def", out)
        self.assertNotIn("SECRETVALUE1", out)
        self.assertNotIn("zzz", out)

    def test_empty_secret_is_ignored(self):
        self.assertEqual(s.redact("plain", [""]), "plain")

    def test_secret_values_skips_short(self):
        self.assertEqual(s.secret_values({"a": "x", "b": "longenough"}), ["longenough"])


class TwentyTests(unittest.TestCase):
    def setUp(self):
        self._old = os.environ.get("TWENTY_BASE_URL")

    def tearDown(self):
        if self._old is None:
            os.environ.pop("TWENTY_BASE_URL", None)
        else:
            os.environ["TWENTY_BASE_URL"] = self._old

    def test_rest_base_no_double_rest(self):
        for raw in ("https://t.example/rest", "https://t.example/rest/", "https://t.example"):
            os.environ["TWENTY_BASE_URL"] = raw
            self.assertEqual(s.rest_base(), "https://t.example/rest")

    def test_unwrap(self):
        rec = {"id": "1", "cookies": {"a": "b"}}
        self.assertEqual(s.unwrap({"data": {"socialAccount": rec}}), rec)
        self.assertEqual(s.unwrap(rec), rec)
        self.assertEqual(s.unwrap(None), {})


class AccountLookupTests(unittest.TestCase):
    def test_single_match(self):
        payload = {"data": {"socialAccounts": [{"id": "a1", "platform": "TWITTER"}]}}
        self.assertEqual(s.pick_account(payload, "h"), "a1")

    def test_zero_or_many_refused(self):
        for rows in ([], [{"id": "a", "platform": "TWITTER"}, {"id": "b", "platform": "TWITTER"}]):
            with self.assertRaises(RuntimeError):
                s.pick_account({"data": {"socialAccounts": rows}}, "h")

    def test_other_platform_ignored(self):
        with self.assertRaises(RuntimeError):
            s.pick_account({"data": {"socialAccounts": [{"id": "a", "platform": "LINKEDIN"}]}}, "h")


class UrlTests(unittest.TestCase):
    def test_own_user_id_from_twid(self):
        self.assertEqual(s.own_user_id({"twid": "u%3D12345"}), "12345")
        with self.assertRaises(RuntimeError):
            s.own_user_id({})

    def test_tweet_id(self):
        self.assertEqual(s.tweet_id_from_url("https://x.com/u/status/123?s=20"), "123")
        self.assertEqual(s.tweet_id_from_url("https://x.com/u/status/123/"), "123")


class CookieShapeTests(unittest.TestCase):
    EXPORT = [
        {"name": "auth_token", "value": "authtokenvalue1", "domain": ".x.com", "path": "/"},
        {"name": "ct0", "value": "csrfvalue1234567", "domain": ".x.com", "path": "/"},
    ]

    def test_list_of_browser_objects(self):
        self.assertEqual(
            s.normalize_cookies(self.EXPORT),
            {"auth_token": "authtokenvalue1", "ct0": "csrfvalue1234567"},
        )

    def test_dict_passthrough(self):
        self.assertEqual(s.normalize_cookies({"a": "b", "c": None}), {"a": "b"})

    def test_header_string(self):
        self.assertEqual(s.normalize_cookies("a=1; b=2"), {"a": "1", "b": "2"})

    def test_json_string_of_export(self):
        self.assertEqual(
            s.normalize_cookies(json.dumps(self.EXPORT)),
            {"auth_token": "authtokenvalue1", "ct0": "csrfvalue1234567"},
        )

    def test_list_of_pairs(self):
        self.assertEqual(s.normalize_cookies([["a", "1"], ["b", "2"]]), {"a": "1", "b": "2"})

    def test_unsupported_shape_raises(self):
        with self.assertRaises(RuntimeError):
            s.normalize_cookies(42)

    def test_secret_values_accepts_list_shape(self):
        vals = s.secret_values(self.EXPORT)
        self.assertIn("authtokenvalue1", vals)
        self.assertIn("csrfvalue1234567", vals)

    def test_secret_values_accepts_string(self):
        self.assertEqual(s.secret_values("a=1; token=longenough"), ["longenough"])

    def test_merge_keeps_list_shape(self):
        merged = s.merge_cookie_shape(self.EXPORT, {"ct0": "freshcsrfvalue999", "twid": "newtwidvalue"})
        self.assertIsInstance(merged, list)
        self.assertEqual([i["name"] for i in merged], ["auth_token", "ct0", "twid"])
        self.assertEqual(merged[1]["value"], "freshcsrfvalue999")
        self.assertEqual(merged[0]["domain"], ".x.com")

    def test_merge_keeps_dict_shape(self):
        self.assertEqual(
            s.merge_cookie_shape({"a": "1", "b": "2"}, {"b": "3", "c": "4"}),
            {"a": "1", "b": "3", "c": "4"},
        )


class CliGateTests(unittest.TestCase):
    def test_send_requires_approval(self):
        code, out = run_cli("--action", "reply", "--tweet-url", "https://x.com/u/status/1", "--text", "hola")
        self.assertEqual(code, 1)
        self.assertIn("approved-by", out)

    def test_dry_run_never_contacts_x(self):
        code, out = run_cli(
            "--action", "reply", "--tweet-url", "https://x.com/u/status/1",
            "--text", "hola", "--approved-by", "matt", "--dry-run",
        )
        self.assertEqual(code, 0)
        self.assertTrue(json.loads(out)["dry_run"])

    def test_style_blocks_send(self):
        code, _ = run_cli("--action", "dm", "--user-id", "1", "--text", "Hola, hi", "--approved-by", "matt")
        self.assertEqual(code, 1)


class FakeHttp:
    def __init__(self, status):
        self.status = status

    async def request(self, method, url, headers=None, **kw):
        assert method == "GET" and "settings.json" in url
        return SimpleNamespace(status_code=self.status)


class FakeClient:
    _user_agent = "ua"

    def __init__(self, status):
        self.http = FakeHttp(status)

    def get_cookies(self):
        return {"ct0": "csrf"}

    def set_cookies(self, cookies, clear_cookies=False):
        self.restored = cookies


@unittest.skipUnless(importlib.util.find_spec("twikit"), "twikit not installed (use the documented uv --with command)")
class SessionCheckTests(unittest.TestCase):
    def test_rejected_cookies_raise_session_invalid(self):
        for status in (401, 403):
            with self.assertRaises(s.SessionInvalid):
                asyncio.run(s.check_session(FakeClient(status)))

    def test_ok(self):
        asyncio.run(s.check_session(FakeClient(200)))

    def test_404_means_auth_accepted(self):
        asyncio.run(s.check_session(FakeClient(404)))

    def test_other_status_is_generic_error(self):
        with self.assertRaises(RuntimeError) as cm:
            asyncio.run(s.check_session(FakeClient(500)))
        self.assertNotIsInstance(cm.exception, s.SessionInvalid)


if __name__ == "__main__":
    unittest.main()
