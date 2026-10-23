from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.parse import urlencode

from playwright.sync_api import sync_playwright

HTML = Path(__file__).with_name("photosViewer.html")
VIEWPORT = {"width": 393, "height": 852}
SCALE = 3


def render(image: Path | str, out: Path | str, faces: list[dict], thumbs: list[str] = (), current: int | None = None, **opts) -> Path:
    query = {
        "img": Path(image).resolve().as_uri(),
        "faces": json.dumps(faces),
        "thumbs": json.dumps([Path(t).resolve().as_uri() for t in thumbs]),
        **({"current": str(current)} if current is not None else {}),
        **{k: str(v) for k, v in opts.items() if v is not None},
    }
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge")
        page = browser.new_page(viewport=VIEWPORT, device_scale_factor=SCALE)
        page.goto(HTML.resolve().as_uri() + "?" + urlencode(query))
        page.wait_for_selector("body[data-ready='1']", timeout=20000)
        jpeg = str(out).lower().endswith((".jpg", ".jpeg"))
        page.screenshot(path=str(out), type="jpeg" if jpeg else "png", **({"quality": 92} if jpeg else {}))
        browser.close()
    return Path(out)


def main() -> None:
    a = argparse.ArgumentParser(description="Render one photo inside the iPhone Photos viewer, faces scribbled out in red.")
    a.add_argument("image")
    a.add_argument("out")
    a.add_argument("--faces", default="[]", help="JSON list of {x,y,w,h}: each head, hair to chin, in image pixels")
    a.add_argument("--thumbs", default="[]", help="JSON list of image paths for the filmstrip")
    a.add_argument("--current", type=int)
    a.add_argument("--clock", help="status bar time, e.g. 2:21")
    a.add_argument("--place", help="title pill, first line: the town")
    a.add_argument("--when", help="title pill, second line: e.g. 'October 21  10:12 AM'")
    a.add_argument("--battery")
    a.add_argument("--signal")
    a.add_argument("--seed")
    args = a.parse_args()
    out = render(args.image, args.out, json.loads(args.faces), json.loads(args.thumbs), args.current, clock=args.clock, place=args.place,
                 when=args.when, battery=args.battery, signal=args.signal, seed=args.seed)
    print(out)


if __name__ == "__main__":
    main()
