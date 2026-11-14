---
title: "Sessions: check and sign-in"
---

# Sessions: check and sign-in

Whether an account is signed in, and signing it back in, is one capability with one state, one gate and one machine on every surface: the CLI (`log sessions check`, `log sessions signIn`), the MCP tools (`sessionsCheck`, `sessionsSignIn`), the console's Connections page and the hosted relay. Slices 3 and 4 of [platformNeutralSurfaces.md](../proposals/platformNeutralSurfaces.md). Rules 6, 25 and 94.

### REQ-SESSIONS-01: One check state for every surface

`CHECK_STATES` (`src/platformKit/sessionCheck/types.ts`) is `signedIn`, `signInNeeded`, `stopped`, `unknown`, `checking` and `skipped`. A session check's verdict is one of them (never `checking`), the console's last check is one of them, and the web console reads the same names. Rows written before this (`succeeded`, `running`, `unavailable`) are read as `signedIn`, `checking` and `unknown` (`checkStateOfStored`). Facebook, which is checked in its browser, and a platform with no session check are `skipped` with their code (`browserCheckRequired`, `noSessionCheck`), and Facebook's next step is still its browser sign-in.

Checked by: code and SubQ

### REQ-SESSIONS-02: One gate decides which accounts may be checked

`sessionGate` (`src/platformKit/sessionCheck/client.ts`) refuses a deactivated account (`accountDeactivated`), an account whose status is banned, dead, restricted or checkpoint, or whose session is checkpoint, restricted, shadowSuspect or accountWarning, and one whose last check the platform refused and that no newer session check has replaced (`accountCheckStopped`). `sessionsCheck` (through `gateReport`), the console's Check (`checkRefusal`) and the sign-in machine (through its check) call it, so an account held stopped is never hit again (rule 94). The console's Browser check, opened by the owner by hand, passes `openedByOwner`, which lifts only the last-check rule.

Checked by: code and SubQ

### REQ-SESSIONS-03: The check machine owns "checking", and a crash leaves no stuck row

`sessionCheckMachine` (`src/platformKit/sessionCheck/machine.ts`) goes `gating` → `checking` → `recording` → `done`, or ends in `busy`, `refused` or `failed`; it is built with `setup()`, named guards and actions, and every invoke is a promise actor with `onError`. `gating` runs the gate, then claims the account in `log.db` (`claimCheck`: one transaction, the row holds `checking`, the pid and the start time); a row already `checking` under a live process is `busy` (`accountCheckBusy`), per account. A platform call that throws is recorded as `unknown` (`checkFailed`), never left `checking`. `readStoredChecks` first reconciles every `checking` row whose process is gone to `unknown` (`checkInterrupted`), as the jobs table does for a lost job. The check's state lives only in the machine and that row: no module singleton, no busy flag, no in-memory proofs (the console's browser verification proof is a `log.db` state row too). `runSessionCheck` runs it; the CLI, the MCP tool and the console all use it. `sessions` is in `LONG_RUNNING`, so a check of every account outlasting its wait runs as a job.

Checked by: code and SubQ

### REQ-SESSIONS-04: One sign-in machine

`signInMachine` (`src/platformKit/signIn/machine.ts`) goes `checking` → `signedIn` when the platform already says so, `stopped` when the gate or the platform refused, or on to `opening` (route browser) or straight to `saving` (route cookies); then `waitingForOwner` → `saving` → `rechecking` → `signedIn`, `signInNeeded`, `stopped` or `failed`. Named guards and actions, `setup()`, and every invoke has `onError`; a step that throws ends in `failed` with its code and nothing is retried. The actors are supplied by the caller (`signInMachineWith`). `runSignIn` (`src/platformKit/signIn/client.ts`) runs it until it ends or waits for the owner; a machine waiting for the owner is kept as its persisted snapshot in `log.db` (`logDbSignInStore`, thirty minutes) and resumed by the next call, which `done` (the owner has finished) moves on to close and save.

Checked by: code and SubQ

### REQ-SESSIONS-05: Routes per platform, from one table

`SIGN_IN_ROUTES` (`src/cli/launch/helpers/start.ts`) gives each platform its routes: `browser` for every platform with a browser (the owner signs in on the login screen and the session is saved from the browser), and `cookies`, the masked prompt, where the platform has one (X, LinkedIn, Slack). X has no browser, so it is cookies only. The first route is the default; a route the platform lacks is refused (`signInRouteUnavailable`).

Checked by: code and SubQ

### REQ-SESSIONS-06: A signed-out browser never overwrites a session

