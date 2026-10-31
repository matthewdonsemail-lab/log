# From a recording to a reusable flow

This is how log learns to do something on a website once and then repeat it on any account. You do the task step by step with `log inspect`, which records everything; log turns that recording into a flow, a state machine, a command and an MCP tool. Read this if you want to automate a new task, or understand where the saved flows come from.

It works on every platform with a browser path (Facebook, Reddit). Every run passes the same gates as any other: proxy, device, locale, self-check, active hours, launch budget and a raw recording of the network (HAR).

## The pipeline

| Stage | Command | What it produces |
| --- | --- | --- |
| 1. Look | `log inspect start --account <a> --url <url>`, then `log inspect do <action>` | One visible browser kept open. Every step is recorded in order: an accessibility snapshot with element refs, a screenshot, the step's own HAR, and rea's reading of that HAR. |
| 2. Read | `log facebook capture --docs` | `docs/platforms/<platform>/<domain>/<request>.md`: every request the site's pages made, what it sends and reads, which step fires it, timings, errors, and rea's evidence from the site's own code. |
| 3. Map | `log inspect map [<run>] [--all]` | The recording as states and transitions (`flow.md`, `machine.json`). `--all` combines every run. |
| 4. Flow | `log flow fromInspect <run> --name <n> --rename text1=firstName …` | `src/browser/flow/definitions/<n>.json`: each step's element by role and name, the request that confirms each step, and the parameters. Plus its doc in `docs/platforms/facebook/flows/<n>.md`. |
| 5. Machine | `createFlowMachine(definition)` | An XState machine: one state per step, and `failed` on the first step that fails. |
| 6. Run | `log flow run <n> --account <a> --set k=v … [--live]` | A dry run lists the filled-in steps. `--live` runs the machine through an inspect session, so the run is recorded and mapped again. |
| 7. MCP | the `log` MCP server | Every saved flow becomes its own tool (for example `flowProfileSetup`), with parameters by name. The live version needs `confirmLive`. |

## Inspect actions

| Action | Changes anything on the site? (needs `--live`) | What it does |
| --- | --- | --- |
| `goto <url>`, `snapshot`, `back`, `wait [s]` | no | Move around or look. |
| `click <ref>`, `type <ref> <text>`, `press <key>`, `upload <ref> <file>` | yes | One action on the element the snapshot gave that ref. |
| `solve` | yes | Reads the site's text captcha, sends it to an image solver, then types and sends the answer (`solve.json`). |
| `signIn`, `code` | yes | Types the email, password and authenticator code from the run's private login file. |
| `clickRole`, `fillRole`, `uploadRole`, `waitRole` | yes | The flow runner's steps: an element found by role and accessible name, plus `expect` (the request that confirms it worked). |
| `stop` | no | Close and save the session. |

Details:

- A step settles when the network has been quiet for 1.5 s (up to 15 s, longer while an `expect` is pending).
- Typed values are hidden in snapshots.
- A HAR over rea's 32 MB limit gets a copy without static file bodies for rea; the raw HAR is kept.
- `--now` skips only the 10-minute gap between launches.

## The mouse

Every session moves the cursor with `python/human/humanMouse.py`, which is fitted to a recording of a real person's mouse made with `python/human/recordMouse.py`. What it reproduces:

- one smooth speed curve per move, peaking early and settling slowly;
- overshooting and coming back about half the time;
- loose loops around whatever is being looked at;
- short pauses, and staying still about 25% of the time.

Every step writes `mouse.json` (its moves) and `mouseSamples.json` (every point, in the recorder's format), so the same analyser can compare the two:

```bash
python python/human/recordMouse.py 60                      # record your own mouse for 60 s, then analyse it
python python/human/recordMouse.py --analyze <run>/steps/02_wait60s/mouseSamples.json
```

Camoufox's own humanize setting stays on, but is capped at 20 ms per hop in these sessions (`launch_kwargs(…, own_trajectory=True)`). Its default cost about 100 ms per 5 px hop, which made earlier movement crawl.

## Saved flows

| Flow | Steps | Confirmed by |
| --- | --- | --- |
| `profileSetup` | profile picture, cover photo, name | `ProfileCometProfilePictureSetMutation`, `ProfileCometCoverPhotoUpdateMutation`, `useFXIMUpdateNameMutation` |

It was recorded on one account and then ran 13 out of 13 steps on another.

## What early recordings showed

- **A first sign-in on a new account can land on "We suspect automated behaviour"** (`/checkpoint/601051028565049/`). Pressing Dismiss sends `FBScrapingWarningMutation` and lands signed in.
- **A locked account goes through these screens in order:** "Confirm that you're human to use your account" [Continue] → `useUFACSubmitActionMutation` (5 s) → a text captcha → solver (1.5 s) → [Continue] → `useUFACSubmitActionMutation` (3 s) → "Confirm your identity with a video selfie". Only a person can clear the last screen. A second visit picks up at the step it was left on.
- **Changing exit IPs stood out.** One account signed in from three exit IPs in 90 minutes over 15 launches; accounts whose exit IP stayed fixed fared differently.
- **Connect read the page too soon.** It read 1 s after pressing Enter, saw the login form still there, and tried again, although the first Enter had worked. It must wait for the page to change.
- **The listing's location isn't set by any request in a run.** It arrives in the create page itself (`sell_location`), so a wrong Marketplace location is an account setting.

## Where things are

| Path | What |
| --- | --- |
| `python/session/inspectSession.py` | The inspect session |
| `src/browser/inspect/` | Talking to it: commands, replies, rendering |
| `src/rea/inspectMap/` | Recording → states and transitions |
| `src/browser/flow/` | Recording → definition, machine, docs; `definitions/` |
| `src/cli/inspect/`, `src/cli/flow/` | The commands |
| `src/mcp/server/helpers/toolsFromFlows.ts` | Flows as MCP tools |
| `src/rea/facebookClient/` | The per-request docs build |
| `skills/inspect`, `skills/flow`, `skills/profileSetup`, `skills/reaCapture` | How-to routines |
| `~/.logCli/runs/{inspect,flow}/<time>_<account>/` | Recordings (local, never committed) |

The rules behind this are in AGENTS.md.
