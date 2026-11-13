import base64
import hashlib
import json
from datetime import datetime, timedelta, timezone

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

from controlService.settings import AUTHORITY_SECONDS


def canonical(value) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str).encode()


def request_hash(tool: str, args: dict) -> str:
    return hashlib.sha256(canonical({"tool": tool, "args": args})).hexdigest()


def private_key(encoded: str) -> Ed25519PrivateKey:
    seed = base64.b64decode(encoded)
    if len(seed) != 32:
        raise ValueError("DISPATCH_SIGNING_KEY must be 32 bytes, base64")
    return Ed25519PrivateKey.from_private_bytes(seed)


def public_key(encoded: str) -> str:
    raw = private_key(encoded).public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    return base64.b64encode(raw).decode()


def sign_authority(encoded: str, *, teamId: str, workspaceId: str, actorUserId: str | None, grantId: str | None, tool: str, requestHash: str, routeGeneration: int, authzVersion: int) -> dict:
    now = datetime.now(timezone.utc)
    authority = {
        "teamId": teamId,
        "workspaceId": workspaceId,
        "actorUserId": actorUserId,
        "grantId": grantId,
        "tool": tool,
        "requestHash": requestHash,
        "routeGeneration": routeGeneration,
        "authzVersion": authzVersion,
        "issuedAt": now.isoformat(),
        "expiresAt": (now + timedelta(seconds=AUTHORITY_SECONDS)).isoformat(),
    }
    authority["signature"] = base64.b64encode(private_key(encoded).sign(canonical(authority))).decode()
    return authority
