# Activity hours: Vietnam's day is Ireland's night

**Id:** `activityHours` · **Severity:** high (behaviour) · **Status:** fixed at `2de5ff5` (verifiedLive, proxied; DST and watch unitTested)

## Summary

Nothing in log-cli stops a run during the account's local night. The operator
works on Vietnam time (UTC+7). A 08:00 to 18:00 working day in Vietnam is
01:00 to 11:00 in Ireland in winter, and 02:00 to 12:00 in summer. Facebook
stores every login, listing and click with a server timestamp. Spoofing the
browser's timezone doesn't change that. Activity that bunches in the small
hours, every day, is a "not local" signal (R2 §6, R4 H4).

## What leaks and to whom

- **To Facebook:** when each session starts, how long it lasts, and when each
  listing goes up. Meta says it collects "the time, frequency and duration" of
  activities, and uses signals such as mouse movement to tell people from bots
  (S29, per R1 §7). *vendorDocs*
- **What it reveals:** a daily pattern that fits UTC+7 office hours. This is a
  behavioural clue, not a location sensor. Shift work and travel are other
  explanations (R1 §7). Whether Meta uses night activity as a feature is not
  public. *inference*

## Evidence

- **No time-of-day logic.** A grep for `getHours|timezone|cron|schedule|night|hour`
  in `src/` finds only `countArkoseToday`, which counts by UTC day (R4 H4).
  *verifiedSource*
- **Commands run whenever the operator runs them:** `log publish --live`
  (`src/cli/publish/index.ts`), `log scan`/`status`/`connect`
  (`src/cli/live/index.ts`) and `log watch`. The monitor retries after 5 s and
  rests 24 h after `rate_limited` (`src/marketplace/monitor/machine.ts:5-9`).
  None of them checks the account's clock. *verifiedSource*
- **The daily cap uses the UTC date.** `src/marketplace/replacement/helpers/pickAccount.ts:57`:
  `const day = now.toISOString().slice(0, 10)`. Close enough for IE and GB,
  wrong for US and AU accounts (R4 L3). *verifiedSource*
- **Zones.** Ireland is GMT in winter and GMT+1 in summer (S28). Vietnam is
  UTC+7 all year (R3 ground truth). *vendorDocs*
- **Earlier systems.** Listaro's night mode and active hours used the server's
  clock (`Listaro_backup/src/lib/inngest/functions.ts:411-414`,
  `scripts/inbox-scanner.ts:152`, R4). *verifiedSource*

### Where the reports disagree

R1 treats posting time as a weak clue: "not a proven Marketplace 'local hours'
rule". R2 and R4 rate it high. Both agree the mechanism is real, and that
Meta's use of it is unknown. It is rated high here for two reasons. It applies
to every action on every account, every day. And the fix is cheap.

## Where in our code it can happen again

- Every command that opens a browser: `src/cli/publish/index.ts`,
  `src/cli/live/index.ts`, `src/cli/watch/index.ts`.
- `src/marketplace/monitor/machine.ts`: any timer (`after`) that can fire at
  night.
- Any daily cap or "today" count: `pickAccount.ts:57`, `countArkoseToday`.
- Any future scheduler (cron, Task Scheduler, XState delays).
- **Manual sign-in** (`log connect`) at the operator's convenience
  (`manualSignIn.md`).

## Mitigation

1. **A pure active-hours check.** `src/marketplace/activeHours/` with
   `types.ts` (`ActiveWindow { start: '08:30', end: '22:30', tz }`) and
   `helpers/isActiveNow.ts(now, window)` (R4 H4).
2. **Where the zone comes from.** The exit IP's zone from `proxy.check`
   (`proxyGate.check()` already returns `timezone`). Save it to Twenty as
   `proxyExitTimezone`. Fall back to the zone of `homeCity`, not the capital,
   for multi-zone countries.
3. **Refuse outside the window.** New catalog code `outsideActiveHours` in
   `cli/publish`, `cli/live` (scan, status) and `cli/watch`.
4. **Guard the monitor.** Add a `withinActiveHours` guard on the
   `waiting → checking` transition, with 20 to 40 minutes of jitter.
5. **No fixed cadence.** Add jitter to start times, and keep session lengths
   human.
6. **Local date for caps.** Count the daily cap by the account's local date
   (`pickAccount.ts:57`).
7. **`connect` may override** only with an explicit flag, because a person is
   present.
8. **Operator planning.** Ireland 08:00 to 23:00 local is 14:00 to 06:00 in
   Vietnam in winter (13:00 to 05:00 in summer) (R2 §6).

## How to re-test

1. Unit tests for `isActiveNow`: both DST changes (Europe/Dublin last Sunday of
   March and October), a US account in `America/Los_Angeles`, an AU account in
   `Australia/Sydney`, and midnight crossing.
2. Command test: with a fixed `now` at 03:00 Europe/Dublin, `log publish --live`
   and `log scan` return `outsideActiveHours` before any browser opens.
3. Monitor test: with 1 ms timings and a fake clock at night, the machine waits
   instead of checking.
4. Cap test: a US account at 23:30 local, which is the next UTC day, still
   counts as "today" locally.

## Status

Leaking at `f033e63`: there was no guard. **Fixed at `2de5ff5`** (rule 18,
`src/marketplace/home/helpers/activeHours.ts`).

- A local hours gate (default 08:00 to 22:00, per account `activeHoursStart` and
  `activeHoursEnd`) refused `log connect`, `log scan` and `log publish` live:
  "it is 12:08 in Galway (Europe/Dublin)... opens at 23:00 local, in 10h52".
  *verifiedLive (proxied)*
- DST and `log watch` were tested with an injected clock. The daily cap counts
  by local date. *unitTested*
- Not checked live: `log watch` over many hours.
