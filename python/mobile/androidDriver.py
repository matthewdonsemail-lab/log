from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def answer(payload: dict) -> int:
    print(json.dumps(payload))
    return 0 if payload.get("ok") else 1


def element_count(xml: str) -> int:
    return xml.count("<node ")


def inspect(serial: str, out: str, open_package: str | None) -> int:
    try:
        import uiautomator2 as u2
    except ImportError:
        return answer({"ok": False, "code": "uiautomator2Missing", "error": "the uiautomator2 Python package isn't installed for LOG_PYTHON: pip install uiautomator2"})
    folder = Path(out)
    folder.mkdir(parents=True, exist_ok=True)
    try:
        device = u2.connect(serial)
        if open_package:
            device.app_start(open_package, wait=True)
        current = device.app_current()
        xml = device.dump_hierarchy()
        hierarchy = folder / "hierarchy.xml"
        hierarchy.write_text(xml, encoding="utf-8")
        screenshot = folder / "screenshot.png"
        device.screenshot(str(screenshot))
    except Exception as error:
        return answer({"ok": False, "code": "inspectFailed", "error": f"{type(error).__name__}: {error}"[:500]})
    (folder / "step.json").write_text(json.dumps({"serial": serial, "opened": open_package, "currentApp": current}, indent=2), encoding="utf-8")
    return answer({"ok": True, "hierarchy": str(hierarchy), "screenshot": str(screenshot), "currentApp": current.get("package", "") if isinstance(current, dict) else str(current), "elements": element_count(xml)})


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["inspect"])
    parser.add_argument("--serial", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--open", default=None)
    args = parser.parse_args()
    return inspect(args.serial, args.out, args.open)


if __name__ == "__main__":
    sys.exit(main())
