import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import func, update
from sqlmodel import Session, select

from controlService.access import active_teams, current_caller, check_origin, parse_id
from controlService.errors import ApiError
from controlService.mailer import Mailer, sign_in_email
from controlService.models import ChallengePurpose, EmailChallenge, Membership, MembershipStatus, User, WebsiteSession
from controlService.security import aware, canonical_email, code_verifier, csrf_token, looks_like_email, new_code, new_token, safe_return_path, same, token_hash
from controlService.settings import (
    CHALLENGE_MAX_ATTEMPTS,
    CHALLENGE_WINDOW_SECONDS,
    CHALLENGES_PER_EMAIL_WINDOW,
    CSRF_COOKIE,
    EMAIL_CODE_SECONDS,
    RESEND_COOLDOWN_SECONDS,
    SESSION_COOKIE,
    WEBSITE_SESSION_DAYS,
    Settings,
)
from controlService.views import AuthChallengeView, EmailStart, EmailVerify, SessionView, TeamSelect, team_view, user_view

NO_STORE = {"Cache-Control": "no-store"}


def session_view(db: Session, session: WebsiteSession, user: User) -> SessionView:
    teams = active_teams(db, user)
    selected = str(session.selectedTeamId) if session.selectedTeamId and any(team.id == session.selectedTeamId for team, _ in teams) else None
    return SessionView(user=user_view(user), teams=[team_view(team, membership) for team, membership in teams], selectedTeamId=selected, expiresAt=aware(session.expiresAt))


def set_session_cookies(response: Response, settings: Settings, token: str, expiresAt: datetime) -> None:
    maxAge = int((expiresAt - datetime.now(timezone.utc)).total_seconds())
    response.set_cookie(SESSION_COOKIE, token, max_age=maxAge, httponly=True, secure=settings.secureCookies, samesite="lax", path="/")
    response.set_cookie(CSRF_COOKIE, csrf_token(settings.sessionSecret, token), max_age=maxAge, httponly=False, secure=settings.secureCookies, samesite="lax", path="/")


def clear_session_cookies(response: Response, settings: Settings) -> None:
    for name in (SESSION_COOKIE, CSRF_COOKIE):
        response.delete_cookie(name, path="/", secure=settings.secureCookies, samesite="lax")


