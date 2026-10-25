---
title: "What others say about Facebook's internal APIs we documented, and why fresh accounts burn"
tags: [facebook, internal-api, marketplace, accounts, warmup, checkpoint]
status: active
created: 2026-10-25
---

# What others say about the internal APIs we documented

Searched the 235 requests in `docs/platforms/facebook/` two ways, for what **other
people** write, never Facebook's own docs:

- **GitHub** (`gh api search/code`, search/issues): where the exact call names live.
- **TinyFish web** (`treg call tinyfish.web.search`, free), Facebook's own sites
  excluded (`facebook.com`, `meta.com`, `developers.facebook.com`, `instagram.com`,
  `messenger.com`, `metastatus.com`, `about.fb.com`, `fb.com`).

Raw results beside this file: `allRequests.md` (all 235, by domain), `ghTable.md`
(GitHub counts + repos), `githubHits.jsonl`, `webHits.jsonl`, `concepts.jsonl`.

## 1. The headline: the exact call names are only on GitHub, not the open web

Every exact query name (`MarketplaceYourListingDialogQuery`,
`CometMarketplaceSetBuyLocationMutation`, …) returned **0** open-web hits with
Facebook excluded. Nobody blogs or posts on forums about these by name. They show
up only in GitHub code — reverse-engineering repos. So:

- For "what does this call do / what shape", read the **GitHub repos** below.
- For "why is this happening to our accounts", read the **concept** discussion
  (section 3); people describe the *behaviour* (checkpoints, ID walls, bans), not
  the call names.

## 2. GitHub: who has reverse-engineered these calls

| Request | code hits | repos (top) |
|---|---|---|
| `TwoStepVerificationChallengePickerDialogQuery` | 15 | brxxn/fbtm, hopfian/fbk, vinikjkkj/wa-diff |
| `useUFACSubmitActionMutation` | 68 | brxxn/fbtm |
| `useTwoFactorLoginValidateCodeMutation` | 20 | ArezDev/relog-akun-ganda, IvenLagowan/Mr-editing-template, babyvibe/deplao-builder, brxxn/fbtm, gioitrongxuan/HUST |
| `TwoFactorAuthWizTriggerNonceCreatorMutation` | 0 | — |
| `usePasskeyAuthOptionsQuery` | 2 | hopfian/fbk |
| `useCometMarketplaceListingCreateMutation` | 17 | Bulldog-Vintage-SL/vinted-accounting, Canh-Cut-Khong-Bay/canhcut-bot, ajsh/ListItIn, jiamingc/fb-marketplace-proxy, m008v/fbchat-v2 |
| `MarketplaceYourListingDialogQuery` | 36 | Jarousek06/cukros, Mandla7784/Business-solution, Manishsah098/Kalikamai, WebWizardss/Php_Project, bgoonz/DEV-RESOURCES |
| `useMarketplaceComposerAttributesQuery` | 16 | Elio1996/ramosflooring, IvenLagowan/Mr-editing-template, MajeedCodes/Next-JS-Portfolio, WebWizardss/Php_Project, Ya-Be-Tech/mrs-philippines-montreal |
| `CometMarketplaceSetBuyLocationMutation` | 10 | Archive-42/INTERVIEW-PREP-COMPLETE, bgoonz/DEV-RESOURCES, bgoonz/INTERVIEW-PREP-COMPLETE, mvanhorn/printing-press-library, web-tools42/Interview |
| `MarketplaceSearchAddressDataSourceQuery` | 9 | AugusDogus/marketplace, BoPeng/ai-marketplace-monitor, hopfian/fbk, memhard/spamer_fb, saucesteals/shop |
| `CometActorGatewayHandlerQuery` | 15 | 0xzer/messagix, DuongJs/bot-mes, TKasperczyk/messenger-rag, braindead-dev/instagram-dms-mcp, hopfian/fbk |
| `browserextPhishingSitesCheck` | 0 | — |
| `CometIXTFacebookAuthenticityWizardTriggerRootQuery` | 89 | brxxn/fbtm, vinikjkkj/wa-diff |
| `useCometUSFScrollablePickerMutation` | 0 | — |
| `useCometMarketplaceCreateListingActionMutation` | 0 | — |

The repos worth reading (they recur across our calls):

- **`brxxn/fbtm`** — the richest. Hits on the 2FA picker, `useUFACSubmitAction`
  (the bot-captcha / UFAC flow we hit on Exeter) and, **89 hits**, the
  **authenticity wizard** (`CometIXTFacebookAuthenticityWizardTriggerRootQuery`) —
  Facebook's identity/authenticity gate, the same family as our Marketplace
  identity hold.
- **`hopfian/fbk`** — login, passkey (`usePasskeyAuthOptionsQuery`), address
  search, actor gateway. Matches our sign-in path.
- **`0xzer/messagix`** (Go) — `CometActorGatewayHandlerQuery` and the session
  bootstrap that fires on every launch.
- **`AugusDogus/marketplace`, `BoPeng/ai-marketplace-monitor`, `memhard/spamer_fb`,
  `jiamingc/fb-marketplace-proxy`, `saucesteals/shop`** — Marketplace listing,
  location and address calls.
- **`vinikjkkj/wa-diff`** — tracks Facebook/WhatsApp query-name changes over time
  (useful: the names drift, so our docs rot).

`useCometUSFScrollablePickerMutation` (the language switch), `browserextPhishingSitesCheck`
and `TwoFactorAuthWizTriggerNonceCreatorMutation` have **0** code hits — we may be
the only ones who have written these down.

## 3. The concepts people actually discuss — and the real cause of our burn

These are the community's words (Reddit, BlackHatWorld, MoreLogin, Multilogin,
HideMyAcc, pvavrt), on the behaviour behind the calls.

