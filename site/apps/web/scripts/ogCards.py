import html
import json
import subprocess
import time
import urllib.request
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

WEB = Path(__file__).resolve().parent.parent
PUBLIC = WEB / "public"
TEMPLATE = (WEB / "scripts" / "ogCard.html").read_text(encoding="utf-8")
SHARE_CARD_PORT = 5317
SHARE_CARD_SITE = f"http://localhost:{SHARE_CARD_PORT}"
ARTICLES = json.loads((WEB / "src" / "landing" / "devlog" / "articles.json").read_text(encoding="utf-8"))
SHARE_PAGES = json.loads((WEB / "src" / "landing" / "useCases" / "sharePages.json").read_text(encoding="utf-8"))
PHOTO = PUBLIC / "images" / "mattlistening.webp"
def fill(card, panel, footer):
    return (
        TEMPLATE.replace("{{LEAD}}", html.escape(card["lead"]))
        .replace("{{NAME}}", html.escape(card["name"].upper()))
        .replace("{{PITCH}}", card["pitch"])
        .replace("{{PANEL}}", panel)
        .replace("{{FOOTER}}", html.escape(footer))
    )


def photo_panel():
    return f'<div class="clip"><img src="{PHOTO.as_uri()}" alt="Matthew Don" /></div>'


def cards(wanted):
    for article in ARTICLES:
        yield (
            article["slug"],
            PUBLIC / "og" / "devlog" / f"{article['slug']}.png",
            fill(article["card"], photo_panel(), f"devlog · {article['author']} · {article['publishedLabel']}"),
        )
    for page in SHARE_PAGES:
        yield (
            page["slug"],
            PUBLIC / "og" / "pages" / f"{page['slug']}.png",
            f"{SHARE_CARD_SITE}/shareCard/{page['slug']}",
        )


def start_site():
    server = subprocess.Popen(
        ["npx", "vite", "--port", str(SHARE_CARD_PORT), "--strictPort"],
        cwd=WEB, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=sys.platform == "win32",
    )
    for _ in range(120):
        try:
            urllib.request.urlopen(SHARE_CARD_SITE, timeout=2)
            return server
        except Exception:
            time.sleep(0.5)
    stop_site(server)
    raise SystemExit("the site never answered for the share cards")


def stop_site(server):
    if sys.platform == "win32":
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(server.pid)], capture_output=True)
    else:
        server.terminate()


def launch(playwright):
    for channel in ("chrome", "msedge"):
        try:
            return playwright.chromium.launch(channel=channel, args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        except Exception:
            continue
    return playwright.chromium.launch()


def main(wanted):
    todo = [card for card in cards(wanted) if not wanted or card[0] in wanted]
    if not todo:
        raise SystemExit(f"no share card matches {wanted}")
    server = start_site() if any(body.startswith(SHARE_CARD_SITE) for _, _, body in todo) else None
    with sync_playwright() as playwright, tempfile.TemporaryDirectory() as scratch:
        browser = launch(playwright)
        try:
            page = browser.new_page(viewport={"width": 1200, "height": 630})
            for slug, out, body in todo:
                if body.startswith(SHARE_CARD_SITE):
                    page.goto(body, wait_until="networkidle")
                    page.wait_for_selector("canvas", timeout=30000)
                    page.evaluate("document.fonts.ready")
                    page.wait_for_timeout(2500)
                else:
                    file = Path(scratch) / f"{slug}.html"
                    file.write_text(body, encoding="utf-8")
                    page.goto(file.as_uri(), wait_until="networkidle")
                    page.evaluate("document.fonts.ready")
                out.parent.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(out), type="png", clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                print(f"wrote {out.relative_to(WEB)}")
        finally:
            browser.close()
            if server:
                stop_site(server)


if __name__ == "__main__":
    main(sys.argv[1:])
