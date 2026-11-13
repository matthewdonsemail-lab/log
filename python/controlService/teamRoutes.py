from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from controlService.access import current_caller, parse_id, team_access
from controlService.errors import ApiError
from controlService.mailer import Mailer, invite_email
from controlService.models import Invite, Membership, MembershipStatus, Role, Team, User
from controlService.security import aware, canonical_email, looks_like_email, new_token, token_hash
from controlService.settings import INVITE_DAYS, Settings
from controlService.views import InviteAccept, InviteCreate, InviteView, MemberUpdate, MemberView, TeamCreate, TeamView, invite_view, member_view, team_view

NO_STORE = {"Cache-Control": "no-store"}


def lock_team(db: Session, team: Team) -> Team:
    locked = db.exec(select(Team).where(Team.id == team.id).with_for_update()).one()
    locked.authzVersion += 1
    locked.updatedAt = datetime.now(timezone.utc)
    db.add(locked)
    return locked


def active_owners(db: Session, teamId) -> int:
    return len(db.exec(select(Membership).where(Membership.teamId == teamId, Membership.role == Role.owner, Membership.status == MembershipStatus.active)).all())


def team_router(settings: Settings, open_db, mailer: Mailer) -> APIRouter:
    router = APIRouter()

    @router.post("/teams", response_model=TeamView, status_code=201)
    def create_team(body: TeamCreate, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        caller = current_caller(request, db, settings, mutating=True)
        if not caller.user.emailVerifiedAt:
            raise ApiError("forbidden", "verify your email first")
        team = Team(name=body.name.strip(), slug=body.slug)
        membership = Membership(teamId=team.id, userId=caller.user.id, role=Role.owner)
        try:
            db.add(team)
            db.flush()
            db.add(membership)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise ApiError("conflict", "that team url is taken")
        db.refresh(team)
        db.refresh(membership)
        return team_view(team, membership)

    @router.get("/teams/{teamId}/members", response_model=list[MemberView])
    def list_members(teamId: str, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=False), teamId)
        rows = db.exec(select(Membership, User).join(User, User.id == Membership.userId).where(Membership.teamId == access.team.id).order_by(Membership.createdAt)).all()
        return [member_view(membership, user) for membership, user in rows]

    @router.patch("/teams/{teamId}/members/{membershipId}", response_model=MemberView)
    def update_member(teamId: str, membershipId: str, body: MemberUpdate, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId)
        if not (access.allows("membershipAdmin") or access.allows("nonOwnerMembershipAdmin")):
            raise ApiError("forbidden")
        lock_team(db, access.team)
        target = db.exec(select(Membership).where(Membership.id == parse_id(membershipId), Membership.teamId == access.team.id).with_for_update()).first()
        if not target:
            db.rollback()
            raise ApiError("notFound")
        touchesOwner = target.role == Role.owner or body.role == Role.owner
        if touchesOwner and not access.allows("membershipAdmin"):
            db.rollback()
            raise ApiError("forbidden", "only an owner manages owners")
        losesOwner = target.role == Role.owner and target.status == MembershipStatus.active and ((body.role and body.role != Role.owner) or body.status == "revoked")
        if losesOwner and active_owners(db, access.team.id) <= 1:
            db.rollback()
            raise ApiError("lastOwnerRequired", "a team needs at least one owner")
        if body.role:
            target.role = body.role
        if body.status:
            target.status = MembershipStatus(body.status)
        target.version += 1
        target.updatedAt = datetime.now(timezone.utc)
        db.add(target)
        db.commit()
        db.refresh(target)
        return member_view(target, db.get(User, target.userId))

    @router.post("/teams/{teamId}/invites", response_model=InviteView, status_code=201)
    def create_invite(teamId: str, body: InviteCreate, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId, "invite")
        if body.role == Role.owner:
            raise ApiError("invalidInput", "invite as admin or member")
        if not looks_like_email(body.email):
            raise ApiError("invalidInput", "check email")
        token = new_token()
        invite = Invite(
            teamId=access.team.id,
            emailCanonical=canonical_email(body.email),
            role=body.role,
            tokenHash=token_hash(token),
            invitedBy=access.caller.user.id,
            expiresAt=datetime.now(timezone.utc) + timedelta(days=INVITE_DAYS),
        )
        db.add(invite)
        db.commit()
        db.refresh(invite)
        subject, text = invite_email(access.team.name, f"{settings.consoleOrigin}/teams?invite={token}")
        if not mailer.send(invite.emailCanonical, subject, text):
            invite.revokedAt = datetime.now(timezone.utc)
            db.add(invite)
            db.commit()
            raise ApiError("deliveryFailed", "the invite could not be sent, try again")
        return invite_view(invite)

    @router.post("/teams/{teamId}/invites/{inviteId}/revoke", status_code=204)
    def revoke_invite(teamId: str, inviteId: str, request: Request, db: Session = Depends(open_db)):
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId, "invite")
        now = datetime.now(timezone.utc)
        done = db.execute(update(Invite).where(Invite.id == parse_id(inviteId), Invite.teamId == access.team.id, Invite.acceptedAt.is_(None), Invite.revokedAt.is_(None)).values(revokedAt=now, updatedAt=now))
        db.commit()
        if done.rowcount != 1:
            raise ApiError("notFound")
        return Response(status_code=204, headers=NO_STORE)

    @router.post("/invites/accept", response_model=TeamView)
    def accept_invite(body: InviteAccept, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        caller = current_caller(request, db, settings, mutating=True)
        if not caller.user.emailVerifiedAt:
            raise ApiError("forbidden", "verify your email first")
        invite = db.exec(select(Invite).where(Invite.tokenHash == token_hash(body.token))).first()
        now = datetime.now(timezone.utc)
        if not invite or invite.revokedAt:
            raise ApiError("inviteExpired", "this invite was withdrawn")
        if invite.acceptedAt:
            raise ApiError("inviteExpired", "this invite was already used")
        if aware(invite.expiresAt) <= now:
            raise ApiError("inviteExpired", "this invite has expired")
        if invite.emailCanonical != caller.user.emailCanonical:
            raise ApiError("inviteWrongEmail", "sign in with the address the invite was sent to")
        team = db.get(Team, invite.teamId)
        if not team or team.suspended:
            raise ApiError("forbidden")
        claimed = db.execute(update(Invite).where(Invite.id == invite.id, Invite.acceptedAt.is_(None), Invite.revokedAt.is_(None)).values(acceptedAt=now, acceptedBy=caller.user.id, updatedAt=now))
        if claimed.rowcount != 1:
            db.rollback()
            raise ApiError("inviteExpired", "this invite was already used")
        membership = db.exec(select(Membership).where(Membership.teamId == team.id, Membership.userId == caller.user.id)).first()
        if membership and membership.status == MembershipStatus.active:
            if membership.role == Role.member and invite.role == Role.admin:
                membership.role = Role.admin
        elif membership:
            membership.status = MembershipStatus.active
            membership.role = invite.role
        else:
            membership = Membership(teamId=team.id, userId=caller.user.id, role=invite.role)
        membership.version = (membership.version or 0) + 1
        membership.updatedAt = now
        db.add(membership)
        lock_team(db, team)
        db.commit()
        db.refresh(team)
        db.refresh(membership)
        return team_view(team, membership)

    return router
