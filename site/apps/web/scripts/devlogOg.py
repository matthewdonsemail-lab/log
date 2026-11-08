import html
import json
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

WEB = Path(__file__).resolve().parent.parent
PUBLIC = WEB / "public"
TEMPLATE = (WEB / "scripts" / "devlogOgCard.html").read_text(encoding="utf-8")
ARTICLES = json.loads((WEB / "src" / "landing" / "devlog" / "articles.json").read_text(encoding="utf-8"))
PHOTO = PUBLIC / "images" / "mattlistening.webp"


def card_html(article):
    card = article["card"]
    return (
        TEMPLATE.replace("{{LEAD}}", html.escape(card["lead"]))
        .replace("{{NAME}}", html.escape(card["name"].upper()))
        .replace("{{PITCH}}", card["pitch"])
        .replace("{{AUTHOR}}", html.escape(article["author"]))
        .replace("{{DATE}}", html.escape(article["publishedLabel"]))
        .replace("{{PHOTO}}", PHOTO.as_uri())
    )


def launch(playwright):
    for channel in ("chrome", "msedge"):
        try:
            return playwright.chromium.launch(channel=channel)
        except Exception:
            continue
    return playwright.chromium.launch()


def main(wanted):
    articles = [a for a in ARTICLES if not wanted or a["slug"] in wanted]
    if not articles:
        raise SystemExit(f"no devlog article matches {wanted}")
    out_dir = PUBLIC / "og" / "devlog"
    out_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright, tempfile.TemporaryDirectory() as scratch:
        browser = launch(playwright)
        try:
            page = browser.new_page(viewport={"width": 1200, "height": 630})
            for article in articles:
                file = Path(scratch) / f"{article['slug']}.html"
                file.write_text(card_html(article), encoding="utf-8")
                page.goto(file.as_uri(), wait_until="networkidle")
                page.evaluate("document.fonts.ready")
                out = out_dir / f"{article['slug']}.png"
                page.screenshot(path=str(out), type="png", clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                print(f"wrote {out.relative_to(WEB)}")
        finally:
            browser.close()


if __name__ == "__main__":
    main(sys.argv[1:])
