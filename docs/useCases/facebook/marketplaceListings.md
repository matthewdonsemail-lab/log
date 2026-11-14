# From accounts to live Marketplace listings

How a local service business gets listings in front of people in every town it serves: take aged Facebook accounts, turn each one into a believable local profile, and post a listing from each one. This page walks one account all the way through, shows which part of log-cli does each step, and what decides that the step worked.

How the owner asks for it: "post a marketplace listing in <town>", "get listings up on facebook marketplace in every town", "set up the facebook accounts and publish the listings", "take the marketplace listing down".

## The idea in one line

One account per town. Each one gets a proxy in that town, its own browser profile, a photo, a cover, a name and a location, a day of normal browsing, and then one listing, all checked against Facebook's own answers.

```mermaid
flowchart LR
  buy["1. import the account<br/>Twenty socialAccounts"] --> proxy["2. a proxy near<br/>the home town"]
  proxy --> device["3. one AdsPower<br/>profile each"]
  device --> host["4. the host opens the browser<br/>once a day"]
  host --> setup["5. sign in, check,<br/>photo, name, location"]
  setup --> warm["6. warm-up"]
  warm --> publish["7. publish the listing"]
  publish --> check["8. check it every 12 min<br/>clicks into Twenty"]
```

## One account, end to end

- **Imported** into Twenty with its home town, cookies and two-step secret.
- **Proxy:** a residential proxy near the home town, checked for country and distance before it's saved.
- **Location:** typing "City, ST" can be offered as a different place entirely (a town of the same name abroad), and a bare zip can be offered as another country first. So locations are always typed with the state written out, "City, State" ([spec](../../specs/marketplaceLocation.md)).
- **Listing:** the service, a price and photos. Facebook's create answer returns the listing id, under review at first, and Twenty marks it UNDER_REVIEW, then live.
- **Taken down** when needed: the delete answer names the listing id, and the row becomes REMOVED (rows are never deleted).

Count the cost per account (the account, its proxy traffic, the browser profile) against what one lead is worth before scaling to many towns.

## The steps and the commands

Every Facebook command starts with the platform (`log facebook …`), and each has an MCP tool. Anything that changes something on Facebook is its own `…Live` tool and needs `confirmLive` (rule 8).

<!-- stepsDiagram: written by `bun run docs:build` from the steps table below, not edited by hand -->
```mermaid
flowchart TD
  s0["1. Import<br/><i>–</i>"]
  s1["2. Proxy<br/><i>proxyAssign, proxyCheck</i>"]
  s2["3. Browser profile<br/><i>adsPowerSync, adsPowerSyncLive</i>"]
  s3["4. Ready?<br/><i>facebookPreflight</i>"]
  s4["5. Open the day<br/><i>facebookHostStartLive</i>"]
  s5["6. Sign in<br/><i>facebookConnect</i>"]
  s6["7. Account check<br/><i>facebookCheck</i>"]
  s7["8. Photo, cover, name<br/><i>facebookProfileSetupLive</i>"]
  s8["9. Location<br/><i>inspectDoLive</i>"]
  s9["10. Warm-up<br/><i>warmup, warmupLive</i>"]
  s10["11. Copy<br/><i>facebookListingCreate, facebookListingLint</i>"]
  s11["12. Publish<br/><i>facebookFlowMarketplaceListingPublishLive</i>"]
  s12["13. Many towns<br/><i>facebookCampaignFill, facebookCampaignRunLive</i>"]
  s13["14. Watch<br/><i>facebookCheck</i>"]
  s14["15. Take down<br/><i>facebookListingRemoveLive, facebookFlowMarketplaceListingDeleteLive</i>"]
  s0 --> s1
  s1 --> s2
  s2 --> s3
  s3 --> s4
  s4 --> s5
  s5 --> s6
  s6 --> s7
  s7 --> s8
  s8 --> s9
  s9 --> s10
  s10 --> s11
  s11 --> s12
  s12 --> s13
  s13 --> s14
```
<!-- /stepsDiagram -->

