---
title: "Flows"
---

# Flows

A procedure recorded with `log inspect` becomes the whole pipeline, not a one-off: the recording is turned into a flow definition, the flow gets its documentation and an XState machine, it runs on any account, and every saved flow is an MCP tool of its own. A flow is deterministic: each control is picked by one scored match, never by a page's exact wording or a person stepping in, and every step waits for the call it must cause and checks its answer before the next one fires. Rules 31 and 79.

## From a recording to a flow

### REQ-FLOW-01: An inspect recording is turned into a saved flow

`log flow fromInspect <runDir> --name <name>` turns an inspect run into a flow definition, saved as `src/browser/flow/definitions/<name>.json`, and writes its documentation in the same call. The name is camelCase.

Checked by: code and SubQ

### REQ-FLOW-02: Each step's control is taken from the snapshot it acted on

Each step that acts on a control keeps that control's role and name from the snapshot taken before it, and the dialog it sat in (`within`) when it was in one.

Checked by: code and SubQ

### REQ-FLOW-03: Each step's confirming request is taken from what it sent

Each step keeps the request that confirms it, from the requests it sent: a mutation first, else a plain endpoint, else a dialog query (`expect`).

Checked by: code and SubQ

### REQ-FLOW-04: Each step keeps rea's evidence

Each step keeps the id of rea's evidence for its recorded step.

Checked by: code and SubQ

### REQ-FLOW-05: Every flow has its documentation

`log flow docs <name>` writes the flow's documentation to `docs/platforms/facebook/flows/<name>.md`, and the docs gate refuses a push while a saved flow has no documentation.

Checked by: code and SubQ

## Running a flow

### REQ-FLOW-06: A flow is an XState machine

`createFlowMachine` makes each flow an XState machine with one state per step, in order: a step that does not succeed ends the flow as failed at that step.

Checked by: code and SubQ

### REQ-FLOW-07: A flow is a dry run unless --live

`log flow run <name> --account <a>` only lists the steps it would run and opens nothing, unless `--live` is given. With `--live` it runs the steps in the account's browser, recording every step again.

Checked by: code and SubQ

### REQ-FLOW-08: Every saved flow is an MCP tool of its own

Every saved flow is an MCP tool named after its platform and itself (`flowToolName` in `src/browser/flow/helpers/flowPlatform.ts`: `facebookFlowPostComment`; a flow whose name already starts with its platform drops it, so `facebookLanguageEnglish` is `facebookFlowLanguageEnglish`), a dry run, and a live twin (`…Live`) that runs it on that platform. The platform is the definition's `platform` field; `log flow fromInspect` writes it from the recording's first page (`flowPlatform`). A flow with no platform keeps the bare `flow<Name>` and fails `check:platformNeutral`. The old `flow<Name>` names stay as unlisted aliases for one release (`RENAMED_FLOW_TOOLS` in `src/mcp/server/helpers/toolAliases.ts`).

Checked by: code and SubQ

## Picking a control

### REQ-FLOW-09: A control is one scored match by role, then name

A control is matched by its role, then by its name as the accessible name, aria-label, label, text or placeholder, with case and spacing ignored.

Checked by: code and SubQ

### REQ-FLOW-10: The match is inside the dialog the step names

When the step names a dialog (`within`), only controls inside that dialog match. When it names none and a match sits in an open dialog, the controls in the page behind it are left out.

Checked by: code and SubQ

### REQ-FLOW-11: Two equal matches are refused

When more than one control still matches after the tie-breaks (exact accessible name, enabled, not hidden, not covered), the step is refused with `controlAmbiguous`.

Checked by: code and SubQ

### REQ-FLOW-12: No match is controlMissing

When no control matches, the step fails with `controlMissing`.

Checked by: code and SubQ

### REQ-FLOW-13: A disabled control is waited for

A matching control that is disabled is waited for until the step's time runs out, and then the step fails with `controlDisabled`.

Checked by: code and SubQ

## Waiting for the platform

### REQ-FLOW-14: Every step waits for the call it must cause

A step waits for the request it must cause (its `expect`, or the first call its answer checks name), and fails when that request was not sent.

Checked by: code and SubQ

### REQ-FLOW-15: The answer is checked before the next step

A step whose answer checks are set fails when the platform never answered that call, answered it with no 2xx, answered with errors, or answered a value other than the one expected. Rule 73.

Checked by: code and SubQ

## Overlays

### REQ-FLOW-16: Known overlays are cleared before the first click

Before a flow's first step that clicks, fills, uploads or sets a location, the known overlays (the browser-notifications notice and an ended "What happened" notice) are pressed away with Escape, the "What happened" one checked against its answer (`xfb_ixt_gateway_clear_flow: true`).

Checked by: code and SubQ

### REQ-FLOW-17: An overlay that stays stops the flow

An overlay still over the page after its Escape, or one whose answer is not as expected, stops the flow with `overlayNotCleared`.

Checked by: code and SubQ
