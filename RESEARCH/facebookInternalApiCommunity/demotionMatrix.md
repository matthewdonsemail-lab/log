---
title: "Demotion matrix: which browser commands can move to fbk's direct API"
tags: [facebook, fbk, directApi, playwright, cli]
status: active
created: 2026-10-25
---

# What can we demote from Playwright to fbk's direct API?

Correcting my earlier call. I said the Marketplace seller-side "can't" move to
fbk because fbk's *shipped* surfaces are buyer/social-side only (`marketplace` =
`search` + `item_detail`). That was wrong about the ceiling: **fbk is built to be
extended** (`vendor/fbk/docs/10-extending-and-testing.md` §2 — give it a
`(friendly_name, doc_id, variables)` triple and it replays it through the governed
client), and **our Playwright runs already harvested exactly those triples** for
the seller-side calls (confirmed in `~/.logCli/rea/clientFacts.json`, e.g.
`useCometMarketplaceListingCreateMutation` doc_id `9551550371629242` with its sent
variables, `CometMarketplaceSetBuyLocationMutation`, the profile-picture set
mutations).

So the real line is not "buyer vs seller". It is:

> **The only thing that must stay in the browser is getting a logged-in session**
> (login, checkpoint, 2FA, passkey, identity/video selfie) — fbk's own login
> proved it defers that to a browser. **Everything after login is portable**,
> because we hold the doc_ids + variables.

## The mechanism (keeps the CLI / MCP identical)

Add one dimension to a command, like `browserDriver`/`commandBrowser` already do:
an **engine** = `browser` | `directApi`, resolved from account state (is a session
exported?) and the command. The command name, flags, and MCP tool stay exactly the
same; only the engine behind it changes. Destructive actions keep their `…Live`
tool + `confirmLive`. The governor (`python/pacing/pacer.py`) paces the directApi
engine; the browser onboarding exports the cookie jar fbk then uses.

## Tier 1 — MUST stay browser (the session floor)

| Command | Why it can't demote |
|---|---|
| `connect` | login + checkpoint + 2FA; fbk can't (tested on Barriere) |
| `host` (onboarding lane) | opens the day browser, signs in, clears checkpoints/identity |
| `inspect` | its whole job is to drive + record a real browser |
| `flow` (recording via `fromInspect`) | records browser steps; replay can demote, recording can't |
| warm-up (`warmup reel/feed/stages/…`) | its purpose is *browser-presence trust*; doing it over direct API defeats the point. Keep on the browser. |

## Tier 2 — demote NOW (fbk's shipped surfaces, on a logged-in account)

| Command | fbk surface.method |
|---|---|
| `read` group posts/comments | `groups.feed_read` |
| `read` members | `groups.members` |
| `poll` group | `groups.feed_read` (polled) |
| `join` group | `groups.join` |
| `conversations` / `conversation read` (live inbox) | `messenger.threads` / `messenger.history` |
| `conversation` reply (when asked) | `messenger.send` |
| own-profile post / comment / delete (`flowProfilePost`, `flowPostComment`, `flowDeletePost`) | `feed.publish` / `feed.comment` / `feed.delete_comment` |

## Tier 3 — demote by EXTENDING fbk from our own recordings (we hold the triples)

| Command | New fbk op (seed from clientFacts) | Triple status |
|---|---|---|
| `publish` / `flowMarketplaceListingPublish` | marketplace listing create | ✅ doc_id `9551550371629242` + variables |
| set location (publish step) | `CometMarketplaceSetBuyLocationMutation` | ✅ held (incl. the 1675030 error sample) |
| `check` / `scan` / `status` / `watch` (Selling status, listing state, item classify) | Selling + listing queries | ◑ partial — have `MarketplaceYouSellingUpsellCardQuery` + `MarketplaceYourListingDialogQuery`; the full Selling-listings query needs one clean capture |
| `profile` picture set | `profilePictureUpload` + `ProfileCometProfilePictureSetMutation` | ✅ held (cover photo MISS — needs one recording) |

## Honest caveats

1. **Server-side gates do not move.** Demoting `publish` to fbk is cheaper and
   better-paced, but it still hits the identity hold (`INTEGRITY_NEEDS_VERIFICATION`)
   — a Facebook wall, not a transport limit. Same checkpoints, same bans.
2. **doc_ids rotate per deploy** (confirmed by `vinikjkkj/wa-diff`). Each demoted
   op must be re-calibrated from a fresh capture periodically — which our
   `capture --docs` + `clientFacts.json` already track, so the browser runs keep
   the direct-API engine honest.
3. **Session dependency.** Every Tier 2/3 op needs a valid exported session, which
   only the browser onboarding (Tier 1) produces. The browser never goes away; it
   becomes the onboarding + calibration layer, and fbk becomes the cheap execution
   layer for everything post-login.

## The shape it points to

AdsPower/Playwright: **onboard, clear gates, export the session, and keep
capturing doc_ids.** fbk direct API (governed): **everything post-login** — group
listening, messenger, profile, and (via our harvested triples) the Marketplace
seller actions too. One CLI/MCP surface; an `engine` switch underneath.