When an account's browser closes, `keepSession` (`src/cli/live/index.ts`) checks that the platform's own sign-in cookies or token are in it (`browserSessionGate`, from each platform's session shape) before `savePlatformSession` writes. When they are, it saves them with `sessionState` loggedIn and `sessionCheckedAt`; when they aren't, the stored session is left untouched. Either way the outcome is recorded (`recordSessionSave`), the sign-in machine's `saving` reads it back and returns it to the caller, and a refused save ends in `signInNeeded` saying nothing was saved.

Checked by: code and SubQ

### REQ-SESSIONS-07: Every surface calls the same machine

`log sessions signIn --account <a> [--platform <p>] [--route browser|cookies] [--done] [--wait <s>]` and its MCP tool `sessionsSignIn` (generated from the form) run `runSignIn` with the live actors (`signInActorsOf`: the check machine, `inspectStart` on the platform's login page, the viewer, `inspectDo` stop, the recorded save, or the cookie command with its prompt). The console's Sign in (`accountSignIn`, methods cookies and browser) runs the same machine, the pasted cookies reaching the cookie command through the context's `cookiePrompts`, never by changing a module; its Browser check is offered for every platform with a browser, and closing that browser finishes a waiting sign-in (`finishConsoleSignIn`). The hosted relay lists `sessionsCheck`, `sessionsSignIn`, `instagramSessionCheck` and `slackSessionCheck` in `READ_TOOLS` and keeps `next`.

Checked by: code and SubQ

### REQ-SESSIONS-08: A login page off facebook.com is the owner's

`pageStateOf` (`src/browser/flow/helpers/pageState.ts`) resolves `loginForm` to Facebook's own sign-in only on facebook.com. On another platform's site it is `<platform>Login` (`platformLoginState`), whose next step is the owner signing in themself; on an unknown site it stays `loginForm` with the owner signing in.

Checked by: code and SubQ

### REQ-SESSIONS-09: A missing account is a structured `accountNotConfigured`

When no account by that name (on that platform, when one is given) is set up, `log sessions signIn` and `log sessions check --account` refuse with `accountNotConfigured` (`accountNotConfigured` in `src/platformKit/signIn/client.ts`), and the JSON answer is `{ ok: false, error: "accountNotConfigured", platform, account, next }`: the platform (null when none was given) and the step that adds the account (the console's Connections page, or `log localAccount add`). Through MCP the answer is always structured (`structuredContent.json`), so any host can show a connect step.

Checked by: code and SubQ

### REQ-SESSIONS-10: What the owner sees is decided from what the host declares

`sessionsSignIn` is one tool on the local and the hosted server. `signInCall` (`src/mcp/apps/signIn/client.ts`) runs it and, when the machine is waiting for the owner on a remote runtime, picks one rung per session (`signInRungOf`):

1. A host that draws MCP Apps gets the live browser inline: `structuredContent.view`, with the tool carrying `ui://log/browserView`; the view reads `view` as well as `json`.
2. A host without MCP Apps that declares `elicitation.url` is asked to open the console link with `elicitation/create` in `mode: "url"`. On a legacy session the local server sends it as a server-initiated request; on revision 2026-07-28 both servers return it in an `InputRequiredResult` and finish when the client retries with the answer and the `requestState` (REQ-MCP-24). A legacy session on the hosted server, which answers each POST with one JSON body, gets rungs 1 and 3 only.
3. Every other host gets plain text with the same link.

A local runtime (stdio) keeps today's answer: the browser window on this machine, no link.

The link (`issueSignInLink`, `src/platformKit/signInLink/client.ts`) is the console's Connections page with an opaque token, never the stream URL. It holds no account, platform or secret, works once (`take` deletes the `signInLink` state row as it reads it), expires after ten minutes, and grants nothing by itself: the console's `signInLinkOpen` operation (`/api/console/signInLink` locally, `POST /teams/{teamId}/console/signInLink` hosted) needs the person's own console session and refuses anyone but the person the link was made for (`signInLinkNotYours`, which does not use the link up; `signInLinkInvalid` for an unknown, used or expired one). Hosted, that person is the dispatch authority's `actorUserId` on both sides; locally it is the machine's owner, and the local console serves loopback only. The page then opens that account's Browser check.

The hosted `sessionsSignIn` opens the browser in the workspace through the same `inspectStart` the console's `browserOpen` uses. `browserView`'s answer for a missing browser names `sessionsSignIn`, not `inspectStart`.

Checked by: code and SubQ

### REQ-SESSIONS-11: Page states are classified per platform

The live viewer classifies a page with `viewer_state` (`python/browser/viewerState.py`). On facebook.com, and on a site that is no platform's, it uses Facebook's own flow (`classify`) as before. On another platform's site a password field is `<platform>Login` and a one-time code field `<platform>TwoStep` (both take the owner's input); a checkpoint, disabled, suspended or locked address with neither field is `<platform>Stopped` (a stop, rule 94); anything else is `unknown`. Each platform has a fixture under `python/fixtures/loginPages/`, and its hosts match `PLATFORM_SITES`.

Checked by: code and SubQ

### REQ-SESSIONS-12: The live view's polling writes no hosted journal row

The bridge runs a tool in `UNJOURNALED_TOOLS` (`src/console/operations/types.ts`: the four browser-view app tools and the console's `browserFrame` and `browserState`) without writing an `operations` row (`unjournaled` in `connectOnce`, `src/runtime/bridge/client.ts`), so a view polling about twice a second writes nothing. Every other tool is journaled as before.

Checked by: code and SubQ
