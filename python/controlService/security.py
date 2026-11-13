import hashlib
import hmac
import secrets
from datetime import datetime, timezone


def aware(moment: datetime | None) -> datetime | None:
    if moment is None:
        return None
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def canonical_email(email: str) -> str:
    return email.strip().lower()


def looks_like_email(email: str) -> bool:
    local, at, domain = email.strip().partition("@")
    return bool(local) and bool(at) and "." in domain and " " not in email and len(email) <= 320


def new_token() -> str:
    return secrets.token_urlsafe(32)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def code_verifier(pepper: str, challengeId: str, code: str) -> str:
    return hmac.new(pepper.encode(), f"{challengeId}:{code}".encode(), hashlib.sha256).hexdigest()


def same(left: str, right: str) -> bool:
    return hmac.compare_digest(left, right)


def csrf_token(secret: str, sessionToken: str) -> str:
    return hmac.new(secret.encode(), f"csrf:{sessionToken}".encode(), hashlib.sha256).hexdigest()


SAFE_RETURN_PREFIXES = ("/teams", "/console", "/verify", "/oauth/authorize")


def safe_return_path(path: str | None) -> str | None:
    if not path:
        return None
    if not path.startswith("/") or path.startswith("//") or "\\" in path or "://" in path:
        return None
    return path if path.startswith(SAFE_RETURN_PREFIXES) else None
