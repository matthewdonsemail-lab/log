from anyio import to_thread
from fastapi import APIRouter, Query, Request, Response
from pydantic import Field
from sqlalchemy.engine import Engine
from sqlmodel import Session

from controlService.access import current_caller, team_access
from controlService.dispatcher import Actor, Dispatcher
from controlService.errors import ApiError
from controlService.settings import Settings
from controlService.views import Strict

NO_STORE = {"Cache-Control": "no-store"}

RUNTIME_ERRORS = {
    "consoleInputInvalid",
    "credentialInputInvalid",
    "credentialRejected",
    "credentialRateLimited",
    "credentialValidationUnavailable",
    "credentialSaveUnconfirmed",
    "browserProviderUnavailable",
    "accountNotFound",
    "accountCheckBusy",
    "accountCheckStopped",
    "accountDeactivated",
    "browserCheckRequired",
    "accountCheckUnavailable",
    "signInInputInvalid",
    "cookieSignInUnavailable",
    "passwordSignInUnavailable",
    "cookiesIncomplete",
    "signInBusy",
    "usageRangeInvalid",
    "browserMissing",
    "browserViewerUnavailable",
    "browserGenerationChanged",
    "browserBusy",
    "browserStateChanged",
    "browserInputStopped",
    "browserInputInvalid",
    "browserInputFailed",
    "browserCheckUnresolved",
    "browserOperationRefused",
}

BROWSER_OPERATIONS = {"state": "browserState", "open": "browserOpen", "frame": "browserFrame", "input": "browserInput", "action": "browserAction", "saveState": "browserSaveState", "close": "browserClose"}

PENDING_STATES = {"dispatched", "accepted", "running"}


class CredentialsSave(Strict):
    provider: str = Field(min_length=1, max_length=40, pattern=r"^[a-zA-Z][a-zA-Z0-9]*$")
    values: dict[str, str] = Field(max_length=3)


class CredentialsRead(Strict):
    provider: str = Field(min_length=1, max_length=40, pattern=r"^[a-zA-Z][a-zA-Z0-9]*$")


class AccountCheck(Strict):
    accountId: str = Field(min_length=24, max_length=24, pattern=r"^[a-f0-9]{24}$")


class AccountSignIn(Strict):
    platform: str = Field(min_length=1, max_length=20, pattern=r"^[a-z]+$")
    method: str = Field(pattern=r"^(cookies|password)$")
    account: str = Field(min_length=1, max_length=120)
    cookies: str | None = Field(default=None, max_length=65536)
    username: str | None = Field(default=None, max_length=320)
    password: str | None = Field(default=None, max_length=1024)


class BrowserRequest(Strict):
    accountId: str = Field(min_length=24, max_length=24, pattern=r"^[a-f0-9]{24}$")
    generation: str | None = Field(default=None, max_length=64, pattern=r"^[a-f0-9]{1,64}$")
    revision: str | None = Field(default=None, max_length=64, pattern=r"^[a-f0-9]{1,64}$")
    action: str | None = Field(default=None, pattern=r"^(back|reload|verify|resolve|linkProfile)$")
    event: dict | None = None


def answer_of(view) -> dict | list:
    if view.state == "succeeded" and isinstance(view.result, (dict, list)):
        return view.result
    code = str((view.error or {}).get("code") or "") if isinstance(view.error, dict) else ""
    if view.state == "failed" and code in RUNTIME_ERRORS:
        raise ApiError(code)
    if view.state == "failed" and code == "toolFailed":
        raise ApiError("consoleOperationUnknown", "update log in your workspace, then try again")
    if view.state in PENDING_STATES:
        raise ApiError("operationPending", "your workspace is still working on it")
    raise ApiError("workspaceOffline", "the workspace did not answer in time")


def console_router(settings: Settings, engine: Engine, dispatcher: Dispatcher) -> APIRouter:
    router = APIRouter()

    def actor_of(request: Request, teamId: str, mutating: bool) -> Actor:
        with Session(engine, expire_on_commit=False) as db:
            access = team_access(db, current_caller(request, db, settings, mutating=mutating), teamId)
            return Actor(teamId=access.team.id, userId=access.caller.user.id)

    async def relay(request: Request, response: Response, teamId: str, tool: str, args: dict, mutating: bool):
        response.headers.update(NO_STORE)
        actor = await to_thread.run_sync(actor_of, request, teamId, mutating)
        return answer_of(await dispatcher.run_console(actor, tool, args))

    @router.get("/teams/{teamId}/console/connections")
    async def connections(teamId: str, request: Request, response: Response):
        return await relay(request, response, teamId, "connectionsList", {}, False)

    @router.get("/teams/{teamId}/console/usage")
    async def usage(teamId: str, request: Request, response: Response, days: int = Query(default=30, ge=1, le=30)):
        return await relay(request, response, teamId, "usage", {"days": days}, False)

    @router.get("/teams/{teamId}/console/events")
    async def events(teamId: str, request: Request, response: Response):
        return await relay(request, response, teamId, "events", {}, False)

    @router.post("/teams/{teamId}/console/credentials")
    async def credentials_save(teamId: str, body: CredentialsSave, request: Request, response: Response):
        return await relay(request, response, teamId, "credentialsSave", {"provider": body.provider, "values": body.values}, True)

    @router.post("/teams/{teamId}/console/credentials/read")
    async def credentials_read(teamId: str, body: CredentialsRead, request: Request, response: Response):
        return await relay(request, response, teamId, "credentialsRead", {"provider": body.provider}, True)

    @router.post("/teams/{teamId}/console/accountCheck")
    async def account_check(teamId: str, body: AccountCheck, request: Request, response: Response):
        return await relay(request, response, teamId, "accountCheck", {"accountId": body.accountId}, True)

    @router.post("/teams/{teamId}/console/signIn")
    async def sign_in(teamId: str, body: AccountSignIn, request: Request, response: Response):
        return await relay(request, response, teamId, "accountSignIn", body.model_dump(exclude_none=True), True)

    @router.post("/teams/{teamId}/console/browser/{operation}")
    async def browser(teamId: str, operation: str, body: BrowserRequest, request: Request, response: Response):
        tool = BROWSER_OPERATIONS.get(operation)
        if not tool:
            raise ApiError("notFound")
        return await relay(request, response, teamId, tool, body.model_dump(exclude_none=True), True)

    return router
