from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from creative.renderViewer import render

LISTINGS = Path(__file__).resolve().parents[2] / "media" / "listings"
FRAME_FILES = ("before", "action", "after")
OUTPUTS = {"ios": False, "iosScribbled": True}


def frame_path(folder: Path, frame: str) -> Path | None:
    for ext in (".jpg", ".png", ".webp"):
        p = folder / "raw" / f"{frame}{ext}"
        if p.exists():
            return p
    return None


def camera_roll(folders: list[Path]) -> list[Path]:
    roll = [p for f in folders for frame in FRAME_FILES if (p := frame_path(f, frame))]
    return roll * 4


def render_listing(folder: Path, roll: list[Path]) -> list[Path]:
    spec = json.loads((folder / "viewer.json").read_text(encoding="utf-8"))
    made = []
    for out_name, scribbled in OUTPUTS.items():
        out_dir = folder / out_name
        out_dir.mkdir(exist_ok=True)
        for k, (frame, item) in enumerate(spec["frames"].items()):
            image = frame_path(folder, frame)
            if not image:
                print(f"{folder.name} {frame}: no raw/{frame} image, skipped", flush=True)
                continue
            current = roll.index(image) + len(roll) // 2 if image in roll else None
            faces = item.get("faces", []) if scribbled else []
            out = render(image, out_dir / f"{frame}.jpg", faces, [str(p) for p in roll], current,
                         clock=item.get("clock"), place=spec.get("place"), when=item.get("when"), battery=item.get("battery"), seed=k + 3)
            print(f"{folder.name} {out_name}/{frame}.jpg", flush=True)
            made.append(out)
    return made


def main() -> None:
    a = argparse.ArgumentParser(description="Render each listing's raw/ frames into ios/ (the iPhone Photos viewer) and iosScribbled/ (the same, faces scribbled out in red).")
    a.add_argument("names", nargs="*", help="listing folder names under media/listings (default: every folder with viewer.json)")
    a.add_argument("--root", default=str(LISTINGS))
    args = a.parse_args()
    root = Path(args.root)
    folders = sorted(p.parent for p in root.glob("*/viewer.json"))
    if args.names:
        folders = [f for f in folders if f.name in args.names]
    roll = camera_roll(sorted(p for p in root.iterdir() if p.is_dir()))
    for folder in folders:
        render_listing(folder, roll)


if __name__ == "__main__":
    main()
