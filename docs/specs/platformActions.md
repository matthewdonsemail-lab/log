---
title: "Platform actions"
---

# Platform actions

An acting command (a send, a reaction, a voice note) runs through one shared machine with the same stages on every platform. Platforms supply what each stage does; the states, and what an outcome means, are the same everywhere. Slice 8 of [platformNeutralSurfaces.md](../proposals/platformNeutralSurfaces.md). Rule 6.

### REQ-ACTION-01: One machine: gating, acting, confirming, then done, refused or uncertain

`actionMachine` (`src/platformKit/action/machine.ts`) is built with `setup()`, named guards (`gatePassed`, `platformConfirmed`) and named actions, and every invoke is a promise actor with `onError`. It starts in `gating` (the platform's gate: claim, catch-up, voice gate, whatever that action needs), moves to `acting` only when the gate passed, then to `confirming` with the platform's answer, and ends in `done`, `refused` or `uncertain`. `runAction` (`src/platformKit/action/client.ts`) runs it to its end and returns the outcome, the stage it ended in, what the gate held, the platform's answer, and the refusal's code and detail; `onStage` hears each stage as it starts.

Checked by: code and SubQ

### REQ-ACTION-02: The platform's answer decides, and a throw is never read as success

A gate that refuses or throws ends in `refused` at `gating`, and nothing acts. `confirmAnswer` confirms an engine answer only when it is ok; otherwise `refused` at `confirming` with the platform's code. `confirmParts` confirms a multi-part send only when every part went out: someone writing between parts (or after the gate read the chat) is `chatMovedOn`, a lost claim is `chatClaimLost`, and a refused part carries the platform's code. An act or a confirm that throws ends in `uncertain` with the error, since the platform may have acted. The caller releases what the gate held and says it once; nothing is retried (rule 94). `passGate` is the gate of an action that holds nothing (a post, a like, a delete), and `refuseGated` (`src/cli/runner/helpers/refuse.ts`) turns a gate's refusal into the command's coded refusal.

Checked by: code and SubQ

### REQ-ACTION-03: Which commands run through it

The react factory (`reactCommandOf`, `src/cli/react/index.ts`: X, Discord, Slack, Instagram) and the voice note factory (`voiceNoteCommandOf`, `src/cli/voiceNote/index.ts`: the same four) run every live call through `runAction`. So do:

- The text sends: `twitter dm` (`src/cli/twitter/helpers/send.ts`), `discord send` (`src/cli/discord/index.ts`), `slack send` (`src/cli/slack/index.ts`) and `instagram send` (`src/cli/instagram/index.ts`). The gate is the catch-up, the voice gate (or `--overGate`'s sameness check) and the chat claim, in that order; the act sends the parts with their gaps, stopping when someone writes or the claim is fenced; the confirm is `confirmParts` (Instagram: the engine's answer, with what it heard). The claim is released once, with what went out, whether the act finished or threw.
- The X writes `twitter reply`, `quote`, `like`, `repost`, `follow` and `post` (`send.ts`) and `twitter list create` and `add` (`src/cli/twitter/helpers/list.ts`): nothing is claimed, so the gate passes and X's answer confirms.
- `discord delete`: each id in turn, 4 s apart, confirmed when every one was deleted.

Their dry runs never reach it, and every gate, governor use, output and exit code is as before. Reddit's post, reply and vote (`src/cli/reddit/index.ts`) and `facebook campaign` (`src/cli/campaign/`) don't yet; `check:agnostic` counts them as `liveCommandsWithoutMachine` (4). The X queue run (`src/twitter/queue/run/`) is its own machine, `queueRunMachine`, which drives the run: its waits, context reads and sends are invoked actors (see the running section of [xQueue.md](xQueue.md)); each send there is one engine call, as before, not a `runAction`.

Checked by: code and SubQ
