---
title: "Page states"
---

# Page states

A known state is resolved, never a reason to stop. When an open browser lands on a page log-cli already knows (a checkpoint's first page, a text captcha, the Remember password prompt, the login form, two-step, "automated behaviour"), its resolver runs, and only what a person must clear stops an account. A Claude Code hook reads the latest step of every open browser and puts the state and its resolver into the agent's context, and the Stop event keeps the turn going while a browser sits on a state log-cli resolves itself. Rule 54 and the page-state part of rule 55, with rule 73 (the internal API answer decides) and rule 77 (a state that needs nothing).

## Knowing the state

### REQ-STATE-01: One map names the known page states

Every known state is one entry in one map (`PAGE_STATES`), matched by `pageStateOf` against the step's URL, its page text and its internal API answers. Each entry says what the state is, how it is resolved and whether only a person can clear it.

### REQ-STATE-02: The internal API answer decides a state that has one

A state with an answer test is matched by the step's internal API answers whenever the step has exchanges, and the page text decides only when there are none. Rule 73.

## Resolvers

### REQ-STATE-03: A checkpoint's first page is never pressed through

A checkpoint's first page ("confirm that you're human to use your account") has no resolver: a checkpointed account is deactivated (rule 82, matt 2026-11-02, rule 118), so nothing on the page is clicked, the state is one only matt is told about, and the browser's checkpoint watch sets the account DEACTIVATED.

### REQ-STATE-04: A text captcha is solved

On a text captcha ("Enter the text from the image") the resolver runs the `solve` step.

### REQ-STATE-05: The Remember password prompt is passed with Not now

On the Remember password prompt the resolver clicks the button "Not now".

### REQ-STATE-06: The login form signs in and two-step types the code

On the login form the resolver runs `signIn`, and on the two-step code page it runs `code`.

### REQ-STATE-07: "Automated behaviour" is dismissed

On "We suspect automated behaviour" the resolver clicks its Dismiss or Continue control by ref.

### REQ-STATE-08: Any other checkpoint page stops the account

A checkpoint page no other state names stops the account the same way: no resolver, nothing clicked, the account deactivated and matt told (rule 118). A two-step code page under a /checkpoint URL is still the sign-in's code step, which comes first in the map.

## What stops an account

### REQ-STATE-09: Only what a person must clear stops an account

A disabled account, a video selfie and an identity check are a person's states: they have no resolver, and the hook says to stop the account and tell matt.

### REQ-STATE-10: A state that needs nothing is not resolved

A state marked as needing nothing (a group's People tab that answered with members) has no resolver, is not a person's state and does not hold the turn. Rule 77.

## The hook

### REQ-STATE-11: The hook runs on four events

The page-state hook is registered on SessionStart, on UserPromptSubmit, on PostToolUse for Bash, PowerShell, Monitor and every `mcp__log__` tool, and on Stop.

### REQ-STATE-12: A session start and every prompt say where every open browser is

On SessionStart and UserPromptSubmit the hook says, for every open browser, where it is and its state, even when nothing changed.

### REQ-STATE-13: After a tool call a known state gets its resolver

After a tool call the hook puts each open browser's known state and its resolver into the agent's context, when it has changed since it was last said.

### REQ-STATE-14: A failed step is an unconfirmed page

When the latest step failed and no known state names its page, the hook says the page is unconfirmed: take a snapshot, then its resolver.

### REQ-STATE-15: The Stop event keeps the turn going on a state log-cli resolves

On Stop, while any open browser sits on a state log-cli resolves itself or on an unconfirmed page, the hook holds the turn with each one's line. A person's state never holds the turn.

### REQ-STATE-16: The turn is never held twice on the same unchanged state

When the hook already held the turn on exactly the same states and the Stop hook is active again, it lets the turn end.
