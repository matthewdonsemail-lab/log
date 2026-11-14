# merchantpool1

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `merchantpool1.linkedin.com/` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script63.js:1 statement`, `runs/inspect/20261107T161246_<name:1>/script146.js:1 statement`, `runs/inspect/20261107T161246_<name:1>/script247.js:1 statement`, `runs/inspect/20261107T161246_<name:1>/script353.js:1 statement` |
| rea | `ev_430b5b61a3c1fdbf8bda22f2cece09ae9974c382ca03573c7cf7e858395d8abf` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: snapshot | 1 | 200 | 56 ms | 963 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, step 3: snapshot: 200, 56 ms

Sent:

```json
{
  "query": {
    "ctx": "jscb1.0",
    "session_id": "<token>",
    "CustomerId": "fb6bbd47-fa7c-4264-b4e9-b25948407586",
    "esi": "YnVhPU1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xNTQuMC4wLjAgU2FmYXJpLzUzNy4zNiZvcz1XaW4zMiZscHJvYz00Jm9sPXRydWUmcnR0PTUwJmNocm09dHJ1ZSZwcm9zdWI9MjAwMzAxMDcmZXZhbD0zMyZhcHB2PTUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTU0LjAuMC4wIFNhZmFyaS81MzcuMzYmbHM9dHJ1ZSZk… (1692 chars)",
    "eci": "eyJ1dmRyIjoiR29vZ2xlIEluYy4gKEFNRCkiLCJ1cmRyIjoiQU5HTEUgKEFNRCwgQU1EIFJhZGVvbiBSNSA0MzAgKDB4MDAwMDY2MTEpIERpcmVjdDNEMTEgdnNfNV8wIHBzXzVfMCwgRDNEMTEpIiwidmRyIjoiV2ViS2l0IiwicmRyIjoiV2ViS2l0IFdlYkdMIiwiaWR1aCI6IjdkOWYyMmY0MjhiOTI5NjA2OGRkOTVhZGE3NzgyNmQ5In0="
  },
  "body": null
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

A script on the page sends a beacon to `merchantpool1.linkedin.com` with a session id, a customer id and two base64 blocks describing the browser: its user agent, platform, CPU count and timing (`esi`), and its WebGL vendor and renderer (`eci`). The answer has no body. It fired once, during a snapshot step, 56 ms after it was sent.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it, and none of our direct-API requests carries this browser description. It is background browser traffic seen only in `log inspect` recordings.

## What can go wrong

The one answer recorded is 200 with no body, so the recording shows nothing of what LinkedIn decides from it. A failure would not touch a direct-API run.
