---
title: "Platform actions"
---

# Platform actions

An acting command (a send, a reaction, a voice note) runs through one shared machine with the same stages on every platform. Platforms supply what each stage does; the states, and what an outcome means, are the same everywhere. Slice 8 of [platformNeutralSurfaces.md](../proposals/platformNeutralSurfaces.md). Rule 6.

### REQ-ACTION-01: One machine: gating, acting, confirming, then done, refused or uncertain

`actionMachine` (`src/platformKit/action/machine.ts`) is built with `setup()`, named guards (`gatePassed`, `platformConfirmed`) and named actions, and every invoke is a promise actor with `onError`. It starts in `gating` (the platform's gate: claim, catch-up, voice gate, whatever that action needs), moves to `acting` only when the gate passed, then to `confirming` with the platform's answer, and ends in `done`, `refused` or `uncertain`. `runAction` (`src/platformKit/action/client.ts`) runs it to its end and returns the outcome, the stage it ended in, what the gate held, the platform's answer, and the refusal's code and detail; `onStage` hears each stage as it starts.

Checked by: code and SubQ

### REQ-ACTION-02: The platform's answer decides, and a throw is never read as success

A gate that refuses or throws ends in `refused` at `gating`, and nothing acts. `confirmAnswer` confirms an engine answer only when it is ok; otherwise `refused` at `confirming` with the platform's code. An act or a confirm that throws ends in `uncertain` with the error, since the platform may have acted. The caller releases what the gate held and says it once; nothing is retried (rule 94).

Checked by: code and SubQ

### REQ-ACTION-03: Which commands run through it

The react factory (`reactCommandOf`, `src/cli/react/index.ts`: X, Discord, Slack, Instagram) and the voice note factory (`voiceNoteCommandOf`, `src/cli/voiceNote/index.ts`: the same four) run every live call through `runAction`. Their dry runs never reach it. The text sends (`twitter dm`, `discord send`, `slack send`, `instagram send`), the X posts, replies, quotes, likes, follows and lists, Reddit's post, reply and vote, `discord delete` and `facebook campaign` don't yet; `check:agnostic` counts them as `liveCommandsWithoutMachine`.

Checked by: code and SubQ
