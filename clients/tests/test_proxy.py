"""The proxy is mandatory and is not the person's to choose or see."""
import asyncio
import base64
import json
import sys
import threading
import urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import facebook_browser  # noqa: E402
import facebook_push  # noqa: E402
import listeningkit_ingest as ingest  # noqa: E402
import x_browser  # noqa: E402
import x_push  # noqa: E402

PROXY = {"server": "http://gw.proxy.example:8080", "username": "proxy-user", "password": "s3cret-pass"}
JAR_X = [{"name": "auth_token", "value": "auth-secret-value", "domain": ".x.com"}, {"name": "ct0", "value": "csrf-secret-value", "domain": ".x.com"}]
JAR_FB = [{"name": "c_user", "value": "100", "domain": ".facebook.com"}, {"name": "xs", "value": "fb-secret-value", "domain": ".facebook.com"}]


def answer(status, body):
    return lambda url, key: (status, json.dumps(body))


class TestAskingTheServer:
    def test_returns_the_proxy_the_deployment_set(self):
        seen = {}

        def get(url, key):
            seen["url"], seen["key"] = url, key
            return 200, json.dumps({"required": True, "proxy": {**PROXY, "extra": "dropped"}})

        assert ingest.fetch_proxy(endpoint="https://d.convex.site/ingest", key="lk", get=get) == PROXY
        assert seen == {"url": "https://d.convex.site/proxy", "key": "lk"}

    def test_a_deployment_that_waived_the_rule_gives_none(self):
        assert ingest.fetch_proxy(endpoint="https://d.convex.site/ingest", key="k", get=answer(200, {"required": False, "proxy": None})) is None

    def test_stops_when_the_deployment_has_no_proxy_and_does_not_blame_the_person(self):
        with pytest.raises(ingest.SessionError, match="paused until the operator sets up the proxy") as error:
            ingest.fetch_proxy(endpoint="e", key="k", get=answer(503, {"error": "Reading is paused until the operator sets up the proxy"}))
        assert "Nothing is wrong on your side" in str(error.value)

    def test_explains_every_other_failure(self):
        with pytest.raises(ingest.SessionError, match="key was rejected"):
            ingest.fetch_proxy(endpoint="e", key="k", get=answer(401, {}))
        with pytest.raises(ingest.SessionError, match=r"\(500\)"):
            ingest.fetch_proxy(endpoint="e", key="k", get=answer(500, {}))
        with pytest.raises(ingest.SessionError, match="unexpected shape"):
            ingest.fetch_proxy(endpoint="e", key="k", get=answer(200, {"proxy": {"username": "u"}}))
        with pytest.raises(ingest.SessionError, match="unexpected shape"):
            ingest.fetch_proxy(endpoint="e", key="k", get=answer(200, {"proxy": "http://x"}))

        def offline(url, key):
            raise urllib.error.URLError("down")

        with pytest.raises(ingest.SessionError, match="could not reach"):
            ingest.fetch_proxy(endpoint="e", key="k", get=offline)


class TestFormsOfTheProxy:
    def test_one_address_for_the_engine_that_wants_that_form(self):
        assert x_push.proxy_url(PROXY) == "http://proxy-user:s3cret-pass@gw.proxy.example:8080"
        assert x_push.proxy_url({"server": "socks5://gw:1080", "username": "u@x", "password": "p/w"}) == "socks5://u%40x:p%2Fw@gw:1080"
        assert x_push.proxy_url({"server": "http://gw:8080"}) == "http://gw:8080"
        assert x_push.proxy_url(None) is None

    def test_every_secret_part_is_kept_out_of_output(self):
        assert x_push.proxy_secrets(PROXY) == ["proxy-user", "s3cret-pass"]
        assert x_push.proxy_secrets(None) == []
        assert x_push.proxy_secrets({"server": "http://gw"}) == []


class TestTheHelpersAlwaysAsk:
    @pytest.fixture(autouse=True)
    def env(self, monkeypatch):
        monkeypatch.setenv("LISTENINGKIT_INGEST_URL", "https://d.convex.site/ingest")
        monkeypatch.setenv("LISTENINGKIT_INGEST_KEY", "lk_ingest_test")

    def wire(self, monkeypatch, module, jar, proxy):
        started = {}
        monkeypatch.setattr(module, "fetch_session", lambda *a, **k: jar)
        monkeypatch.setattr(module, "fetch_proxy", proxy if callable(proxy) else (lambda **k: proxy))

        class Client:
            async def close(self):
                started["closed"] = True

        def make(*args, **kwargs):
            started["args"], started["kwargs"] = args, kwargs
            return Client()

        async def one_round(args, client):
            started["secrets"] = list(args.secrets)
            return 0

        monkeypatch.setattr(module, "make_client", make)
        monkeypatch.setattr(module, "loop_rounds", one_round)
        return started

    @pytest.mark.parametrize("module,jar", [(x_push, JAR_X), (facebook_push, JAR_FB)])
    def test_the_browser_is_started_with_the_proxy_and_its_secrets_are_hidden(self, monkeypatch, module, jar):
        started = self.wire(monkeypatch, module, jar, PROXY)
        assert module.main([]) == 0
        assert PROXY in list(started["args"]) + list(started["kwargs"].values())
        assert "s3cret-pass" in started["secrets"] and "proxy-user" in started["secrets"]

    @pytest.mark.parametrize("module,jar,who", [(x_push, JAR_X, "x helper"), (facebook_push, JAR_FB, "facebook helper")])
    def test_no_proxy_means_no_browser_and_a_plain_message(self, monkeypatch, capsys, module, jar, who):
        def paused(**k):
            raise ingest.SessionError("Reading is paused until the operator sets up the proxy. Nothing is wrong on your side; try again later.")

        started = self.wire(monkeypatch, module, jar, paused)
        assert module.main([]) == 1
        assert "args" not in started  # the browser was never created, so nothing could browse directly
        err = capsys.readouterr().err
        assert err.startswith(who) and "paused until the operator sets up the proxy" in err

    @pytest.mark.parametrize("module", [x_push, facebook_push])
    def test_there_is_no_way_for_the_person_to_pick_a_proxy_or_skip_it(self, module, capsys):
        for flag in (["--proxy", "http://x:1"], ["--no-proxy"], ["--direct"]):
            with pytest.raises(SystemExit):
                module.main(flag)
        capsys.readouterr()
        assert "proxy" not in module.__doc__.lower().replace("proxy is", "")  # the help text does not invite people to set one


