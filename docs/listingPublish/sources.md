# Sources: what was proven, and what not to copy

The publish research draws on three earlier projects. This page says what each one actually proved live against facebook.com, and lists the bugs found in each so they aren't carried into log. Read it before reusing code or ideas from any of them.

It was read from local checkouts on 2026-10-18; nothing was re-run for this page. "Live" means a doc or commit in that project says it worked against facebook.com.

## The Camoufox client

A Python browser driver built on Camoufox.

**Proven live:**

- One real publish through the spike script (`docs/okf/marketplace_create.md:47-49`). It went to duplicate hold because the photo and title were reused (`:50-52`).
- A dry run through `MarketplaceCreateAction` (`:53-54`).
- A photo added to a live listing (`docs/okf/listing_photo_update.md:17-21`).
- A relist check that read ACTIVE.

**Not proven live:** a real publish through `MarketplaceCreateAction`, a relist repost (`RELIST_LIVE=1`), and the group post selectors (`domain_groups/post_driver.py:3-8`).

**Tests** cover only a dry run, auth, a category miss and an unknown category (`tests/domain_marketplace/test_create.py:94-158`).

**Bugs:**

1. `_capture_dashboard_id` returns the first `/marketplace/item/` link on the page, which may belong to another listing (`create.py:203-219`).
2. It returns `published=True` even when no id was found (`:152-164`).
3. When relisting hits a fatal state, it `break`s and then rewrites the state file without the rest of the watch list (`relist_watcher.py:105-106`, `:162`).
4. A new relist generation doesn't copy `title`, so the next health check can see a "missing card" and repost again (`:141-156`, `health.py:93-96`).
5. The first repost has no cooldown (`is_due` is true when `next_eligible_at` is None).
6. Pillow and httpx aren't in `pyproject.toml`. Without them, the photo change and the webhooks silently do nothing.
7. The API create path skips the `SingleFlight` lock the watcher uses (`api/app.py:71-83`).

## The production poster

A TypeScript poster using Playwright over AdsPower, used in production.

**The live path** is the server route `/api/process-posts` → `postToFacebookMarketplace`, on an AdsPower profile that's already signed in. Its desktop agent is switched off (`posting-session-manager.ts:699-700`, `useAgent = false`). A Python posting engine isn't in the repo, but its scheduled job is still registered (`functions.ts:704-710`).

**Bugs:**

1. It returns success with no listing URL or id (`facebook-poster.ts:2432-2443`); the listing id is never saved.
2. Nothing checks the upload finished; a fixed wait stands in (`:1266`).
3. The AI selector fallback never runs (a Promise tested with `||`, `:1345`).
4. Condition values never match Facebook's labels (`process-posts/route.ts:707`).
5. Two workers can claim the same post: `pending → posting` has no status guard (`:360-363`), and the scheduled job picks up the same rows (`functions.ts:201-203`).
6. The browser lock force-releases after 3 minutes, but a post can take up to 5 (`browser-lock.ts:26`).
7. The desktop agent re-runs a failed post once, which duplicates it if Publish had gone through (`agent/src/poll-loop.ts:79-83`).
8. The agent's result route calls `increment_account_posts({account_id})`, but the parameter is `p_account_id` (`agent/result/route.ts:122-124`).
9. Its posting routes have no auth.
10. A captcha-service API key is committed in its source.

## The dashboard

A listings dashboard with no browser.

- `apps/web/src/lib/listings/server.ts` is an in-memory store marked "Mock-backed for now" (`:82-87`). `POST /listings` makes up a 17-digit id and sets `underReview` without posting anything (`:91-137`).
- Its photos are data URLs, at most 4. The comment saying the live client "will upload the same bytes" (`types.ts:100-102`) describes code nobody has written.
- Its status names already match the Camoufox client's status action (`status.py:15-29`), and log's port converts them to camelCase at the boundary.

## The vision-model experiment

Out of date. It was an experiment with vision models. Only its CaptchaKraken notes carry over, in [CaptchaKraken](captchaKraken.md).
