---
title: "Instagram"
---

# Instagram

What `log new platform instagram` made, and what the platform's code must keep doing as it grows. Rules 83, 117 and 123.

## The account's session

### REQ-INSTAGRAM-01: The account is found on its own platform's row and gated

An account is found in socialAccounts by its platform, INSTAGRAM, and checked by the platform's gate before its engine runs.

Checked by: code and SubQ

### REQ-INSTAGRAM-02: The engine runs the account through the shared platform kit

Every Instagram call goes through `python/instagramApi/engine.py` on the shared platform kit, with the account's own governor, never a script of its own.

Checked by: code and SubQ

### REQ-INSTAGRAM-03: Instagram's own answer is what gets recorded

`log instagram session check` sends nothing, and writes Instagram's own answer to the account's sessionState. Refreshed cookies for .instagram.com are merged back into the row.

Checked by: code and SubQ

### REQ-INSTAGRAM-05: The session is checked through the vendored instagrapi over curl_cffi

The engine's ping reaches Instagram only through the vendored client in `vendor/instagrapi`: it signs in from the account's saved `sessionid` with `login_by_sessionid`, its private transport set to curl, and reads nothing beyond that. Cookies with no `sessionid` are answered `sessionDead` before any call. A `sessionid` Instagram says belongs to another user than the account's `ds_user_id` is `sessionMismatch`. Instagram's challenge, rate limit and login refusals are answered `challenged`, `rateLimited` and `sessionDead`.

Checked by: code and SubQ

## Wiring

### REQ-INSTAGRAM-04: The platform is wired into the CLI and the direct-API routes

instagram is in PLATFORMS and PLATFORM_SITES, its session command is in COMMANDS, and its session route is in DIRECT_ROUTES.

Checked by: code and SubQ
