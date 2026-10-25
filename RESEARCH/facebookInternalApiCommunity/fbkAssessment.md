---
title: "hopfian/fbk — can it help what we're doing?"
tags: [facebook, internal-api, reference, opsec, warmup]
status: active
created: 2026-10-25
---

# hopfian/fbk — assessment (read via GitHub API)

[hopfian/fbk](https://github.com/hopfian/fbk) — "a reverse-engineered Python CLI
that speaks Facebook's internal GraphQL, MQTT and DGW protocols with a full
browser fingerprint and adaptive rate governor." Python, AGPL-3.0, last push
2026-09-20, 36 command families, 1250+ offline tests, a doc_id registry and
captured wire fixtures.

## The honest answer: yes to learn from, no to drop in

**Correction to "it can work with what we've been doing":** fbk is a **different
architecture**. It speaks Facebook's internal API **directly** over `curl_cffi`
(a TLS/h2 browser impersonation) — **no browser at all**. Our stack is
**browser-first**: AdsPower + Playwright, headed, recorded, one browser per
account (matt's rules 11, 12, 35, 44; "whatever Listaro did we go with that
path"). So:

- It is **not** a drop-in for our transport, and switching to it would break the
  browser-stays-open rules we deliberately set.
- **License: AGPL-3.0; our repo is MIT.** We can **read and re-implement its
  ideas**, we cannot paste its code into log-cli. (This file is study notes, not
  copied code.)

So it doesn't *replace* anything we do. But it is the best reference we've found,
and three things in it are directly portable as **ideas**.

## What's worth taking (ideas, re-implemented, not copied)

### 1. The governor — the warm-up/anti-flag discipline we're missing (biggest win)
Their opsec doc (`docs/09-safety-and-opsec.md`) states the single most useful
finding of this whole research effort:

> During live calibration, ~47 requests at a **metronomic 2.4-second mean** over
> two minutes triggered a server-side session kill that escalated to an
> **account-level "automated behaviour" warning**. … volume plus metronomic
> timing is the **only signal that has ever fired** on this project.

That is **exactly** the warning we hit on every account tonight. Their fix, as
concrete numbers we can mirror in our flows/host:

| Mechanism | Their default |
|---|---|
| Inter-arrival gaps | lognormal, floor **4 s**, mean **12 s**, CV **0.7** (never metronomic) |
| Warm-up curve | first **8 requests** of the day at **2× the mean** |
| Hourly cap | **120 / rolling hour** |
| Daily cap | **500 / day** |
| **Mutation budget** | **40 writes / day** (separate, far lower than reads) |
| Soft block (empty-200, 403/429) | **15-min cooldown**, never retry |
| Checkpoint | **6-hour disengagement** |
| Quiet hours | confine to a daily window (a 24/7 account is the top anomaly) |

We don't fire 47 req/2 min ourselves, but our browser flows click through steps
back-to-back with no day-level pacing or mutation budget — and we listed on day
one. This table is the blueprint for the warm-up/governor we keep saying we need.

### 2. The doc_id registry + captured fixtures — reference for our own docs
`data/doc_id_registry_v2/v3.json` maps friendly query names → the doc_ids FB
actually sends, and overlaps our names (MarketplaceYourListingDialogQuery,
TwoStepVerificationChallengePickerDialogQuery, MarketplaceSearchAddressDataSourceQuery
all present). `data/marketplace_fixture.json` references `buy_location`. Useful
to cross-check our `docs/platforms/facebook/` and, maybe, to crack the
**1675030 setBuyLocation "Query Error"** unknown — their fixture touches that field.

### 3. The enforcement-ladder model corroborates our burn matrix
They treat checkpoint > soft-block > account-warning as tiers, with disengagement
scaled to tier — the same shape as our [`burnMatrix.md`](burnMatrix.md), and
independent confirmation that our read is right.

## What does NOT carry over
- Its transport (curl_cffi direct API) — against our browser-first rules.
- Its MQTT/DGW Messenger stack — not our scope.
- Its code, literally — AGPL vs our MIT.

## Recommended use
1. **Port the governor as pacing discipline into our browser flows/host** (our
   own code): per-day mutation budget (~40), lognormal gaps between steps, a
   warm-up curve, cooldown-on-softblock, checkpoint disengagement. This is the
   most likely single lever to stop the burns.
2. **Keep its registry/fixtures as a reference** next to our request docs, and
   consult `marketplace_fixture.json` when we run the rule-1 loop on the 1675030
   location error.
3. Do **not** adopt its transport or copy its code.
