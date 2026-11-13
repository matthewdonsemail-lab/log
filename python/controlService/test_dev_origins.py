from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from controlService.app import create_app
from controlService.db import make_engine
from controlService.settings import MissingSetting, dev_origins
from controlService.test_hosted_origins import AcceptingMailer, settings

LOCAL = "http://localhost:5181"


def client_with(databaseUrl: str, devOrigins: tuple[str, ...]) -> TestClient:
    engine = make_engine(databaseUrl)
    SQLModel.metadata.create_all(engine)
    return TestClient(create_app(replace(settings(databaseUrl), devOrigins=devOrigins), engine, AcceptingMailer()))


def test_a_listed_dev_origin_can_finish_a_clerk_sign_in(tmp_path: Path) -> None:
    with client_with(f"sqlite:///{tmp_path / 'dev.db'}", (LOCAL,)) as app:
        with patch("controlService.clerkRoutes.verified_email", return_value="person@example.com"):
            response = app.post("/api/v1/auth/clerk", json={"token": "verifiedToken"}, headers={"Origin": LOCAL})
            assert response.status_code == 200


def test_a_dev_origin_is_refused_unless_it_is_listed(tmp_path: Path) -> None:
    with client_with(f"sqlite:///{tmp_path / 'closed.db'}", ()) as app:
        with patch("controlService.clerkRoutes.verified_email", return_value="person@example.com"):
            response = app.post("/api/v1/auth/clerk", json={"token": "verifiedToken"}, headers={"Origin": LOCAL})
            assert response.status_code == 403


def test_dev_origins_take_only_local_http_origins() -> None:
    assert dev_origins(" http://localhost:5181/ , http://127.0.0.1:3000") == ("http://localhost:5181", "http://127.0.0.1:3000")
    assert dev_origins(None) == ()
    for bad in ("https://evil.example", "http://evil.example", "http://localhost:5181/console"):
        with pytest.raises(MissingSetting):
            dev_origins(bad)
