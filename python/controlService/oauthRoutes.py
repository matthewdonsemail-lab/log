import base64
import hashlib
import re
import secrets
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode, urlparse

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy import update
from sqlmodel import Session, select

from controlService.access import active_teams, current_caller, parse_id, team_access
from controlService.errors import ApiError
from controlService.models import (
    AuthorizationCode,
    AuthorizationRequest,
    Membership,
    MembershipStatus,
    OauthAccessToken,
    OauthClient,
    OauthGrant,
    OauthRefreshToken,
    Team,
    User,
)
from controlService.security import aware, new_token, same, token_hash
from controlService.settings import (
    ACCESS_TOKEN_SECONDS,
    AUTHORIZATION_CODE_SECONDS,
    AUTHORIZATION_REQUEST_SECONDS,
    CLIENT_REGISTRATIONS_PER_HOUR,
    REFRESH_TOKEN_DAYS,
    SCOPES,
    Settings,
)
from controlService.views import Strict, team_view

NO_STORE = {"Cache-Control": "no-store", "Pragma": "no-cache"}
LOOPBACK = {"localhost", "127.0.0.1", "[::1]", "::1"}
APP_SCHEME = re.compile(r"^[a-z][a-z0-9+.\-]{1,63}$")
UNSAFE_SCHEMES = {"javascript", "data", "file", "vbscript", "about", "blob", "ftp", "ws", "wss"}


class OAuthError(Exception):
    def __init__(self, error: str, description: str, status: int = 400):
        self.error = error
        self.description = description
        self.status = status


async def oauth_error_handler(_: Request, error: OAuthError) -> JSONResponse:
    return JSONResponse({"error": error.error, "error_description": error.description}, status_code=error.status, headers=NO_STORE)


def allowed_redirect(uri: str) -> bool:
    try:
        parsed = urlparse(uri)
    except ValueError:
        return False
    if parsed.fragment or len(uri) > 2048:
        return False
    if parsed.scheme == "https":
        return bool(parsed.hostname)
    if parsed.scheme == "http":
        return parsed.hostname in LOOPBACK
    return bool(APP_SCHEME.match(parsed.scheme)) and parsed.scheme not in UNSAFE_SCHEMES


def loopback_match(registered: str, asked: str) -> bool:
    left, right = urlparse(registered), urlparse(asked)
    return left.scheme == "http" and right.scheme == "http" and left.hostname in LOOPBACK and left.hostname == right.hostname and left.path == right.path and left.query == right.query


def redirect_ok(client: OauthClient, uri: str) -> bool:
    return any(uri == registered or loopback_match(registered, uri) for registered in client.redirectUris)


def pkce_s256(verifier: str) -> str:
    return base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()


def parse_scopes(text: str | None) -> list[str] | None:
    asked = [item for item in (text or "log:read").split() if item]
    if any(item not in SCOPES for item in asked):
        return None
    return sorted(set(asked))


class ConsentDecision(Strict):
    teamId: str


class RequestView(Strict):
    id: str
    clientName: str
    redirectHost: str
    scopes: list[str]
    resource: str
    expiresAt: datetime


def live_grant(db: Session, grantId) -> tuple[OauthGrant, User, Team] | None:
    grant = db.get(OauthGrant, grantId)
    if not grant or grant.revokedAt:
        return None
    user = db.get(User, grant.userId)
    team = db.get(Team, grant.teamId)
    member = db.exec(select(Membership).where(Membership.teamId == grant.teamId, Membership.userId == grant.userId, Membership.status == MembershipStatus.active)).first()
    if not user or user.suspended or not team or team.suspended or not member:
        return None
    return grant, user, team


def revoke_grant_tokens(db: Session, grantId, now: datetime) -> None:
    db.execute(update(OauthAccessToken).where(OauthAccessToken.grantId == grantId, OauthAccessToken.revokedAt.is_(None)).values(revokedAt=now))
    db.execute(update(OauthRefreshToken).where(OauthRefreshToken.grantId == grantId, OauthRefreshToken.revokedAt.is_(None)).values(revokedAt=now))


