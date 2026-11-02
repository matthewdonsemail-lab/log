---
title: "Local accounts"
---

# Local accounts

Accounts can live in a local file instead of Twenty, on every platform, so log can run everything locally. `log localAccount pull|add|list` (MCP `localAccount`) fills and reads the file, and `LOG_ACCOUNTS=local` leaves Twenty out of accounts entirely. Listings, groups and conversations stay in Twenty. Rule 97, which narrows rule 13 for accounts only.

## The file

### REQ-LOCAL-01: Accounts live in one local file

Local accounts are kept in `~/.logCli/localAccounts.json`, and `LOG_LOCAL_ACCOUNTS` moves it. The file is written readable by its owner only, since it holds cookies and logins.

Checked by: code and SubQ

## The commands

### REQ-LOCAL-02: Pull copies every Twenty account in, keeping its Twenty id

`log localAccount pull` copies every Twenty account (or one platform's, `--platform`) into the file with its cookies and its login (email, password, two-step secret, PIN). Each pulled row keeps its Twenty id, so its listings and groups still find it. An account already in the file is kept as it is unless `--refresh`. Twenty is not changed.

Checked by: code and SubQ

### REQ-LOCAL-03: Add makes an account Twenty never had

`log localAccount add --platform <p> --account <a>` saves an account to the file under a local id (`local:<platform>:<accountName>`), with its AdsPower profile (`--adsPower`, which sets the AdsPower driver), proxy, home country and city. It takes any platform log knows, and Twenty is not touched.

Checked by: code and SubQ

### REQ-LOCAL-04: List shows the local accounts

`log localAccount list` shows every account in the file with its platform, name, AdsPower profile and session state.

Checked by: code and SubQ

## How every command reads accounts

### REQ-LOCAL-05: A local row wins over Twenty's of the same name

Every command reads accounts through one wrapper over Twenty: a list of accounts holds the local rows and then Twenty's rows, minus any Twenty row with the same platform and name as a local one.

Checked by: code and SubQ

### REQ-LOCAL-06: LOG_ACCOUNTS=local leaves Twenty out of accounts

With `LOG_ACCOUNTS=local`, listing, reading, creating and updating accounts and reading their logins use only the file, and Twenty is never asked about an account.

Checked by: code and SubQ

### REQ-LOCAL-07: A session a run saves goes back to the file

An update to an account that is in the file (a session a run captured or refreshed, a state) is written to the file, never to Twenty.

Checked by: SubQ

### REQ-LOCAL-08: Everything else stays in Twenty

Listings, groups, conversations and every other object are read and written in Twenty whatever `LOG_ACCOUNTS` says.

Checked by: SubQ

### REQ-LOCAL-09: The tool names the rule it falls under

The `localAccount` MCP tool's description names rule 97 among the rules it falls under (rule 47).

Checked by: code and SubQ
