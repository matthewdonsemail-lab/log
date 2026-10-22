from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))
from login import autoLogin
from browser import proxyGate
from errors.errorCodes import failure
from human.humanMouse import human_click
from session.publishSession import Session, log

PROFILE_URL = "https://www.facebook.com/me"
NAME_URL = "https://accountscenter.facebook.com/profiles/{id}/name"

PROFILE_PICTURE = re.compile(r"update profile picture|profile picture actions|add (?:a )?profile picture|choose profile picture", re.I)
COVER = re.compile(r"(?:add|edit|update) cover photo", re.I)
UPLOAD = re.compile(r"^\s*upload (?:a )?photo", re.I)
SAVE = re.compile(r"^\s*save(?: changes)?\s*$", re.I)

CONTROLS_JS = """() => {
  const seen = new Set(); const out = [];
  for (const el of document.querySelectorAll('[role=button],[role=link],[role=menuitem],button,a[aria-label]')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const name = (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 80);
    if (!name || seen.has(name)) continue;
    seen.add(name); out.push((el.getAttribute('role') || el.tagName.toLowerCase()) + ': ' + name);
    if (out.length >= 250) break;
  }
  const files = [...document.querySelectorAll('input[type=file]')].map(i => 'file input: accept=' + (i.accept || '*') + (i.multiple ? ' multiple' : ''));
  return out.concat(files);
}"""


NAME_FIELDS_JS = """() => [...document.querySelectorAll('input')].filter(i => {
  const r = i.getBoundingClientRect(); return r.width && r.height && (!i.type || i.type === 'text');
}).map(i => {
  const id = i.id && document.querySelector('label[for="' + i.id + '"]');
  return { label: (i.getAttribute('aria-label') || (id && id.innerText) || i.name || i.placeholder || '').trim().slice(0, 60), value: i.value || '' };
})"""


def session_cookies(s: Session) -> bool:
    try:
        names = {c["name"] for c in s.context.cookies() if c.get("value")}
    except Exception:
        return False
    return {"c_user", "xs"} <= names


def run_dir(s: Session) -> Path | None:
    capture = s.config.get("captureDir")
    return Path(capture).parent if capture else None


def save_text(s: Session, name: str, lines: list[str]) -> None:
    folder = run_dir(s)
    if folder is None:
        return
    try:
        (folder / name).write_text("\n".join([s.page.url.split("?", 1)[0], *lines]) + "\n", encoding="utf8")
    except Exception:
        pass


def opener(s: Session, pattern: re.Pattern):
    for role in ("button", "link"):
        found = s.page.get_by_role(role, name=pattern)
        for i in range(found.count()):
            item = found.nth(i)
            try:
                if item.is_visible():
                    return item
            except Exception:
                continue
    labelled = s.page.get_by_label(pattern)
    for i in range(min(labelled.count(), 20)):
        item = labelled.nth(i)
        try:
            if item.is_visible():
                return item
        except Exception:
            continue
    return None


def label_of(item) -> str:
    try:
        return (item.get_attribute("aria-label") or item.inner_text(timeout=1000) or "").strip()[:80]
    except Exception:
        return ""


