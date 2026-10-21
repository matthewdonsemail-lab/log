#!/usr/bin/env python3
"""Stream legacy Facebook access into an AES-256-GCM vault on node02.

No plaintext credential file is created. Source mode emits only to stdout for a
single SSH pipeline. Target mode encrypts each record before atomically writing
it and marks the corresponding non-secret Twenty record as migrated.
"""
from __future__ import annotations

import base64
import json
import os
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SENSITIVE_FIELDS = (
    "cookies",
    "accessToken",
    "email",
    "password",
    "emailPassword",
    "totpSecret",
    "storageOrigins",
    "proxy",
    "deviceProfile",
    "adsPowerProfileId",
    "vendorUserAgent",
)


def required(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required")
    return value.rstrip("/")


def request_json(url: str, key: str, *, method: str = "GET", payload: dict | None = None) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode() if payload is not None else None,
        method=method,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            text = response.read().decode()
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Twenty request failed with HTTP {error.code}") from None
    except urllib.error.URLError:
        raise RuntimeError("Could not reach Twenty") from None
    return json.loads(text) if text.strip() else {}


def source_mode() -> None:
    base = required("SOURCE_TWENTY_URL")
    key = required("SOURCE_TWENTY_API_KEY")
    rows = request_json(f"{base}/rest/socialAccounts?limit=100", key).get("data", {}).get("socialAccounts", [])
    if not isinstance(rows, list) or len(rows) >= 100:
        raise RuntimeError("Legacy Social Accounts exceeded the bounded migration window")
    payload = []
    for row in rows:
        if not isinstance(row, dict) or not row.get("id"):
            continue
        secrets = {name: row[name] for name in SENSITIVE_FIELDS if row.get(name) not in (None, "", [], {})}
        if secrets:
            payload.append({"sourceAccountId": str(row["id"]), "secrets": secrets})
    sys.stdout.write(json.dumps(payload, separators=(",", ":")))


def decode_key(value: str) -> bytes:
    try:
        key = base64.b64decode(value, validate=True)
    except ValueError:
        raise RuntimeError("FACEBOOK_VAULT_KEY is invalid") from None
    if len(key) != 32:
        raise RuntimeError("FACEBOOK_VAULT_KEY must decode to 32 bytes")
    return key


def target_mode() -> None:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM

    base = required("TARGET_TWENTY_URL")
    api_key = required("TARGET_TWENTY_API_KEY")
    vault_key = decode_key(required("FACEBOOK_VAULT_KEY"))
    vault_path = Path(required("FACEBOOK_VAULT_PATH"))
    rows = json.load(sys.stdin)
    if not isinstance(rows, list) or len(rows) >= 100:
        raise RuntimeError("Facebook access payload was invalid")

    cipher = AESGCM(vault_key)
    encrypted: dict[str, dict[str, str | int]] = {}
    migrated_ids = []
    for row in rows:
        if not isinstance(row, dict) or set(row) != {"sourceAccountId", "secrets"}:
            raise RuntimeError("Facebook access payload contained an unexpected field")
        source_id = str(row["sourceAccountId"])
        secrets = row["secrets"]
        if not source_id or not isinstance(secrets, dict) or set(secrets) - set(SENSITIVE_FIELDS):
            raise RuntimeError("Facebook access payload was malformed")
        nonce = os.urandom(12)
        aad = f"listeningkit:facebook-account:{source_id}:v1".encode()
        sealed = cipher.encrypt(nonce, json.dumps(secrets, separators=(",", ":")).encode(), aad)
        encrypted[source_id] = {
            "version": 1,
            "algorithm": "AES-256-GCM",
            "nonce": base64.b64encode(nonce).decode(),
            "ciphertext": base64.b64encode(sealed).decode(),
        }
        migrated_ids.append(source_id)

    vault_path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(vault_path.parent, 0o700)
    fd, temporary_name = tempfile.mkstemp(prefix=f".{vault_path.name}.", dir=vault_path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf8") as temporary:
            json.dump({"version": 1, "accounts": encrypted}, temporary, separators=(",", ":"))
            temporary.write("\n")
            temporary.flush()
            os.fsync(temporary.fileno())
        os.chmod(temporary_name, 0o600)
        os.replace(temporary_name, vault_path)
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)

    updated = 0
    for source_id in migrated_ids:
        params = urllib.parse.urlencode({"limit": "1", "filter": f"sourceAccountId[eq]:{json.dumps(source_id)}"})
        matches = request_json(f"{base}/rest/facebookAccounts?{params}", api_key).get("data", {}).get("facebookAccounts", [])
        if len(matches) != 1:
            raise RuntimeError("A migrated Facebook Account record was missing or duplicated")
        request_json(
            f"{base}/rest/facebookAccounts/{urllib.parse.quote(matches[0]['id'])}",
            api_key,
            method="PATCH",
            payload={"credentialsMigrated": True},
        )
        updated += 1
    print(f"Facebook access encrypted on node02: vault_records={len(encrypted)} linked_records={updated}")


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "source":
        source_mode()
    elif mode == "target":
        target_mode()
    else:
        raise RuntimeError("Expected source or target mode")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, KeyError, ValueError, json.JSONDecodeError) as error:
        print(f"Facebook access migration failed: {error}", file=sys.stderr)
        raise SystemExit(1)
