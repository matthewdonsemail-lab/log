---
title: "Account watchers"
---

# Account watchers

Each signed-in account on a platform with a push channel has one watcher: one process that owns the account's socket, writes what it hears to log.db and relays it to every subscriber (rule 105). Its lifecycle is one XState machine with the same states on every platform; each platform supplies only how it connects and how its events read. Any harness starts the watchers through one command, and reads what they heard through one reader. Slice 10 of [platformNeutralSurfaces.md](../proposals/platformNeutralSurfaces.md). Rules 6, 105 and 123.

## The machine

### REQ-WATCH-01: One machine per account watcher

`accountWatcherMachine` (`src/platformKit/watcher/machine.ts`) is built with `setup()`, named guards (`claimRefused`, `endedAs`, `behind`) and named actions, and every invoke is a promise actor with `onError`. It starts in `starting`, where the `claim` actor takes the account's `owners` row (`claimWatcher`); a claim held by a live process ends in `busy` with the holder's pid, so a second watcher is refused by a state and connects nothing. A won claim goes to `running`, which invokes the platform's `connect` actor for the life of the socket and holds `catchingUp` (the `catchUp` actor, then `live` whether it caught up or not, the gap staying open for the next try), `live` and `reconnecting`. `dropped` moves to `reconnecting`; `opened` moves to `catchingUp`, and so does anything heard while reconnecting; `recheck` catches up again only when `behind` says the account has a gap the platform didn't refuse. When the socket ends, `releasing` invokes `release`, then the machine ends in `stopped`, `signInNeeded`, `coolingDown` or `failed`. `startAccountWatcher` (`src/platformKit/watcher/client.ts`) runs it and returns `send`, the current state and its end. The states are `WATCHER_STATES` (`src/platformKit/watcher/types.ts`).

Checked by: code and SubQ

### REQ-WATCH-02: How a watch ended decides its end state

`watchEndOf` reads the engine's answer: ok is `stopped`; a session the platform no longer accepts (`SIGN_IN_CODES`: `sessionDead`, `noPlatformSession`, `noSession`, `sessionMismatch`) is `signInNeeded`, the state `sessionsCheck` reports for it; a rate limit or the governor (`COOLING_CODES`) is `coolingDown`; any other refusal is `failed` with its code. A `connect` that throws is released, then `failed` with the error; a `release` that throws ends `failed` too, so the machine never stays running. A claim that throws is `failed` with nothing released.

Checked by: code and SubQ

### REQ-WATCH-03: The watch commands run through it

`ownOrAttach` (`src/inbox/relay/client.ts`) is where all four watches (`twitter chat watch`, `discord watch`, `slack watch`, `instagram watch`) meet, and it runs the machine: `claim` is `claimWatcher`, `connect` opens the relay and runs the platform's own watch, `catchUp` is the account's catch-up run as the owner, `release` waits for the catch-up, closes the relay, releases the claim and records the end, and `behind` is `needsCatchUp`. Every pushed event is decoded by `socketEventOf` (or a platform's own `decode`) into `dropped`, `opened` or `heard`; a drop still opens a `socketDropped` gap. The relay writes the machine's state into the account's `owners` row as it changes (`status`, read by `relayJoined`), in place of the old `connecting` and `streaming`. A machine that ends `busy` attaches to the owner's relay, or is refused when it is an inbox watch, as before.

Checked by: code and SubQ

### REQ-WATCH-04: The state is kept in log.db and reconciled

While a watcher runs, its state is its `owners` row's `status`. When it ends, `recordWatcherEnd` writes the end state and code as a `watcherEnd` state row. `watcherRows` reads both: a running row shows its machine state (an old `connecting` reads `starting`, `streaming` reads `live`, through `watcherStateOf`), an ended one its recorded end. `reconcileWatchers` marks a row whose process is gone `stopped`, recorded `watcherGone`, as the session check does for a check whose process died.

Checked by: code and SubQ

## Starting and reading

### REQ-WATCH-05: One start, called by every harness

`superviseWatchers` (`src/platformKit/watcher/client.ts`) runs, for each platform in `WATCH_COMMANDS`, `replaceHungOwners`, `stopStaleWatchers` and then `ensureLiveWatchers` over the signed-in accounts, leaving out one cooling down and one the owner held, and starts each with `startWatcher`, which runs that platform's watch command from the table with `--inbox` as a detached process. `superviseLocalWatchers` (`src/platformKit/watcher/helpers/supervise.ts`) is it with this workspace's accounts. The callers are the Claude Code and Codex inbox hook (`inboxAnswer`, `scripts/hooks/inbox.ts`), `log watchers start` (`watchersStart`), and `log runtime connect`, which calls `watchersStart` when it connects and every `WATCHERS_EVERY_MS` while connected, so a harness with no hooks gets the same watchers.

Checked by: code and SubQ

### REQ-WATCH-06: log watchers status, start and stop

`log watchers status|start|stop [--platform] [--account]` (`src/cli/watchers/index.ts`; tools `watchersStatus`, `watchersStart`, `watchersStop`) is one shared command. `status` lists each watcher's state, pid, start, heartbeat and end code, and a signed-in account with no watcher yet as `stopped` (`watcherNeverStarted`). `start` lifts the owner's hold on the accounts it names and runs the one start. `stop` needs a platform or an account, kills each named running watcher (never this process's own watch, which ends after its seconds), releases its claim, records `stoppedByOwner` and holds the accounts (`watcherHold` state rows) so no start makes them again until `start` names them. A platform with no push watcher answers `capabilityMissing`, an account not signed in on one answers `accountNotFound`.

Checked by: code and SubQ

### REQ-WATCH-07: One reader for what was heard

`readPending(reader)` (`src/inbox/pending/client.ts`) is the one delivery: the reader's alerts (a second watcher refused, first, under `ONE PROCESS PER ACCOUNT`), then the messages since its cursor with their voice-note text, each platform's steps (`inboxContext`) and the chat claims (`claimContext`). The inbox hook calls it with the hook's session as the reader and puts the text into context; `log inbox pending --reader <name>` (`inboxPending`) returns the same text, and the messages and alerts as JSON, to a harness that reads it as a tool. A new reader starts from now; each read moves only its own cursor.

Checked by: code and SubQ
