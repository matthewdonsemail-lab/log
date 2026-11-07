---
title: "treg"
---

# treg

[treg](https://treg.to/?ref=matthewdonse-aebsh) is the tool catalog: about 2,600 endpoints across about 40 providers (web search, X and TikTok data, SEO, people and company enrichment, ad libraries...), each called with the key injected server-side, so nobody holds the provider's key. log uses it for every lookup that has to come from an external source, never from memory or a guess (rules 53, 166).

## What log can do with it

| Tool | Command | What it gives |
| --- | --- | --- |
| `tregSearch` | `log treg search "<what you want done>" [--limit <n>]` | The endpoints that do the job, each with its id, what it does and its price |
| `tregGet` | `log treg get <endpointId>` | One endpoint in full: its price, every param and a call that works |
| `tregCall` | `log treg call <endpointId> --params '<json object>' [--path <p>] [--method <m>] [--data '<body>'] [--await]` | Its answer, as the provider sent it |
| `tregCallLive` | the same with `--live --approvedBy matt` | The same, for a priced endpoint matt asked to spend on |

## What it costs

Every call reads the endpoint's price with `get` first:

- **A free endpoint runs.** `tinyfish.web.search` is free, for example.
- **A priced endpoint is a dry run.** It prints the price and the exact `treg call` it would run, and calls and spends nothing.
- **It runs only with `--live` and `--approvedBy`,** when matt asked for that spend (rule 41). Over MCP that's `tregCallLive` with `confirmLive: true`.

The team's treg balance is in `log balance` (rule 164).

## How it runs

log runs the treg CLI on this machine (`treg.exe`, found on the PATH; `TREG_BIN` moves it), as a child process with its arguments passed one by one, never through a shell. Each `search`, `get` and `call` is a timed span in the call's timings (`treg.search`, `treg.get`, `treg.call`, rule 165), so `log timing` shows how long treg took.

## Example

```
log treg search "web search"
log treg get tinyfish.web.search
log treg call tinyfish.web.search --params '{"query":"kick streamer managers","domain_type":"web"}'
```

## Setting it up

Install the treg CLI and sign in (`treg --help`). There is no key in `.env.local`: treg holds the credentials server-side.

Spec: [treg](../specs/treg.md).
