from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
FBK = ROOT.parent / "vendor" / "fbk"
for p in (str(ROOT), str(FBK / "src")):
    if p not in sys.path:
        sys.path.insert(0, p)

DATA = FBK / "data"
STATE = Path.home() / ".logCli" / "fbk"


def registry() -> dict[str, str]:
    return json.loads((DATA / "logcliRegistry.json").read_text(encoding="utf-8"))


def templates() -> dict[str, Any]:
    return json.loads((DATA / "logcliTemplates.json").read_text(encoding="utf-8"))


def resolve(friendly: str) -> dict[str, Any]:
    reg, tpl = registry(), templates()
    if friendly not in reg:
        return {"ok": False, "code": "notMapped", "detail": f"{friendly} is not in logcliRegistry.json"}
    return {"ok": True, "friendly": friendly, "docId": reg[friendly], "variables": (tpl.get(friendly) or {}).get("variables", {})}


def run(friendly: str, cookies_path: str, *, proxy: str | None = None, account: str | None = None,
        variables: dict[str, Any] | None = None, dry_run: bool = False) -> dict[str, Any]:
    r = resolve(friendly)
    if not r["ok"]:
        return r
    doc_id = r["docId"]
    vars_ = dict(r["variables"] or {})
    if variables:
        vars_.update(variables)

    from governor import GovernorBlockedError
    from graphql.errors import DryRunComplete

    session = _session(account, cookies_path, proxy, dry_run)
    is_mutation = friendly.endswith("Mutation")
    try:
        login = _login(session)
        if not login["ok"]:
            return login
        docs = session.graphql.call_raw(friendly, doc_id, vars_)
    except DryRunComplete:
        return {"ok": True, "planned": True, "friendly": friendly, "docId": doc_id, "isMutation": is_mutation}
    except GovernorBlockedError as e:
        return {"ok": False, "code": "governorBlocked", "detail": str(e)}
    finally:
        try:
            session.transport.close()
        except Exception:
            pass
    return {"ok": True, "friendly": friendly, "docId": doc_id, "isMutation": is_mutation, "docs": len(docs), "answer": docs[0] if docs else None}


def state_dir(account: str | None) -> Path:
    folder = STATE / (account or "default")
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def _session(account: str | None, cookies_path: str, proxy: str | None, dry_run: bool = False) -> Any:
    from config import Config
    from session import Session

    cfg = Config.discover().model_copy(update={"cookies_path": Path(cookies_path), "proxy": proxy, "state_dir": state_dir(account)})
    return Session(cfg, journal_name=None, dry_run=dry_run)


def _camel(snake: str) -> str:
    head, *rest = snake.split("_")
    return head + "".join(w.capitalize() for w in rest)


def _login(session: Any) -> dict[str, Any]:
    from auth.state import LoginState

    boot = session.bootstrap()
    warnings = [m.split(":", 1)[1] for m in boot.markers_seen if m.startswith("ACCOUNT_WARNING:")]
    state = _camel(boot.state.value)
    out = {"loginState": state, "loginMarkers": [m for m in boot.markers_seen if not m.startswith("ACCOUNT_WARNING:")], "accountWarnings": warnings}
    if warnings:
        return {"ok": False, "code": "accountWarning", "detail": f"the page carries {', '.join(warnings)}", **out}
    if boot.state == LoginState.CHECKPOINT:
        session.transport.governor.observe_checkpoint()
        return {"ok": False, "code": "loginCheckpoint", "detail": "Facebook's page says is_checkpointed", **out}
    if boot.state != LoginState.LOGGED_IN:
        return {"ok": False, "code": f"login{state[:1].upper()}{state[1:]}", "detail": f"Facebook's page classified {state}", **out}
    return {"ok": True, **out}


def governor_status(account: str) -> dict[str, Any]:
    from governor import RequestGovernor

    return {"ok": True, "account": account, "governor": RequestGovernor(state_path=state_dir(account) / "governor_state.json").status()}


def _plain(x: Any) -> Any:
    import dataclasses

    if dataclasses.is_dataclass(x) and not isinstance(x, type):
        return {k: _plain(v) for k, v in dataclasses.asdict(x).items()}
    if isinstance(x, (list, tuple)):
        return [_plain(i) for i in x]
    if hasattr(x, "__dict__"):
        return {k: _plain(v) for k, v in vars(x).items()}
    return x


def run_surface(surface: str, method: str, args: list[Any], cookies_path: str, *, proxy: str | None = None, account: str | None = None) -> dict[str, Any]:
    import importlib

    from governor import GovernorBlockedError
    from graphql.errors import CheckpointError, NotLoggedInError

    session = _session(account, cookies_path, proxy)
    login: dict[str, Any] = {}
    try:
        login = _login(session)
        if not login["ok"]:
            return {**login, "governor": session.transport.governor.status()}
        module = importlib.import_module(f"surfaces.{surface}")
        service_cls = next(getattr(module, n) for n in dir(module) if n.endswith("Service"))
        result = getattr(service_cls(session), method)(*args)
        raw = result if isinstance(result, list) else getattr(result, "stories", None)
        rows = [_plain(r) for r in raw] if isinstance(raw, list) else _plain(result)
        count = len(rows) if isinstance(rows, list) else None
        return {"ok": True, "surface": surface, "method": method, "count": count, "rows": rows, **login, "governor": session.transport.governor.status()}
    except GovernorBlockedError as e:
        return {"ok": False, "code": "governorBlocked", "detail": str(e), **login}
    except CheckpointError as e:
        return {"ok": False, "code": "loginCheckpoint", "detail": str(e)[:300], **login, "loginState": "checkpoint"}
    except NotLoggedInError as e:
        return {"ok": False, "code": "loginLoggedOut", "detail": str(e)[:300], **login, "loginState": "loggedOut"}
    except Exception as e:
        return {"ok": False, "code": type(e).__name__, "detail": str(e)[:300], **login}
    finally:
        try:
            session.transport.close()
        except Exception:
            pass


def main() -> int:
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    if spec.get("governorStatus"):
        out = governor_status(spec["account"])
    elif spec.get("surface"):
        out = run_surface(spec["surface"], spec["method"], spec.get("args", []), spec["cookiesPath"], proxy=spec.get("proxy"), account=spec.get("account"))
    else:
        out = run(spec["friendly"], spec["cookiesPath"], proxy=spec.get("proxy"),
                  account=spec.get("account"), variables=spec.get("variables"), dry_run=bool(spec.get("dryRun")))
    print(json.dumps(out, default=str))
    return 0 if out.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
