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
