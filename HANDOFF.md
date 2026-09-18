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
| X | **Built; the run with a real X account is the open item.** `clients/x_push.py` reads the connected X login and the person's X phrases from the app, searches X in real Chrome (`clients/x_browser.py`, Playwright; needs Chrome installed) and pushes tweets to `/ingest`. Checked end to end in the real app with only X's results replaced by a stand-in, and against the real X site with no login (it recognises X's login wall). twikit was tried first and is broken by X's site rebuild ("Couldn't get KEY_BYTE indices"); kept as `--engine twikit`. Runs on the person's own computer. |
| Facebook | **Not built.** Connectable (token saved) but nothing reads it. Keywords page marks it "Soon". |
| Everything else in the dashboard | Still the in-browser mock (messaging, listings, brand, analytics, API keys, groups). |

Checks that were green at the last commit: backend 75, web 164, `clients` 52, reddit-camofox-client 25;
`pnpm typecheck`, `pnpm typecheck:backend`, `pnpm run lint` (one old oxlint warning in
`communities/index.ts`), `pnpm --filter web build`.

## TODO for Matthew (repo owner: needs an account, a credential or owner rights)

**Who owns what** (checked 2026-09-18):
- **GitHub repo** `matthewdonsemail-lab/log`: owned by Matthew (public). Work has been pushed as the collaborator `deepmroot` (write access), so repo *settings* (visibility, branch protection, collaborators) are Matthew's to change.
- **Convex project** `listeningkit-hackathon`, team `max-kentan` (dev `determined-cheetah-971`, prod `tremendous-seahorse-330`): team owner is Matthew (confirmed by the team). Matthew can run every `convex env set` / `convex deploy` below after `npx convex login`, and is the one who can upgrade the plan. Anyone else who deploys must be a member of that team.
- **Clerk app** "Log" (dev instance `internal-piglet-2301`): owned by Mandeep's personal Clerk account (the developer who built this), not Matthew's. Item 6 needs Mandeep to add Matthew as a member of the Clerk application (dashboard, Configure, Members), or Matthew creates a new Clerk app and repoints `VITE_CLERK_PUBLISHABLE_KEY`, `AUTH_ISSUER` and `AUTH_AUDIENCE`. Item 5 (testing sign-in) needs no Clerk access.
- **OpenAI, Reddit, Luma, vibeapps.dev**: whichever account Matthew registers under; the key and the submission should belong to the same person who registered for the hackathon.

Do these in order. None of them needs code changes; the code for each is already in `main`.
Run every command in your own terminal and never paste a key into chat, a commit or a doc.
Deadline for the whole list: **Tue 22 Sep 2026, 12:00 PM PT**.

- [ ] **1. OpenAI API key (turns on match scoring).** Get a key at platform.openai.com (check the hackathon Luma / confirmation email first: OpenAI is a sponsor and may have given credits). Then:
  ```
  pnpm exec convex env set OPENAI_API_KEY <key>
  pnpm exec convex env set --prod OPENAI_API_KEY <key>
  pnpm exec convex run scoring:tryScore '{"phrase":"need a plumber","title":"Need a plumber in Austin"}'
  ```
  Expect `{ provider: "openai", model: "gpt-4o-mini", score: { score: ~90, ... } }`. Then add the phrase `ipad` in r/ipad on the site, press Check now, and confirm badges and reasons appear. Then deploy: `pnpm exec convex deploy --yes`. This is the hackathon's sponsor-integration gate.
- [ ] **2. Reddit app (makes Reddit reads fresh).** Log in to Reddit, open reddit.com/prefs/apps, "create another app", type **script**, redirect `http://localhost:8080`. Copy the client id (under the app name) and the secret, then:
  ```
  pnpm exec convex env set REDDIT_CLIENT_ID <id>
  pnpm exec convex env set REDDIT_CLIENT_SECRET <secret>
  pnpm exec convex env set --prod REDDIT_CLIENT_ID <id>
  pnpm exec convex env set --prod REDDIT_CLIENT_SECRET <secret>
  pnpm exec convex run watch:tick
  ```
  Expect `sources.reddit` to be at least 1 and no "backup source" warning on the Keywords page. Reddit's free API terms cover non-commercial use only.
- [ ] **3. Confirm hackathon registration** at https://luma.com/convex-allgas-hackathon (no confirmation email was found in the inbox that was searched).
- [ ] **4. Check the extension in your real browser.** In Chrome, Edge or Brave open `chrome://extensions`, turn on Developer mode, Load unpacked, choose `apps/extension`. Log in to reddit.com, click the icon, expect "Ready. You are logged in to Reddit", copy the token and paste it in onboarding. It was only tested in Chromium 145 with fake cookies. If the popup says anything else, send the exact words.
- [ ] **4b. Try the X helper with a real X account** (use one you can afford to lose: automating a logged-in X session can go against X's terms). Log in to x.com, copy a token with the extension and paste it in Settings, add an X phrase on the Keywords page, make a key under Settings, Send posts in, then set `LISTENINGKIT_INGEST_URL` and `LISTENINGKIT_INGEST_KEY`, then `python clients/x_push.py --phrases "good morning" --count 5 --dry-run --verbose --show` (a browser window opens and searches X), then with your saved phrases, then without `--dry-run`. Expect tweets to appear as matches and the phrase to say "checked ... by your helper". Report exactly what it prints if anything fails.
- [ ] **5. Sign in on the production URL** https://tremendous-seahorse-330.convex.site with a brand-new Google account (an incognito window is fine). Expect to go straight to "Where should we listen?" with no username prompt.
- [ ] **6. Production Clerk instance (optional but cleaner).** Needs a domain Matthew owns and Mandeep's help with the Clerk application (see "Who owns what"): `clerk deploy`, add custom Google/GitHub OAuth credentials in the Clerk dashboard, `clerk env pull --instance prod`, set `AUTH_ISSUER` / `AUTH_AUDIENCE` on the prod Convex deployment, rebuild with `pk_live_...`, `pnpm deploy:site`. Until then production runs on the Clerk dev instance, which works but is not for real customers. Any new instance also needs username made optional (see "Clerk instance settings changed outside git").
- [ ] **7. Convex plan (optional).** The Convex AI Gateway needs a paid plan on team `max-kentan`; Matthew, as team owner, can upgrade it. With an OpenAI key it is not needed.
- [ ] **8. Chrome Web Store (optional, after the deadline).** Publish `apps/extension` so people can skip Developer mode.
- [ ] **9. Submission package** (the person who registered for the hackathon submits). Record the ≤ 3-minute video of the real product (sign in, add a phrase, matches with scores appear, connect an account), post about it on X or LinkedIn, then submit at https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit with the public repo, the live URL https://tremendous-seahorse-330.convex.site and the video. The repo is public and `hackathon.md` is at its root.

The other open to-dos (X and Facebook adapters, real brand step, phone alerts, Firecrawl discovery, deleting posts from the UI, pagination, and the rest) are listed below under "To do".

## Hackathon gates — what is still missing

1. **A sponsor integration that works** (OpenAI, Firecrawl or AgentMail). **OpenAI scoring is built and tested but not yet run live**: set `OPENAI_API_KEY` on dev and prod (`convex env set`), then check with `pnpm exec convex run scoring:tryScore '{"phrase":"need a plumber","title":"Need a plumber in Austin"}'`. The Convex AI Gateway is not enabled on the free plan. Still open: Firecrawl for community discovery, OpenAI to draft replies.
2. ~~A live public URL~~ **Done:** https://tremendous-seahorse-330.convex.site (prod). Republish with `pnpm deploy:site`; backend with `pnpm exec convex deploy --yes`. Dev rehearsal copy: https://determined-cheetah-971.convex.site (`pnpm deploy:site:dev`).
3. **Repo public + `hackathon.md` at root** (done once pushed; confirm the repo is public).
4. **Video ≤ 3 minutes** of the real product. **Post on X or LinkedIn.**
5. **Submit** at `https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit`.

## To do — in priority order

### Must do before Tuesday
- [ ] **Turn OpenAI scoring on**: see "TODO for Matthew" item 1. Kill switch `AI_SCORING=off`; model override `AI_MODEL`.
- [ ] **Second sponsor integration** (optional): Firecrawl `communities:discover`.
- [x] **Deployed to `convex.site`** (prod `tremendous-seahorse-330`). Google sign-in verified on the public dev copy; test it on the prod URL too.
- [ ] **Clerk stays on the dev instance** (`internal-piglet-2301`), which works on the public URL but shows dev-mode behaviour. A production Clerk instance needs an owned domain.
- [x] **Prod env set:** `AUTH_ISSUER`, `AUTH_AUDIENCE`, `SESSION_ENCRYPTION_KEY` (its own key, never printed). Still to set on prod: `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`.
- [ ] **Reddit app for dependable freshness**: see "TODO for Matthew" item 2. Until then the hosted check mostly falls back to a mirror that can be ~9 h old (Reddit's plain feed returns 429 to Convex's shared address); the API path is unit-tested but never run live.
- [ ] **Phone alerts (Bark).** Action calling Bark when a hit is recorded; per-user device key stored like a session (sealed, never returned to the browser).
- [ ] **Record the video, post, submit**: see "TODO for Matthew" item 9.

### Next product work
- [x] **X adapter** built (`clients/x_push.py`); needs the real-account check in "TODO for Matthew" item 4b. Later: a hosted worker so a normal person does not have to run anything (today the helper runs on their own computer).
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

- The prod site was last deployed before scoring and the X helper: run `pnpm exec convex deploy --yes` then `pnpm deploy:site` to publish them.
- Convex dev deployment `determined-cheetah-971`. Push functions: `pnpm exec convex dev --once --typecheck=disable`. Run a function: `pnpm exec convex run watch:tick`. Never run `convex logs` without `--history`/a timeout (it tails forever).
- Web: `pnpm --filter web exec vite --port 3000`. **Restart Vite after editing `apps/web/.env.local`** (env is baked at startup). Live mode needs `VITE_API_MODE=live` and `VITE_CONVEX_URL` (public URL, safe to expose).
- Env files (`apps/web/.env.local`, `apps/api/.env.local`) are git-ignored. Convex-side secrets live only in the deployment env.
- Git: push with `git push origin main` (authenticated as the collaborator `deepmroot`; the repo owner is `matthewdonsemail-lab`). Excluded from commits on purpose: `.omo/` (tool state), the two Convex skill folders `.agents/skills` and `.claude/skills` (42 MB of tool-installed files; reinstall with `npx convex ai-files install`), `skills-lock.json`, and the nested-git repos `apps/facebook-camofox-client`, `apps/reddit-camofox-client`, `apps/twikit`.
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
