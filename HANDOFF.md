# Agent handoff — ListeningKit (2026-09-18)

Convex All Gas hackathon. **Submission deadline: Tue 22 Sep 2026, 12:00 PM PT.**
This is the working state for the next person or agent. Read `README.md` (architecture),
`AGENTS.md` (rules) and `hackathon.md` (build log) first.

## Where things stand

The product now runs on a real backend for **Reddit**, end to end, with no bridge server:

```
Sign in (Clerk) → onboarding (video, extension, token) → "What should we listen for?"
   → phrase + subreddit → Convex cron reads Reddit every 10 min → matches appear live
```

| Area | State |
|---|---|
| Auth | Clerk **dev** instance, Google/GitHub. Prod not set up. |
| Feed | Live `useQuery` subscription straight from Convex (`VITE_CONVEX_URL`). Hono bridge is off this path. |
| Keywords + matches | Real: `convex/keywords.ts`, `convex/hits.ts`, whole-word matching in `convex/lib/match.ts`. Page: `DashboardKeywordsLive.tsx`. |
| Reddit reading | Cron `watch.tick` every 10 min. Sources in order: official API (needs app creds) → Reddit plain feed → public mirror. Phrases show "checked N min ago" and a backup-data warning. |
| Ingest door | `POST /ingest` (per-user ingest key, hashed). Keys made on Settings → "Send posts in". |
| Connect an account | Chrome extension (`apps/extension`) copies a token → onboarding/Settings paste → `convex/sessions.ts` validates it and seals the cookie jar (AES-256-GCM). Local clients read it with `GET /session` + an ingest key. |
| Reddit adapter | `clients/reddit_push.py` → reddit-camofox-client → `/ingest`. Verified with a real login. |
| X / Facebook | **Not built.** Connectable (token saved) but nothing reads them. Keywords page marks them "Soon". |
| Everything else in the dashboard | Still the in-browser mock (messaging, listings, brand, analytics, API keys, groups). |

Checks that were green at the last commit: backend 53, web 162, `clients` 19, reddit-camofox-client 25;
`pnpm typecheck`, `pnpm typecheck:backend`, `pnpm run lint` (one old oxlint warning in
`communities/index.ts`), `pnpm --filter web build`.

## Hackathon gates — what is still missing

1. **A sponsor integration that works** (OpenAI, Firecrawl or AgentMail). None wired. Best fits:
   Firecrawl for community discovery, OpenAI for scoring hits and drafting replies.
2. ~~A live public URL~~ **Done:** https://tremendous-seahorse-330.convex.site (prod). Republish with `pnpm deploy:site`; backend with `pnpm exec convex deploy --yes`. Dev rehearsal copy: https://determined-cheetah-971.convex.site (`pnpm deploy:site:dev`).
3. **Repo public + `hackathon.md` at root** (done once pushed; confirm the repo is public).
4. **Video ≤ 3 minutes** of the real product. **Post on X or LinkedIn.**
5. **Submit** at `https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit`.

## To do — in priority order

### Must do before Tuesday
- [ ] **Sponsor integration** (gate 1). Suggested: `communities:discover` action calling Firecrawl search; OpenAI action scoring each hit.
- [x] **Deployed to `convex.site`** (prod `tremendous-seahorse-330`). Google sign-in verified on the public dev copy; test it on the prod URL too.
- [ ] **Clerk stays on the dev instance** (`internal-piglet-2301`), which works on the public URL but shows dev-mode behaviour. A production Clerk instance needs an owned domain.
- [x] **Prod env set:** `AUTH_ISSUER`, `AUTH_AUDIENCE`, `SESSION_ENCRYPTION_KEY` (its own key, never printed). Still to set on prod: `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`.
- [ ] **Reddit app for dependable freshness.** Create a free "script" app at reddit.com/prefs/apps, set `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` on dev and prod. Until then the hosted check mostly falls back to a mirror that can be ~9 h old (Reddit's plain feed returns 429 to Convex's shared address). The API path is unit-tested but **never run live**. Reddit's free API terms are non-commercial only.
- [ ] **Phone alerts (Bark).** Action calling Bark when a hit is recorded; per-user device key stored like a session (sealed, never returned to the browser).
- [ ] **Record the video, post, submit.**

### Next product work
- [ ] **X adapter** (twikit, `apps/twikit`, nested repo) using the connected token via `GET /session?platform=x`. Reuse `clients/listeningkit_ingest.py` (`push`, `fetch_session`).
- [ ] **Facebook adapter** (facebook-camofox-client, nested repo), same pattern. Flip `LIVE_PLATFORMS` in `apps/web/src/lib/platform-support.ts` as each ships.
- [ ] **Brand step is mock.** "Paste your website and we'll pull your brand info" only guesses a name from the domain (`extractBrandFromUrl`); nothing is fetched. Make it real (Firecrawl) and store the brand in Convex. The reveal step after it is mock too.
- [ ] **Chrome Web Store.** The extension is installed unpacked (Developer mode). Publishing needs review time. Also: Firefox build (add `browser_specific_settings`, test in Camoufox), and a check in real Chrome/Edge/Brave with a real login (only tested in Chromium 145 with fake cookies and a stubbed active tab).
- [ ] **Delete a post from the UI** (only an operator function exists: `feed.purgeAuthor`, run with `convex run`).
- [ ] **Replace remaining mock screens** with Convex-backed ones: messaging, listings, groups, brand, analytics, API keys.
- [ ] **Return validators** on Convex functions (the `convex-lint` hook flags them everywhere).
- [ ] **Pagination** for `feed.list` (today `take(200)` then filter in memory) and `hits.list` (`take(100)`).
- [ ] **Auto-reply / actions** (post, DM, join group) through the camofox clients using the connected login.
- [ ] Retire `apps/api` (the Hono bridge) once nothing depends on it; it is only used when `VITE_CONVEX_URL` is unset.

