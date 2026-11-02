---
title: "Runs and rea"
---

# Runs and rea

Every browser action records a raw HAR of everything it did, and rea reads it. What each platform's client does is written up as one doc per request, by platform and then domain, built from the runs by `log facebook capture --docs` with rea reading each request's code. A run is deleted once it is analysed, and what it taught is kept. Rules 22, 27, 48, 66 and 85, with rule 73 (a step's exchanges are kept past the prune).

## Recording

### REQ-RUNS-01: Every browser context records a raw HAR

The proxy gate puts a HAR recorder on every browser context it opens, writing `session.har` into the run's capture folder with full content embedded. There is no way to turn it off.

Checked by: code and SubQ

### REQ-RUNS-02: A browser without a capture folder is refused

A browser context, or an attached browser, with no capture folder is refused with `captureMissing` before anything loads.

Checked by: code and SubQ

### REQ-RUNS-03: rea settles every run's capture

When a run ends, rea reads its capture in the background (`log facebook capture --settle`), and the run gets its `settle.json`.

Checked by: code and SubQ

### REQ-RUNS-04: The capture is split per step and each step is read

Settling splits `session.har` by the run's `steps.jsonl` into one HAR per step under `steps/`, rea reads each one, and the run gets `findings.md` with each step's Evidence ID.

Checked by: code and SubQ

## Request docs

### REQ-RUNS-05: Facebook's requests are documented by domain

`log facebook capture --docs` writes one doc per Facebook request at `docs/platforms/facebook/<domain>/<request>.md`, the domain taken from the request's name (`groups`, `reels`, `login` and the others), and lists them in `operations.json`.

Checked by: code and SubQ

### REQ-RUNS-06: rea reads each Facebook request's code

Each Facebook GraphQL request's modules are cut out of Facebook's bundles by syntax tree, and rea reads each slice.

Checked by: code and SubQ

### REQ-RUNS-07: Every browser platform's calls go through rea

The same build documents every other platform with a browser path under `docs/platforms/<platform>/`: its runs' calls to that platform's hosts, each named by its GraphQL operation or its path, its code found in that platform's bundles by syntax tree and read by rea. A call whose code is not in the bundles keeps its step's rea reading.

Checked by: code and SubQ

### REQ-RUNS-08: A doc keeps every row its pruned runs gave

The docs build folds each request's facts into `~/.logCli/rea/clientFacts.json` (one per platform), so a doc keeps every row it had from runs since pruned and only adds.

Checked by: code and SubQ

### REQ-RUNS-09: The docs gate refuses undocumented or unread requests

lefthook's pre-push runs the docs gate (`check:facebookClientDocs`). It refuses a listed doc that is missing, a doc rea has not read, a doc whose reasoning is not written, a doc not in `operations.json`, a Facebook request named in the code with no doc, and a run recorded after the docs were built.

Checked by: code and SubQ

## Pruning runs

### REQ-RUNS-10: A run may go only once it is analysed

A run may be deleted only when rea has settled it and the request docs were built after it. A run that is still open or was written in the last 10 minutes stays.

Checked by: code and SubQ

### REQ-RUNS-11: Pruning is a dry run unless --apply

`log runs prune` lists what would go and deletes nothing unless `--apply` is given.

Checked by: code and SubQ

### REQ-RUNS-12: Every step's exchanges are taken out before a run goes

Before a run is deleted, every step's internal API exchanges are taken out of its HAR into `exchanges.json`. A run where that fails for any step is kept.

Checked by: code and SubQ

### REQ-RUNS-13: What a run taught is kept

A pruned run keeps its `findings.md`, `steps.jsonl`, `settle.json`, every step's `exchanges.json` and reading, its goal findings, and its requests by domain, in `~/.logCli/runs/kept`, with one line in `runs/pruned.jsonl`.

Checked by: code and SubQ

### REQ-RUNS-14: The storage hook warns before the disk fills

An agent hook says so, with `log runs prune`, when `~/.logCli/runs` passes 2 GB or the disk has under 5 GB free.

Checked by: code and SubQ
