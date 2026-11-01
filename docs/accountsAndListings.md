# Accounts and listings

This page explains how log keeps track of Facebook accounts, their Marketplace
listings and campaigns, and what happens when an account is lost. Everything
lives in Twenty: log reads it, runs it, and writes the results back. Read this
when you set up accounts, run a campaign, or want to know why a listing moved
to another account.

## Where things live

| What | Twenty object | Key fields log uses |
|---|---|---|
| A Facebook account | `socialAccounts`, `platform = FACEBOOK` | `accountName` (the `--account` handle), `proxy`, `homeCity`, `homeCountry`, `accountStatus`, `statusReason`, `cookies`, `dailyListingCap`, `lastPostedAt`, proxy check results, `vendor…`, `totpSecret` |
| A listing on one account | `agencyListings` | the ad (`title`, `description`, `price`, `category`, `condition`, `photos`, `copyVersions` and the `copyVersionId` this copy took), the location (`locationQuery` such as "Galway, Ireland", `locationCity`, `locationCountry`), `status`, `socialAccount`, `campaign`, `replaces`, `generation`, Facebook's `listingId` / `listingUrl`, the last run |
| A buyer's conversation about a listing | `agencyConversations` (`channel = FACEBOOK_MARKETPLACE`), with its messages in `agencyMessages` | `socialAccount`, `agencyListing`, `facebookThreadId`, buyer, `leadStatus`, `unreadCount`, `latest*`. Each message has `agencyConversation`, `direction`, `messageKey`, `isRead`, `sentBy`, `aiStatus` ([Conversations](conversations.md)) |
| A campaign | `agencyCampaigns` | Groups listings: 10 accounts in Galway means 10 `agencyListings` rows with the same `campaign` |

Other tools can read the same `socialAccounts` rows. log only ever **adds**
fields (`scripts/twenty/twentySetup.mjs`), so nothing another tool relies on
changes.

## Account status

| Status | May post | Set by | Cleared by |
|---|---|---|---|
| ACTIVE | yes | a sign-in, or by hand | |
| WARMING | yes, within its cap | by hand | |
| LIMITED | no | `rateLimited` seen on a page | time, after the limit |
| PAUSED | no | by hand | by hand |
| NEEDS_LOGIN | no (may sign in) | `sessionExpired`, `loginWall`, `neverConnected`, `cookieInvalid` | `log facebook connect` |
| CHECKPOINT | no (may sign in) | `checkpointed`, `unconfirmedUser` | `log facebook connect` after a person clears it |
| RESTRICTED | no | `suspended` ("can't buy or sell"), `readOnlyLimited`, `restrictedPolicy` | by hand |
| BANNED | no, final | `accountDisabled` ("your account has been disabled"), or by hand | never automatically |
| DEAD | no, final | by hand (lost, deleted, unrecoverable) | never automatically |
| DEACTIVATED | no, never used | by hand, when you take an account out of use | by hand |

Set a status by hand with
`log facebook account status <name> <STATUS> [--reason <code>]`. Runs set it
themselves from what the page shows (`statusForIssue` in
`marketplace/socialAccount`). Proxy problems never change an account's status:
they are a setup problem, not the account's.

### What DEACTIVATED does

- The account's proxy is cleared in the same write, so it costs no traffic.
- `log proxy assign --missing` skips it, and `log proxy assign --account`
  refuses it.
- Its lifecycle ends at once, and no run or sign-in may open it.
- Its AdsPower profile is deleted and unlinked, and the slot goes to an
  account waiting for one.
- Its listings are lost and replaced, the same as for a RESTRICTED account.
- Its row, cookies and history stay.

## Taking a listing down

```bash
log facebook listing remove <agencyListingId|facebookListingId> --live
```

This deletes the listing on Facebook from its own account's Selling page,
through the recorded flow `marketplaceListingDelete` (More options, Delete
listing, Delete, then "No, haven't sold").

- The Twenty row becomes **REMOVED** only once Facebook's delete answer names
  that listing's id.
- The row is never deleted. It keeps its title, photos, Facebook id, clicks and
  account, so the account still shows it, marked REMOVED.
- Without `--live` it is a dry run that lists the steps.
- Only ACTIVE, UNDER_REVIEW, UNCONFIRMED, SOLD and DUPLICATE_TAKEDOWN listings
  with a Facebook id can be taken down (`listingNotRemovable` otherwise).

## Losing an account, and its replacement

When an account becomes RESTRICTED, BANNED, DEAD or DEACTIVATED (from a run or
by hand):

1. The account row is **kept**, with its status, reason and time.
2. Its listings that were DRAFT, READY, ACTIVE, UNDER_REVIEW, BLOCKED or FAILED
   become **ACCOUNT_LOST**. They are kept too. SOLD and REMOVED rows don't
   change.
3. Every lost listing **in a campaign** gets a replacement account. The
   replacement must be:
   - FACEBOOK, ACTIVE or WARMING, with a proxy and a saved session (cookies);
   - in the listing's country (`homeCountry = locationCountry`);
   - not already holding a slot in that campaign (10 accounts stay 10);
   - under its `dailyListingCap` today.

   Accounts in the same city come first, then the least recently posted.
4. A new READY row is created with the same ad: `generation + 1`, `replaces`
   pointing at the old row, and a `replacementReason`. The old row becomes
   **REPLACED**.
5. If no account qualifies, the old row stays ACCOUNT_LOST with
   `lastErrorCode = noReplacementAccount`. Nothing ever posts from another
   country.

## Campaigns

```bash
log facebook campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts 10
log facebook campaign show --campaign <id>
log facebook campaign run  --campaign <id>            # dry run of every READY listing
log facebook campaign run  --campaign <id> --live     # publish them
log facebook campaign heal --campaign <id>            # retry ACCOUNT_LOST listings (after adding accounts)
```

- `fill` takes one ad (any listing, for example a DRAFT with no account) and
  puts it on up to N eligible accounts in its country, one row each.
- `run` publishes each READY row through `log facebook publish`, so every
  listing passes the account check and the proxy gate on its own.

## The checks every run makes

Before any browser opens, dry run or live:

1. The listing can be published: DRAFT, READY, FAILED or BLOCKED. A live,
   publishing or unconfirmed one would make a duplicate.
2. The account is FACEBOOK, with a usable status, a readable proxy and a home
   country.
3. The listing is in the account's country (`locationCountry`, and the country
   in `locationQuery`).
4. A live publish is under the account's daily cap.
5. The proxy gate (`python/browser/proxyGate.py`): the proxy's exit IP is in
   the home country, and the browser's timezone, locale and WebRTC come from
   that IP.
6. On the form, the Location suggestion picked must name that country too.

Every refusal and every run is written to the listing row (`lastRunAt`,
`lastRunResult`, `lastErrorCode`, `lastError`). `log errors --code <code>`
explains any code.

The rules behind this are in AGENTS.md.
