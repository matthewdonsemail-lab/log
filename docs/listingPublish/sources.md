# Sources: what was verified, and what not to copy

Read 2026-10-18 from the local checkouts in `REPOS/`. Nothing was re-run
for this doc. "Live" means a doc or commit in that repo says it worked
against facebook.com.

## facebook-camofox-client (FCC)

- **Live:** one real publish through the spike
  (`38629807913299080`, `docs/okf/marketplace_create.md:47-49`), which went to
  duplicate hold because the photo and title were reused (`:50-52`). Also: a dry
  run through `MarketplaceCreateAction` (`:53-54`), a photo added to
  `1583545526797714` (`docs/okf/listing_photo_update.md:17-21`), and a relist
  check that read ACTIVE.
- **Not live:** a real publish through `MarketplaceCreateAction`, a relist
  repost (`RELIST_LIVE=1`), and the group post selectors
  (`domain_groups/post_driver.py:3-8`).
- **Tests** cover dry run, auth, a category miss and an unknown category only
  (`tests/domain_marketplace/test_create.py:94-158`).

Bugs:

1. `_capture_dashboard_id` returns the first `/marketplace/item/` link on the
   page, which may belong to another listing (`create.py:203-219`).
2. It returns `published=True` even when no id was found (`:152-164`).
3. Relist: a fatal state `break`s and then rewrites the state file without the
   rest of the watchlist (`scripts/relist_watcher.py:105-106`, `:162`).
4. A new relist generation doesn't copy `title`, so the next health check
   can see a "missing card" and repost again (`:141-156`,
   `health.py:93-96`).
5. The first repost has no cooldown (`is_due` is true when
   `next_eligible_at` is None).
6. Pillow and httpx aren't in `pyproject.toml`. Without them, the photo
   change and the webhooks silently do nothing.
7. The API create path skips the `SingleFlight` lock the watcher uses
   (`api/app.py:71-83`).

## Listaro (`Listaro_backup`)

- **Live path:** the server `/api/process-posts` →
  `postToFacebookMarketplace`, on an AdsPower profile that's already
  logged in. The desktop agent is turned off (`posting-session-manager.ts:699-700`,
  `useAgent = false`). The Python posting engine (Inngest) isn't in the repo,
  but its cron is still registered (`src/lib/inngest/functions.ts:704-710`).

Bugs:

1. Success is returned with no listing URL or id
   (`facebook-poster.ts:2432-2443`). `posted_listings.fb_listing_id` is
   never written.
2. Nothing checks that the upload finished; a sleep stands in (`:1266`).
3. The AI selector fallback never runs (Promise `||`, `:1345`).
4. Condition values never match the FB labels (`process-posts/route.ts:707`).
5. Claim race: `pending → posting` has no status guard (`:360-363`), and the
   Inngest cron picks up the same rows (`functions.ts:201-203`).
6. The browser lock force-releases after 3 min, but a post takes up to 5
   (`browser-lock.ts:26`).
7. The agent re-runs a failed post once, which duplicates it if Publish
   had gone through (`agent/src/poll-loop.ts:79-83`).
8. The agent result route calls `increment_account_posts({account_id})`, but
   the parameter is `p_account_id` (`agent/result/route.ts:122-124`,
   `001:72`).
9. `/api/process-posts` and `/api/webhooks/posting` have no auth.
10. **A 2Captcha key is committed** in `auto-login/captcha-solver.ts:11-12`.

## listeningkit-hackathon (LKH)

- `apps/web/src/lib/listings/server.ts` is an in-memory Hono store, marked
  "Mock-backed for now" (`:82-87`). `POST /listings` makes up a 17-digit id
  and sets `underReview` without posting anything (`:91-137`).
- Its photos are data-URLs, ≤4. The comment "the live client will upload the
  same bytes" (`types.ts:100-102`) describes code nobody has written.
- Its status strings already match FCC's status action
  (`status.py:15-29`), and log-cli's port converts kebab to camelCase at the
  boundary.

## open-typesafe-camoufox

Stale (matt, 2026-10-18). It was an experiment with vision models. Only the
CaptchaKraken call notes carry over (`captchaKraken.md`).
