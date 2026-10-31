# Record → document → machine → command → MCP

How log-cli learns a Facebook procedure and then runs it on any account. Built
2026-10-19 (rules 25-31 in AGENTS.md). Everything here runs live and headed,
through every gate a run passes (proxy, device, locale, self-check, waking
hours, launch budget, raw HAR).

## The pipeline

| Stage | Command | What it produces |
| --- | --- | --- |
| 1. Look | `log inspect start --account <a> --url <facebook url>`, then `log inspect do <action>` | One headed Camoufox (async API) kept open; every step recorded in order: accessibility snapshot with refs, screenshot, the step's own HAR, rea's reading of that HAR at once |
| 2. Read | `log facebook capture --docs` | `docs/platforms/facebook/<domain>/<request>.md`: every request Facebook's pages made, with what it sends and reads, which step fires it, timings, errors, reasoning and rea Evidence (rule 27) |
| 3. Map | `log inspect map [<run>] [--all]` | The recording as states and transitions (`flow.md`, `machine.json`); `--all` collates every run |
| 4. Flow | `log flow fromInspect <run> --name <n> --rename text1=firstName …` | `src/browser/flow/definitions/<n>.json`: each step's element by role and name, each step's confirming request, params; and `docs/platforms/facebook/flows/<n>.md` |
| 5. Machine | `createFlowMachine(definition)` | An XState machine: one state per step, `failed` on the first step that fails |
| 6. Run | `log flow run <n> --account <a> --set k=v … [--live]` | Dry run lists the filled steps; `--live` runs the machine through an inspect session, so the run is recorded again and mapped |
| 7. MCP | the `log` MCP server | Every saved flow is a tool of its own (`flowProfileSetup`), params by name, `live` needs `confirmLive` |

## Inspect actions

| Action | Acts on Facebook (needs `--live`) | Does |
| --- | --- | --- |
| `goto <url>`, `snapshot`, `back`, `wait [s]` | no | Move or look |
| `click <ref>`, `type <ref> <text>`, `press <key>`, `upload <ref> <file>` | yes | One action by the snapshot's ref |
| `solve` | yes | Facebook's text captcha → 2Captcha's image solver → type and send (`solve.json`) |
| `signIn`, `code` | yes | Email, password and authenticator code from the private login.json (rule 21) |
| `clickRole`, `fillRole`, `uploadRole`, `waitRole` | yes | The flow runner's steps: an element by role and accessible name, plus `expect` (the request that confirms it) |
| `stop` | no | Close, save the session |

Each step settles when the network has been quiet 1.5 s (up to 15 s, longer
while an `expect` is pending). Typed values are redacted in snapshots. A HAR
over rea's 32 MB limit gets a copy without static bodies for rea; the raw HAR
is kept (rule 19). `--now` skips only the 10-minute launch gap (rule 30).

## The cursor (rule 32)

`python/human/humanMouse.py`, used by every session. Fitted to matt's own mouse,
recorded by `python/human/recordMouse.py` (run it for N seconds, then it analyses
the recording; `--analyze <file>` re-analyses one). What the recording showed
and the module reproduces: one continuous velocity profile per move, an early
speed peak and a long settle, overshoot-and-return about half the time, loose
loops around whatever is being looked at, short pauses, ~25 % still. Every
step writes `mouse.json` (its legs) and `mouseSamples.json` (every emitted
point, in the recorder's format), so the same analyser compares ours with his:

```bash
python python/human/recordMouse.py 60                      # record your hand, then analyse
python python/human/recordMouse.py --analyze <run>/steps/02_wait60s/mouseSamples.json
```

Camoufox's humanize stays on but is capped to 20 ms per hop in these
sessions (`launch_kwargs(…, own_trajectory=True)`): measured, its default
cost ~100 ms per 5 px hop, which is what made earlier motion crawl.

## Saved flows

| Flow | Recorded on | Proven on | Steps |
| --- | --- | --- | --- |
| `profileSetup` | Lancaster (`61593967241658`) | Bethlehem (`61594063207669`), 13/13 | profile picture, cover photo, name; confirmed by `ProfileCometProfilePictureSetMutation`, `ProfileCometCoverPhotoUpdateMutation`, `useFXIMUpdateNameMutation` |

## What the recordings showed (2026-10-19)

- **A first sign-in on a vendor account is flagged at once.** Lancaster's and
  Bethlehem's first sign-ins went to "We suspect automated behaviour"
  (`/checkpoint/601051028565049/`); Dismiss sends `FBScrapingWarningMutation`
  and lands signed in.
- **The lock path, in order** (Allentown, the same as Philadelphia):
  "Confirm that you're human to use your account" [Continue] →
  `useUFACSubmitActionMutation` (5 s) → text captcha → 2Captcha (1.5 s) →
  [Continue] → `useUFACSubmitActionMutation` (3 s) → "Confirm your identity
  with a video selfie". Only a person clears the last screen. A second visit
  resumes at the step it was left on.
- **Allentown was locked between 09:21 and 10:40 UTC with no run of ours in
  between.** Philadelphia's sign-ins came from three exit IPs in 90 minutes and
  15 launches; Allentown's and the new accounts' exit IPs stayed fixed.
- **Connect reads the page 1 s after Enter**, sees the login form still there,
  and tries a second time; the first Enter had worked. Its next read must wait
  for the page to change.
- **The listing's location is not set by any request in the run**: it arrives
  in the create page itself (`sell_location`), so a wrong Marketplace location
  is an account setting.

## Where things are

| Path | What |
| --- | --- |
| `python/session/inspectSession.py` | The inspect session (async Camoufox) |
| `src/browser/inspect/` | Talking to it: commands, replies, rendering |
| `src/rea/inspectMap/` | Recording → states and transitions |
| `src/browser/flow/` | Recording → definition, machine, docs; `definitions/` |
| `src/cli/inspect/`, `src/cli/flow/` | The commands |
| `src/mcp/server/helpers/toolsFromFlows.ts` | Flows as MCP tools |
| `src/rea/facebookClient/` | The per-request docs build |
| `skills/inspect`, `skills/flow`, `skills/profileSetup`, `skills/reaCapture` | The routines |
| `~/.logCli/runs/{inspect,flow}/<time>_<account>/` | Recordings (local, never committed) |
