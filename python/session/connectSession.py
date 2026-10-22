from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import sys as _sys
from pathlib import Path as _Path

_sys.path.insert(0, str(_Path(__file__).resolve().parents[1]))
from login import autoLogin
from browser import proxyGate
from errors.errorCodes import failure
from session.publishSession import SELLING_URL, Session, log, step_solve_captcha


def read_login(path: str | None) -> dict[str, Any]:
    if not path or not Path(path).is_file():
        return {}
    try:
        secrets = json.loads(Path(path).read_text(encoding="utf8"))
    except Exception:
        return {}
    return secrets if isinstance(secrets, dict) else {}


def captcha_on(s: Session) -> dict[str, Any] | None:
    detection = s.detect_captcha()
    return detection if detection and detection.get("kind") in ("arkose", "recaptcha", "textImage") else None


def session_cookies(s: Session) -> bool:
    try:
        names = {c["name"] for c in s.context.cookies() if c.get("value")}
    except Exception:
        return False
    return {"c_user", "xs"} <= names


def step_open(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    issue = s.start()
    if issue:
        return failure(issue["issue"], issue.get("detail", ""))
    log("Opening Marketplace > Selling.")
    try:
        s.page.goto(SELLING_URL, wait_until="domcontentloaded")
    except Exception as exc:
        log(f"Navigation warning: {type(exc).__name__}. The page is read as it is.")
    s.page.wait_for_timeout(3000)
    return {"ok": True}


def step_open_in_session(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    log("Signing in in this browser: opening Marketplace > Selling.")
    try:
        s.page.goto(SELLING_URL, wait_until="domcontentloaded")
    except Exception as exc:
        log(f"Navigation warning: {type(exc).__name__}. The page is read as it is.")
    s.page.wait_for_timeout(3000)
    return {"ok": True}


def step_read(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    page = autoLogin.read(s.page, captcha_on(s), session_cookies(s))
    log(f"Page: {page['kind']} {page['path']}" + (f" \"{page['heading']}\"" if page.get("heading") else ""))
    if page.get("text") is not None or page.get("buttons"):
        seen = f"{page['kind']}|{page['path']}"
        if s.__dict__.get("lastDescribed") != seen:
            s.lastDescribed = seen
            log(f"  says: {page.get('text') or '(no text)'} | buttons: {', '.join(page.get('buttons') or []) or 'none'}")
    return page


def acted(done: bool, what: str) -> dict[str, Any]:
    return {"ok": True} if done else failure("crashed", f"{what}: nothing to act on")


def step_submit_credentials(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    return acted(autoLogin.submit_credentials(s.page, s.secrets, log), "submitCredentials")


def step_choose_auth_app(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    return acted(autoLogin.choose_auth_app(s.page, log), "chooseAuthApp")


def step_submit_code(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    return acted(autoLogin.submit_code(s.page, s.secrets.get("totpSecret"), log), "submitCode")


def step_dismiss(s: Session, params: dict[str, Any]) -> dict[str, Any]:
    return acted(autoLogin.dismiss(s.page, str(params.get("kind")), log), "dismiss")


def step_save(s: Session, _: dict[str, Any]) -> dict[str, Any]:
    try:
        s.page.reload(wait_until="domcontentloaded")
        s.page.wait_for_timeout(2500)
    except Exception as exc:
        log(f"Reload warning: {type(exc).__name__}.")
    page = autoLogin.read(s.page, captcha_on(s), session_cookies(s))
    logged_in = page["kind"] == "loggedIn"
    if logged_in:
        Path(s.config["storageStatePath"]).parent.mkdir(parents=True, exist_ok=True)
        s.context.storage_state(path=str(s.config["storageStatePath"]))
        log("Signed in; session written for Twenty.")
    else:
        log(f"Not signed in after the reload: {page['kind']} {page['path']}.")
    return {"ok": True, "loggedIn": logged_in, **({"bodySample": page["bodySample"]} if logged_in else {})}


STEPS = {
    "open": step_open,
    "read": step_read,
    "submitCredentials": step_submit_credentials,
    "chooseAuthApp": step_choose_auth_app,
    "submitCode": step_submit_code,
    "dismiss": step_dismiss,
    "solveCaptcha": step_solve_captcha,
    "save": step_save,
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
    session = Session({**config, "allowFresh": True, "receiptDir": str(Path(capture).parent) if capture else None})
    session.secrets = read_login(config.get("loginPath"))

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
                    session.mouse.look(0.3, 1.2)
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
