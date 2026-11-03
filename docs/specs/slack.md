---
title: "Slack"
---

# Slack

What `log new platform slack` made, and what the platform's code must keep doing as it grows. Rules 83, 117, 123, 124 and 125.

## The account's session

### REQ-SLACK-01: The account is found on its own platform's row and gated

An account is found in socialAccounts by its platform, SLACK, and checked by the platform's gate before its engine runs.

Checked by: code and SubQ

### REQ-SLACK-02: The engine runs the account through the shared platform kit

Every Slack call goes through `python/slackApi/engine.py` on the shared platform kit, with the account's own governor, never a script of its own.

Checked by: code and SubQ

### REQ-SLACK-03: Slack's own answer is what gets recorded

`log slack session check` sends nothing, and writes Slack's own answer to the account's sessionState. Refreshed cookies for .slack.com are merged back into the row.

Checked by: code and SubQ

## Wiring

### REQ-SLACK-04: The platform is wired into the CLI and the direct-API routes

slack is in PLATFORMS and PLATFORM_SITES, its session command is in COMMANDS, and its session route is in DIRECT_ROUTES.

Checked by: code and SubQ

## Transport

### REQ-SLACK-05: Slack is reached only through one curl_cffi session that impersonates Chrome

vendor/gabrielSlack reaches Slack, its web API, its cookie exchange and its websocket (wss-primary.slack.com), only through `gabriel/core/transport.py`: one curl_cffi `AsyncSession` made by `new_session`, pinned to one Chrome target (`IMPERSONATE`), sending that target's own user agent (`USER_AGENT`, which the client's default metadata uses). It never uses httpx, websockets, aiohttp, requests or a socket of its own, and it keeps no cookies between calls: the d cookie is sent explicitly on each one. `bun run check:slackTransport` (`python/checks/slackTransport.py`, pre-commit and pre-push) maps every transport touchpoint by syntax tree, rewrites what has a curl_cffi equivalent (`--apply`) and refuses the rest. Rule 125.

Checked by: code and SubQ
