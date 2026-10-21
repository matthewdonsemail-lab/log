#!/usr/bin/env python3
"""Migrate non-secret Facebook account metadata into ListeningKit Twenty.

Source mode reads the legacy Social Accounts API and emits only allowlisted,
non-secret fields. Target mode creates/updates Facebook Accounts without ever
accepting cookies, passwords, tokens, TOTP secrets, proxy details, or IPs.
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime

TARGET_SINGULAR = "facebookAccount"
TARGET_PLURAL = "facebookAccounts"

FIELDS = [
    {"name": "name", "label": "Account", "type": "TEXT"},
    {"name": "sourceAccountId", "label": "Legacy source ID", "type": "TEXT"},
    {"name": "accountStatus", "label": "Account status", "type": "TEXT"},
    {"name": "lifecycleState", "label": "Lifecycle state", "type": "TEXT"},
    {"name": "platform", "label": "Platform", "type": "TEXT"},
    {"name": "browserDriver", "label": "Browser driver", "type": "TEXT"},
    {"name": "profileName", "label": "Profile name", "type": "TEXT"},
    {"name": "dailyListingCap", "label": "Daily listing cap", "type": "NUMBER"},
    {"name": "lastPostedAt", "label": "Last posted", "type": "DATE_TIME"},
    {"name": "statusChangedAt", "label": "Status changed", "type": "DATE_TIME"},
    {
        "name": "connectionState",
        "label": "Connection state",
        "type": "SELECT",
        "options": ["CONNECTED", "NEEDS_ATTENTION", "NOT_CONFIGURED"],
    },
    {"name": "legacyCredentialPresent", "label": "Legacy login available", "type": "BOOLEAN"},
    {"name": "credentialsMigrated", "label": "Encrypted login migrated", "type": "BOOLEAN"},
    {"name": "sourceUpdatedAt", "label": "Legacy record updated", "type": "DATE_TIME"},
    {"name": "migratedAt", "label": "Migrated at", "type": "DATE_TIME"},
]

LIST_OBJECTS = """query { objects(paging: {first: 300}) {
  edges { node { id namePlural labelIdentifierFieldMetadataId } }
} }"""
LIST_FIELDS = """query Fields($objectId: UUID!) {
  object(id: $objectId) {
    fields(paging: {first: 300}) { edges { node { id name } } }
  }
}"""
CREATE_OBJECT = """mutation CreateObject($input: CreateOneObjectInput!) {
  createOneObject(input: $input) { id }
}"""
CREATE_FIELD = """mutation CreateField($input: CreateOneFieldMetadataInput!) {
  createOneField(input: $input) { id name }
}"""
UPDATE_OBJECT = """mutation UpdateObject($input: UpdateOneObjectInput!) {
  updateOneObject(input: $input) { id labelIdentifierFieldMetadataId }
}"""


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


def metadata(base: str, key: str, query: str, variables: dict | None = None) -> dict:
    result = request_json(
        f"{base}/metadata",
        key,
        method="POST",
        payload={"query": query, "variables": variables or {}},
    )
    if result.get("errors"):
        raise RuntimeError("Twenty rejected a metadata operation")
    return result.get("data") or {}


def safe_text(value: object, limit: int = 500) -> str:
    return str(value or "").strip()[:limit]


def source_mode() -> None:
    base = required("SOURCE_TWENTY_URL")
    key = required("SOURCE_TWENTY_API_KEY")
    result = request_json(f"{base}/rest/socialAccounts?limit=100", key)
    rows = result.get("data", {}).get("socialAccounts", [])
    if not isinstance(rows, list) or len(rows) >= 100:
        raise RuntimeError("Legacy Social Accounts exceeded the bounded migration window")
    migrated_at = datetime.now(UTC).isoformat().replace("+00:00", "Z")
    safe_rows = []
    for index, row in enumerate(rows, start=1):
        if not isinstance(row, dict) or not row.get("id"):
            continue
        has_login = bool(row.get("cookies") or row.get("accessToken"))
        status = safe_text(row.get("accountStatus") or "UNSET", 100)
        connection = (
            "CONNECTED"
            if status == "ACTIVE" and has_login
            else "NEEDS_ATTENTION"
            if has_login
            else "NOT_CONFIGURED"
        )
        safe_rows.append(
            {
                "name": safe_text(row.get("accountName") or row.get("profileName") or f"Facebook account {index}", 160),
                "sourceAccountId": str(row["id"]),
                "accountStatus": status,
                "lifecycleState": safe_text(row.get("lifecycleState"), 100),
                "platform": safe_text(row.get("platform") or "facebook", 100),
                "browserDriver": safe_text(row.get("browserDriver"), 100),
                "profileName": safe_text(row.get("profileName"), 160),
                "dailyListingCap": row.get("dailyListingCap") if isinstance(row.get("dailyListingCap"), (int, float)) else None,
                "lastPostedAt": row.get("lastPostedAt") or None,
                "statusChangedAt": row.get("statusChangedAt") or None,
                "connectionState": connection,
                "legacyCredentialPresent": has_login,
                "credentialsMigrated": False,
                "sourceUpdatedAt": row.get("updatedAt") or None,
                "migratedAt": migrated_at,
            }
        )
    sys.stdout.write(json.dumps(safe_rows, separators=(",", ":")))


def ensure_schema(base: str, key: str) -> None:
    objects = metadata(base, key, LIST_OBJECTS).get("objects", {}).get("edges", [])
    found = next((edge["node"] for edge in objects if edge["node"].get("namePlural") == TARGET_PLURAL), None)
    if found:
        object_id = found["id"]
    else:
        object_id = metadata(
            base,
            key,
            CREATE_OBJECT,
            {
                "input": {
                    "object": {
                        "nameSingular": TARGET_SINGULAR,
                        "namePlural": TARGET_PLURAL,
                        "labelSingular": "Facebook Account",
                        "labelPlural": "Facebook Accounts",
                        "description": "Non-secret operational metadata migrated from the legacy CRM",
                        "icon": "IconBrandFacebook",
                    }
                }
            },
        )["createOneObject"]["id"]
        time.sleep(5)

    field_data = metadata(base, key, LIST_FIELDS, {"objectId": object_id})
    existing = {
        edge["node"]["name"]
        for edge in field_data.get("object", {}).get("fields", {}).get("edges", [])
    }
    for spec in FIELDS:
        if spec["name"] in existing:
            continue
        field = {
            "objectMetadataId": object_id,
            "name": spec["name"],
            "label": spec["label"],
            "type": spec["type"],
            "description": "ListeningKit Facebook account migration metadata",
        }
        if spec.get("options"):
            field["options"] = [
                {"label": option.replace("_", " ").title(), "value": option, "color": "blue", "position": position}
                for position, option in enumerate(spec["options"])
            ]
        result = request_json(
            f"{base}/metadata",
            key,
            method="POST",
            payload={"query": CREATE_FIELD, "variables": {"input": {"field": field}}},
        )
        if result.get("errors"):
            raise RuntimeError("Twenty rejected a field metadata operation")
        time.sleep(1)

    field_data = metadata(base, key, LIST_FIELDS, {"objectId": object_id})
    fields = {edge["node"]["name"]: edge["node"]["id"] for edge in field_data["object"]["fields"]["edges"]}
    name_field_id = fields.get("name")
    if not name_field_id:
        raise RuntimeError("Facebook Account display field is missing")
    if not found or found.get("labelIdentifierFieldMetadataId") != name_field_id:
        metadata(
            base,
            key,
            UPDATE_OBJECT,
            {"input": {"id": object_id, "update": {"labelIdentifierFieldMetadataId": name_field_id}}},
        )


def target_mode() -> None:
    base = required("TARGET_TWENTY_URL")
    key = required("TARGET_TWENTY_API_KEY")
    rows = json.load(sys.stdin)
    if not isinstance(rows, list) or len(rows) >= 100:
        raise RuntimeError("Safe Facebook Account payload was invalid")
    allowed = {field["name"] for field in FIELDS}
    created = updated = 0
    ensure_schema(base, key)
    for row in rows:
        if not isinstance(row, dict) or set(row) - allowed or not row.get("sourceAccountId") or not row.get("name"):
            raise RuntimeError("Safe Facebook Account payload contained an unexpected field")
        clean = {name: value for name, value in row.items() if value is not None and value != ""}
        params = urllib.parse.urlencode(
            {"limit": "1", "filter": f"sourceAccountId[eq]:{json.dumps(row['sourceAccountId'])}"}
        )
        existing = request_json(f"{base}/rest/{TARGET_PLURAL}?{params}", key).get("data", {}).get(TARGET_PLURAL, [])
        if existing:
            request_json(
                f"{base}/rest/{TARGET_PLURAL}/{urllib.parse.quote(existing[0]['id'])}",
                key,
                method="PATCH",
                payload=clean,
            )
            updated += 1
        else:
            request_json(f"{base}/rest/{TARGET_PLURAL}", key, method="POST", payload=clean)
            created += 1
    total = request_json(f"{base}/rest/{TARGET_PLURAL}?limit=100", key).get("data", {}).get(TARGET_PLURAL, [])
    print(f"Facebook Account metadata migrated: created={created} updated={updated} total={len(total)}")


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
        print(f"Facebook Account migration failed: {error}", file=sys.stderr)
        raise SystemExit(1)
