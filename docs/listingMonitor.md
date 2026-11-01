# The listing monitor

`log facebook watch` checks an account's Marketplace listings on a schedule and decides what should happen to each one. It only decides: it never posts, reposts or deletes anything. Read this if you want to know how it reacts to removed listings, errors and limits.

## How it moves between states

The monitor is an XState v5 machine in `src/marketplace/monitor/machine.ts`:

```text
checking --ok-----------> evaluating --> waiting --after poll--> checking
   |                          '-- checks done --> done
   |--rateLimited--> resting --after 24h--> checking
   |--other account issue--> blocked
   '--error--> failed --first try--> retrying --after 5s--> checking
                 |-- same error 3x in a row --> tripped
                 '-- otherwise --> waiting
```

In words:

- **Checking** reads the listings. If that works, it **evaluates** them, then **waits** for the next poll.
- If the account is rate-limited, it **rests** for 24 hours.
- Any other account issue (ban, checkpoint, login) **blocks** it.
- An error is **retried** once after 5 seconds. The same error three times in a row **trips** it and it stops.

## Watching it

`log facebook watch` prints each event and state as it happens (through XState's inspect API, `src/observability/trace`).

- `--json` streams them as NDJSON, one line per step, with the result on the last line.
- `--checks 0` runs until you press Ctrl+C.

## Where its behaviour comes from

The monitor reuses decisions proven in two earlier Marketplace tools:

| Behaviour | Taken from |
| --- | --- |
| Reasons a listing was removed; never repost after a policy removal, ban or checkpoint; at most 2 reposts, with a 1 hour then 3 hour cooldown; `RETRY_EXHAUSTED` | An earlier Facebook client (`domain_marketplace/relist.py`) |
| One quick retry for passing errors; stop after the same error 3 times; rest 24 hours when limited | An earlier Marketplace tool (`agent/src/poll-loop.ts`, `api/agent/result/route.ts`, `process-posts`) |
| Don't call listings removed when the page showed none, or fewer than 3 out of 3 or more | The same tool (`src/lib/listing-checker.ts`) |
| No second repost while one is already queued | The same tool (`listing-checker.ts`) |
| Map page text to one account issue (ban, checkpoint, limit, login) | The same tool (`poster.ts`, `process-posts`, `facebook-auto-login.ts`) |