def step_open(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    issue = s.start()
    if issue:
        return failure(issue["issue"], issue.get("detail", ""))
    log("Opening the profile (facebook.com/me).")
    try:
        s.page.goto(PROFILE_URL, wait_until="domcontentloaded")
    except Exception as exc:
        log(f"Navigation warning: {type(exc).__name__}. The page is read as it is.")
    s.page.wait_for_timeout(4000)
    return {"ok": True}


def step_read(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    page = autoLogin.read(s.page, None, session_cookies(s))
    log(f"Page: {page['kind']} {page['path']}")
    try:
        controls = s.page.evaluate(CONTROLS_JS)
    except Exception:
        controls = []
    save_text(s, "profileFound.txt", controls)
    picture = opener(s, PROFILE_PICTURE)
    cover = opener(s, COVER)
    out = {
        "ok": True,
        "kind": page["kind"],
        "path": page["path"],
        "profileControl": label_of(picture) if picture else None,
        "coverControl": label_of(cover) if cover else None,
        "fileInputs": sum(1 for c in controls if c.startswith("file input")),
        "controls": len(controls),
    }
    log(f"Profile controls: picture {out['profileControl'] or 'not found'}; cover {out['coverControl'] or 'not found'}; "
        f"{out['controls']} controls listed in profileFound.txt.")
    return out


def step_read_name(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    try:
        uid = next((c["value"] for c in s.context.cookies() if c.get("name") == "c_user" and c.get("value")), None)
    except Exception:
        uid = None
    if not uid:
        return failure("sessionExpired", "no c_user cookie: not signed in")
    log("Opening the name settings (Accounts Center), read only.")
    try:
        s.page.goto(NAME_URL.format(id=uid), wait_until="domcontentloaded")
    except Exception as exc:
        log(f"Navigation warning: {type(exc).__name__}. The page is read as it is.")
    s.page.wait_for_timeout(5000)
    try:
        fields = s.page.evaluate(NAME_FIELDS_JS)
    except Exception:
        fields = []
    try:
        controls = s.page.evaluate(CONTROLS_JS)
    except Exception:
        controls = []
    save_text(s, "nameFound.txt", [f"field: {f['label']} = {f['value']}" for f in fields] + controls)
    current = " ".join(f["value"] for f in fields if f["value"]).strip() or None
    log(f"Name settings: {len(fields)} name field(s) ({', '.join(f['label'] or '?' for f in fields) or 'none'}); "
        f"current name {current or 'not shown'}; {len(controls)} controls listed in nameFound.txt.")
    return {"ok": True, "path": s.page.url.split("?", 1)[0], "currentName": current,
            "fields": [f["label"] for f in fields], "controls": len(controls)}


def choose_file(s: Session, path: str) -> bool:
    items = [s.page.get_by_role(role, name=UPLOAD) for role in ("menuitem", "button")]
    for found in items:
        for i in range(found.count()):
            item = found.nth(i)
            try:
                if not item.is_visible():
                    continue
                with s.page.expect_file_chooser(timeout=10_000) as chooser:
                    human_click(item)
                chooser.value.set_files(path)
                log(f"Photo chosen through \"{label_of(item)}\".")
                return True
            except Exception:
                continue
    inputs = s.page.locator('[role=dialog] input[type=file], input[type=file][accept*="image"]')
    if inputs.count():
        try:
            inputs.first.set_input_files(path)
            log("Photo set on the dialog's file input.")
            return True
        except Exception:
            pass
    return False


def upload(s: Session, what: str, pattern: re.Pattern, path: str) -> dict[str, Any]:
    if not path or not Path(path).is_file():
        return failure("profilePhotoMissing", f"{what}: no prepared file")
    control = opener(s, pattern)
    if control is None:
        save_text(s, f"{what}Failed.txt", s.page.evaluate(CONTROLS_JS))
        return failure("profileControlNotFound", f"{what}: no control matching {pattern.pattern}")
    log(f"{what}: opening \"{label_of(control)}\".")
    human_click(control)
    s.page.wait_for_timeout(1500)
    if not choose_file(s, path):
        save_text(s, f"{what}Failed.txt", s.page.evaluate(CONTROLS_JS))
        return failure("profileControlNotFound", f"{what}: no Upload photo item or file input after the opener")
    log(f"{what}: waiting for Save.")
    if not s.click_when_enabled(SAVE, 45_000):
        save_text(s, f"{what}Failed.txt", [s.body(3000)])
        return failure("profileUploadNotSaved", f"{what}: Save never became clickable")
    s.page.wait_for_timeout(5000)
    if s.enabled_button(SAVE, 2000) is not None:
        save_text(s, f"{what}Failed.txt", [s.body(3000)])
        return failure("profileUploadNotSaved", f"{what}: the dialog is still open after Save")
    log(f"{what}: saved.")
    return {"ok": True}


def step_upload_profile_photo(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    return upload(s, "profilePhoto", PROFILE_PICTURE, str(params.get("path") or ""))


def step_upload_cover_photo(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    return upload(s, "coverPhoto", COVER, str(params.get("path") or ""))


STEPS = {
    "open": step_open,
    "read": step_read,
    "readName": step_read_name,
    "uploadProfilePhoto": step_upload_profile_photo,
    "uploadCoverPhoto": step_upload_cover_photo,
}


def main() -> int:
    try:
        config = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    except json.JSONDecodeError as exc:
        print(json.dumps({"id": 0, "result": failure("badConfig", str(exc))}), flush=True)
        return 1
    sys.stdin.reconfigure(encoding="utf8")
    reply_out, sys.stdout = sys.stdout, sys.stderr
    capture = config.get("captureDir")
    proxyGate.arm(config.get("proxyPath"), config.get("devicePath"), capture)
    session = Session({**config, "receiptDir": str(Path(capture).parent) if capture else None})

    def reply(request_id: Any, result: dict[str, Any]) -> None:
        reply_out.write(json.dumps({"id": request_id, "result": result}) + "\n")
        reply_out.flush()

    try:
        for line in sys.stdin:
            if not line.strip():
                continue
            try:
                request = json.loads(line)
            except json.JSONDecodeError as exc:
                reply(None, failure("badRequest", str(exc)))
                continue
            step = request.get("step")
            if step == "close":
                reply(request.get("id"), {"ok": True})
                break
            handler = STEPS.get(step)
            if handler is None:
                reply(request.get("id"), failure("unknownStep", str(step)))
                continue
            if step != "open" and session.page is None:
                reply(request.get("id"), failure("notOpen", "send open first"))
                continue
            try:
                if session.mouse is not None and step not in ("open",):
                    session.mouse.look()
                result = handler(session, request.get("params") or {})
            except proxyGate.GateError as exc:
                result = failure(exc.code, exc.detail)
            except Exception as exc:
                result = failure("crashed", f"{type(exc).__name__}"[:400])
            if result.get("ok") is False:
                log(f"{step} failed: {result.get('code')} {result.get('detail', '')}".rstrip())
            reply(request.get("id"), result)
    finally:
        session.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
