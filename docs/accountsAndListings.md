# Accounts and listings in Twenty

AGENTS.md rules 12–14. Everything lives in Twenty; log-cli reads it, runs it,
and writes the results back. There is no UI of its own: matt says what to do,
the CLI does it.

## Where things live

| What | Twenty object | Key fields log-cli uses |
|---|---|---|
| A Facebook account | `socialAccounts`, `platform = FACEBOOK` | `accountName` (the `--account` handle), `proxy`, `homeCity`, `homeCountry`, `accountStatus`, `statusReason`, `cookies`, `dailyListingCap`, `lastPostedAt`, proxy check results, `vendor…`, `totpSecret` |
| A listing on one account | `agencyListings` | ad (`title`, `description`, `price`, `category`, `condition`, `photos`), location (`locationQuery` "Galway, Ireland", `locationCity`, `locationCountry`), `status`, `socialAccount`, `campaign`, `replaces`, `generation`, Facebook `listingId` / `listingUrl`, last run |
| A buyer's conversation about a listing | `agencyConversations` (`channel = FACEBOOK_MARKETPLACE`), its messages in `agencyMessages` | `socialAccount`, `agencyListing`, `facebookThreadId`, buyer, `leadStatus`, `unreadCount`, `latest*`. Each message's `agencyConversation`, `direction`, `messageKey`, `isRead`, `sentBy`, `aiStatus` (rule 34, `docs/conversations.md`) |
| A campaign | `agencyCampaigns` | groups listings: 10 accounts in Galway = 10 agencyListing rows with the same `campaign` |

The twitter-controller reads the same `socialAccounts` (only `accountName`,
`platform` and `cookies` on TWITTER rows). log-cli only ever **added** fields
(`scripts/twentySetup.mjs`), so nothing it relies on changed.

## Account status

| Status | May post | Set by | Cleared |
|---|---|---|---|
| ACTIVE | yes | a sign-in, or by hand | |
| WARMING | yes, within its cap | by hand | |
| LIMITED | no | `rateLimited` seen on a page | after the limit |
| PAUSED | no | by hand | by hand |
| NEEDS_LOGIN | no (may sign in) | `sessionExpired`, `loginWall`, `neverConnected`, `cookieInvalid` | `log connect` |
| CHECKPOINT | no (may sign in) | `checkpointed`, `unconfirmedUser` | `log connect` after a person clears it |
| RESTRICTED | no | `suspended` ("can't buy or sell"), `readOnlyLimited`, `restrictedPolicy` | by hand |
| BANNED | no, terminal | `accountDisabled` ("your account has been disabled"), or by hand | never automatically |
| DEAD | no, terminal | by hand (lost, deleted, unrecoverable) | never automatically |

`log account status <name> <STATUS> [--reason <code>]` sets it by hand. Runs
set it themselves from what the page shows (`marketplace/socialAccount`
`statusForIssue`). Proxy problems never change an account's status: they are
setup, not the account's fault.

## Losing an account, and its replacement

When an account becomes RESTRICTED, BANNED or DEAD (from a run or by hand):

1. The account row is **kept**, with its status, reason and time.
2. Its listings that were DRAFT, READY, ACTIVE, UNDER_REVIEW, BLOCKED or FAILED
   become **ACCOUNT_LOST**. They are kept too. SOLD and REMOVED rows don't change.
3. Every lost listing **in a campaign** gets a replacement account, which must be:
   - FACEBOOK, ACTIVE or WARMING, with a proxy and a saved session (cookies);
   - in the listing's country (`homeCountry = locationCountry`);
   - not already holding a slot in that campaign (10 accounts stay 10);
   - under its `dailyListingCap` today.

   The order is the same city first, then the least recently posted.
4. A new READY row is created with the same ad: `generation + 1`, `replaces` → the
   old row, and `replacementReason`. The old row becomes **REPLACED**.
5. If no account qualifies, the old row stays ACCOUNT_LOST with
   `lastErrorCode = noReplacementAccount`. Nothing ever posts from another country.

Listaro never did this: a banned account's posts were just marked failed, and
reposts always went back to the same account (Listaro research, 2026-10-18).

## Campaigns

```bash
log campaign fill --campaign <agencyCampaignId> --from <agencyListingId> --accounts 10
log campaign show --campaign <id>
log campaign run  --campaign <id>            # dry run of every READY listing
log campaign run  --campaign <id> --live     # publish them
log campaign heal --campaign <id>            # retry ACCOUNT_LOST listings (after adding accounts)
```

`fill` takes one ad (any agencyListing, e.g. a DRAFT with no account) and puts
it on up to N eligible accounts in its country, one row each. `run` publishes
each READY row through `log publish`, so every listing passes the account
check and the proxy gate on its own.

## The checks every run makes

Before any browser opens, dry run or live:

1. The listing is publishable: DRAFT, READY, FAILED or BLOCKED. A live,
   publishing or unconfirmed one would make a duplicate.
2. The account is FACEBOOK, with a usable status, a readable proxy and a home country.
3. The listing is in the account's country (`locationCountry`, and the country in
   `locationQuery`).
4. A live publish is under the account's daily cap.
5. python/proxyGate.py: the proxy's exit IP is in the home country, and the
   browser's timezone, locale and WebRTC come from that IP.
6. On the form, the Location suggestion picked must name that country too.

Every refusal and every run is written to the listing row (`lastRunAt`,
`lastRunResult`, `lastErrorCode`, `lastError`). `log errors --code <code>`
explains any code.