### Known rough edges
- Link posts read through Reddit's plain feed have no scores; the code keeps scores from an earlier read (`keepMetrics`).
- `hits` are recorded when a post is ingested, so a phrase added later will not match posts already stored until they are re-read ("Check now" re-reads).
- Removing a phrase deletes up to 500 of its matches per call.
- Onboarding shows a **DEV** step bar in dev builds only.
- The video on the onboarding step is a placeholder demo clip.
- `apps/reddit-camofox-client` got an extractor fix (reads each post card's attributes, link posts get an empty body); it lives in that **nested repo** and is not part of this commit. Commit it there.

## Environment (dev)

- Convex dev deployment `determined-cheetah-971`. Push functions: `pnpm exec convex dev --once --typecheck=disable`. Run a function: `pnpm exec convex run watch:tick`. Never run `convex logs` without `--history`/a timeout (it tails forever).
- Web: `pnpm --filter web exec vite --port 3000`. **Restart Vite after editing `apps/web/.env.local`** (env is baked at startup). Live mode needs `VITE_API_MODE=live` and `VITE_CONVEX_URL` (public URL, safe to expose).
- Env files (`apps/web/.env.local`, `apps/api/.env.local`) are git-ignored. Convex-side secrets live only in the deployment env.
- Git: push with `git push origin main`. Excluded from commits on purpose: `.omo/` (tool state), the two Convex skill folders `.agents/skills` and `.claude/skills` (42 MB of tool-installed files; reinstall with `npx convex ai-files install`), `skills-lock.json`, and the nested-git repos `apps/facebook-camofox-client`, `apps/reddit-camofox-client`, `apps/twikit`.
- Browser testing used Camoufox (headed, saved Clerk session, human-signed-in once) for the app and Playwright's Chromium for the extension. Chrome 137+ ignores `--load-extension`, and Camoufox (Firefox) cannot load a Chrome extension. The throwaway check scripts were kept outside the repo.

## Secrets and personal data (hard rules)
- Never print, log, commit or paste: cookie values, ingest keys, `SESSION_ENCRYPTION_KEY`, Reddit app secret, Clerk keys, deployment keys.
- Real cookie files stay in a gitignored folder (`apps/reddit-camofox-client/state/`). Delete them when done; Reddit's expire in about a day.
- Generate keys in the shell and pipe them straight into `convex env set`; check with names only (`convex env list | sed 's/=.*/=<hidden>/'`).
- `hackathon.md` is public: no email addresses, no account ids.

## Clerk instance settings changed outside git (dev instance `internal-piglet-2301`)
- `auth_username.required_for_sign_up = false` (2026-09-18): new Google sign-ups no longer get a "choose a username" prompt. Username is still usable for sign-in. Change or revert with `clerk config patch --instance dev --json '{"auth_username":{"required_for_sign_up":true}}'`. Any production Clerk instance must be configured the same way.

## Gotchas already paid for
- Clerk emotion CSS injects after our utilities. Beat it with scoped doubled-class selectors under `.lk-clerk` in `apps/web/src/index.css`; inputs need `max-height: none` and a real border.
- Installed `@clerk/react` uses signal-style hooks. Custom OAuth cards must use the classic `authenticateWithRedirect` handoff (`OnboardingAuth.tsx:startOAuth`).
- After adding Convex functions run `pnpm exec convex codegen` (`convex/_generated` is committed). `convex-test` needs EVERY function module in the test's `modules` map.
- A developer's `.env.local` leaks into Vitest; `apps/web/vitest.config.ts` blanks `VITE_CONVEX_URL` so tests stay hermetic.
- Extension pages forbid string `eval`, so Playwright `wait_for_function("...")` fails there; poll text instead.
- `old.reddit.com` feeds redirect bots to a login page. Fetch with `redirect: 'manual'` or a "200" may be the login page.
- Multi-line shell heredocs with quotes break in this environment; write files with the editor tool.

## Key files
- Backend: `convex/{keywords,hits,watch,reddit,sessions,ingest,feed,http,crons}.ts`, `convex/lib/{match,token,crypto,redditFeed,posts,accounts}.ts`, `convex/schema.ts`
- Web live path: `apps/web/src/lib/{convex,live-keywords,live-sessions,ingest-keys,platform-support}.ts`, `apps/web/src/components/{DashboardKeywordsLive,DashboardSettingsIngest,DashboardFeed}.tsx`, `apps/web/src/pages/onboarding/OnboardingSteps.tsx`
- Extension: `apps/extension/*`, packaged by `python scripts/build-extension.py` into `apps/web/public/listeningkit-extension.zip`
- Adapters: `clients/listeningkit_ingest.py`, `clients/reddit_push.py`
