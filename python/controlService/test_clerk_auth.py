from pathlib import Path
from unittest.mock import patch

from controlService.test_hosted_origins import client


def test_clerk_exchange_creates_session_and_reuses_user(tmp_path: Path) -> None:
    with client(f"sqlite:///{tmp_path / 'clerk.db'}") as app:
        with patch('controlService.clerkRoutes.verified_email', return_value='person@example.com'):
            first = app.post('/api/v1/auth/clerk', json={'token': 'verifiedToken'}, headers={'Origin': 'https://log.listeningkit.com'})
            assert first.status_code == 200
            assert first.json()['user']['emailVerified'] is True
            assert 'HttpOnly' in first.headers.get_list('set-cookie')[0]
            second = app.post('/api/v1/auth/clerk', json={'token': 'verifiedToken'})
            assert second.json()['user']['id'] == first.json()['user']['id']


def test_clerk_exchange_refuses_foreign_origin(tmp_path: Path) -> None:
    with client(f"sqlite:///{tmp_path / 'origin.db'}") as app:
        response = app.post('/api/v1/auth/clerk', json={'token': 'untrusted'}, headers={'Origin': 'https://evil.example'})
        assert response.status_code == 403


def test_clerk_exchange_refuses_unconfigured_provider(tmp_path: Path) -> None:
    with client(f"sqlite:///{tmp_path / 'missing.db'}") as app:
        response = app.post('/api/v1/auth/clerk', json={'token': 'untrusted'})
        assert response.status_code != 200
        assert 'set-cookie' not in response.headers
