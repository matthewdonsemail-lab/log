# flows

Recorded flows and the warm-up on any platform: a recording turned into steps that run in the account's open browser, each step checked against the call it must cause.

Load next, when the work needs it: getGuide({ topic: "facebookFlows" }) (Facebook's recorded flows and its warm-up, each a facebookFlow tool run as steps in the account's open browser); getGuide({ topic: "accountBrowser" }) (An account's one browser on any platform: opening it through its gates, inspecting a page step by step, where every open browser is, the live view for signing in, AdsPower profiles and local accounts).

Written by `bun run docs:build` from the code, the skills and AGENTS.md. Not edited by hand: change the command's usage, its skill or the rule, and rebuild.

## Use cases these tools are part of

When the owner asks for one of these, follow its page step by step.

| Use case | What it is | How the owner asks for it |
|---|---|---|
| `getGuide({ useCase: "facebook/marketplaceListings" })` | From accounts to live Marketplace listings | "post a marketplace listing in <town>", "get listings up on facebook marketplace in every town", "set up the facebook accounts and publish the listings", "take the marketplace listing down". |

## The tools in this guide

Each tool's own description carries its full usage, notes, live line and rules; `logGet` gives its exact inputs and a call that works.

| Tool | What it does | Usage |
|---|---|---|
| `flow` | Recorded inspect runs as flows | `log flow fromInspect <runDir> --name <n> \| docs <n> \| list \| show <n> \| run <n> --account <a> [--set k=v]... [--live]` |
| `flowLive` | Recorded inspect runs as flows, live on the platform | `log flow fromInspect <runDir> --name <n> \| docs <n> \| list \| show <n> \| run <n> --account <a> [--set k=v]... [--live]` |
| `warmup` | The warm-up, by platform and activity | `log <platform> warmup <platform> <activity> [plan\|record\|run\|log\|persona] [--account <a>] [--live] [--likes] [--bypass]` |
| `warmupLive` | The warm-up, by platform and activity, live on the platform | `log <platform> warmup <platform> <activity> [plan\|record\|run\|log\|persona] [--account <a>] [--live] [--likes] [--bypass]` |

## The work, step by step: flow

From `skills/flow/SKILL.md`.

## flow

Record once, then run anywhere: recording → definition → docs → machine →
command → MCP tool.

### Hard boundaries

1. **Built from a recording, never by hand** (rules 25, 29). Each step's
   element is the role and accessible name the recorded snapshot gave it;
   each step's confirming request is the mutation the recorded step sent.
   A confirming request only proves the call happened. **What it answered
   decides the step** (rule 73): a step's `answers` name the call and what its
   answer must say (a value, what we sent, present, the account's home city,
   country or id), with the error code it raises, written from the request's
   doc ("What it sent and what came back"). Every step with a confirming
   request checks the field its request doc says it answers, and a test
   refuses a flow step that waits on a call without checking its answer. A
   streamed answer is read from its first part. The flow's doc shows every
   check, and recording the flow again keeps them.
2. **Dry run unless `--live`** (rule 8); over MCP, live is its own tool (the
   flow's tool name ending in `Live`), with confirmLive.
3. **Every gate** (rules 19, 35): a run is one launch through
   the inspect session, so every step is recorded again (snapshot,
   screenshot, HAR, rea) and mapped.
4. **No credential in a step or param**: sign-in is `signIn`/`code`,
   which read the private login.json; typed values are redacted in snapshots.
5. Run it live (rule 26): Monitor; every machine state prints.

### The routine

The example is a Facebook flow, `profileSetup`:

```bash
## 1. record (skills/inspect)
log inspect start --account <a> --url <url> --bypass --now
log inspect do click <ref> --live ...   # one step at a time
log inspect do stop

## 2. recording → definition + docs (params renamed from text1/file1)
log flow fromInspect ~/.logCli/runs/inspect/<run> --name profileSetup \
  --rename text1=firstName --rename text2=lastName --rename file1=profilePhoto --rename file2=coverPhoto

## 3. run it on another account (dry run first: lists the filled steps, opens nothing)
log flow run profileSetup --account <a> --set firstName=<first> --set lastName=<last> \
  --set profilePhoto=<path|url> --set coverPhoto=<path|url>
log flow run profileSetup --account <a> ... --live --bypass --now
```

Over MCP the same run is the flow's own tool with `account` and the params
by name, and its live twin with `confirmLive: true`. The CLI words
(`log flow run <name>`) are the same on every platform.

A failed step ends the run (`failedAt`): read that step's folder in the new
recording (rule 25), re-record the changed part with inspect, rebuild the flow.

### Deterministic steps (rule 79)

A step never guesses which control to press: `python/browser/controlMatch.py`
scores every visible control by role, then name, inside the step's dialog
(`within`). The exact requirements (and their error codes) are in
[docs/specs/flows.md](../../docs/specs/flows.md). A Dismiss button with no
accessible name is found by its text.

`fromInspect` writes what keeps a step deterministic:

- `within`: the dialog around the control in the snapshot before the step.
- `expect`: the call the step must cause, a mutation first, else a plain
  endpoint, else a `…DialogQuery`. The session waits for it, and the step
  fails without it.
- `answers`: what that call must say (rule 73), added from the recording's
  exchanges before the flow ships; `answers.test.ts` refuses a step with
  `expect` and no `answers`.

Before a flow's first click, fill, upload or location, `clearOverlays` reads the page
and presses Escape for each known overlay over it (`OVERLAY_CLEARS`,
`src/browser/flow/helpers/overlays.ts`), then reads the page again. One
still there after its Escape, or a clear call that answers otherwise, stops
the flow at that step with `overlayNotCleared`. An overlay no known state
names stays unknown, for SubQ to read (rule 73). A new overlay is added there
with its page state, fixture and answer.

When a platform changes a page, add its snapshot excerpt to
`python/fixtures/controls/` (no names, no page copy) and a case to
`src/browser/flow/controlMatch.test.ts`, so the next change fails a test, not
a live run.

Rebuild the platform's request docs after a run.

Facebook's flows, their tools, checks and overlays: `skills/facebookFlows/SKILL.md` (the facebookFlows guide).

## The work, step by step: warmup

From `skills/warmup/SKILL.md`.

## warmup

What the warm-up must do, requirement by requirement: [docs/specs/warmup.md](../../docs/specs/warmup.md).

### Hard boundaries

1. **Recorded, never written blind** (rule 29). `log <platform> warmup stages record` drives the
   inspect session headed, every step saved (snapshot, screenshot, HAR, rea),
   and builds each flow from that recording. `log <platform> warmup stages run` refuses an
   activity whose flow isn't recorded (`flowNotRecorded`).
2. **One browser** (rule 35). Record and run both open one session and do every
   activity inside it.
3. **Likes act on the platform** (rule 8): a like only runs with
   `--likes`, when the owner asks. Everything else reads. **A like passes on
   the platform's answer** (rule 73), not on the button the page shows after:
   the step waits for the like's mutation and passes only when it answers
   2xx with the reaction we sent saved (`expect.answers`, `answerIssue`). A
   step's answers are read from its own recording and kept as
   `exchanges.json`. Other steps get `expect.answers` the same way, written
   from that request's doc ("What it sent and what came back").
4. **Every step that makes a call is decided by its answer** (rule 73). The
   stage flows carry `answers` on each step whose recording shows a call
   that answers it, and the run fails the step with its code when the answer
   isn't right (`runFlowInSession`, `answersIssue`). Dwells and steps whose
   recording shows no call have nothing to read. A home check is skipped
   when Twenty has no home for the account. Each flow's doc shows what every
   step must answer, and recording a flow again keeps the checks
   (`keepAnswers`).
5. **Live and watched** (rule 26): run through Monitor; every step goes to the
   stage log as it happens.
6. **Stops on the wrong page.** Every step's landing page is checked
   (`pageProblem`): a checkpoint, a login wall or another section ends the
   activity (`blocked`), and the account's issue is written to Twenty.
7. **Scrolls like a hand** (`python/human/scrollMotion.py`, ported from the Robotic
   VSL repo): bell-curve wheel steps, overshoot and recoil, mid-pauses. No
   `scrollBy` or `scroll_into_view_if_needed` anywhere.

### The routine

```bash
log <platform> warmup stages plan                                        # the activity scripts, recorded or not
log <platform> warmup stages record --account <a> --now                  # one headed session: each script, then each flow
log <platform> warmup stages run --account <a> --now                     # watched run: the machine runs each flow in turn, 10 s apart
log <platform> warmup stages log --account <a> --follow                 # the stage log (the activity feed), live
```

`--gapSeconds` is the wait between activities: 10 by default, not minutes.
`--only <activity>,<activity>` limits it.

After recording, read each activity's steps with rea (rule 25) and rebuild the
platform's request docs before pushing. A record that fails part-way still
saves the activities that finished before it.

Facebook's warm-up activities, pages, checks and Reels: `skills/facebookWarmup/SKILL.md` (the facebookFlows guide).

## The rules these tools fall under

Each by its number and first line. The full text is in AGENTS.md (`log://agents`); the core rules are in full in `getGuide({ topic: "logMcpInstructions" })`.

- **Rule 8.** Platform actions require the user authorization their tool defines.
- **Rule 25.** Fix failed or unfamiliar behavior from its own recorded action/request/response timeline.
- **Rule 26.** Stream progress while work runs, one meaningful line per stage, with the run log retained.
- **Rule 29.** Record a browser page with the existing inspect tool before implementing actions on it.
- **Rule 30.** Complete the authorized task.
- **Rule 31.** Turn a repeatable recorded browser procedure into its flow, deterministic machine, documentation and matching CLI/MCP surface.
- **Rule 35.** Browser work uses one account browser through its active day, with actions as tabs/steps; close only for a logged lifecycle reason.
- **Rule 38.** Do not introduce discussions of Meta/Facebook rules, terms, eligibility or account ownership unless the owner raises them.
- **Rule 39.** Use only the scope, options and intent the owner stated or implied.
- **Rule 40.** Do not propose physical infrastructure unless the owner asks.
- **Rule 41.** Paid work must stay within the authorized task and spend.
- **Rule 73.** For an unknown platform state, collate the goal, account/runtime, action, sent requests, answers, timing and page evidence.
- **Rule 79.** Flow controls must match deterministically by the recorded role/name and scope; ambiguous, missing or disabled controls refuse.
