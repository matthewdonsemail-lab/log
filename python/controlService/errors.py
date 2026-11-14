import uuid

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

STATUS = {
    "invalidInput": 400,
    "unauthenticated": 401,
    "forbidden": 403,
    "notFound": 404,
    "conflict": 409,
    "expiredChallenge": 410,
    "invalidCode": 400,
    "tooManyAttempts": 429,
    "inviteExpired": 410,
    "inviteWrongEmail": 403,
    "lastOwnerRequired": 409,
    "deliveryFailed": 502,
    "workspaceNotSelected": 409,
    "workspaceOffline": 503,
    "workspaceIncompatible": 409,
    "runtimeRevoked": 403,
    "leaseStale": 409,
    "approvalRequired": 403,
    "idempotencyConflict": 409,
    "providerUnavailable": 501,
    "operationPending": 202,
    "consoleOperationUnknown": 409,
    "consoleInputInvalid": 400,
    "credentialInputInvalid": 400,
    "credentialRejected": 422,
    "credentialRateLimited": 429,
    "credentialValidationUnavailable": 503,
    "credentialSaveUnconfirmed": 503,
    "browserProviderUnavailable": 503,
    "accountNotFound": 404,
    "accountCheckBusy": 409,
    "accountCheckStopped": 409,
    "accountDeactivated": 409,
    "browserCheckRequired": 409,
    "signInInputInvalid": 400,
    "cookieSignInUnavailable": 409,
    "passwordSignInUnavailable": 409,
    "cookiesIncomplete": 400,
    "signInRouteUnavailable": 409,
    "sessionSaveUnconfirmed": 503,
    "usageRangeInvalid": 400,
    "browserMissing": 404,
    "browserViewerUnavailable": 503,
    "browserGenerationChanged": 409,
    "browserBusy": 409,
    "browserStateChanged": 409,
    "browserInputStopped": 409,
    "browserInputInvalid": 400,
    "browserInputFailed": 409,
    "browserCheckUnresolved": 409,
    "browserOperationRefused": 409,
    "signInLinkInvalid": 410,
    "signInLinkNotYours": 403,
}


class ApiError(Exception):
    def __init__(self, code: str, safeMessage: str | None = None, retryAfterSeconds: int | None = None):
        self.code = code
        self.safeMessage = safeMessage
        self.retryAfterSeconds = retryAfterSeconds


def error_view(code: str, safeMessage: str | None = None, retryAfterSeconds: int | None = None) -> dict:
    view = {"code": code, "requestId": uuid.uuid4().hex}
    if retryAfterSeconds is not None:
        view["retryAfterSeconds"] = retryAfterSeconds
    if safeMessage:
        view["safeMessage"] = safeMessage
    return view


async def api_error_handler(_: Request, error: ApiError) -> JSONResponse:
    headers = {"Cache-Control": "no-store"}
    if error.retryAfterSeconds is not None:
        headers["Retry-After"] = str(error.retryAfterSeconds)
    return JSONResponse(error_view(error.code, error.safeMessage, error.retryAfterSeconds), status_code=STATUS.get(error.code, 400), headers=headers)


async def validation_error_handler(_: Request, error: RequestValidationError) -> JSONResponse:
    fields = sorted({".".join(str(part) for part in item.get("loc", [])[1:]) for item in error.errors()})
    return JSONResponse(error_view("invalidInput", f"check {', '.join(fields)}" if fields else None), status_code=400, headers={"Cache-Control": "no-store"})
