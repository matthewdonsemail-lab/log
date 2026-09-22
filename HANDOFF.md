# Agent handoff — ListeningKit (2026-09-21)

Convex All Gas hackathon. **Submission deadline: Tue 22 Sep 2026, 12:00 PM PT.**
This is the working state for the next person or agent. Read `README.md` (architecture),
`AGENTS.md` (rules) and `hackathon.md` (build log) first.

## Where things stand

The product runs on a real Convex backend, no bridge server, for Reddit end to end, X and Facebook
through a helper on the person's own computer, a scoped public API with phrase writes and webhooks
(Pro), and an MCP server so AI agents can use it as tools. Deployed to prod and checked there.

```
Sign in (Clerk) → onboarding (website read by Firecrawl, video, extension, token)
   → "What should we listen for?" → phrase + platform → Convex cron/helper reads it
   → matches appear live, scored, emailed if strong, or read by an API key or an AI agent
```

| Area | State |
|---|---|
| Auth | Clerk **dev** instance, Google/GitHub. Prod not set up (needs an owned domain). |
| Feed | Live `useQuery` subscription straight from Convex. |
| Keywords + matches | Real, with the Free plan limit (1 phrase per platform) enforced server-side. |
| Reddit reading | Cron every 10 min: official API (needs app creds, not set) → plain feed → public mirror. |
| X, Facebook | Helpers on the person's own computer (`clients/x_push.py`, `facebook_push.py`), through a mandatory operator proxy. Both run against real throwaway accounts on dev. Not re-run on prod (need a prod-connected login). |
| AI scoring | Built and tested, **never run live: no `OPENAI_API_KEY` set**. Without it, matches have no score and webhooks have nothing real to send. |
| Website reading (Firecrawl) | Real, checked on prod. |
| Email alerts (AgentMail) | Real, checked on dev and prod (a test email arrived on both). |
| Public API | Real: keys with scopes (`read`, `write:phrases`, `webhooks`), phrase writes, webhooks (Pro feature, off by default). Checked on prod. |
| MCP server | Real: `POST /mcp`, same keys and scopes. Claude Code and Claude Desktop setup checked on prod; Cursor and Hermes snippets match their docs but were not run; ChatGPT is not supported. |
| Dashboard pages | Feed, Keywords, Analytics, Accounts, Docs, API, Settings are real. **Groups, Listings, Brand and Messages are still in-browser mock and are hidden from the live site's menu** (they redirect to the feed); they still show in demo mode. |

Checks green at the last commit: backend 216, web 203, `clients` 86, reddit-camofox-client 25;
`pnpm typecheck`, `pnpm typecheck:backend`, `pnpm run lint`, `pnpm --filter web build`.

## TODO for Matthew (repo owner: needs an account, a credential or owner rights)

**Who owns what:**
- **GitHub repo** `matthewdonsemail-lab/log`: owned by Matthew (public). Work is pushed as the collaborator `deepmroot` (write access), so repo *settings* are Matthew's to change.
- **Convex project** `listeningkit-hackathon` (dev `determined-cheetah-971`, prod `tremendous-seahorse-330`): team owner is Matthew. He can run every `convex env set` / `convex deploy` below after `npx convex login`.
- **Clerk app** "Log" (dev instance `internal-piglet-2301`): owned by Mandeep's personal Clerk account. A production Clerk instance needs Mandeep to add Matthew as a member, or a new Clerk app.
- **OpenAI, Reddit, Luma, vibeapps.dev**: whichever account Matthew registers under.

None of the items below need code changes. Never paste a key into chat, a commit or a doc.

- [ ] **1. OpenAI API key (turns on match scoring — the sponsor-integration gate, and the biggest open item).**
  ```
  pnpm exec convex env set OPENAI_API_KEY <key>
  pnpm exec convex env set --prod OPENAI_API_KEY <key>
  pnpm exec convex run scoring:tryScore '{"phrase":"need a plumber","title":"Need a plumber in Austin"}'
  ```
  Expect `{ provider: "openai", model: "gpt-4o-mini", score: { score: ~90, ... } }`. Then add a phrase on the site, press Check now, and confirm badges and reasons appear.
- [ ] **2. Reddit app (makes Reddit reads fresh instead of a mirror that can be hours old).** reddit.com/prefs/apps, "create another app", type **script**, redirect `http://localhost:8080`.
  ```
  pnpm exec convex env set REDDIT_CLIENT_ID <id>
  pnpm exec convex env set REDDIT_CLIENT_SECRET <secret>
  pnpm exec convex env set --prod REDDIT_CLIENT_ID <id>
  pnpm exec convex env set --prod REDDIT_CLIENT_SECRET <secret>
  ```