### The identity / "confirm your mobile number" wall (our exact burn)
Mountain Top and Hazleton hit `MarketplaceYourListingDialogQuery` →
`INTEGRITY_NEEDS_VERIFICATION_VH`, "confirm your identity to publish". This is
**widespread and well known**:
- r/FacebookMarketplace "Stuck with error on verifying identity": a listing asks
  to confirm identity before it can publish; **a phone number already used on
  another account is rejected** ("recently used to verify another account"), and
  "send code" then fails. Vendor accounts often share recycled numbers — so this
  wall is likely for every account from the same batch.
- BlackHatWorld "Facebook Marketplace ID Verification" is a whole thread on it.
- Multiple "How to confirm your identity on Facebook Marketplace 2026" YouTube
  how-tos — it's common enough to be a content niche.
- **Takeaway:** this is not a bug we caused. It is Facebook's integrity gate on
  new / low-trust sellers, and a reused phone number makes it unpassable.

### Why fresh vendor accounts check-point on first automated login
- MoreLogin: checkpoints fire on **new device or login location, IP checks,
  cookie/session/history inconsistency**. A fresh vendor account logged in from
  our proxy+AdsPower for the first time trips all three.
- HideMyAcc: the tell is being **logged out on all devices** into an identity
  screen — which is what Scranton/Wilkes-Barre/Exeter did.
- r/FacebookAds "FB ad account warm up always gets me banned" — even careful
  warm-up burns accounts; it's not just us.

### Warm-up (what we skipped, and what others do)
- r/FacebookAds "How I warm up my FB accounts": fresh anti-detect profile + a
  **clean residential or mobile proxy per profile**, then **days** of ordinary
  browsing before anything commercial. One profile, one proxy, held.
- The consensus everywhere: **do nothing commercial on day one.** We listed on
  day one. That likely triggered the integrity gate.

### Aged vs fresh (money)
pvavrt's 2026 ban-rate breakdown, by use case:

| Use case | Their pick | Price |
|---|---|---|
| Marketplace selling | **Fresh PVA** | ~$3 |
| Group posting / organic | Fresh PVA | ~$3 |
| Meta Ads day 1 | Aged 90-day | ~$13 |
| Business Manager + ads | BM-ready | ~$60 |

- For **Marketplace**, they say fresh PVA is the right tier — so our problem is
  **not** that we bought too cheap. It's the **phone/identity gate and no
  warm-up**, not account age.
- Accounts <30 days are ~8× more likely to flag when a payment method is added —
  but that's the Ads pipeline, not Marketplace. Marketplace's gate is identity /
  phone, per the threads above.

## 4. What this says to change (for matt to decide — nothing bought yet)

1. **The phone number is probably the root cause.** A reused/burned number can't
   pass the Marketplace identity wall. Worth asking the vendor whether each
   account has its **own, un-reused** number, and whether they are
   **Marketplace-verified** specifically (not just "Marketplace-ready").
2. **Warm up before listing**, as the plan always said (rule 35) — we broke that
   tonight.
3. **The names drift** (`vinikjkkj/wa-diff`): our request docs need re-capturing
   as Facebook renames queries.

## Sources

GitHub (via `gh api search/code`) — the full 61 with links are in [`repos.md`](repos.md). The ones to read:
- [brxxn/fbtm](https://github.com/brxxn/fbtm) — 2FA picker, UFAC bot-captcha, authenticity wizard (our identity family)
- [hopfian/fbk](https://github.com/hopfian/fbk) — login, passkey, actor gateway, address search
- [0xzer/messagix](https://github.com/0xzer/messagix) — Go Messenger/IG library, session bootstrap
- [AugusDogus/marketplace](https://github.com/AugusDogus/marketplace), [BoPeng/ai-marketplace-monitor](https://github.com/BoPeng/ai-marketplace-monitor), [memhard/spamer_fb](https://github.com/memhard/spamer_fb), [jiamingc/fb-marketplace-proxy](https://github.com/jiamingc/fb-marketplace-proxy), [saucesteals/shop](https://github.com/saucesteals/shop) — Marketplace listing/location/address
- [vinikjkkj/wa-diff](https://github.com/vinikjkkj/wa-diff) — tracks query-name renames over time

Web (TinyFish, Facebook excluded):
- [r/FacebookMarketplace — Stuck with error on verifying identity](https://www.reddit.com/r/FacebookMarketplace/comments/1gxvded/stuck_with_error_on_verifying_identity/)
- [r/FacebookAds — How I warm up my FB accounts](https://www.reddit.com/r/FacebookAds/comments/1pbj33r/how_i_warm_up_my_fb_accounts_before_i_start/)
- [r/FacebookAds — FB ad account warm up always gets me banned](https://www.reddit.com/r/FacebookAds/comments/zb8m1y/fb_ad_account_warm_up_always_gets_me_banned/)
- [BlackHatWorld — Facebook Marketplace ID Verification](https://www.blackhatworld.com/seo/facebook-marketplace-id-verification.1733842/)
- [MoreLogin — Why is your account prone to checkpoints](https://www.morelogin.com/blog/account-subject-to-checkpoints)
- [HideMyAcc — What is Facebook checkpoint](https://hidemyacc.com/facebook-checkpoint)
- [pvavrt — Aged vs Fresh Facebook Accounts 2026](https://www.pvavrt.com/blog/aged-vs-fresh-facebook-accounts-2026/)
- [Multilogin — Buy aged Facebook accounts](https://multilogin.com/blog/buy-facebook-aged-accounts/)

The identity-hold internal call is our own [`docs/platforms/facebook/listingForm/MarketplaceYourListingDialogQuery.md`](../../docs/platforms/facebook/listingForm/MarketplaceYourListingDialogQuery.md).
