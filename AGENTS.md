# AGENTS.md — listeningkit-hackathon

## Lint

- After making changes, run `pnpm run lint` and fix all errors.
- Design-system rules live in `.oxlintrc.json` (`@shadcn/lint` via Oxlint).
  No `@shadcn/lint` rules are enabled yet — see the
  [available rules](https://github.com/shadcn-ui/lint/blob/main/README.md#rules)
  and [configuration examples](https://github.com/shadcn-ui/lint/blob/main/docs/design-systems.md)
  when adding them.

## Form Rules (2026-09-13)

- **No auto-advance on card select inside forms.** Selecting a card/row/tile
  inside a multi-step form only marks the selection — it must NEVER advance
  the step on its own. Every step advances exclusively through the sheet's
  Continue/confirm button.
- Pattern: selection state + a `*Confirmed` flag per gated step
  (`platformConfirmed`, `accountConfirmed`, `groupConfirmed`); the sheet's
  `onConfirm` branches per step (`Continue` vs the final action); Back
  un-confirms (and clears the pick, matching existing reset behavior).
- When touching any form, audit ALL of its steps for select-to-advance logic
  (`onSelect`/`onClick` handlers that call `setStep`, flip derived step
  state, or fire the fetch that unlocks the next step) and convert them to
  the Continue gate. Applies to `DashboardGroupsForm`, `DashboardKeywordsForm`,
  `DashboardListingsForm`, and any future form.
- OAuth provider cards are exempt: the redirect IS the action, not a form
  step (`OnboardingAuth.tsx`).

## Clerk Appearance Overrides (2026-09-17)

- Clerk injects its emotion stylesheet at runtime **after** our utilities, so
  plain `appearance.elements` classes lose every equal-specificity tie
  (input height stuck at 36px, footer bands, zero-width borders). Win on
  **specificity**, not source order: scoped doubled-class selectors in
  `apps/web/src/index.css` under `.lk-clerk` (same pattern as the torph
  override already there).
- Two non-obvious traps: Clerk pins inputs with a hidden `max-height: 36px`
  (a `height` override alone computes to nothing — set `max-height: none`
  too), and draws input borders as a faint `box-shadow` ring
  (`border-width` computes to 0 — declare a real border).
- `useSignIn`/`useSignUp` return signal-style values in the installed
  `@clerk/react` (`{ fetchStatus, signIn/signUp }`, no `isLoaded`; the
  sign-up resource exposes `sso()`, not `authenticateWithRedirect`).
  Custom OAuth buttons must pair with the component that finalizes the
  flow: prefer the classic `authenticateWithRedirect` handoff (what the
  path-routed `<SignIn>`/`<SignUp>` handles at `…/sso-callback`), detected
  at runtime with `typeof === 'function'`, and fall back to `sso()` only
  when the classic entry point is absent (`OnboardingAuth.tsx:startOAuth`).

## Convex Workflow (2026-09-17)

- After adding/renaming functions, run `pnpm exec convex codegen` so
  `convex/_generated/api.d.ts` (committed — offline typecheck and
  convex-test depend on it) picks up the new modules.
- Push functions to the dev deployment without watching:
  `pnpm exec convex dev --once --typecheck=disable` (repo typechecks
  separately via `pnpm typecheck:backend`).
- `convex-test` resolves function references **only** through the test
  file's `modules` map — every module under test must be listed
  (`'./accounts.ts'` alongside `'./reddit.ts'`), or calls fail with
  `Could not find module for: "<name>"`.
- Ingestion honesty rules: failures throw (`ConvexError`), junk rows are
  skipped and counted, demo rows are never substituted. Owner isolation
  is structural — cron-style jobs can't impersonate users, so ingestion
  stays user-triggered (`reddit:syncSubreddit` action) until per-user
  scheduling exists.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Live Backend Rules (2026-09-18)

- **Talk to Convex directly on the live path.** `VITE_API_MODE=live` with `VITE_CONVEX_URL` uses `ConvexProviderWithClerk` and `useQuery`; one-shot calls use `convexClient()` in `apps/web/src/lib/convex.ts`. Without `VITE_CONVEX_URL` the old Hono bridge is used. Every wire result is validated with zod before use; failures throw, never fall back to demo rows.
- **Owner comes from the token, never an argument.** Every public Convex function calls `requireOwner(ctx)`. Ingest keys resolve to an owner server-side. No function accepts a user id from the client.
- **Errors are sentences a person can act on.** User-facing failures are `ConvexError` strings such as "We could not find your Reddit login. Log in at reddit.com, then copy the token again." Show them through toasts, never inline, and never include a cookie, key or secret value.
- **Sources are ordered and honest.** Reddit reading tries the official API, then the plain feed, then the mirror, and records which answered (`lastSource`). Anything that can be stale must say so in the UI.
- **Re-reads must not erase data.** A source without scores (`metricsKnown: false`) keeps the counts an earlier read stored.
- **Hits are recorded at ingest time** through `writePosts`, so every path (Sync now, cron, `/ingest`) matches identically.

## AI Scoring Rules

- Post text is untrusted. It goes only inside the fenced `<post>` block of the prompt, and every model reply is parsed and clamped (`parseScore`) before it is stored. Never act on model output beyond storing a score, intent and reason.
- Model errors must not echo response bodies or headers (they can carry keys). `askModel` reports only the provider and HTTP status.
- Scoring must fail safe: no provider, a gateway error or a bad reply leaves a match unscored and the rest of the pipeline untouched. A match gives up after three failed attempts. `AI_SCORING=off` must stop every model call.
- Test with fake `fetch` replies only; never call a real model from tests.

## Firecrawl And AgentMail Rules

- Website text (Firecrawl) is untrusted. `parseBrandFacts` checks, trims, caps and de-fillers every field, and only an absolute https logo survives. It never stores "N/A"-style answers as facts. Add a test whenever you add a field.
- Reading a website spends credits: keep it behind sign-in, the 30-second cooldown (`brand:claim`) and `normalizeWebsite` (no localhost, numeric or internal hosts). Errors are plain words from our own library and never carry the key or a response body.
- The business summary reaches the scoring prompt only inside the fenced `<business>` block, capped at 500 characters.
- Email goes out through AgentMail as plain text only, with a fixed subject. Never put post text in a subject, never add an HTML part, and never accept more than one address. Keep the limits: 5 matches per email, one email per person per 10 minutes, one test per minute.
- A failed send must not mark matches as sent (`alerts:markSent` runs only after a successful send).
- Tests use fake `fetch` replies. The Firecrawl call was also checked once against the real service; do the same after changing the request or the schema.

## Local Helpers (X, Reddit)

- A helper reads a platform from the person's own computer and only pushes to `/ingest`. It gets its login from `GET /session` and its phrases from `GET /phrases`, both authenticated by the owner's ingest key; never add a way to fetch someone else's login or phrases.
- Helpers must be polite: spaced requests with jitter, a floor on the polling interval (X: 2 minutes), a cap on phrases per round, and a clean stop when the platform says slow down. A refused login is reported in plain words and stops the run.
- X is read in real Chrome (`clients/x_browser.py`, Playwright with `channel="chrome"`; Camoufox is kept as `browser="camoufox"` but X answers its searches with "Something went wrong" even with a good login) because twikit's request signing breaks whenever X changes its site. The reader depends on X's page structure (`article[data-testid="tweet"]`, `time`, `tweetText`, `reply`, `like`), so when X changes it, fix the selectors in `x_browser.py` and re-check against the real site with no login (it must report a login wall as `Unauthorized`). Never trust a stand-in page alone. Keep the "use an account you can afford to lose" notice wherever it is described.
- Facebook works like X: `clients/facebook_push.py` reuses `x_push.run_once` (with `platform`, `search`, `to_post`) and `clients/facebook_browser.py` reads the post cards (`[role="feed"] [aria-posinset]`, or `div[role="article"]` in older layouts) from `facebook.com/search/posts` in real Chrome; the message is `data-ad-rendering-role="story_message"`, and the post address only appears after hovering the timestamp link. Facebook renames its page elements often, so when nothing is read set `LISTENINGKIT_FB_DEBUG_DIR` to save a screenshot and the page text, fix the selectors, and re-check against the real site (a fake login must come back as `Unauthorized`). The selectors were fixed against a real logged-in page; re-check them the same way when Facebook changes (the reader's debug dump also saves the page HTML without scripts).
- Browser tests start a real browser and take about a minute or two; `x_browser.py` retries page reads that race a redirect and reloads twice on X's "Something went wrong". Set `LISTENINGKIT_X_DEBUG_DIR` to save a screenshot and the page text when no tweets are found. The helper keeps only tweets whose text contains the phrase, because X pads a quiet search with sidebar and timeline posts.
- Test helpers with fake clients injected into `run_once`, and test the browser reader in a real headless browser against a stand-in page, then once against the real site with no login.

## Secrets And Logins (hard rules)

- Never print, log, commit or paste cookie values, ingest keys, `SESSION_ENCRYPTION_KEY`, the Reddit app secret, Clerk keys or deployment keys, in chat, tests, docs or commit messages. Tests use obviously fake values.
- Generate a key in the shell and pipe it straight into `pnpm exec convex env set NAME "$(...)"`; verify with names only (`convex env list | sed 's/=.*/=<hidden>/'`).
- Connected logins are stored only as AES-256-GCM ciphertext (`convex/lib/crypto.ts`). No query may return a cookie jar to a browser; only `GET /session` with the owner's own ingest key may.
- Real cookie files live in gitignored folders only. Ask people to save their own; never ask them to paste cookies into chat.
- `hackathon.md` is public: no email addresses, no account ids.

## Testing Conventions

- After adding Convex functions run `pnpm exec convex codegen`. `convex-test` needs every function module in the test's `modules` map.
- `apps/web/vitest.config.ts` blanks `VITE_CONVEX_URL` so a developer's `.env.local` cannot reroute tests. Tests that need the live path stub it with `vi.stubEnv`.
- Mock `convex/browser` with a small class (`setAuth`, `query`, `mutation`, `action`) to test web transports.
- The extension and the server must agree on the token: keep `apps/web/src/lib/__tests__/extension-contract.test.ts` green whenever `apps/extension/lib.js` or `convex/lib/token.ts` changes, then run `python scripts/build-extension.py`.
- Real-browser checks: Camoufox for the app (a person signs in once; the session persists in the profile), Playwright's Chromium for the extension (Chrome 137+ ignores `--load-extension`; Camoufox cannot load Chrome extensions). Extension pages forbid string `eval`, so poll text instead of `wait_for_function("...")`.
- Reddit: never trust a "200" from `old.reddit.com` (it redirects bots to a login page); fetch with `redirect: 'manual'`.
- Write multi-line files with the editor tool; long shell heredocs with quotes break here.
