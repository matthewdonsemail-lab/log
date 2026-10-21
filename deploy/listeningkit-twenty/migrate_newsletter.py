#!/usr/bin/env python3
"""Create the newsletter object and copy subscribers without printing addresses."""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

SOURCE_OBJECT = "agencyNewsletterMembers"
TARGET_SINGULAR = "newsletterMember"
TARGET_PLURAL = "newsletterMembers"
MAX_RECORDS = 1000

FIELDS = [
    {"name": "email", "label": "Email", "type": "TEXT"},
    {"name": "firstName", "label": "First name", "type": "TEXT"},
    {"name": "clerkUserId", "label": "Clerk user ID", "type": "TEXT"},
    {"name": "source", "label": "Source", "type": "TEXT"},
    {"name": "consentAt", "label": "Consent timestamp", "type": "DATE_TIME"},
    {
        "name": "status",
        "label": "Subscription status",
        "type": "SELECT",
        "options": ["ACTIVE", "UNSUBSCRIBED", "BOUNCED"],
    },
    {"name": "unsubscribedAt", "label": "Unsubscribed timestamp", "type": "DATE_TIME"},
]

LIST_OBJECTS = """query { objects(paging: {first: 200}) {
  edges { node { id nameSingular namePlural } }
} }"""
LIST_FIELDS = """query Fields($objectId: UUID!) {
  object(id: $objectId) {
    fields(paging: {first: 200}) { edges { node { name } } }
  }
}"""
CREATE_OBJECT = """mutation CreateObject($input: CreateOneObjectInput!) {
  createOneObject(input: $input) { id nameSingular namePlural }
}"""
CREATE_FIELD = """mutation CreateField($input: CreateOneFieldMetadataInput!) {
  createOneField(input: $input) { id name }
}"""


def required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required")
    return value.rstrip("/")


def request_json(
    base: str,
    path: str,
    key: str,
    *,
    method: str = "GET",
    payload: dict | None = None,
) -> dict:
    body = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{base}{path}",
        data=body,
        method=method,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as response:
            text = response.read().decode()
    except urllib.error.HTTPError as error:
        # Response bodies can contain customer data or implementation details.
        raise RuntimeError(f"{method} {path} failed with HTTP {error.code}") from None
    except urllib.error.URLError:
        raise RuntimeError(f"Could not reach {base}") from None
    return json.loads(text) if text.strip() else {}


def metadata(base: str, key: str, query: str, variables: dict | None = None) -> dict:
    result = request_json(
        base,
        "/metadata",
        key,
        method="POST",
        payload={"query": query, "variables": variables or {}},
    )
    if result.get("errors"):
        raise RuntimeError("Twenty rejected a metadata operation")
    return result.get("data") or {}


def create_field(base: str, key: str, field: dict) -> bool:
    result = request_json(
        base,
        "/metadata",
        key,
        method="POST",
        payload={"query": CREATE_FIELD, "variables": {"input": {"field": field}}},
    )
    if not result.get("errors"):
        return True
    messages = " ".join(str(error.get("message") or "") for error in result["errors"])
    if "already used" in messages or "NOT_AVAILABLE" in messages:
        return False
    raise RuntimeError("Twenty rejected a field metadata operation")


