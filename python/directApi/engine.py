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

    from config import Config
    from session import Session
    from governor import GovernorBlockedError
    from graphql.errors import DryRunComplete

    cfg = Config.discover().model_copy(update={"cookies_path": Path(cookies_path), "proxy": proxy})
    session = Session(cfg, journal_name=None, dry_run=dry_run)
    is_mutation = friendly.endswith("Mutation")
    try:
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


def main() -> int:
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = run(spec["friendly"], spec["cookiesPath"], proxy=spec.get("proxy"),
              account=spec.get("account"), variables=spec.get("variables"), dry_run=bool(spec.get("dryRun")))
    print(json.dumps(out))
    return 0 if out.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
