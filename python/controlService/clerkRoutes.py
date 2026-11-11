from datetime import datetime, timedelta, timezone
from functools import lru_cache

import httpx
import jwt
from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from controlService.access import check_origin
from controlService.authRoutes import session_view, set_session_cookies
from controlService.errors import ApiError
from controlService.models import User, WebsiteSession
from controlService.security import aware, canonical_email, new_token, token_hash
from controlService.settings import Settings, WEBSITE_SESSION_DAYS


class ClerkExchange(BaseModel):
    token: str = Field(min_length=1, max_length=16384)


@lru_cache(maxsize=4)
def key_client(issuer: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{issuer}/.well-known/jwks.json")


def verified_email(token: str, settings: Settings) -> str:
    issuer = (settings.clerkIssuer or "").rstrip("/")
    secret = settings.clerkSecretKey
    if not issuer.startswith("https://") or not secret:
        raise ApiError("providerUnavailable")
    try:
        key = key_client(issuer).get_signing_key_from_jwt(token)
        claims = jwt.decode(token, key.key, algorithms=["RS256"], issuer=issuer,
                            options={"require": ["exp", "iat", "sub", "iss"], "verify_aud": False})
        if claims.get("azp") not in {settings.consoleOrigin, settings.appOrigin}:
            raise ApiError("unauthenticated")
        subject = claims["sub"]
        if not isinstance(subject, str) or not subject.startswith("user_") or not subject.replace("_", "").isalnum():
            raise ApiError("unauthenticated")
        with httpx.Client(timeout=10) as client:
            response = client.get(f"https://api.clerk.com/v1/users/{subject}", headers={"Authorization": f"Bearer {secret}"})
            response.raise_for_status()
            user = response.json()
        primary = user.get("primary_email_address_id")
        for email in user.get("email_addresses", []):
            if email.get("id") == primary and email.get("verification", {}).get("status") == "verified":
                return canonical_email(email["email_address"])
    except (jwt.PyJWTError, httpx.HTTPError, KeyError, ValueError):
        raise ApiError("unauthenticated") from None
    raise ApiError("unauthenticated")


def clerk_router(settings: Settings, open_db) -> APIRouter:
    router = APIRouter()

    @router.post("/auth/clerk")
    def exchange(body: ClerkExchange, request: Request, response: Response, db: Session = Depends(open_db)):
        check_origin(request, settings)
        email = verified_email(body.token, settings)
        now = datetime.now(timezone.utc)
        user = db.exec(select(User).where(User.emailCanonical == email)).first()
        if user and user.suspended:
            raise ApiError("forbidden")
        if not user:
            user = User(email=email, emailCanonical=email, emailVerifiedAt=now)
        user.emailVerifiedAt = user.emailVerifiedAt or now
        db.add(user)
        db.flush()
        token = new_token()
        session = WebsiteSession(userId=user.id, tokenHash=token_hash(token),
                                 issuedTokenVersion=user.tokenVersion,
                                 expiresAt=now + timedelta(days=WEBSITE_SESSION_DAYS))
        db.add(session)
        db.commit()
        db.refresh(session)
        set_session_cookies(response, settings, token, aware(session.expiresAt))
        response.headers["Cache-Control"] = "no-store"
        return session_view(db, session, user)

    return router
