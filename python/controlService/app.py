from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from sqlalchemy.engine import Engine

from controlService.authRoutes import auth_router
from controlService.bridge import Bridges
from controlService.bridgeRoutes import bridge_router
from controlService.db import make_engine, session_maker
from controlService.errors import ApiError, api_error_handler, validation_error_handler
from controlService.mailer import Mailer, ResendMailer
from controlService.settings import Settings, load_settings
from controlService.operationRoutes import operation_router
from controlService.teamRoutes import team_router
from controlService.workspaceRoutes import workspace_router

API_BASE = "/api/v1"


def create_app(settings: Settings | None = None, engine: Engine | None = None, mailer: Mailer | None = None) -> FastAPI:
    settings = settings or load_settings()
    engine = engine or make_engine(settings.databaseUrl)
    mailer = mailer or ResendMailer(settings)
    open_db = session_maker(engine)
    app = FastAPI(title="log control service", version="1", openapi_url=f"{API_BASE}/openapi.json", docs_url=None, redoc_url=None)
    app.add_exception_handler(ApiError, api_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.include_router(auth_router(settings, open_db, mailer), prefix=API_BASE)
    app.include_router(team_router(settings, open_db, mailer), prefix=API_BASE)
    bridges = Bridges()
    app.include_router(workspace_router(settings, open_db, bridges), prefix=API_BASE)
    app.include_router(operation_router(settings, engine, bridges), prefix=API_BASE)
    bridgeRoutes, serveBridge = bridge_router(engine, bridges)
    app.include_router(bridgeRoutes, prefix=API_BASE)
    app.add_api_websocket_route("/bridge", serveBridge)
    app.state.engine = engine
    app.state.bridges = bridges
    return app