- [ ] **3. Confirm hackathon registration** at https://luma.com/convex-allgas-hackathon.
- [ ] **4. Check the extension in your real browser**, and **try the X helper with a real X account** (see `README.md`, X helper). Use an account you can afford to lose.
- [ ] **5. Sign in on prod** with a brand-new Google account and confirm it lands on onboarding.
- [ ] **6. Production Clerk instance (optional).** Needs an owned domain and Mandeep's help (see "Who owns what").
- [ ] **7. Submission package.** Record the ≤3:00 video, post on X or LinkedIn, submit at https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit. Kit: [`SUBMISSION.md`](SUBMISSION.md).

## Hackathon gates

1. **A sponsor integration that works** (OpenAI, Firecrawl or AgentMail). Firecrawl and AgentMail are live and checked on prod. **OpenAI scoring is built but has never run live** — item 1 above.
2. **A live public URL:** done, https://tremendous-seahorse-330.convex.site. Republish with `pnpm deploy:site`; backend with `pnpm exec convex deploy --yes`.
3. **Repo public + `hackathon.md` at root:** done.
4. **Video ≤3 minutes, posted on X or LinkedIn:** not done.
5. **Submit:** not done.

## To do — in priority order

### Must do before Tuesday
- [ ] Turn OpenAI scoring on (item 1). Kill switch `AI_SCORING=off`; model override `AI_MODEL`.
- [ ] Record the video, post, submit (item 7).
- [ ] Reddit app for dependable freshness (item 2).

