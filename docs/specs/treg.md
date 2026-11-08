---
title: "treg"
---

# treg

treg's catalog reached from log as an extension: endpoints found by the job, read, and called with the key held server-side, with nothing priced run unless matt approved the spend. Rule 166.

### REQ-TREG-01: Search, get and call run the treg CLI, never a shell

`log treg search`, `get` and `call` (`tregCommand`, `src/cli/treg/index.ts`) go through `createTregClient` (`src/extensions/treg/client.ts`). It runs the treg CLI (`tregBin`, `TREG_BIN` or `treg`) with `execFile`, its arguments passed one by one and never through a shell, under a time limit, with its output capped. `search` runs `treg catalog search <words> --limit <n>`, `get` runs `treg catalog get <id>`, and `call` runs `treg call <id> [path]` with each param as `--query key=value` (`callArgs`). A param that is a list is sent comma-separated. Each run is a timed span (`treg.search`, `treg.get`, `treg.call`) with its exit code. A failed run is refused with `tregFailed` and treg's own words, and params that aren't a JSON object are refused with `tregParamsInvalid` (`paramsOf`).

Checked by: code and SubQ

### REQ-TREG-02: Nothing priced runs unless matt approved the spend

Every call reads the endpoint with `get` and takes its price (`endpointOf`). Without `--live` and `--approvedBy`, that read comes first and decides what happens. With both, the spend is already approved, so the read and the call run at the same time, and the price is still reported. That saves the read's 4 s from every approved call (issue #99). A price of free or $0 is free (`isFreePrice`). A free endpoint is called. A priced endpoint without `--live` is a dry run: it says the price and the exact command (`shownCommand`), and calls nothing. With `--live` but no `--approvedBy` it is refused with `notApproved`. Only `--live` with `--approvedBy` calls it, which is the MCP tool `tregCallLive` with `confirmLive`.

Checked by: code and SubQ

### REQ-TREG-03: A call's answer comes back trimmed

`call` drops treg's `raw` copy of the provider's answer unless `--raw` (`trimAnswer`). `--where key=value`, `--maxItems` and `--fields` trim every list of rows in the answer, after it is parsed and before it is printed (`trimOf`, `trimAnswer`), and a malformed one is refused with `tregTrimInvalid` before treg is called. Trimming changes only what comes back, never the call or its charge.

Checked by: code and tests