def issue_tokens(db: Session, grant: OauthGrant, now: datetime, familyId=None, parentId=None) -> dict:
    access = new_token()
    refresh = new_token()
    db.add(OauthAccessToken(tokenHash=token_hash(access), grantId=grant.id, expiresAt=now + timedelta(seconds=ACCESS_TOKEN_SECONDS)))
    db.add(OauthRefreshToken(tokenHash=token_hash(refresh), grantId=grant.id, familyId=familyId or uuid.uuid4(), parentId=parentId, issuedTeamId=grant.teamId, expiresAt=now + timedelta(days=REFRESH_TOKEN_DAYS)))
    return {"access_token": access, "token_type": "Bearer", "expires_in": ACCESS_TOKEN_SECONDS, "refresh_token": refresh, "scope": " ".join(grant.scopes)}


def bearer_grant(db: Session, token: str | None) -> tuple[OauthGrant, User, Team] | None:
    if not token:
        return None
    access = db.exec(select(OauthAccessToken).where(OauthAccessToken.tokenHash == token_hash(token))).first()
    if not access or access.revokedAt or aware(access.expiresAt) <= datetime.now(timezone.utc):
        return None
    return live_grant(db, access.grantId)


def oauth_router(settings: Settings, open_db) -> APIRouter:
    router = APIRouter()
    registrations: dict[str, deque] = defaultdict(deque)
    issuer = settings.appOrigin

    def metadata() -> dict:
        return {
            "issuer": issuer,
            "authorization_endpoint": f"{issuer}/oauth/authorize",
            "token_endpoint": f"{issuer}/oauth/token",
            "registration_endpoint": f"{issuer}/oauth/register",
            "revocation_endpoint": f"{issuer}/oauth/revoke",
            "response_types_supported": ["code"],
            "grant_types_supported": ["authorization_code", "refresh_token"],
            "code_challenge_methods_supported": ["S256"],
            "token_endpoint_auth_methods_supported": ["none"],
            "revocation_endpoint_auth_methods_supported": ["none"],
            "scopes_supported": list(SCOPES),
        }

    @router.get("/.well-known/oauth-authorization-server")
    @router.get("/.well-known/openid-configuration")
    def authorization_server():
        return JSONResponse(metadata(), headers={"Cache-Control": "public, max-age=300"})

    @router.get("/.well-known/oauth-protected-resource")
    @router.get("/.well-known/oauth-protected-resource/mcp")
    def protected_resource():
        return JSONResponse({"resource": settings.mcpResourceUrl, "authorization_servers": [issuer], "scopes_supported": list(SCOPES), "bearer_methods_supported": ["header"], "resource_name": "log"}, headers={"Cache-Control": "public, max-age=300"})

    @router.post("/oauth/register", status_code=201)
    async def register(request: Request, db: Session = Depends(open_db)):
        host = request.client.host if request.client else "unknown"
        window = registrations[host]
        now = time.monotonic()
        while window and now - window[0] > 3600:
            window.popleft()
        if len(window) >= CLIENT_REGISTRATIONS_PER_HOUR:
            raise OAuthError("invalid_client_metadata", "too many registrations from this address, try later", 429)
        try:
            body = await request.json()
        except ValueError:
            raise OAuthError("invalid_client_metadata", "send JSON client metadata")
        if not isinstance(body, dict):
            raise OAuthError("invalid_client_metadata", "send JSON client metadata")
        uris = body.get("redirect_uris")
        if not isinstance(uris, list) or not uris or len(uris) > 20 or not all(isinstance(uri, str) and allowed_redirect(uri) for uri in uris):
            raise OAuthError("invalid_redirect_uri", "redirect_uris must be https, loopback http, or an app's own scheme")
        method = body.get("token_endpoint_auth_method", "none")
        if method != "none":
            raise OAuthError("invalid_client_metadata", "only public clients with PKCE (token_endpoint_auth_method none)")
        window.append(now)
        name = str(body.get("client_name") or "MCP client")[:100]
        client = OauthClient(clientId=secrets.token_urlsafe(24), name=name, redirectUris=list(dict.fromkeys(uris)))
        db.add(client)
        db.commit()
        return JSONResponse({"client_id": client.clientId, "client_id_issued_at": int(datetime.now(timezone.utc).timestamp()), "client_name": name, "redirect_uris": client.redirectUris, "token_endpoint_auth_method": "none", "grant_types": ["authorization_code", "refresh_token"], "response_types": ["code"]}, status_code=201, headers=NO_STORE)

    @router.get("/oauth/authorize")
    def authorize(request: Request, db: Session = Depends(open_db)):
        query = request.query_params
        client = db.exec(select(OauthClient).where(OauthClient.clientId == query.get("client_id", ""))).first()
        redirectUri = query.get("redirect_uri", "")
        if not client or client.registrationStatus.value != "active" or not redirectUri or not redirect_ok(client, redirectUri):
            return JSONResponse({"error": "invalid_request", "error_description": "unknown client or redirect_uri not registered"}, status_code=400, headers=NO_STORE)
        state = query.get("state")

        def back(error: str, description: str) -> RedirectResponse:
            params = {"error": error, "error_description": description, **({"state": state} if state else {})}
            return RedirectResponse(f"{redirectUri}{'&' if '?' in redirectUri else '?'}{urlencode(params)}", status_code=302)

        if query.get("response_type") != "code":
            return back("unsupported_response_type", "only code")
        challenge = query.get("code_challenge", "")
        if query.get("code_challenge_method") != "S256" or not (43 <= len(challenge) <= 128):
            return back("invalid_request", "PKCE with S256 is required")
        resource = query.get("resource") or settings.mcpResourceUrl
        if resource.rstrip("/") != settings.mcpResourceUrl.rstrip("/"):
            return back("invalid_target", "this server only issues tokens for its own MCP resource")
        scopes = parse_scopes(query.get("scope"))
        if scopes is None:
            return back("invalid_scope", f"scopes are {' '.join(SCOPES)}")
        pending = AuthorizationRequest(clientId=client.id, redirectUri=redirectUri, clientState=state[:512] if state else None, codeChallenge=challenge, resource=settings.mcpResourceUrl, scopes=scopes, expiresAt=datetime.now(timezone.utc) + timedelta(seconds=AUTHORIZATION_REQUEST_SECONDS))
        db.add(pending)
        db.commit()
        return RedirectResponse(f"{settings.consoleOrigin}/console/mcp?request={pending.id}", status_code=302)

    def pending_request(db: Session, requestId: str) -> tuple[AuthorizationRequest, OauthClient]:
        pending = db.get(AuthorizationRequest, parse_id(requestId))
        if not pending or pending.consumedAt or aware(pending.expiresAt) <= datetime.now(timezone.utc):
            raise ApiError("expiredChallenge", "this connection request expired, start again from the app")
        client = db.get(OauthClient, pending.clientId)
        if not client or client.registrationStatus.value != "active":
            raise ApiError("forbidden")
        return pending, client

    @router.get("/api/v1/oauth/requests/{requestId}")
    def show_request(requestId: str, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        caller = current_caller(request, db, settings, mutating=False)
        pending, client = pending_request(db, requestId)
        teams = [team_view(team, membership).model_dump() for team, membership in active_teams(db, caller.user)]
        view = RequestView(id=str(pending.id), clientName=client.name, redirectHost=urlparse(pending.redirectUri).netloc or urlparse(pending.redirectUri).scheme, scopes=pending.scopes, resource=pending.resource, expiresAt=aware(pending.expiresAt))
        return {**view.model_dump(mode="json"), "teams": teams, "selectedTeamId": str(caller.session.selectedTeamId) if caller.session.selectedTeamId else None}

    def finish(pending: AuthorizationRequest, params: dict) -> dict:
        if pending.clientState:
            params["state"] = pending.clientState
        return {"redirectTo": f"{pending.redirectUri}{'&' if '?' in pending.redirectUri else '?'}{urlencode(params)}"}

    @router.post("/api/v1/oauth/requests/{requestId}/approve")
    def approve(requestId: str, body: ConsentDecision, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        caller = current_caller(request, db, settings, mutating=True)
        pending, client = pending_request(db, requestId)
        access = team_access(db, caller, body.teamId, "readTools")
        now = datetime.now(timezone.utc)
        consumed = db.execute(update(AuthorizationRequest).where(AuthorizationRequest.id == pending.id, AuthorizationRequest.consumedAt.is_(None)).values(consumedAt=now, updatedAt=now, userId=caller.user.id, teamId=access.team.id))
        if consumed.rowcount != 1:
            db.rollback()
            raise ApiError("expiredChallenge", "this connection request was already used")
        grant = OauthGrant(userId=caller.user.id, teamId=access.team.id, clientId=client.id, resource=pending.resource, scopes=pending.scopes, authzVersion=access.team.authzVersion)
        db.add(grant)
        db.flush()
        code = new_token()
        db.add(AuthorizationCode(codeHash=token_hash(code), requestId=pending.id, grantId=grant.id, expiresAt=now + timedelta(seconds=AUTHORIZATION_CODE_SECONDS)))
        db.commit()
        return finish(pending, {"code": code})

    @router.post("/api/v1/oauth/requests/{requestId}/deny")
    def deny(requestId: str, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        current_caller(request, db, settings, mutating=True)
        pending, _ = pending_request(db, requestId)
        now = datetime.now(timezone.utc)
        db.execute(update(AuthorizationRequest).where(AuthorizationRequest.id == pending.id, AuthorizationRequest.consumedAt.is_(None)).values(consumedAt=now, updatedAt=now))
        db.commit()
        return finish(pending, {"error": "access_denied", "error_description": "the person declined"})

    @router.post("/oauth/token")
    async def token(request: Request, db: Session = Depends(open_db)):
        form = await request.form()
        grantType = str(form.get("grant_type") or "")
        client = db.exec(select(OauthClient).where(OauthClient.clientId == str(form.get("client_id") or ""))).first()
        if not client or client.registrationStatus.value != "active":
            raise OAuthError("invalid_client", "unknown client", 401)
        now = datetime.now(timezone.utc)
        if grantType == "authorization_code":
            code = db.exec(select(AuthorizationCode).where(AuthorizationCode.codeHash == token_hash(str(form.get("code") or "")))).first()
            pending = db.get(AuthorizationRequest, code.requestId) if code else None
            if not code or not pending or pending.clientId != client.id:
                raise OAuthError("invalid_grant", "unknown code")
            if code.consumedAt:
                revoke_grant_tokens(db, code.grantId, now)
                db.execute(update(OauthGrant).where(OauthGrant.id == code.grantId).values(revokedAt=now, updatedAt=now))
                db.commit()
                raise OAuthError("invalid_grant", "this code was already used; its grant is revoked")
            if aware(code.expiresAt) <= now:
                raise OAuthError("invalid_grant", "the code expired")
            if str(form.get("redirect_uri") or pending.redirectUri) != pending.redirectUri:
                raise OAuthError("invalid_grant", "redirect_uri does not match")
            if not same(pkce_s256(str(form.get("code_verifier") or "")), pending.codeChallenge):
                raise OAuthError("invalid_grant", "PKCE verification failed")
            asked = form.get("resource")
            if asked and str(asked).rstrip("/") != pending.resource.rstrip("/"):
                raise OAuthError("invalid_target", "resource does not match the authorization")
            taken = db.execute(update(AuthorizationCode).where(AuthorizationCode.id == code.id, AuthorizationCode.consumedAt.is_(None)).values(consumedAt=now))
            if taken.rowcount != 1:
                db.rollback()
                raise OAuthError("invalid_grant", "this code was already used")
            alive = live_grant(db, code.grantId)
            if not alive:
                db.rollback()
                raise OAuthError("invalid_grant", "the grant or team membership is no longer active")
            tokens = issue_tokens(db, alive[0], now)
            db.commit()
            return JSONResponse(tokens, headers=NO_STORE)
        if grantType == "refresh_token":
            presented = db.exec(select(OauthRefreshToken).where(OauthRefreshToken.tokenHash == token_hash(str(form.get("refresh_token") or "")))).first()
            grant = db.get(OauthGrant, presented.grantId) if presented else None
            if not presented or not grant or grant.clientId != client.id:
                raise OAuthError("invalid_grant", "unknown refresh token")
            if presented.consumedAt or presented.revokedAt:
                db.execute(update(OauthRefreshToken).where(OauthRefreshToken.familyId == presented.familyId, OauthRefreshToken.revokedAt.is_(None)).values(revokedAt=now))
                db.execute(update(OauthAccessToken).where(OauthAccessToken.grantId == grant.id, OauthAccessToken.revokedAt.is_(None)).values(revokedAt=now))
                db.commit()
                raise OAuthError("invalid_grant", "this refresh token was already used; sign in again")
            if aware(presented.expiresAt) <= now:
                raise OAuthError("invalid_grant", "the refresh token expired")
            alive = live_grant(db, grant.id)
            if not alive:
                raise OAuthError("invalid_grant", "the grant or team membership is no longer active")
            asked = parse_scopes(form.get("scope")) if form.get("scope") else grant.scopes
            if asked is None or not set(asked) <= set(grant.scopes):
                raise OAuthError("invalid_scope", "a refresh never widens scopes")
            taken = db.execute(update(OauthRefreshToken).where(OauthRefreshToken.id == presented.id, OauthRefreshToken.consumedAt.is_(None), OauthRefreshToken.revokedAt.is_(None)).values(consumedAt=now))
            if taken.rowcount != 1:
                db.rollback()
                raise OAuthError("invalid_grant", "this refresh token was already used")
            tokens = issue_tokens(db, grant, now, familyId=presented.familyId, parentId=presented.id)
            db.commit()
            return JSONResponse(tokens, headers=NO_STORE)
        raise OAuthError("unsupported_grant_type", "authorization_code or refresh_token")

    @router.post("/oauth/revoke")
    async def revoke(request: Request, db: Session = Depends(open_db)):
        form = await request.form()
        hashed = token_hash(str(form.get("token") or ""))
        now = datetime.now(timezone.utc)
        refresh = db.exec(select(OauthRefreshToken).where(OauthRefreshToken.tokenHash == hashed)).first()
        if refresh:
            db.execute(update(OauthRefreshToken).where(OauthRefreshToken.familyId == refresh.familyId, OauthRefreshToken.revokedAt.is_(None)).values(revokedAt=now))
        db.execute(update(OauthAccessToken).where(OauthAccessToken.tokenHash == hashed, OauthAccessToken.revokedAt.is_(None)).values(revokedAt=now))
        db.commit()
        return Response(status_code=200, headers=NO_STORE)

    @router.get("/api/v1/teams/{teamId}/grants")
    def list_grants(teamId: str, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=False), teamId)
        query = select(OauthGrant, OauthClient).join(OauthClient, OauthClient.id == OauthGrant.clientId).where(OauthGrant.teamId == access.team.id)
        if not access.allows("teamAdmin") and not access.allows("nonOwnerMembershipAdmin"):
            query = query.where(OauthGrant.userId == access.caller.user.id)
        rows = db.exec(query.order_by(OauthGrant.createdAt.desc())).all()
        return [{"id": str(grant.id), "clientName": client.name, "userId": str(grant.userId), "teamId": str(grant.teamId), "scopes": grant.scopes, "revokedAt": aware(grant.revokedAt).isoformat() if grant.revokedAt else None} for grant, client in rows]

    @router.post("/api/v1/teams/{teamId}/grants/{grantId}/revoke", status_code=204)
    def revoke_grant(teamId: str, grantId: str, request: Request, db: Session = Depends(open_db)):
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId)
        grant = db.get(OauthGrant, parse_id(grantId))
        if not grant or grant.teamId != access.team.id:
            raise ApiError("notFound")
        mayRevoke = access.allows("grantRevoke") or access.allows("nonOwnerMembershipAdmin") or grant.userId == access.caller.user.id
        if not mayRevoke:
            raise ApiError("forbidden")
        now = datetime.now(timezone.utc)
        grant.revokedAt = now
        grant.updatedAt = now
        db.add(grant)
        revoke_grant_tokens(db, grant.id, now)
        db.commit()
        return Response(status_code=204, headers=NO_STORE)

    return router
