import html
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

WEB = Path(__file__).resolve().parent.parent
PUBLIC = WEB / "public"
TEMPLATE = (WEB / "scripts" / "ogCard.html").read_text(encoding="utf-8")
ARTICLES = json.loads((WEB / "src" / "landing" / "devlog" / "articles.json").read_text(encoding="utf-8"))
SHARE_PAGES = json.loads((WEB / "src" / "landing" / "useCases" / "sharePages.json").read_text(encoding="utf-8"))
PHOTO = PUBLIC / "images" / "mattlistening.webp"
ICON_SCRIPT = (
    "const b=require('@fortawesome/free-brands-svg-icons');"
    "const out={};for(const n of process.argv.slice(1)){const i=b[n].icon;out[n]={w:i[0],h:i[1],d:String(i[4])}}"
    "process.stdout.write(JSON.stringify(out))"
)


def icon_paths(names):
    if not names:
        return {}
    run = subprocess.run(["node", "-e", ICON_SCRIPT, *names], cwd=WEB, capture_output=True, text=True, check=True, shell=False)
    return json.loads(run.stdout)


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


def logo_panel(icon):
    return f'<div class="logo"><svg viewBox="0 0 {icon["w"]} {icon["h"]}" aria-hidden="true"><path d="{icon["d"]}" /></svg></div>'


def cards(wanted):
    icons = icon_paths(sorted({page["icon"] for page in SHARE_PAGES}))
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
            fill(page["card"], logo_panel(icons[page["icon"]]), f"log.listeningkit.com/{page['slug']}"),
        )


def launch(playwright):
    for channel in ("chrome", "msedge"):
        try:
            return playwright.chromium.launch(channel=channel)
        except Exception:
            continue
    return playwright.chromium.launch()


def main(wanted):
    todo = [card for card in cards(wanted) if not wanted or card[0] in wanted]
    if not todo:
        raise SystemExit(f"no share card matches {wanted}")
    with sync_playwright() as playwright, tempfile.TemporaryDirectory() as scratch:
        browser = launch(playwright)
        try:
            page = browser.new_page(viewport={"width": 1200, "height": 630})
            for slug, out, body in todo:
                file = Path(scratch) / f"{slug}.html"
                file.write_text(body, encoding="utf-8")
                page.goto(file.as_uri(), wait_until="networkidle")
                page.evaluate("document.fonts.ready")
                out.parent.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(out), type="png", clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                print(f"wrote {out.relative_to(WEB)}")
        finally:
            browser.close()


if __name__ == "__main__":
    main(sys.argv[1:])
