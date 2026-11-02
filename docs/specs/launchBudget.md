---
title: "Launch budget"
---

# Launch budget

Before a run opens an account's browser, `prepareRun` checks when it may open: only inside the account's local waking hours, at most 8 launches a local day and at least 10 minutes apart. `--bypass` skips the hours only, `--now` skips the gap only, and only matt resets the count, with `log facebook account resetOpens`. Rules 18, 20, 24, 30 and 37.

## Active hours

### REQ-LAUNCH-01: No run outside the account's waking hours

A run that opens a browser is refused with `outsideActiveHours` when the account's local time is outside its window. The window is 08:00 to 22:00 in its home timezone. Rule 18.

Checked by: code and SubQ

### REQ-LAUNCH-02: The account's own hours replace the default

When the account has valid `activeHoursStart` and `activeHoursEnd` that are not equal, its window is those hours instead of 08:00 to 22:00, and a window that crosses midnight is handled. Rule 18.

Checked by: code and SubQ

### REQ-LAUNCH-03: --bypass skips the waking hours and nothing else

With `--bypass` the hours check is skipped for that run. The launch budget, the proxy gate, the home locale, the device and the self-check still run. It is never on by default. Rule 20.

Checked by: code and SubQ

## Launches

### REQ-LAUNCH-04: At most 8 launches a local day

An account's browser opens at most 8 times in its local day, dry runs counted. The ninth is refused with `launchBudgetSpent`. Rule 24.

Checked by: code and SubQ

### REQ-LAUNCH-05: Launches are at least 10 minutes apart

A launch less than 10 minutes after the last one is refused with `launchTooSoon`, saying how long to wait. Rule 24.

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

`log facebook account resetOpens <a>|all` writes one line with the account, the time and the reason to `~/.logCli/launchResets.jsonl` and sets the host's opens today to 0. Nothing is deleted. Rule 37.

Checked by: code and SubQ

### REQ-LAUNCH-11: Launches before the latest reset stop counting

Launches at or before the account's latest reset line are not counted, so the 8 a day and the 10-minute gap apply again from the reset. Rule 37.

Checked by: code and SubQ

### REQ-LAUNCH-12: resetOpens is refused while a browser is open

matt resets the opens only with every browser closed first. A reset for an account whose browser session is still open is refused, naming the open session. Rule 37.

Checked by: code and SubQ
