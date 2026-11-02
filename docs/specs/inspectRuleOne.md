---
title: "Inspect rule one"
---

# Inspect rule one

Rule one of the stack: if we don't know, we do this. In `log inspect`, where flows are made to be run again and again, every step's internal API calls are taken out of its recording and decide what the step means. A step no known state names is collated with everything around it and read by SubQ, the reading is said loudly to the agent, the session keeps going until its goal is reached, and what went wrong is written as P.E.E. with its fix. Rule one at the top of AGENTS.md and rules 29, 73, 74, 75 and 76.

## Internal API

### REQ-INSPECT-01: Every inspect step's internal API calls are taken out of its recording by code

Each inspect step's own HAR (`network.har`) is read by code into its internal API exchanges, each with what was sent and what came back, and they are written beside the step as `exchanges.json` and `exchanges.md`.

Checked by: code and SubQ

### REQ-INSPECT-02: Each exchange is timed in seconds from the step's first request

Every exchange carries its offset from the first request the step recorded, so the timeline says how long after our action each answer came.

Checked by: code and SubQ

## Deciding

### REQ-INSPECT-03: A step a known page state names is decided by that state

When the page state map names the step (from its URL, page and internal API answers), the step is decided by that state and SubQ is not asked.

Checked by: code and SubQ

### REQ-INSPECT-04: A step no known state names is read by SubQ

A step no known state names (it failed, made calls never documented before, got answers with errors, or nothing confirms the goal) is not decided by code and goes to SubQ. A step that ran fine and made no call is decided as no change.

Checked by: code and SubQ

### REQ-INSPECT-05: The step is collated into one bundle

What SubQ reads is one bundle: the goal, the account (name, platform, home city and country, browser and the proxy's exit), what we did (the action, its arguments, the mouse, how long it took), every internal API exchange, the page text, the screenshot and the earlier steps.

Checked by: code and SubQ

### REQ-INSPECT-06: SubQ's Decisions API reads it with subq-snap-1.1 and at most 128 questions

The reading is one request to SubQ's Decisions API with the model `subq-snap-1.1` and no more than 128 questions.

Checked by: code and SubQ

### REQ-INSPECT-07: SubQ is asked what the step means, not what to do next

The questions ask whether the goal was met, whether everything fits the account, whether something should never have come up, whether the page agrees with the API, whether our action caused it, and what each internal API call says about the goal.

Checked by: code and SubQ

## Saying it loudly

### REQ-INSPECT-08: The reading comes first in the step's result

The reading of a step no known state names starts with `>>> UNKNOWN STATE`, and it is printed before the rest of the step's result.

Checked by: code and SubQ

### REQ-INSPECT-09: The page-state hook puts the reading into the agent's context

When the latest step of an open browser has a reading that was not decided by code, the page-state hook puts that reading into the agent's context.

Checked by: code and SubQ

### REQ-INSPECT-10: A recorded step can be read again

`log inspect read <stepFolder>` reads a recorded step again, the same way as when it ran.

Checked by: code and SubQ

## Goal

### REQ-INSPECT-11: An inspect session has a goal

The goal is given with `--goal` on `log inspect start`, or set later with `log inspect goal --set`.

Checked by: code and SubQ

### REQ-INSPECT-12: The goal is reached when a step's reading says so

The goal is reached when a step's SubQ reading answers `goalMet` at 0.5 or more.

Checked by: code and SubQ

### REQ-INSPECT-13: The Stop hook holds the turn until the goal is reached

While the goal is not reached, the page-state hook's Stop event holds the turn and says to keep going with the next inspect step.

Checked by: code and SubQ

### REQ-INSPECT-14: The goal is put into the agent's context when it changes

After each tool call, the hook puts the goal's line into the agent's context only when it has changed since it was last said; on a session start and on each prompt it is always said.

Checked by: code and SubQ

## P.E.E. findings

### REQ-INSPECT-15: A step that went wrong needs its finding before the next step

A step whose reading says wrong result, stopped by the platform or unclear, or whose reading SubQ failed, needs a finding, and the Stop hook holds the turn until it is written.

Checked by: code and SubQ

### REQ-INSPECT-16: A finding is Point, Evidence and Explain

`log inspect finding` takes the Point (the issue, one sentence) and the Explain (why the evidence shows it, what caused it), refuses one without either, and takes its Evidence quoted from the step's reading, plus any of the agent's own.

Checked by: code and SubQ

### REQ-INSPECT-17: Once the goal is reached, every finding says how it was fixed

After the goal is reached the Stop hook holds the turn until every finding has its fix (`log inspect finding --fixes <n> --fix`).

Checked by: code and SubQ

### REQ-INSPECT-18: Findings are kept in the run

Findings and their fixes are kept in the run as `goalFindings.jsonl` and `goalFindings.md`, and `log inspect goal` shows them.

Checked by: code and SubQ

### REQ-INSPECT-19: What only a person can clear never holds the turn

When the latest reading says only a person can clear the step, the goal's line says to stop the account and tell matt, and it does not hold the turn.

Checked by: code and SubQ

### REQ-INSPECT-20: The hook holds the turn once per unchanged state

The Stop hook never holds the turn twice on the same unchanged state: when it already held on the same marks and the hook is active again, it lets the turn end.

Checked by: SubQ
