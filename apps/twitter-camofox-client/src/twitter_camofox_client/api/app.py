"""REST service over twikit (X/Twitter). Same /api/* + /healthz contract
as reddit-camofox-client and facebook-camofox-client, so all three
platforms wire into apps/web the same way.

Cookies travel per request (no server-side session store) — same
convention as the sibling clients. Bearer key optional via
TWITTER_API_KEY.

Endpoints:
  POST /api/actions/{action_type}  generic dispatch (tweets.listen, tweets.search)
  GET  /api/actions                list registered action types
  POST /api/tweets/listen          tweets.listen convenience route
  POST /api/tweets/search          tweets.search convenience route
  GET  /healthz                    liveness
"""
from __future__ import annotations

import os
import uuid

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from twikit import Client

from twitter_camofox_client.normalize import normalize_tweet

app = FastAPI(title="twitter-camofox-client", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _client(cookies: dict | None) -> Client:
    client = Client("en-US")
    if cookies:
        client.set_cookies(cookies)
    elif os.getenv("TWIKIT_COOKIES_FILE"):
        client.load_cookies(os.getenv("TWIKIT_COOKIES_FILE"))
    return client


async def _api_key(authorization: str | None = Header(default=None)) -> None:
    required = os.getenv("TWITTER_API_KEY")
    if not required:
        return
    if authorization != f"Bearer {required}":
        raise HTTPException(status_code=401, detail="missing or invalid bearer key")


class ActionBody(BaseModel):
    account_id: str = "default"
    cookies: dict | None = None
    idempotency_key: str | None = None
    input: dict = Field(default_factory=dict)


async def _tweets_listen(body: ActionBody) -> dict:
    query = body.input.get("query", "")
    limit = int(body.input.get("limit", 25))
    client = await _client(body.cookies)
    tweets = await client.search_tweet(query, product="Latest", count=limit)
    return {"new_posts": [normalize_tweet(t) for t in tweets]}


async def _tweets_search(body: ActionBody) -> dict:
    query = body.input.get("query", "")
    limit = int(body.input.get("limit", 25))
    product = body.input.get("product", "Top")
    client = await _client(body.cookies)
    tweets = await client.search_tweet(query, product=product, count=limit)
    return {"results": [normalize_tweet(t) for t in tweets]}


REGISTRY = {
    "tweets.listen": _tweets_listen,
    "tweets.search": _tweets_search,
}


async def _run(action_type: str, body: ActionBody) -> dict:
    try:
        handler = REGISTRY[action_type]
    except KeyError:
        raise HTTPException(status_code=404, detail=f"unknown action_type: {action_type}")
    try:
        result = await handler(body)
    except Exception as exc:  # search/timeline calls need a logged-in session
        result = {"new_posts": [], "results": [], "auth_state": "auth_required", "auth_reason": str(exc)}
    return {
        "action_id": body.idempotency_key or f"api-{uuid.uuid4().hex[:12]}",
        "action_type": action_type,
        "result": result,
    }


@app.get("/api/actions")
async def action_index(_: None = Depends(_api_key)):
    return {"action_types": sorted(REGISTRY)}


@app.post("/api/actions/{action_type}")
async def run_action(action_type: str, body: ActionBody, _: None = Depends(_api_key)):
    return await _run(action_type, body)


@app.post("/api/tweets/listen")
async def tweets_listen(body: ActionBody, _: None = Depends(_api_key)):
    return await _run("tweets.listen", body)


@app.post("/api/tweets/search")
async def tweets_search(body: ActionBody, _: None = Depends(_api_key)):
    return await _run("tweets.search", body)


@app.get("/healthz")
async def healthz():
    from datetime import UTC, datetime

    return {"ok": True, "at": datetime.now(UTC).isoformat()}
