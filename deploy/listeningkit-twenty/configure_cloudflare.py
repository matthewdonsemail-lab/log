#!/usr/bin/env python3
"""Create the ListeningKit Cloudflare tunnel and DNS routes without printing secrets."""

from __future__ import annotations

import base64
import json
import os
import secrets
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API_BASE = "https://api.cloudflare.com/client/v4"
ZONE_NAME = "listeningkit.com"
TUNNEL_NAME = "listeningkit-node02"
HOSTNAMES = {
    "twenty.listeningkit.com": "http://auth-guard:3000",
    "newsletter-relay.listeningkit.com": "http://newsletter-relay:8787",
}


def required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


def api(token: str, method: str, path: str, payload: dict | None = None) -> dict:
    request = urllib.request.Request(
        f"{API_BASE}{path}",
        method=method,
        data=None if payload is None else json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Cloudflare {method} failed with HTTP {error.code}") from None
    except urllib.error.URLError:
        raise RuntimeError("Could not reach Cloudflare") from None
    if not result.get("success"):
        raise RuntimeError(f"Cloudflare rejected {method} {path.split('?')[0]}")
    return result


def unique(items: list[dict], description: str) -> dict:
    if len(items) != 1:
        raise RuntimeError(f"Could not uniquely resolve {description}")
    return items[0]


def upsert_dns(token: str, zone_id: str, name: str, target: str) -> None:
    query = urllib.parse.urlencode({"name": name})
    records = api(token, "GET", f"/zones/{zone_id}/dns_records?{query}").get("result", [])
    payload = {"type": "CNAME", "name": name, "content": target, "proxied": True, "ttl": 1}
    if not records:
        api(token, "POST", f"/zones/{zone_id}/dns_records", payload)
        return
    record = unique(records, f"DNS record {name}")
    api(token, "PUT", f"/zones/{zone_id}/dns_records/{record['id']}", payload)


def write_secret(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{secrets.token_hex(6)}.tmp")
    temporary.write_text(value, encoding="utf-8")
    os.chmod(temporary, 0o600)
    temporary.replace(path)


def main() -> None:
    token = required_env("CLOUDFLARE_API_TOKEN")
    output_path = Path(required_env("CLOUDFLARED_TOKEN_FILE"))

    zones = api(token, "GET", f"/zones?name={ZONE_NAME}&status=active").get("result", [])
    zone = unique(zones, ZONE_NAME)
    zone_id = zone["id"]
    account_id = zone["account"]["id"]

    query = urllib.parse.urlencode({"name": TUNNEL_NAME, "is_deleted": "false"})
    tunnels = api(token, "GET", f"/accounts/{account_id}/cfd_tunnel?{query}").get("result", [])
    if tunnels:
        tunnel = unique(tunnels, TUNNEL_NAME)
        print("Found existing ListeningKit tunnel.")
    else:
        tunnel_secret = base64.b64encode(secrets.token_bytes(32)).decode()
        tunnel = api(
            token,
            "POST",
            f"/accounts/{account_id}/cfd_tunnel",
            {"name": TUNNEL_NAME, "tunnel_secret": tunnel_secret, "config_src": "cloudflare"},
        )["result"]
        print("Created ListeningKit tunnel.")

    tunnel_id = tunnel["id"]
    ingress = [
        {"hostname": hostname, "service": service}
        for hostname, service in HOSTNAMES.items()
    ]
    ingress.append({"service": "http_status:404"})
    api(
        token,
        "PUT",
        f"/accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations",
        {"config": {"ingress": ingress}},
    )
    print("Configured two narrow tunnel routes.")

    target = f"{tunnel_id}.cfargotunnel.com"
    for hostname in HOSTNAMES:
        upsert_dns(token, zone_id, hostname, target)
    print("Configured two proxied DNS records.")

    connector_token = api(
        token,
        "GET",
        f"/accounts/{account_id}/cfd_tunnel/{tunnel_id}/token",
    )["result"]
    write_secret(output_path, connector_token)
    print("Saved the connector token to a protected temporary file.")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, KeyError, json.JSONDecodeError) as error:
        print(f"Cloudflare setup failed: {error}", file=os.sys.stderr)
        raise SystemExit(1)
