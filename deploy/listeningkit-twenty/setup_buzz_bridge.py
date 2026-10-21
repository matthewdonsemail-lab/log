#!/usr/bin/env python3
"""Create the curated Buzz Updates object without printing CRM data or secrets."""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request

TARGET_SINGULAR = "buzzUpdate"
TARGET_PLURAL = "buzzUpdates"

FIELDS = [
    {"name": "headline", "label": "Title", "type": "TEXT"},
    {"name": "details", "label": "Details", "type": "TEXT"},
    {
        "name": "category",
        "label": "Category",
        "type": "SELECT",
        "options": ["DECISION", "CUSTOMER_NOTE", "FOLLOW_UP", "INCIDENT", "OTHER"],
    },
    {
        "name": "direction",
        "label": "Direction",
        "type": "SELECT",
        "options": ["BUZZ_TO_TWENTY", "TWENTY_TO_BUZZ"],
    },
    {
        "name": "syncStatus",
        "label": "Sync status",
        "type": "SELECT",
        "options": [
            "PENDING",
            "SENDING",
            "PENDING_REPLY",
            "SENDING_REPLY",
            "SYNCED",
            "FAILED",
        ],
    },
    {"name": "buzzEventId", "label": "Buzz event ID", "type": "TEXT"},
    {"name": "buzzChannelId", "label": "Buzz channel ID", "type": "TEXT"},
    {"name": "buzzThreadId", "label": "Buzz thread ID", "type": "TEXT"},
    {"name": "buzzAuthorPubkey", "label": "Buzz author pubkey", "type": "TEXT"},
    {"name": "buzzMessageUrl", "label": "Buzz message link", "type": "TEXT"},
    {"name": "relatedRecordUrl", "label": "Related Twenty record", "type": "TEXT"},
    {"name": "syncedAt", "label": "Synced at", "type": "DATE_TIME"},
    {"name": "failureReason", "label": "Failure reason", "type": "TEXT"},
]

LIST_OBJECTS = """query { objects(paging: {first: 200}) {
  edges { node { id nameSingular namePlural labelIdentifierFieldMetadataId } }
} }"""
LIST_FIELDS = """query Fields($objectId: UUID!) {
  object(id: $objectId) {
    fields(paging: {first: 200}) { edges { node { id name } } }
  }
}"""
CREATE_OBJECT = """mutation CreateObject($input: CreateOneObjectInput!) {
  createOneObject(input: $input) { id nameSingular namePlural }
}"""
CREATE_FIELD = """mutation CreateField($input: CreateOneFieldMetadataInput!) {
  createOneField(input: $input) { id name }
}"""
UPDATE_OBJECT = """mutation UpdateObject($input: UpdateOneObjectInput!) {
  updateOneObject(input: $input) { id labelIdentifierFieldMetadataId }
}"""


def required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"{name} is required")
    return value.rstrip("/")


def request_json(base: str, key: str, payload: dict) -> dict:
    request = urllib.request.Request(
        f"{base}/metadata",
        data=json.dumps(payload).encode(),
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            text = response.read().decode()
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Twenty metadata request failed with HTTP {error.code}") from None
    except urllib.error.URLError:
        raise RuntimeError(f"Could not reach {base}") from None
    return json.loads(text) if text.strip() else {}


def metadata(base: str, key: str, query: str, variables: dict | None = None) -> dict:
    result = request_json(
        base,
        key,
        {"query": query, "variables": variables or {}},
    )
    if result.get("errors"):
        raise RuntimeError("Twenty rejected a metadata operation")
    return result.get("data") or {}


def create_field(base: str, key: str, field: dict) -> bool:
    result = request_json(
        base,
        key,
        {"query": CREATE_FIELD, "variables": {"input": {"field": field}}},
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
        print("Buzz Updates object already exists.")
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
                        "labelSingular": "Buzz Update",
                        "labelPlural": "Buzz Updates",
                        "description": "Explicitly curated updates exchanged with the private Buzz CRM channel",
                        "icon": "IconMessageCircleBolt",
                    }
                }
            },
        )
        object_id = created["createOneObject"]["id"]
        print("Created the Buzz Updates object.")
        time.sleep(5)

    field_data = metadata(base, key, LIST_FIELDS, {"objectId": object_id})
    existing = {
        edge["node"]["name"]
        for edge in field_data.get("object", {}).get("fields", {}).get("edges", [])
    }
    for index, spec in enumerate(FIELDS, start=1):
        if spec["name"] in existing:
            continue
        field = {
            "objectMetadataId": object_id,
            "name": spec["name"],
            "label": spec["label"],
            "type": spec["type"],
            "description": "ListeningKit curated Buzz and Twenty synchronization data",
        }
        if spec.get("options"):
            field["options"] = [
                {
                    "label": option.replace("_", " ").title(),
                    "value": option,
                    "color": "blue",
                    "position": position,
                }
                for position, option in enumerate(spec["options"])
            ]
        created = create_field(base, key, field)
        print(f"{'Created' if created else 'Found'} field {index}/{len(FIELDS)}.")
        if created:
            time.sleep(1)

    field_data = metadata(base, key, LIST_FIELDS, {"objectId": object_id})
    fields_by_name = {
        edge["node"]["name"]: edge["node"]["id"]
        for edge in field_data.get("object", {}).get("fields", {}).get("edges", [])
    }
    headline_field_id = fields_by_name.get("headline")
    if not headline_field_id:
        raise RuntimeError("Twenty did not expose the Buzz Update title field")
    if not found or found.get("labelIdentifierFieldMetadataId") != headline_field_id:
        metadata(
            base,
            key,
            UPDATE_OBJECT,
            {
                "input": {
                    "id": object_id,
                    "update": {"labelIdentifierFieldMetadataId": headline_field_id},
                }
            },
        )
        print("Configured Title as the Buzz Update display name.")


def main() -> int:
    ensure_schema(
        required_env("TARGET_TWENTY_URL"),
        required_env("TARGET_TWENTY_API_KEY"),
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, KeyError, json.JSONDecodeError) as error:
        print(f"Buzz bridge schema setup failed: {error}", file=sys.stderr)
        raise SystemExit(1)