| # | Step | MCP tool | What decides it | Command |
| --- | --- | --- | --- | --- |
| 1 | Import | – | the row in Twenty `socialAccounts` | `scripts/twenty/importVendorAccounts.mjs` |
| 2 | Proxy | `proxyAssign`, `proxyCheck` | the exit IP is in the home country and within 100 km of the home town | `log proxy assign --account <a> --vendor <vendor>`, `log proxy check` |
| 3 | Browser profile | `adsPowerSync` (a dry run), then `adsPowerSyncLive` { confirmLive: true } | one [AdsPower](https://www.adspower.com/share/pD25Iu) profile per account, linked in `adsPowerProfileId` | `log adsPower sync --apply` |
| 4 | Ready? | `facebookPreflight` | hours, proxy, kernel, opens left, photo on disk, before anything opens | `log facebook preflight` |
| 5 | Open the day | `facebookHostStartLive` | the browser's own timezone, language and exit IP match the account | `log facebook host start --account <a> --live` |
| 6 | Sign in | `facebookConnect` | Facebook's `c_user` and `xs` cookies | `log facebook connect --account <a>` (the host does it) |
| 7 | Account check | `facebookCheck` | `/marketplace/status` says selling is open | `log facebook check --account <a>` |
| 8 | Photo, cover, name | `facebookProfileSetupLive` | the photo and name saves answer without an error | `log facebook profile setup --account <a> --live` |
| 9 | Location | `inspectDoLive` | the location save's answer names the town | `log inspect do setLocation "<City>, <State>" --live` (the host does it) |
| 10 | Warm-up | `warmup`, `warmupLive` | the five browsing activities each see their own answer; then 24 h before it's ready | `log facebook warmup stages run`, `log facebook warmup reel` |
| 11 | Copy | `facebookListingCreate`, `facebookListingLint` | an ad on more than one listing in a city: at least 3 versions and one per listing live there, every two titles at least half different (the city not counted); `campaign fill` refuses too few (`notEnoughCopyVersions`) | `log facebook listing create`, `listing lint` |
| 12 | Publish | `facebookFlowMarketplaceListingPublishLive` | the create answer returns the listing id | `log flow run marketplaceListingPublish --account <a> --live` |
| 13 | Many towns | `facebookCampaignFill`, `facebookCampaignRunLive` | one copy per account, a lost account's copy handed to another in the same area | `log facebook campaign fill`, `run`, `heal` |
| 14 | Watch | `facebookCheck` | each listing's state and clicks from the Selling page, into `agencyListings` | the host, every 12 minutes, or `log facebook check` |
| 15 | Take down | `facebookListingRemoveLive`, `facebookFlowMarketplaceListingDeleteLive` | the delete answer names the listing | `log facebook listing remove <id> --live` |

## What keeps an account safe

- **One browser a day.** The host opens each account's browser once per local day and keeps it open; every action is a tab in it (rule 35). On top of that, an account's browser opens at most 8 times a day, 10 minutes apart (rule 35).
- **The proxy first.** No browser opens without a proxy in the account's home country (rule 35).
- **Local hours.** Nothing runs outside 08:00–22:00 in the account's home town unless the owner asks (rule 35).
- **The same device every time.** Each account keeps one fingerprint (rule 35).
- **Recorded.** Every step is recorded, and Facebook's own answers decide what happened, never the screen (rule 73).

## What log-cli does underneath

```mermaid
flowchart LR
  cmd["log facebook … / MCP tool"] --> gate["gates: proxy, hours,<br/>opens left, self-check"]
  gate --> browser["the account's AdsPower browser<br/>(one a day, one tab per action)"]
  browser --> fb["Facebook"]
  fb --> answer["Facebook's own answer<br/>read from the recording"]
  answer --> machine["the account's lifecycle machine<br/>onboarding lane, then host lane"]
  answer --> twenty["Twenty: account, listing, clicks"]
```

- Each account runs one lifecycle machine (`src/platformKit/lifecycle`): proxying, opening, signingIn, checkingAccount, settingProfile, settingName, settingLocation, warming, attached, then watching and checking.
- Flows are recorded once with `log inspect` and then replayed on any account (`src/browser/flow/definitions/*.json`, docs in `docs/platforms/facebook/flows/`).
- When a step lands somewhere new, its internal API calls are read, SubQ is asked what they mean, and the new state gets a name (rule one at the top of `AGENTS.md`).

## When accounts are lost

Not every account makes it. Some are lost before or after their first listing: a video selfie, a wrong password, or an identity check on a live listing. Their listings go to ACCOUNT_LOST, and a campaign hands each lost copy to another account in the same area (`log facebook listing sweep`). A checkpointed account is deactivated and gives its browser profile back.

## Next

- [#41](https://github.com/matthewdonsemail-lab/log/issues/41) reads buyers' messages into Twenty and replies to them (`log facebook conversations` keeps what is recorded today).
- [#42](https://github.com/matthewdonsemail-lab/log/issues/42) publishes as a tab of the host's browser on every path (the recorded flow does already; the older `log facebook publish` opens its own browser).

## Ways to reuse it

The pipeline doesn't care what the listing sells. Anything that wants a local profile in many towns uses the same parts: the proxy per town, the profile, the warm-up, the recorded publish flow, and the 12-minute check. A new kind of listing is a new copy set and photos (`skills/listingCopy`, `skills/listingCreative`), not new code.

Sources here: `docs/lifecycle.md`, `docs/accountsAndListings.md`, `docs/proxies.md`, `docs/adsPower.md`, `skills/host/SKILL.md`. What each step must do: the specs for [proxies](../../specs/proxies.md), [the location](../../specs/marketplaceLocation.md), [copy versions](../../specs/marketplaceCopy.md), [the warm-up](../../specs/warmup.md) and [publish and check](../../specs/marketplacePublish.md).