def auth_router(settings: Settings, open_db, mailer: Mailer) -> APIRouter:
    router = APIRouter()

    @router.post("/auth/email/start", response_model=AuthChallengeView)
    def email_start(body: EmailStart, request: Request, response: Response, db: Session = Depends(open_db)):
        check_origin(request, settings)
        response.headers.update(NO_STORE)
        if not looks_like_email(body.email):
            raise ApiError("invalidInput", "check email")
        email = canonical_email(body.email)
        now = datetime.now(timezone.utc)
        windowStart = now - timedelta(seconds=CHALLENGE_WINDOW_SECONDS)
        recent = db.exec(select(EmailChallenge).where(EmailChallenge.emailCanonical == email, EmailChallenge.purpose == ChallengePurpose.signIn, EmailChallenge.createdAt >= windowStart).order_by(EmailChallenge.createdAt.desc())).all()
        if recent:
            sinceLast = (now - aware(recent[0].createdAt)).total_seconds()
            if sinceLast < RESEND_COOLDOWN_SECONDS:
                raise ApiError("tooManyAttempts", "wait before asking for another code", int(RESEND_COOLDOWN_SECONDS - sinceLast) + 1)
            if len(recent) >= CHALLENGES_PER_EMAIL_WINDOW:
                retry = int(CHALLENGE_WINDOW_SECONDS - (now - aware(recent[-1].createdAt)).total_seconds()) + 1
                raise ApiError("tooManyAttempts", "too many codes asked for", max(retry, 1))
        db.execute(update(EmailChallenge).where(EmailChallenge.emailCanonical == email, EmailChallenge.consumedAt.is_(None), EmailChallenge.supersededAt.is_(None)).values(supersededAt=now, updatedAt=now))
        challengeId = uuid.uuid4()
        code = new_code()
        challenge = EmailChallenge(
            id=challengeId,
            emailCanonical=email,
            codeVerifier=code_verifier(settings.otpPepper, str(challengeId), code),
            expiresAt=now + timedelta(seconds=EMAIL_CODE_SECONDS),
            maxAttempts=CHALLENGE_MAX_ATTEMPTS,
            safeReturnPath=safe_return_path(body.returnPath),
        )
        db.add(challenge)
        db.commit()
        subject, text = sign_in_email(code)
        if not mailer.send(email, subject, text):
            challenge.supersededAt = datetime.now(timezone.utc)
            db.add(challenge)
            db.commit()
            raise ApiError("deliveryFailed", "the code could not be sent, try again")
        return AuthChallengeView(challengeId=str(challengeId), expiresAt=challenge.expiresAt, retryAfterSeconds=RESEND_COOLDOWN_SECONDS)

    @router.post("/auth/email/verify", response_model=SessionView)
    def email_verify(body: EmailVerify, request: Request, response: Response, db: Session = Depends(open_db)):
        check_origin(request, settings)
        response.headers.update(NO_STORE)
        challengeId = parse_id(body.challengeId)
        now = datetime.now(timezone.utc)
        challenge = db.get(EmailChallenge, challengeId)
        if not challenge or challenge.consumedAt or challenge.supersededAt or aware(challenge.expiresAt) <= now:
            raise ApiError("expiredChallenge", "ask for a new code")
        counted = db.execute(update(EmailChallenge).where(EmailChallenge.id == challengeId, EmailChallenge.attempts < EmailChallenge.maxAttempts, EmailChallenge.consumedAt.is_(None)).values(attempts=EmailChallenge.attempts + 1, updatedAt=now))
        db.commit()
        if counted.rowcount != 1:
            raise ApiError("tooManyAttempts", "ask for a new code")
        if not same(code_verifier(settings.otpPepper, str(challengeId), body.code), challenge.codeVerifier):
            raise ApiError("invalidCode")
        consumed = db.execute(update(EmailChallenge).where(EmailChallenge.id == challengeId, EmailChallenge.consumedAt.is_(None), EmailChallenge.supersededAt.is_(None)).values(consumedAt=now, updatedAt=now))
        if consumed.rowcount != 1:
            db.rollback()
            raise ApiError("expiredChallenge", "ask for a new code")
        db.refresh(challenge)
        user = db.exec(select(User).where(User.emailCanonical == challenge.emailCanonical)).first()
        if user and user.suspended:
            db.rollback()
            raise ApiError("forbidden")
        if not user:
            user = User(email=challenge.emailCanonical, emailCanonical=challenge.emailCanonical, emailVerifiedAt=now)
        elif not user.emailVerifiedAt:
            user.emailVerifiedAt = now
            user.updatedAt = now
        db.add(user)
        db.flush()
        token = new_token()
        teams = db.exec(select(Membership).where(Membership.userId == user.id, Membership.status == MembershipStatus.active)).all()
        session = WebsiteSession(
            userId=user.id,
            tokenHash=token_hash(token),
            selectedTeamId=teams[0].teamId if len(teams) == 1 else None,
            issuedTokenVersion=user.tokenVersion,
            expiresAt=now + timedelta(days=WEBSITE_SESSION_DAYS),
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        db.refresh(user)
        set_session_cookies(response, settings, token, aware(session.expiresAt))
        if challenge.safeReturnPath:
            response.headers["X-Return-Path"] = challenge.safeReturnPath
        return session_view(db, session, user)

    @router.get("/session", response_model=SessionView)
    def get_session(request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        caller = current_caller(request, db, settings, mutating=False)
        return session_view(db, caller.session, caller.user)

    @router.post("/auth/logout", status_code=204)
    def logout(request: Request, db: Session = Depends(open_db)):
        caller = current_caller(request, db, settings, mutating=True)
        now = datetime.now(timezone.utc)
        caller.session.revokedAt = now
        caller.session.updatedAt = now
        db.add(caller.session)
        db.commit()
        response = Response(status_code=204, headers=NO_STORE)
        clear_session_cookies(response, settings)
        return response

    @router.post("/session/team", response_model=SessionView)
    def select_team(body: TeamSelect, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        caller = current_caller(request, db, settings, mutating=True)
        teamId = parse_id(body.teamId)
        if not any(team.id == teamId for team, _ in active_teams(db, caller.user)):
            raise ApiError("forbidden")
        caller.session.selectedTeamId = teamId
        caller.session.updatedAt = datetime.now(timezone.utc)
        db.add(caller.session)
        db.commit()
        db.refresh(caller.session)
        return session_view(db, caller.session, caller.user)

    @router.get("/healthz", include_in_schema=False)
    def health(db: Session = Depends(open_db)):
        db.exec(select(func.count()).select_from(User)).one()
        return {"ok": True}

    return router
