---
title: "Write budgets"
---

# Write budgets

How many times an account may write on its platform in a day, how matt can push one call past the account's governor, and how a refusal stops an account instead of being pushed through. Every direct-API engine (X, Discord, LinkedIn, Reddit and any new platform) runs each call through the account's own governor. Rules 86, 91, 94, 96, 101 and 102.

## Budgets

### REQ-BUDGET-01: Each platform has its own daily write budget

An X account makes up to 240 writes a day, a Discord account 120, a LinkedIn account 10, and every other platform 40. Rules 91, 96, 101, 102 and 122.

Checked by: code and SubQ

### REQ-BUDGET-02: Every engine run carries the platform's budget

log hands each engine run the budget of the account's platform, for X and for every platform on the shared platform kit.

Checked by: code and SubQ

### REQ-BUDGET-03: The governor's write cap is the platform's budget

Each engine's governor takes the budget it was handed as its daily write cap. `FBK_GOVERNOR_MUTATION_DAILY` replaces it for a run only when it is set. Rule 91.

Checked by: code and SubQ

### REQ-BUDGET-04: Every call goes through the account's governor first

Every engine call asks the account's governor before it acts, counting a write as a write. A call the governor refuses (its pause, or an hourly, daily or write cap) is answered `governorBlocked` and does not reach the platform. Rule 94.

Checked by: code and SubQ

## Force

### REQ-BUDGET-05: Only an X call with force set goes past the governor

An X send goes past the governor's pause and caps only when its spec has `force` set to true. Without it, a governor refusal stops the call. The shared platform kit never goes past its governor. Rule 86.

Checked by: SubQ

### REQ-BUDGET-06: --force is for that call or that run only

`--force` on `log twitter reply|quote|like|dm|repost|post` and on `log twitter queue run` sets `force` only on the specs of that call or run, and only when the flag is given. It is never on by default. Rule 86.

Checked by: code and SubQ

### REQ-BUDGET-07: A forced answer says what it went past

When a call went past the governor, its answer carries `forcedPast`, the governor's own refusal. Rule 86.

Checked by: code and SubQ

### REQ-BUDGET-08: The governor still counts a forced request

A forced call is still counted by the governor, in its hourly and daily counts and, for a write, in its write count. Rule 86.

Checked by: code and SubQ

## Stopping

### REQ-BUDGET-09: A throttle or block answer pauses the account

When the platform answers throttled, dropped, automated or its daily limit, the engine puts the account's governor into its pause, so the next call is refused instead of going through. Rules 94, 96 and 101.

Checked by: code and SubQ

### REQ-BUDGET-10: A Discord 429 stops the read and is never retried

When Discord answers 429 while reading a chat or channel, the read stops there and returns what it had, with the reason; the page is never asked for again in that run. Rule 94.

Checked by: code and SubQ

### REQ-BUDGET-11: A 429 on a session check is a throttle, not a session

When a platform answers 429 to the session check, the engine answers `rateLimited` with the event `throttled`, never logged in or logged out. Rule 94.

Checked by: code and SubQ

### REQ-BUDGET-13: A refusal stops the whole Discord read

When Discord refuses a read (a 429 or any other HTTP answer that isn't 200) while the export for `log search index` reads one conversation, or while the chat list is read, the whole read stops there: no other conversation is read, the answer says which conversation and what Discord answered, and the conversations already read are kept. A 429 pauses the account. A network drop, where Discord gave no answer, isn't a refusal: that conversation is noted and the next is read. Rule 94.

Checked by: code and SubQ

## LinkedIn

### REQ-BUDGET-12: LinkedIn goes out as curl_cffi impersonating Chrome

The LinkedIn client reaches LinkedIn only through one curl_cffi `Session` pinned to `IMPERSONATE` (`chrome150`), sending that target's own user agent, never plain `requests` and never the library's fixed user agent on its calls. Rule 102.

Checked by: code and SubQ
