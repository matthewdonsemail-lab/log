---
title: "X session"
---

# X session

How log-cli talks to X: directly, with no proxy, through one curl_cffi client per account that lives in one engine host, one call at a time, spaced the way X's own web app spaces them, and signed with X's live operation ids. Rules 80, 81, 104, 105, 110 and 113.

## Transport

### REQ-XSESSION-01: An X account calls X directly, with no proxy

The X engine makes its twikit client without a proxy, and the spec log hands the engine carries no proxy. Facebook's proxy gate (rule 12) does not apply to X. Rule 80.

### REQ-XSESSION-02: twikit goes out as curl_cffi impersonating Safari

twikit's HTTP transport is one curl_cffi `AsyncSession` pinned to one impersonation target (`IMPERSONATE`, `safari17_0`), with redirects not followed and the proxy kept in the session. httpx is never used. Rule 81.

## One call at a time

### REQ-XSESSION-03: One call per account at a time

Every X call except the X Chat watch takes the account's `engine.lock` before it acts, and holds it until the call is done. A call that waits more than 15 minutes for the lock is refused with `accountBusy` and sends nothing. Rule 104.

### REQ-XSESSION-04: Sends are spaced 4 to 11 seconds, reads 0.8 to 2.5 seconds

After the account's last call, a send waits a random 4 to 11 seconds and a read a random 0.8 to 2.5 seconds before it goes out. The time of every call is recorded so the next one is spaced from it. Rules 104 and 110.

### REQ-XSESSION-05: The transaction key is kept for 3 hours

The client's transaction key is saved in `clientTransaction.json` after each call and restored by a new client while it is under 3 hours old, so X's home page and signer are not loaded again for every call. Rule 104.

## One session

### REQ-XSESSION-06: Every X call goes through the account's one engine host

Every call from the CLI, the MCP, the hooks, the queue and the X Chat watch goes through the account's one engine host, started on the first call. Running the call inline is only for tests (`LOG_TWITTER_HOST=inline`). Rule 105.

### REQ-XSESSION-07: The host keeps one client for the account

While hosting, the engine keeps one twikit client per account and hands the same client to every call with the same login, so the account has one connection, one cookie jar and one transaction key. Rule 105.

### REQ-XSESSION-08: A second host cannot start

A host holds the account's `host.lock`. A second host for the same account cannot take it and exits without serving. Rule 105.

### REQ-XSESSION-09: A call that cannot reach the host is refused, never run on its own

When the host does not start or does not answer, the call is refused with `xSessionHostDown`, nothing is sent, and no second session is opened in its place. Rule 105.

### REQ-XSESSION-10: The host closes when idle for 30 minutes or when its code changes

The host closes after 30 minutes without a call, and closes when any of the engine's code changes (the X engine, the platform kit or vendored twikit), even while an X Chat watch is open on it, so the next call runs the new code. Rules 105 and 108.

### REQ-XSESSION-11: A call to a restarting session waits for the new one

When the host is closing as a call reaches it, the call waits for the old host process to end and connects to the new one, rather than failing. Rule 113.

### REQ-XSESSION-12: A closing session drops its connections and exits at once

When the host closes it releases its record and its lock, closes its server and closes every open connection, so an open X Chat watch cannot hold it half closed. Rule 113.

## X's live operations

### REQ-XSESSION-13: webClient writes X's live operation table

`log twitter session webClient` loads x.com/home through the account's one session, saves the page and its scripts, and writes X's live operation ids and feature switch values to `xOperations.json`. Rule 113.

### REQ-XSESSION-14: Every GraphQL call uses X's live id and exactly X's switches

Every session loads `xOperations.json`, and each GraphQL call to x.com takes X's live query id for its operation and sends exactly the feature switches X's client sends for it, with X's values. Rule 113.
