# Vendors

Where we buy the Facebook accounts that log-cli posts from. These files are
reference only: matt's research on each vendor (region, site, direct listing
URLs, 2FA and cookie availability, pricing, how far the region was verified).
Nothing in log-cli reads them, and they hold no account logins.

The files are stored exactly as matt sent them on 2026-10-18 (one JSON object
per line, field names as the research wrote them). Only the file names were
changed, to camelCase (AGENTS.md rule 1).

| File | Region | Vendors |
|---|---|---|
| `irelandUkFacebookAccounts.jsonl` | UK / Ireland | NPPR Team Shop, AccsZone, BulkAcc, HQ Accounts, PVAMarkets |
| `canadaBcFacebookAccounts.jsonl` | Canada (British Columbia not found separately) | NPPR Team Shop, AccsZone / AccsBulk, PVAMarkets |
| `usaEastCoastFacebookAccounts.jsonl` | USA (no East Coast / state-level listing verified) | NPPR Team Shop, ADS2FA, PVAMarkets, BulkAcc, HQ Accounts, PE2P, AccsZone, PlayerOK, BuyFB, AcctBoom |
| `usaFacebookDirectListings.jsonl` | USA, direct product URLs | NPPR Team Shop, AccsZone, PVAMarkets, ADS2FA, BulkAcc, HQ Accounts, PE2P |

Fields in each line: `provider_name`, `region_focus` (or `geographic_location`),
`website_url` (or `main_url`), `direct_listing_urls`, `account_details`,
`2fa_availability`, `username_password_availability`, `cookie_availability`,
`pricing`, and `verification_status` (or `notes`).

What the research says to watch:
- **Region claims are mostly country level.** Ireland is usually inside a UK or
  "Europe" listing, not its own product. No vendor confirmed British Columbia or
  a US state.
- Stock and prices change daily. Treat the URLs and prices as a snapshot.

## From purchase to socialAccounts

A bought account goes into Twenty's `socialAccounts` object, one record per
account, never into a file in this repo. Delivered logins, cookies and 2FA
secrets are credentials: they go straight into Twenty and nowhere else (not
git, not chat).

| socialAccounts field | What goes in it |
|---|---|
| `platform` | `FACEBOOK` |
| `accountName` | The account's Facebook username or numeric id (log-cli's `--account`) |
| `name` | The profile's display name |
| `email` / `password` / `emailPassword` / `phoneNumber` | As delivered by the vendor |
| `profileUrl` | `https://www.facebook.com/<id>` |
| `cookies` | The delivered cookies as JSON (a list of `{ name, value, domain, path }` or a `name: value` object). `log connect` refreshes them |
| `homeCity` / `homeCountry` | Where the account is registered and must appear from, e.g. `Galway` / `IE`. Take the country from the vendor listing, not a guess |
| `proxy` | A proxy **in `homeCountry`**, as `http://user:pass@host:port`. Bought separately: vendors sell the account, not its IP |
| `accountStatus` | `WARMING` for a fresh account, `NEEDS_LOGIN` until `log connect` has run |

Before an account does anything:

1. `log proxy check --account <accountName>`: the proxy's exit IP must be in
   `homeCountry`. No log-cli run opens a browser until it is
   (AGENTS.md rule 12, `docs/proxies.md`).
2. `log connect --account <accountName>`: sign in once through the proxy and save
   fresh cookies to Twenty.
3. Set `accountStatus` to `ACTIVE` when it's ready to post.

Not in socialAccounts yet, so only noted here:
- **The 2FA (TOTP) secret** many vendors deliver. There is no field for it.
- **Which vendor and order an account came from.** There is no field for it.

Both are worth a field before buying in volume.