def ensure_schema(base: str, key: str) -> None:
    data = metadata(base, key, LIST_OBJECTS)
    objects = [edge["node"] for edge in data.get("objects", {}).get("edges", [])]
    found = next((item for item in objects if item.get("namePlural") == TARGET_PLURAL), None)
    if found:
        object_id = found["id"]
        print("Newsletter object already exists.")
    else:
        created = metadata(
            base,
            key,
            CREATE_OBJECT,
            {
                "input": {
                    "object": {
                        "nameSingular": TARGET_SINGULAR,
                        "namePlural": TARGET_PLURAL,
                        "labelSingular": "Newsletter Member",
                        "labelPlural": "Newsletter Members",
                        "description": "ListeningKit newsletter subscribers",
                        "icon": "IconMail",
                    }
                }
            },
        )
        object_id = created["createOneObject"]["id"]
        print("Created the newsletter object.")
        # Twenty v2.49 creates custom application metadata asynchronously.
        time.sleep(5)

    field_data = metadata(base, key, LIST_FIELDS, {"objectId": object_id})
    existing = {
        edge["node"]["name"]
        for edge in field_data.get("object", {}).get("fields", {}).get("edges", [])
    }
    for position, spec in enumerate(FIELDS):
        if spec["name"] in existing:
            continue
        field = {
            "objectMetadataId": object_id,
            "name": spec["name"],
            "label": spec["label"],
            "type": spec["type"],
            "description": "ListeningKit newsletter subscription data",
        }
        if spec.get("options"):
            field["options"] = [
                {
                    "label": option.title(),
                    "value": option,
                    "color": "blue",
                    "position": index,
                }
                for index, option in enumerate(spec["options"])
            ]
        created = create_field(base, key, field)
        print(
            f"{'Created' if created else 'Found'} field "
            f"{position + 1}/{len(FIELDS)}."
        )
        if created:
            time.sleep(1)


def load_source(base: str, key: str) -> list[dict]:
    if os.environ.get("SOURCE_TWENTY_STDIN") == "1":
        data = json.load(sys.stdin)
    else:
        params = urllib.parse.urlencode({"limit": str(MAX_RECORDS)})
        data = request_json(base, f"/rest/{SOURCE_OBJECT}?{params}", key)
    rows = (data.get("data") or {}).get(SOURCE_OBJECT, [])
    if len(rows) >= MAX_RECORDS:
        raise RuntimeError(f"Source reached the safety limit of {MAX_RECORDS} records")
    return rows


def find_target(base: str, key: str, email: str) -> str | None:
    params = urllib.parse.urlencode(
        {"limit": "1", "filter": f'email[eq]:{json.dumps(email)}'}
    )
    data = request_json(base, f"/rest/{TARGET_PLURAL}?{params}", key)
    rows = (data.get("data") or {}).get(TARGET_PLURAL, [])
    return rows[0].get("id") if rows else None


def migrate(source_base: str, source_key: str, target_base: str, target_key: str) -> None:
    rows = load_source(source_base, source_key)
    normalized: dict[str, dict] = {}
    skipped = 0
    for row in rows:
        email = str(row.get("email") or "").strip().lower()
        if not email or "@" not in email:
            skipped += 1
            continue
        normalized[email] = {
            "email": email,
            **(
                {"firstName": row["firstName"].strip()}
                if isinstance(row.get("firstName"), str) and row["firstName"].strip()
                else {}
            ),
            "source": "listeningkit-signup-import",
            "status": "ACTIVE",
        }

    succeeded = 0
    for index, (email, payload) in enumerate(normalized.items(), start=1):
        existing_id = find_target(target_base, target_key, email)
        if existing_id:
            request_json(
                target_base,
                f"/rest/{TARGET_PLURAL}/{existing_id}",
                target_key,
                method="PATCH",
                payload=payload,
            )
        else:
            request_json(
                target_base,
                f"/rest/{TARGET_PLURAL}",
                target_key,
                method="POST",
                payload=payload,
            )
        succeeded += 1
        print(f"Migrated {index}/{len(normalized)}")

    print(
        json.dumps(
            {
                "sourceRecords": len(rows),
                "uniqueValidSubscribers": len(normalized),
                "migrated": succeeded,
                "skipped": skipped,
            }
        )
    )


def main() -> int:
    if os.environ.get("SOURCE_TWENTY_STDIN") == "1":
        source_base = ""
        source_key = ""
    else:
        source_base = required_env("SOURCE_TWENTY_URL")
        source_key = required_env("SOURCE_TWENTY_API_KEY")
    target_base = required_env("TARGET_TWENTY_URL")
    target_key = required_env("TARGET_TWENTY_API_KEY")

    ensure_schema(target_base, target_key)
    # Give Twenty's generated REST schema a moment to refresh after metadata writes.
    time.sleep(3)
    migrate(source_base, source_key, target_base, target_key)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, KeyError, json.JSONDecodeError) as error:
        print(f"Migration failed: {error}", file=sys.stderr)
        raise SystemExit(1)
