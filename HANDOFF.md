# Agent handoff — ListeningKit dev session (2026-09-17)

Pushed and clean at `75969c8` on `main` (`matthewdonsemail-lab/log`).
This file is local-only context for the next agent. Do not assume it is
committed — re-read the listed source files before acting.

## What works right now (all verified live today unless noted)

- **Auth (Clerk dev instance):** onboarding → provider cards (Google/GitHub)
  → OAuth → session → guarded `/dashboard`. Sign-out lands clean.
  Last live session seen: Google OAuth as mandeepsinghwani@gmail.com.
- **Live reads:** `GET /api/accounts` + `GET /api/feed` return 200,
  owner-scoped, through Clerk convex-JWT → API JWKS verify → Convex.
- **Live Reddit sync (new, NOT yet clicked by a human):** dashboard feed has
  an `r/[subreddit]` + **Sync now** control (live mode only) →
  `POST /api/feed/sync` → Convex action `reddit:syncSubreddit` (Arctic Shift
  public mirror, no keys) → ingest under the caller's auto-created
  `Reddit public ingest` account → feed reloads. Junk skipped/counted,
  failures throw, never demo rows.
- **Gates:** web 127 / backend 10 / api 8 tests pass; `pnpm typecheck`,
  `pnpm run lint` clean (one pre-existing oxlint warning in
  `communities/index.ts`).

## Pending — in order

1. **Human Sync-now click.** Needs the user's Google session (agents can't
   complete Google OAuth). Ask them to sign in at
   `http://localhost:3000/sign-in`, open the dashboard feed, click Sync now,
   and report the toast. Then verify rows in `feed:list`.
2. **Clerk production.** Deferred — needs a user-owned domain.
   `clerk deploy` is interactive (human terminal only). Then enable
   Google/GitHub with custom OAuth creds in the Dashboard (dev shared keys
   don't work in prod), `clerk env pull --instance prod`, Convex prod env,
   rebuild with `pk_live_...`, `railcode deploy`.
3. **API bridge has no prod home.** `apps/api` is localhost:4000 only; the
   Railcode static frontend has no `/api`. Decide hosting before claiming
   live-mode prod.
4. **Next product slice (per docs order):** real account session
   verification → ingestion scheduling/scopes → actions → brand AI.
   (`docs/backend-integration-audit.md` §Proposed implementation order.)

## Environment (dev, all local)

- Web `pnpm dev` → :3000 · API `pnpm --filter api dev` → :4000 ·
  Vite proxies `/api` → 4000. Convex dev deployment
  `determined-cheetah-971` (push: `pnpm exec convex dev --once
  --typecheck=disable`).
- Env files (`apps/web/.env.local`, `apps/api/.env.local`) are git-ignored
  and hold dev keys. `VITE_API_MODE=live`. Railcode never ships `.env*`.
- Browser automation: Chrome on remote-debugging `:9222`; puppeteer-core
  via `C:/Users/mande/.pi/agent/skills/pi-skills/browser-tools/`.
  The user's main profile may hold their Google + Clerk session — prefer a
  fresh incognito context (`browser.createBrowserContext()`) for signed-out
  checks so you never disturb their login. Beware stale tabs: close
  `localhost:3000` duplicates before asserting (mixed auth states across
  tabs look exactly like redirect loops). `waitForFunction` needs
  `polling: 500` (rAF stalls in background tabs).
- Git auth is `deepmroot` (write access granted). Push with plain
  `git push origin main`. Excluded from commits on purpose: `.omo/`
  (tool state) + nested-git repos `apps/{facebook,reddit-camofox-client}`
  + `apps/twikit` (would record broken gitlinks).

## Gotchas already paid for (see AGENTS.md)

- Clerk emotion CSS injects after our utilities: beat it with scoped
  doubled-class selectors under `.lk-clerk` in `apps/web/src/index.css`.
  Inputs also need `max-height: none` (hidden 36px pin) and a real border
  (Clerk draws a faint `box-shadow` ring, `border-width` computes to 0).
- Installed `@clerk/react` uses signal-style hooks (`{ fetchStatus,
  signIn/signUp }`, no `isLoaded`). Custom OAuth cards must use the
  classic `authenticateWithRedirect` handoff (what path-routed
  `<SignIn>`/`<SignUp>` finalizes at `…/sso-callback`), with `sso()` as
  fallback only — `OnboardingAuth.tsx:startOAuth`. A past `sso()`-only
  version caused a user-visible redirect loop.
- After adding Convex functions run `pnpm exec convex codegen`
  (`convex/_generated` is committed). `convex-test` needs EVERY module in
  the test file's `modules` map or calls fail with `Could not find
  module for`.
- `feed:list` always returns `variant: 'post-text'`, `timeAgo: ''` — cards
  render text-only for live rows. Keywords/scopes are not wired to live
  fetch (`DashboardFeed` calls `getFeed()` with no args).
- `hackathon.md` header + log, `README.md` Live-backend section, and
  `AGENTS.md` rules were updated for all of the above — read them.

## Key files for the next slice

- `convex/reddit.ts` (action + normalize + ensurePublicAccount),
  `convex/reddit.test.ts`, `convex/feed.ts`, `convex/accounts.ts`
- `apps/api/src/app.ts` + `backend.ts` (+ `app.test.ts`)
- `apps/web/src/lib/feed/{index,remote}.ts`,
  `apps/web/src/components/DashboardFeed.tsx`
- `apps/web/src/pages/onboarding/OnboardingAuth.tsx`,
  `apps/web/src/components/AuthGate.tsx`
