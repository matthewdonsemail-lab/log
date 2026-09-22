# Agent handoff — ListeningKit (2026-09-22)

Convex All Gas hackathon. **Submission deadline: Tue 22 Sep 2026, 12:00 PM PT.**
This is the working state for the next person or agent. Read `README.md` (architecture),
`AGENTS.md` (rules) and `hackathon.md` (build log) first.

## 2026-09-22 session — feed score chips + click-to-inspect (NEW, read this first)

What landed this session (all uncommitted, not yet deployed):

1. **Score + intent joined onto the feed.** `convex/feed.ts` `feed:list` now does a
   per-post join to `hits` and returns the best match on each post:
   `score` (number|null), `intent` (string|null), `reason` (string|null) and the NEW
   `keywordId` (string|null — the best hit's keyword, null when unscored). A post that
   matched no keyword returns all four as null. The wire adds the same fields in
   `apps/web/src/lib/feed/remote.ts` (zod: `score`/`intent`/`reason` nullable,
   `keywordId` optional-nullable) and the mock adds them on every
   `MOCK_FEED_ITEMS` row in `apps/web/src/lib/feed/mock.ts` (two rows are
   intentionally `score: null` so the hidden-chip path stays exercised).
   The Convex change is NOT yet codegen'd/pushed — do `pnpm exec convex codegen`
   then `pnpm exec convex dev --once --typecheck=disable` when you have deployment
   access; the mock path works without it.

2. **The verdict strip under each card.** `FeedCardFrame` (
   `apps/web/src/components/cards/FeedCardFrame.tsx`) renders a `ScoreChip` under the
   card when `score != null`: a solid brand-blue `Badge` (from `@listeningkit/ui`)
   showing `score · intentLabel(intent)` (reuse `intentLabel` from
   `apps/web/src/lib/live-keywords.ts`, same source as the Keywords page), and under it
   a full-width 50/50 two-button row, `Reply with AI` (lucide `Bot`) and `Auto-Reply`
   (lucide `Zap`), both `bg-[#2A8CFF]` white text. Those two buttons are visual
   placeholders only — the reply action underneath is NOT built (see
   "Draft a response" below).
   **The whole card is the click target that opens the inspect sheet** (the user was
   explicit: the chip itself is not the button). `FeedCardFrame` takes
   `onInspect?: () => void` and puts `onClick` on the outer frame div (plus
   `cursor-pointer` when set); the two action buttons `event.stopPropagation()` so
   they don't trigger it. `DashboardFeed` threads `onInspect` through
   `FeedGrid` → `FeedColumn` → `FeedCardFrame` in both `ConvexFeed` and
   `ClassicFeed` (mock).

3. **Click a card → the post opens in the inspect sheet.** Both feed variants own
   `inspectedEvent` / `relatedEvent` / `communityEvent` (`FirehoseEvent`) state,
   register `DashboardEventInspectForm` / `DashboardRelatedKeywordsForm` /
   `DashboardRelatedCommunitiesForm` in the dashboard form slot via
   `useDashboardFormSlot()` (same recipe as `DashboardAnalyticsPage.tsx` lines
   140–165), and close by nulling the state. `toInspectEvent(item)` at the top of
   `DashboardFeed.tsx` adapts a `FeedItem` into the `FirehoseEvent` the inspect sheet
   expects: `keywordId = item.keywordId ?? 'feed'` (the 'feed' fallback keeps the
   mock path working; the live Convex value is the real keyword UUID),
   `type: 'mention'`, sentiment mapped from `intent`
   (looking_for_help|buying → positive, complaint → negative, else neutral),
   `text = title + body joined`, `url` is a placeholder. **The inspect sheet is a
   shared component keyed on `event` — nothing inside it needs to change.**

Verified: `pnpm --filter web exec tsc --noEmit` is clean except a pre-existing
unused `TAB_CHANNEL` in `DashboardBrand.tsx` (not this session's work). Lint passes
with only pre-existing warnings. Has NOT been visually confirmed in a browser yet.

## 2026-09-22 session — the two visual bugs that still need fixing

Read `AGENTS.md` for the dashboard visual rules (all status pills go through
`Badge`, squircle system, `DASHBOARD_DESIGN.md`).

### Bug 1 — "Draft a response" renders as a dropdown, should be a form

In `DashboardEventInspectForm.tsx` the "What next?" block lists
`AI_NEXT_ACTIONS` (`related` / `communities` / `reply`). The first two open their own
sheets (`onFindRelated` / `onFindCommunities` → `DashboardRelatedKeywordsForm` /
`DashboardRelatedCommunitiesForm`). `reply` ("Draft a response", `MessageSquareText`
icon, `DashboardEventInspectForm.tsx:86,424`) instead sets
`openAction = 'reply'` and inlines `ReplyDraftPanel` (`:137–205`, `:438`) — a
collapsed/expandable block that shows a "Send reply" button, the drafted text, and a
"suggested resource" card with an Attach toggle. The user says this reads as a
dropdown and is inconsistent with how the related-keywords / related-communities
forms render (each is a full form with a chain-of-thought stream and the sheet's
own confirm footer). **Fix: make "Draft a response" open a proper
`DashboardEventInspectForm`-style sheet of its own** — a new
`DashboardReplyForm` (suggested name) registered in the same form-slot pattern
(`useDashboardFormSlot`), with its own `DashboardFormSheet` (title, subtitle,
confirm footer that actually sends/copies the reply) instead of an inline expand.
The reply content logic already exists and is mock/deterministic:
`buildAiQuery` + `draftReply` + `suggestResource` in
`apps/web/src/lib/brand/query.ts` (a matched enabled autoreply sends verbatim, else
the brand voice answers the event's words; the attached resource is picked from the
brand's own site/offers). `DashboardEventInspectForm.tsx:256–259` already builds the
`AiQuery` and snapshots the brand per event — reuse that. The reply currently has
no real send path (the "Send reply" button only flips local `sent` state
(`ReplyDraftPanel:141,158`)); the live client is not wired yet, so the new form's
confirm should stay a local "copied / would-post" state until the messaging
surface (still a mock page, hidden on the live menu) lands.

### Bug 2 — `ai-elements` chain-of-thought / chain-joints are broken

`apps/web/src/components/ai-elements/chain-of-thought.tsx` imports
`Badge` from `@/components/ui/badge` (`:3`) but that module does not exist in
this repo — the dashboard `Badge` lives in `@listeningkit/ui`
(`packages/ui/src/badge.tsx`). Worse, that Badge has no `secondary` variant
(`packages/ui/src/badge.tsx:29–57` defines neutral/muted/success/danger/warning/info/
brand/solid/trigger) so `ChainOfThoughtSearchResult` (`chain-of-thought.tsx:238–248`)
references a variant the real Badge cannot render. The same file also uses
`text-muted-foreground`, `bg-muted`, `shadow-hard` classes
(`:82,:88,:115,:209,:219,:267,:270`) which may not resolve under this app's Tailwind
setup. The geometry in `chain-joints.ts` is a deliberate full-literal-string system
(it says so in its header comment): Tailwind only generates CSS for classes it can
read statically, so the `h-[64px]`, `bottom-auto`, `bottom-0` overrides are
**never built with template interpolation** (`:4–8,35–41`) — if you add a new
measurement, add a new named literal there, don't interpolate a number in.
The step's rail/track math (`chain-of-thought.tsx:113–203`) is tightly coupled to
the icon-box sizes (`size-7` = 28px nested, `size-10` = 40px trunk, via
`ICON_40` in chain-joints) and the `elbow`/`compact` flags; changing any one
number breaks the flush joints. **The fix is to make these two files actually
compile and render** (point `Badge` at `@listeningkit/ui`, use a variant it has,
and reconcile the `muted-*`/`shadow-hard` tokens with what this app defines),
then walk one real chain (e.g. the RelatedMentionsChain in
`DashboardRelatedKeywordsForm.tsx`) and check the elbows/rails still land flush.
Nothing downstream should need to change once the two files are sound.

### After fixing both, verify

- `pnpm --filter web exec tsc --noEmit` and `pnpm run lint` (repo root, per AGENTS.md).
- `pnpm --filter web exec vite --port 3000` and walk: dashboard feed (mock) →
  click a card → inspect sheet → "Draft a response" opens as a real form; then
  open the related-keywords chain and confirm the chain-of-thought stream renders
  with flush rails/elbows.
- No Convex deploy is needed for either fix (both are web-only). The feed
  score/join work above is the only Convex-side change, and it can wait on
  deployment access.

## Where things stand

The product runs on a real Convex backend, no bridge server, for Reddit end to end, X and Facebook
through a helper on the person's own computer, a scoped public API with phrase writes and webhooks
(Pro), and an MCP server so AI agents can use it as tools. Deployed to prod and checked there.

```
Sign in (Clerk) → onboarding (Firecrawl facts read, live page map, typed competitors, keyword pick, typed groups — every stage real or skippable, video, extension, token)
   → keywords dashboard (add the phrase there; the reveal's pick is saved locally, dashboard prefill not yet wired) → phrase + platform → Convex cron/helper reads it
   → matches appear live, scored, emailed if strong, or read by an API key or an AI agent
```

| Area | State |
|---|---|
| Auth | Clerk **dev** instance, Google/GitHub. Prod not set up (needs an owned domain). |
| Feed | Live `useQuery` subscription straight from Convex; each card now carries the best hit's `score · intent` (verdict strip under the card) and the whole card opens the post in the inspect sheet. |
| Keywords + matches | Real, with the Free plan limit (1 phrase per platform) enforced server-side. |
| Reddit reading | Cron every 10 min: official API (needs app creds, not set) → plain feed → public mirror. |
| X, Facebook | Helpers on the person's own computer (`clients/x_push.py`, `facebook_push.py`), through a mandatory operator proxy. Both run against real throwaway accounts on dev. Not re-run on prod (need a prod-connected login). |
| AI scoring | Built and tested, **never run live: no `OPENAI_API_KEY` set**. Without it, matches have no score and webhooks have nothing real to send. |
| Website reading (Firecrawl) | Real, checked on prod: facts extract + page map under separate cooldowns. The reveal renders only mapped pages, typed competitors/groups, and keyword suggestions derived from the read offerings — every stage shows the plain-words error and skips on failure. No mock rows anywhere in onboarding. |
| Email alerts (AgentMail) | Real, checked on dev and prod (a test email arrived on both). |
| Public API | Real: keys with scopes (`read`, `write:phrases`, `webhooks`), phrase writes, webhooks (Pro feature, off by default). Checked on prod. |
| MCP server | Real: `POST /mcp`, same keys and scopes. Claude Code and Claude Desktop setup checked on prod; Cursor and Hermes snippets match their docs but were not run; ChatGPT is not supported. |
| Dashboard pages | Feed, Keywords, Analytics, Accounts, Docs, API, Settings are real. **Groups, Listings, Brand and Messages are still in-browser mock and are hidden from the live site's menu** (they redirect to the feed); they still show in demo mode. |
| Notifications (header bell) | **In progress** — bell button is still a no-op (`DashboardHeader.tsx`). Plan: floating `@floating-ui/react` panel (same recipe as `DashboardSidebar.tsx`/`AccountTooltip.tsx`) listing notification types (new match / strong match / email digest / Bark push) with deep links, fed by `notifications:recent`; Bark connections move from `localStorage` (`lib/notifications/bark.ts`) into Convex via the committed `barkConnections` table + `notifications.ts` module. Code exists in the repo; **codegen and deploy are blocked until someone has access to the Convex deployment** (no `convex dev`/`code gen` access right now). |

Checks green at the last commit: backend 216, web 203, `clients` 86, reddit-camofox-client 25;
`pnpm typecheck`, `pnpm typecheck:backend`, `pnpm run lint`, `pnpm --filter web build`.
**That pre-dates the reveal rework and the 2026-09-22 auth/onboarding UI overhaul; no suite has run since — treat all green-checks as unverified until the next run.**

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
- [ ] **Make "Draft a response" a real form** (inline expand → its own `DashboardFormSheet` registered in the form slot, like the related-keywords/communities forms). Content logic already exists in `lib/brand/query.ts`; only the surface needs reworking. See "Bug 1" above.
- [ ] **Fix `ai-elements` chain-of-thought + chain-joints** (nonexistent `@/components/ui/badge` import, a `Badge` variant that doesn't exist, and possibly-unresolved `muted-*`/`shadow-hard` tokens). Keep chain-joints' full-literal-string rule intact. See "Bug 2" above.
- [ ] Facebook: read comment counts, and the address for posts whose timestamp link could not be hovered.
- [ ] Chrome Web Store listing for the extension (only tested in Chromium 145 unpacked so far).
- [ ] Replace the remaining mock pages (Groups, Listings, Brand's Agent Memory section, Messages) with Convex-backed ones, or remove them for good instead of hiding them.
- [ ] Return validators on Convex functions (the `convex-lint` hook flags them everywhere).
- [ ] Pagination for `feed.list` and `hits.list` (both `take` a bounded window today).
- [ ] Retire `apps/api` (the Hono bridge); only used when `VITE_CONVEX_URL` is unset.
- [ ] MCP: OAuth, so ChatGPT's connectors can use it.
- [ ] **Notifications (header bell) — see "Where things stand".** In repo: `convex/schema.ts` (`barkConnections` table), `convex/notifications.ts` (`recent` + Bark `create/list/save/removeConnection`), and the plan above. To finish: (1) `pnpm exec convex codegen` + push the new module (`pnpm exec convex dev --once --typecheck=disable`), (2) add the refs to `apps/web/src/lib/convex.ts` (`notifications:recent`, `bark:*` — note the module is `notifications`, not `bark`), (3) build `DashboardNotifications.tsx` + wire the bell, (4) switch `DashboardSettingsNotifications.tsx` to the live store with a one-time localStorage import.

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
- Backend: `convex/{keywords,hits,watch,reddit,sessions,ingest,feed,http,crons,scoring,brand,alerts,plan,apiKeys,publicApi,webhooks,notifications}.ts`, `convex/lib/{match,token,crypto,redditFeed,posts,accounts,scopes,keywordOps,proxy,firecrawl,agentmail,webhookUrl,webhookSign,mcp}.ts`, `convex/schema.ts` (in-progress: `notifications.ts` + the `barkConnections` table — not yet codegen'd/pushed, see above; `feed.ts` now joins `hits` for score/intent/keywordId — not yet codegen'd either)
- Web live path: `apps/web/src/lib/{convex,live-keywords,live-sessions,ingest-keys,api-keys-live,webhooks-live,live-brand,live-alerts,plans}.ts`, `apps/web/src/components/{DashboardKeywordsLive,DashboardSettingsIngest,DashboardFeed,DashboardApiLive,DashboardWebhooks,DashboardSidebar}.tsx`, `apps/web/src/pages/onboarding/OnboardingSteps.tsx`
- Feed + inspect (this session): `apps/web/src/components/cards/FeedCardFrame.tsx` (`ScoreChip` + card-level `onInspect`), `apps/web/src/components/DashboardFeed.tsx` (`toInspectEvent` adapter + form-slot registration in both feed variants), `apps/web/src/components/DashboardEventInspectForm.tsx` (the shared inspect sheet; "Draft a response" inline panel = Bug 1), `apps/web/src/components/ai-elements/{chain-of-thought.tsx,chain-joints.ts}` (Bug 2)
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
