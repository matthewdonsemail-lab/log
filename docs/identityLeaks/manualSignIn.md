# Manual sign-in: the person at the keyboard

**Id:** `manualSignIn` · **Severity:** medium (process) · **Status:** leaking (no guidance or checks)

## Summary

`log connect` opens the proxied browser and hands it to a person. The browser
hides the machine. The person can still give it away:

- an Asian input method (IME) shows up in keyboard events;
- a Vietnamese phone number typed at a checkpoint;
- personal email opened in the same window;
- signing in during the account's night.

The prompt warns about none of these (R4 M7; R2 §16).

## What leaks and to whom

- **To Facebook's page scripts:**
  - `compositionstart`/`compositionend` events and `isComposing` from an IME;
  - `KeyboardEvent.code` vs `key` differences from a non-English layout;
  - diacritics typed into fields.

  Meta says it uses device operations "such as how you open the app or move the
  mouse" (S29). *vendorDocs*
- **To Facebook's account records:** a +84 phone number or a personal email
  given at a checkpoint becomes part of the account.
- **When it happens:** the sign-in time (`activityHours.md`).

## Evidence

- **The prompt.** `python/session/logWorker.py:142` prints only
  `"1. Log into Facebook (finish any checkpoint or 2FA)"`. *verifiedSource*
- **This PC's input languages** are en-US, ja and zh-Hans-CN (R3 ground truth).
  Japanese and Chinese IMEs fire composition events (R2 §16). *verifiedLive (proxied)*
  for the host settings, *inference* for the events.
- **Vietnamese IMEs** (Unikey, Telex) do the same (R4 M7). This study didn't
  confirm one is installed on this PC. *inference*
- **Checkpoint content.** Meta's identity checks ask for details such as a phone
  number or code (S34). A +84 number or a personal inbox would tie the account
  to Vietnam or to the operator. *vendorDocs*, *inference*
- **Rule 10** sends Facebook's own challenges (SMS, ID) to a person, so this
  path is used on purpose. *verifiedSource*

## Where in our code it can happen again

- `python/session/logWorker.py` `login` (`:130-155`): the prompt and the open window.
- Any future flow that hands the window to a person (rule 10 challenges in
  `log publish`).
- `src/cli/live/index.ts` (`connect`).

## Mitigation

1. **Extend the prompt** in `logWorker.login` with a short checklist:
   - Switch Windows input to English (UK for IE and GB accounts), and turn off
     Japanese, Chinese and any Vietnamese IME.
   - Never enter a +84 number or a personal email. Use only the account's own
     recovery details from Twenty.
   - Don't open other sites in this window.
   - Sign in during the account's local daytime.
2. **Warn live.** A small page script in a new `python/connectGuard.py`, used by
   `login`, prints a warning on stderr when:
   - an `input[type=tel]` value starts with `+84` or `84`, or is a `0` plus
     9 digits;
   - a `compositionstart` event fires (R4 M7).
3. **Time guard.** `connect` follows active hours unless overridden with an
   explicit flag (`activityHours.md`).

## How to re-test

1. Run `log connect` with a Japanese IME on, and type into the email field.
   **Pass:** a stderr warning appears.
2. Type `+84 912 345 678` into a phone field on a test page. **Pass:** a stderr
   warning appears.
3. Read the prompt text. **Pass:** it shows the checklist above.

## Status

Leaking (process risk) at `f033e63`. There is no guidance or check.
