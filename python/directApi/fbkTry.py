from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT.parent / "vendor" / "fbk" / "src"))

from login.autoLogin import totp
from pacing import pacer


def log(line: str) -> None:
    print(line, file=sys.stderr, flush=True)


def main() -> int:
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    account = spec["account"]
    proxy = spec["proxy"]
    from curl_cffi import requests as creq
    probe = creq.Session()
    probe.proxies = {"http": proxy, "https": proxy}
    try:
        ip = probe.get("https://api.ipify.org", timeout=20).text.strip()
    except Exception as exc:
        log(f"proxy probe failed: {type(exc).__name__}: {exc}")
        return 3
    log(f"proxy exit IP: {ip}")
    probe.close()

    from transport.session import FBTransport
    from auth.login import LoginFlow

    gov = pacer.governor_for(account)
    transport = FBTransport(cookies={}, governor=gov, proxy=proxy)
    flow = LoginFlow(transport, identifier=spec["email"], password=spec["password"],
                     log=lambda l: log(f"[fbk] {l}"))
    secret = spec.get("totpSecret") or ""
    try:
        result = flow.run(code_provider=lambda variant: totp(secret) if secret else "",
                          approval_wait_s=120.0)
    except Exception as exc:
        log(f"login error: {type(exc).__name__}: {str(exc)[:300]}")
        jar = transport.cookie_map()
        log(f"jar after failure: c_user={'yes' if jar.get('c_user') else 'no'} xs={'yes' if jar.get('xs') else 'no'}")
        transport.close()
        return 1
    jar = transport.cookie_map()
    transport.close()
    print(json.dumps({
        "exitIp": ip,
        "state": result.state,
        "userId": result.user_id,
        "checkpoint": result.checkpoint,
        "signedIn": bool(jar.get("c_user") and jar.get("xs")),
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
