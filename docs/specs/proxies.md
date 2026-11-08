---
title: "Proxies"
---

# Proxies

Every Facebook account goes out through its own proxy, kept as one URL in Twenty whichever provider it came from. log-cli reads the provider from the proxy's host, gives an account a proxy from 2Captcha or Byteful in its home city after checking it, sets the proxy speed limit per run, meters each account's proxy traffic against a 24 hour budget, and never buys from a provider. Rules 33, 43, 51 and 52 (rule 52 widens rule 43 to Byteful).

## Speed limit

### REQ-PROXY-01: --proxyMs sets the speed limit for one run

`--proxyMs <ms>` on any log command sets `LOG_PROXY_MAX_MS` for that run only, and puts back what was there before once the run ends. A value that is not a whole number from 500 to 60000 is refused before the command runs.

Checked by: code and SubQ

### REQ-PROXY-02: The speed limit defaults to 2500 ms

When `LOG_PROXY_MAX_MS` is not set, the limit is 2500 ms, in the TypeScript checks and in the Python gate alike.

Checked by: code and SubQ

## Providers

### REQ-PROXY-03: The provider is read from the proxy's host

The provider of an account's proxy is read from the host of its one `proxy` URL: `proxy.2captcha.com` is 2Captcha and `byteful.com` is Byteful, both billed by traffic. A URL that does not parse or a host that is neither has no provider.

Checked by: code and SubQ

### REQ-PROXY-04: An assigned proxy is checked before it is saved

`log proxy assign` saves a proxy to the account's `proxy` field in Twenty only after it exits in the account's home country, within 100 km of its home city, and fast enough for Facebook. It tries up to 3 sessions, and saves none when every one is too far or too slow.

Checked by: code and SubQ

### REQ-PROXY-05: Byteful gives a sticky 24 hour residential proxy in the home city

`log proxy assign --vendor byteful` asks Byteful's residential list for one sticky proxy with a 24 hour session, in the account's home country and the Byteful city picked for its home city (or `--city`).

Checked by: code and SubQ

### REQ-PROXY-06: Deactivated and non-Facebook accounts get no proxy

`log proxy assign` refuses an account that is deactivated, is not a Facebook account, or has no home country, with either provider.

Checked by: code and SubQ

### REQ-PROXY-07: log-cli never buys from a provider

log-cli only reads from the providers: balances, cities, proxy lists and a price quote. Nothing in it creates a checkout or an order.

Checked by: SubQ

## Traffic budget

### REQ-PROXY-08: Each account has a 24 hour traffic budget of 1 GB by default

An account's proxy traffic budget is 1024 MB over the last 24 hours, counted from the runs recorded for that account in the `ledger` table in `~/.logCli/log.db` (kind `proxyTraffic`). `--trafficMb` sets another budget for the run.

Checked by: code and SubQ

### REQ-PROXY-09: A warm-up over its budget does not start

A Reels or feed warm-up on a metered proxy whose account has no budget left is refused with `trafficBudgetSpent` before any step runs.

Checked by: code and SubQ

### REQ-PROXY-10: The Reels warm-up checks its traffic every 5 reels and stops at the budget

The Reels warm-up reads the provider's counter at the start and again every 5 swipes, and stops with `trafficBudgetSpent` once the traffic used in 24 hours reaches the budget.

Checked by: code and SubQ

### REQ-PROXY-11: Each run's traffic is recorded

At the end of a metered warm-up its traffic is read from the provider's counter and one line with the time, account, run and megabytes is appended to the `ledger` table in `~/.logCli/log.db` (kind `proxyTraffic`).

Checked by: code and SubQ

### REQ-PROXY-12: A proxy is metered by its own provider, a static IP is not

A traffic-billed proxy is metered by its own provider's counter (2Captcha's used flow, Byteful's residential bytes used). A proxy with no traffic-billed provider, such as a static IP, is not metered.

Checked by: code and SubQ
