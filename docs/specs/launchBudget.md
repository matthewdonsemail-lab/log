---
title: "Launch budget"
---

# Launch budget

Before a run opens an account browser, prepareRun validates the account, proxy, home/device and launch budget. Browser launch and preflight no longer restrict execution to the legacy active-hours window. The daily launch count and minimum gap remain in force.

## Retired active-hours launch restriction

### REQ-LAUNCH-01: Browser launch has no waking-hours restriction

prepareRun does not refuse browser opening because of the account local time. Proxy, locale/device, account and launch-budget checks remain authoritative.

Checked by: code and SubQ

### REQ-LAUNCH-02: Legacy window calculation remains available

activeWindow and insideWindow remain for existing runtime consumers outside browser preparation. Removing the browser launch gate does not migrate host scheduling or direct API policy.

Checked by: code and SubQ

### REQ-LAUNCH-03: Inspect bypass is retained for compatibility

The existing inspect bypass flag is accepted for older callers but is unnecessary for browser launch. It does not disable the proxy, account, device or launch-budget checks.

Checked by: code and SubQ

## Launches

### REQ-LAUNCH-04: At most 8 launches a local day

An account's browser opens at most 8 times in its local day, dry runs counted. The ninth is refused with `launchBudgetSpent`. Rule 24.

Checked by: code and SubQ

### REQ-LAUNCH-05: Launches are at least 10 minutes apart

A launch less than 10 minutes after the last one is refused with `launchTooSoon`, saying how long to wait and the exact next eligible UTC timestamp. Rule 24.

Checked by: code and SubQ

### REQ-LAUNCH-06: A launch counts once it passed the self-check

A launch is counted from the "Self-check passed" line in the `steps.jsonl` of the account's runs, both the run folders and the publish folders. Rule 24.

Checked by: code and SubQ

### REQ-LAUNCH-07: The day is the account's local day

Today's launches are the ones on the same calendar day as now in the account's home timezone. Rules 18 and 24.

Checked by: code and SubQ

### REQ-LAUNCH-08: --now skips only the 10-minute gap

With `--now` on inspect, connect or publish, the 10-minute gap is not applied for that run, and the 8 a day still holds. Rule 30.

Checked by: code and SubQ

### REQ-LAUNCH-09: Only a publish against the saved fixture form is not counted

The launch budget is skipped only for a publish whose `--formUrl` is a `file:` URL. `--bypass` does not skip it. Rule 24.

Checked by: code and SubQ

## Reset

### REQ-LAUNCH-10: resetOpens writes one dated line and deletes nothing

`log facebook account resetOpens <a>|all` writes one line with the account, the time and the reason to the `ledger` table in `~/.logCli/log.db` (kind `launchReset`) and sets the host's opens today to 0. Nothing is deleted. Rule 37.

Checked by: code and SubQ

### REQ-LAUNCH-11: Launches before the latest reset stop counting

Launches at or before the account's latest reset line are not counted, so the 8 a day and the 10-minute gap apply again from the reset. Rule 37.

Checked by: code and SubQ

### REQ-LAUNCH-12: resetOpens is refused while a browser is open

matt resets the opens only with every browser closed first. A reset for an account whose browser session is still open is refused, naming the open session. Rule 37.

Checked by: code and SubQ
