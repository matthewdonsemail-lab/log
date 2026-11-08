---
title: "Governor counts"
---

# Governor counts

Every platform account's governor counts what it sent today (requests, writes, this hour's requests) and refuses once the day is spent. Its count is read with one command and put back to 0 with another, only when matt says so, and every reset is checked and kept in log.db. Rules 73, 94 and 168.

## Reading

### REQ-GOVERNOR-01: One command shows every account's count

`log governor show` (MCP `governorShow`) lists every account on every platform that has a governor count, or one platform's with `--platform`: its requests out of 500, its writes out of the platform's daily writes, this hour's requests, the day, any cooldown, and its last reset as a log.db ledger row.

Checked by: code and SubQ

## Resetting

### REQ-GOVERNOR-02: A reset puts the count back to 0 and proves it held

`log governor reset --platform <p> --account <a|all> --by <who>` (MCP `governorReset`) sets the account's requests, writes and hour count to 0 in its `governor_state.json`, written atomically, then reads it again and refuses if any of them isn't 0. `all` resets every account on that platform. An account with no governor count is refused before anything is written.

Checked by: code and SubQ

### REQ-GOVERNOR-03: Every reset is a row in log.db

Each reset writes one row to log.db's `ledger` table, kind `governorReset`, with the platform, the account, who said it, the request count before and matt's words, and the answer names that row. The resets made by hand before (`governorResets.jsonl`) are imported into the ledger once.

Checked by: code and SubQ

### REQ-GOVERNOR-04: A cooldown after a block is kept

A reset changes the counts only: a cooldown after a block stays, and the answer says so, since nothing resumes on a blocked account until matt says so (rule 94).

Checked by: code and SubQ
