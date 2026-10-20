# Account history and Meta enforcement

**Id:** `accountHistoryAndMetaEnforcement` · **Severity:** high (cannot be engineered away) · **Status:** accepted risk (inherent to bought accounts)

## Summary

A bought account arrives with a history we can't see or change. It carries the
vendor's login IPs and countries, cookies made on the vendor's device, and
whatever Meta has already linked to it. Our first run changes the country, the
IP, the device and the timezone all at once. No browser setting removes what
Meta already holds. This file also states, once, what Meta's own documents say
about automation, Marketplace eligibility and enforcement, so the rest of the
study can be read against it.

## What Meta's documents say

- **Terms.** Meta's Terms prohibit accessing or collecting data from its
  products by automated means without prior permission, and prohibit getting
  around access controls (S31). Its Automated Data Collection Terms require
  separate, express permission. Accepting those terms is not permission
  (S32, R1 §8). *vendorDocs*
- **Marketplace eligibility.** Marketplace is for people who live in a country
  where it is available. It can be unavailable for other reasons too: age, a
  new or inactive account, an additional rather than main profile, or policy
  violations (S37). An Irish exit IP doesn't meet the residence requirement.
  A listing location is not the seller's residence (R1 §8). *vendorDocs*
- **Enforcement isn't deterministic.** Meta documents device recognition (S33),
  security checks (S34), approximate login locations (S35), and content
  restriction, suspension or disabling for violations, including serious or
  repeated ones (S31). None of these sources gives a rule like "this mismatch
  means a ban". The same signals can lead to no action, a login alert, a
  checkpoint, Marketplace losing access, or an account being disabled (R1 §8).
  *vendorDocs*
- **What this study can claim.** It finds and reduces measurable
  inconsistencies. It does not claim, and no evidence supports, that the
  operation can't be detected. Detection and enforcement are separate.
  Public evidence doesn't show how Meta combines signals into a decision
  (R1, Synthesis).

## What leaks and to whom

- **To Facebook, before we ever touch the account:**
  - the vendor's login IPs, countries and devices;
  - the `datr`/`sb` browser cookies minted on the vendor's machine;
  - any Accounts Center links;
  - device and activity data Meta gets from its products and from third-party
    sites (S29, S30).

  *vendorDocs* for what Meta collects. *inference* for what any one bought
  account carries.
- **At our first run:** a change of country, IP, device fingerprint and
  timezone in one session (R2 §12). *inference*
- **At replacement.** When an account is banned, its campaign listings get a
  replacement account in the same country (`docs/accountsAndListings.md`,
  rule 13). The same listing content, posted again from the same PC (one GPU,
  `webglGpuLinkage.md`), is a natural link between the old and new account.
  *inference*

## Evidence

- **Meta collects usual login locations and may "check that it's really you"**
  on a login from somewhere new (S29, per R2 §12). *vendorDocs*
- **Device recognition.** Private browsing can stop Facebook recognising a device
  (S33). *vendorDocs*
- **Unfamiliar locations** in "Where you're logged in" can be approximate or
  wrong (S35). *vendorDocs*
- **Meta's DEC system** classifies accounts using linked entities: devices shared
  between users, IP country and reputation, accounts registered from an IP
  (S38, Table 1). *vendorDocs (paper)*
- **Vendors.** Region claims are mostly country level. Ireland is usually inside
  a UK or "Europe" listing. No vendor confirmed British Columbia or a US state
  (`docs/vendors/README.md`). *verifiedSource*
- **Currency follows the account's own region.** Listaro saw wrong currencies
  on bought accounts (commits `504ea63`, `0c7c8bc`;
  `listingContentAndCurrency.md`). *verifiedSource*
- **Earlier systems.** Listaro: "Cookies must be created on the same IP the
  server uses" (commit `a37058b`). *verifiedSource*

### Where the reports disagree

- **R1** frames the whole question around legitimate use and official recovery.
  It advises against tuning around unknown thresholds (R1 §8, Synthesis).
- **R2 and R4** give operational fixes (warm-up, a stable identity).
- They don't disagree on the facts. All three agree Meta's thresholds are not
  public and outcomes are not predictable. This file records R1's facts once
  and doesn't repeat them elsewhere.

## Where in our code it can happen again

- `log connect` (`src/cli/live/index.ts`, `python/session/logWorker.py` `login`): the
  first session on a new account.
- `src/marketplace/replacement/`: choosing a replacement account for a banned
  one.
- `scripts/twenty/twentySetup.mjs` and `socialAccounts`: where recovery details, home
  country and city live.

## Mitigation

These reduce changes we cause. They can't undo the account's past.

1. **Fix the identity before the first sign-in.** Create the device persona,
   locale, timezone and home-town position (`deviceFingerprintChurn.md`,
   `localeAndLanguage.md`, `geolocationApi.md`), then sign in once with all of
   it. Keep it the same from then on (R2 §12).
2. **Don't stack changes.** Don't change the proxy session, device and behaviour
   in the same session (R2 §12).
3. **Keep the account's own recovery details** in Twenty. Facebook's own
   challenges go to a person (rule 10). Never answer them with the operator's
   phone or email (`manualSignIn.md`).
4. **Record outcomes.** Keep every checkpoint, alert, Marketplace restriction and
   ban in the account's Twenty record with its status (rule 13). Over time this
   is the only evidence of what Meta reacts to.
5. **Replacement accounts.** Treat a reposted listing on a replacement account as
   linked to the old one. Vary the content, and avoid replacing many accounts
   from the same machine. *inference*

## How to re-test

There is no lab test for Meta's decisions. Track it instead:

1. For each account, log the first sign-in date, persona creation date,
   checkpoints, alerts and restrictions in Twenty.
2. Review monthly: do checkpoints cluster after particular changes (a new persona,
   a proxy change, a Camoufox upgrade)?

## Status

Accepted risk: it's inherent to operating bought accounts from another country.
It can be reduced, but not removed.
