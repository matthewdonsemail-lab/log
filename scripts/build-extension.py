"""Package apps/extension into apps/web/public/listeningkit-extension.zip (the onboarding download)."""
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "apps" / "extension"
OUT = ROOT / "apps" / "web" / "public" / "listeningkit-extension.zip"
FILES = ["manifest.json", "popup.html", "popup.js", "lib.js", "icons/16.png", "icons/32.png", "icons/48.png", "icons/128.png"]

OUT.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as archive:
    for name in FILES:
        info = zipfile.ZipInfo(f"listeningkit-extension/{name}", date_time=(2026, 9, 18, 0, 0, 0))  # fixed date: same input, same zip
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, (SRC / name).read_bytes())
print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes)")