class Handler(BaseHTTPRequestHandler):
    seen: list[dict] = []

    def do_GET(self):  # a browser sends plain-http requests to a proxy with the full address
        token = self.headers.get("Proxy-Authorization", "")
        good = "Basic " + base64.b64encode(b"proxy-user:s3cret-pass").decode()
        Handler.seen.append({"url": self.path, "auth": token == good})
        if token != good:
            self.send_response(407)
            self.send_header("Proxy-Authenticate", 'Basic realm="lk"')
            self.end_headers()
            return
        img = "<img src='http://lk-proxy-check.test/big-picture.png'><video src='http://lk-proxy-check.test/clip.mp4'></video>" if self.path.endswith('/pictures') else ''
        body = f"<html><body><main id='r'>reached through the proxy</main>{img}</body></html>".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


pytest.importorskip("playwright", reason="Playwright is not installed")


class TestInARealBrowser:
    """Real Chrome, a real local proxy that demands a password: the traffic must arrive through it with the login."""

    @pytest.fixture()
    def proxy_server(self):
        Handler.seen = []
        server = HTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        yield server.server_address[1]
        server.shutdown()

    def browse(self, launch):
        async def go():
            playwright, browser = await launch()
            try:
                page = await (await browser.new_context()).new_page()
                await page.goto("http://lk-proxy-check.test/hello", wait_until="domcontentloaded", timeout=20000)
                return await page.inner_text("#r")
            finally:
                await browser.close()
                await playwright.stop()

        return asyncio.run(go())

    def test_chrome_goes_through_the_proxy_with_its_login(self, proxy_server):
        proxy = {"server": f"http://127.0.0.1:{proxy_server}", "username": "proxy-user", "password": "s3cret-pass"}
        assert self.browse(lambda: x_browser.launch_chrome(False, proxy)) == "reached through the proxy"
        assert any(hit["url"].startswith("http://lk-proxy-check.test/hello") and hit["auth"] for hit in Handler.seen)

    def test_without_a_proxy_the_same_page_is_not_reachable_which_proves_the_proxy_was_used(self, proxy_server):
        with pytest.raises(Exception):
            self.browse(lambda: x_browser.launch_chrome(False, None))
        assert Handler.seen == []

    def test_the_readers_skip_pictures_video_and_fonts_so_the_paid_traffic_lasts(self, proxy_server):
        proxy = {"server": f"http://127.0.0.1:{proxy_server}", "username": "proxy-user", "password": "s3cret-pass"}

        async def go(client):
            try:
                page = await client._page_ready()
                await page.goto("http://lk-proxy-check.test/pictures", wait_until="load", timeout=20000)
                await page.wait_for_timeout(800)
                return await page.inner_text("#r")
            finally:
                await client.close()

        for client in (x_browser.BrowserXClient(JAR_X, proxy=proxy), facebook_browser.BrowserFacebookClient(JAR_FB, proxy=proxy)):
            assert asyncio.run(go(client)) == "reached through the proxy"
        urls = [hit["url"] for hit in Handler.seen]
        assert sum(1 for hit in Handler.seen if hit["auth"] and hit["url"].endswith("/pictures")) == 2   # the page itself came through, with the login
        assert not any(url.endswith((".png", ".mp4")) for url in urls)    # the picture and the video were never fetched

    def test_the_readers_pass_the_proxy_to_the_browser(self, proxy_server):
        proxy = {"server": f"http://127.0.0.1:{proxy_server}", "username": "proxy-user", "password": "s3cret-pass"}

        async def go(client):
            try:
                page = await client._page_ready()
                await page.goto("http://lk-proxy-check.test/reader", wait_until="domcontentloaded", timeout=20000)
                return await page.inner_text("#r")
            finally:
                await client.close()

        for client in (x_browser.BrowserXClient(JAR_X, proxy=proxy), facebook_browser.BrowserFacebookClient(JAR_FB, proxy=proxy)):
            assert asyncio.run(go(client)) == "reached through the proxy"
        assert sum(1 for hit in Handler.seen if hit["url"].endswith("/reader") and hit["auth"]) == 2