### Next product work
- [ ] Facebook: read comment counts, and the address for posts whose timestamp link could not be hovered.
- [ ] Chrome Web Store listing for the extension (only tested in Chromium 145 unpacked so far).
- [ ] Replace the remaining mock pages (Groups, Listings, Brand's Agent Memory section, Messages) with Convex-backed ones, or remove them for good instead of hiding them.
- [ ] Return validators on Convex functions (the `convex-lint` hook flags them everywhere).
- [ ] Pagination for `feed.list` and `hits.list` (both `take` a bounded window today).
- [ ] Retire `apps/api` (the Hono bridge); only used when `VITE_CONVEX_URL` is unset.
- [ ] MCP: OAuth, so ChatGPT's connectors can use it.

### Known rough edges
- Link posts read through Reddit's plain feed have no scores; the code keeps scores from an earlier read.
- `hits` are recorded at ingest time, so a phrase added later will not match posts already stored until re-read ("Check now").
- Removing a phrase deletes up to 500 of its matches per call.
- The webhook address check cannot resolve DNS (documented in the API docs and `AGENTS.md`).
- The video on the onboarding step is a placeholder demo clip.

## Environment (dev)

- Prod was last redeployed on 2026-09-21 with the MCP server, hiding the mock pages, and the Vercel build fix. Scoring stays idle on prod until `OPENAI_API_KEY` is set. Redeploy after code changes with `pnpm exec convex deploy --yes` then `pnpm deploy:site`.
- Convex dev deployment `determined-cheetah-971`. Push functions: `pnpm exec convex dev --once --typecheck=disable`. Run a function: `pnpm exec convex run watch:tick`. Never run `convex logs` without `--history`/a timeout.
- Web: `pnpm --filter web exec vite --port 3000`. **Restart Vite after editing `apps/web/.env.local`.** Live mode needs `VITE_API_MODE=live` and `VITE_CONVEX_URL`.
- Env files (`apps/web/.env.local`, `apps/api/.env.local`) are git-ignored. Convex-side secrets live only in the deployment env.
- Git: push with `git push origin main` (authenticated as the collaborator `deepmroot`). Commits carry no AI attribution trailer (the user asked for none). `.omo/` (tool state) is excluded on purpose; the nested-git repos `apps/facebook-camofox-client`, `apps/reddit-camofox-client`, `apps/twikit` must never be `git add`-ed (they are separate git repos, not submodules — check `git status` before a broad `git add`).
- Browser testing used Camoufox (headed, saved Clerk session) for the app and Playwright's Chromium for the extension. Chrome 137+ ignores `--load-extension`, and Camoufox (Firefox) cannot load a Chrome extension.

## Secrets and personal data (hard rules)
- Never print, log, commit or paste: cookie values, ingest keys, API keys, `SESSION_ENCRYPTION_KEY`, Reddit app secret, Clerk keys, deployment keys.
- Real cookie files stay in a gitignored folder (`apps/reddit-camofox-client/state/`). Delete them when done; Reddit's expire in about a day.
- Generate keys in the shell and pipe them straight into `convex env set`; check with names only (`convex env list | sed 's/=.*/=<hidden>/'`).
- `hackathon.md` is public: no email addresses, no account ids.
- **Rotate the Firecrawl and AgentMail keys after the deadline** (both were pasted into a chat during development).

## Clerk instance settings changed outside git (dev instance `internal-piglet-2301`)
- `auth_username.required_for_sign_up = false`: new Google sign-ups no longer get a "choose a username" prompt. Revert with `clerk config patch --instance dev --json '{"auth_username":{"required_for_sign_up":true}}'`. Any production Clerk instance must be configured the same way.

## Gotchas already paid for
- Clerk emotion CSS injects after our utilities. Beat it with scoped doubled-class selectors under `.lk-clerk` in `apps/web/src/index.css`; inputs need `max-height: none` and a real border.
- Installed `@clerk/react` uses signal-style hooks. Custom OAuth cards must use the classic `authenticateWithRedirect` handoff.
- After adding Convex functions run `pnpm exec convex codegen`. `convex-test` needs EVERY function module in the test's `modules` map.
- A developer's `.env.local` leaks into Vitest; `apps/web/vitest.config.ts` blanks `VITE_CONVEX_URL` so tests stay hermetic.
- Extension pages forbid string `eval`, so Playwright `wait_for_function("...")` fails there; poll text instead.
- `old.reddit.com` feeds redirect bots to a login page. Fetch with `redirect: 'manual'` or a "200" may be the login page.
- Multi-line shell heredocs with quotes break in this environment; write files with the editor tool.
- `git add apps` sweeps in the nested-git client repos and any stray untracked folder under `apps/`; check `git status --short` before committing and add specific paths instead.
- The static-hosting upload to Convex sometimes drops the connection mid-upload ("fetch failed" / "SocketError: other side closed"); retry with `--concurrency 1`.
- Vercel needs its own `vercel.json` (build command, output directory, SPA rewrite) or it guesses wrong and every deployment fails; the real site is the Convex one, the Vercel copy has no `VITE_CONVEX_URL` and runs in demo mode.

## Key files
- Backend: `convex/{keywords,hits,watch,reddit,sessions,ingest,feed,http,crons,scoring,brand,alerts,plan,apiKeys,publicApi,webhooks}.ts`, `convex/lib/{match,token,crypto,redditFeed,posts,accounts,scopes,keywordOps,proxy,firecrawl,agentmail,webhookUrl,webhookSign,mcp}.ts`, `convex/schema.ts`
- Web live path: `apps/web/src/lib/{convex,live-keywords,live-sessions,ingest-keys,api-keys-live,webhooks-live,live-brand,live-alerts,plans}.ts`, `apps/web/src/components/{DashboardKeywordsLive,DashboardSettingsIngest,DashboardFeed,DashboardApiLive,DashboardWebhooks,DashboardSidebar}.tsx`, `apps/web/src/pages/onboarding/OnboardingSteps.tsx`
- Extension: `apps/extension/*`, packaged by `python scripts/build-extension.py` into `apps/web/public/listeningkit-extension.zip`
- Adapters: `clients/listeningkit_ingest.py`, `clients/reddit_push.py`, `clients/x_push.py`, `clients/facebook_push.py`
- Docs: `apps/docs/content/docs/guide/{index,using-listeningkit,helpers,api,mcp,developers}.mdx`

## Deploying the site (docs ship inside it)

`pnpm deploy:site` (prod) and `pnpm deploy:site:dev` run `scripts/build-site.mjs`: it builds the web app, exports the docs app as static files (`DOCS_EXPORT=1 next build`) and copies them into `apps/web/dist`, so the docs live at `/docs.html` and `/docs/<page>.html`. Convex hosting only serves exact file names, so the app redirects a docs address without `.html` to the page file (`StaticDocsRedirect`). Docs page files over 900 KB are left out (uploads of files that large kept failing). If the upload itself drops the connection, retry with `--concurrency 1`. Backend first when the schema changed: `pnpm exec convex deploy --yes`.

## Still open before submitting

- `OPENAI_API_KEY` on dev and prod (scoring, and therefore real alert emails and a real webhooks demo).
- Record the video, post, and submit: everything is written down in [`SUBMISSION.md`](SUBMISSION.md).
- Rotate the Firecrawl and AgentMail keys after the deadline (pasted into a chat).
- Decide whether to build out or delete the mock pages (Groups, Listings, Brand's Agent Memory, Messages) after the deadline.
