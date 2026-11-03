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

The engine's ping reaches Instagram only through the vendored client in `vendor/instagrapi`: it signs in from the account's saved `sessionid` with `login_by_sessionid`, its private (app) and public (web) transports both set to curl, so every HTTP call goes through curl_cffi, and reads nothing beyond that. `check:instagramTransport` (lefthook pre-commit and pre-push, `python/checks/instagramTransport.py`) refuses an engine that imports an HTTP or websocket library of its own or leaves either transport off curl, and builds the client the engine's way to check both sessions sit on curl_cffi adapters. The realtime MQTT socket is the one exception: it isn't HTTP. Cookies with no `sessionid` are answered `sessionDead` before any call. A `sessionid` Instagram says belongs to another user than the account's `ds_user_id` is `sessionMismatch`. Instagram's challenge, rate limit and login refusals are answered `challenged`, `rateLimited` and `sessionDead`.

Checked by: code and SubQ

## DMs

### REQ-INSTAGRAM-06: DMs are read through instagrapi, sending nothing and marking nothing seen

`log instagram dms` lists the account's threads (who each is with, the last message, whether it is unread), or with `--with` reads one thread's latest messages oldest first, through the engine's `inbox` and `thread` actions on the vendored instagrapi (`direct_threads`, `direct_thread`). It sends nothing and marks nothing seen. `--with` is matched to one thread by handle, thread name or thread id: none is `threadNotFound`, several are `threadAmbiguous` with the candidates listed, and a thread read with nothing named is `threadNeeded` before any call. A voice message carries the shared audio marker; a shared reel or post is named by its kind and owner.

Checked by: code and SubQ

### REQ-INSTAGRAM-07: Sending goes through instagrapi, a dry run unless --live

`log instagram send` sends to a thread matched by handle, name or id, or to a new DM with that handle, through the engine's `send` action on the vendored instagrapi (`direct_send`, and `direct_send_photo` for `--photo`), never the account's browser. Without `--live` it is a dry run that contacts nothing; `--live` needs `--approvedBy` (rule 8). The text goes out one message per line unless `--asOne` (rule 90), and is refused with `aiArtifacts` when it carries what AI chat interfaces leave in text (rule 111). Nothing to send is `nothingToSend` and a missing photo file is `photoMissing`, before any call. A refusal stops the run with what was sent reported and nothing retried (rule 94).

Checked by: code and SubQ

### REQ-INSTAGRAM-08: New DMs are pushed by Instagram's realtime connection to the inbox hook

`log instagram watch` holds Instagram's own realtime connection open through the vendored instagrapi (MQTT to `edge-mqtt.facebook.com`, subscribed to the DM sync with `direct_subscribe`), pinging it while it waits, and prints each new message the moment it is pushed, nothing polled. With `--inbox` every message from someone else goes to the inbox hook, which starts the watcher for every signed-in Instagram account, restarts it when the engine or instagrapi changes, skips an account cooling off, and puts each message in front of the agent (`>>> NEW INSTAGRAM MESSAGE`) with the steps to answer through `instagramDms`, `voice` and `instagramSendLive`, never the browser (rule 123). A refused or dropped connection ends the watch with `realtimeRefused` or `realtimeDropped`.

Checked by: code and SubQ

## Wiring

### REQ-INSTAGRAM-04: The platform is wired into the CLI and the direct-API routes

instagram is in PLATFORMS and PLATFORM_SITES, its session command is in COMMANDS, and its session route is in DIRECT_ROUTES.

Checked by: code and SubQ
