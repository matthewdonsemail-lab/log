# Listing content and currency: what the listing itself says

**Id:** `listingContentAndCurrency` · **Severity:** medium · **Status:** leaking (latent: depends on the listing data)

## Summary

The listing is public. Its title and description go onto Facebook exactly as
stored in Twenty. Nothing screens them for Vietnamese text, a +84 phone number
or a ₫/VND price. The price currency is stored but never compared with the
currency the form shows. The location, by contrast, is checked well (R4 M8).

## What leaks and to whom

- **To Facebook, and to every buyer who reads the listing:**
  - Vietnamese diacritics or place names ("Hà Nội");
  - a +84 number;
  - "₫", "VND" or "đồng";
  - a price in the wrong currency.
- **Currency follows the account.** Facebook sets the listing currency from the
  account's own region, not the proxy. A bought account whose region isn't its
  sale country shows the wrong currency (R4 M8, Listaro).

## Evidence

- `src/marketplace/publish/helpers/validateListing.ts:4-14` checks only the
  length, the price range, the category and the photo count. *verifiedSource*
- `src/marketplace/agencyListing/helpers/toPublishListing.ts:35` (`countryMismatch`)
  checks the location's country against `homeCountry`. It doesn't check the
  text. *verifiedSource*
- `src/marketplace/agencyListing/client.ts:38` reads `priceCurrency`. Nothing
  uses it for a check. It is only displayed (`src/cli/launch/index.ts:122`,
  `src/cli/listing/helpers/renderListing.ts:33`). *verifiedSource*
- `python/publishSession.py` types the price as digits and never reads which
  currency the form shows (R4 M8, `step_review`). *verifiedSource*
- **Earlier systems.** Listaro hit this with bought accounts: commits `504ea63`
  and `0c7c8bc` ("RUB0/wrong currency", "skip foreign accounts") (R4).
  *verifiedSource*
- **What's right.** The form's Location suggestion must contain both the city
  and the country (`python/publishSession.py:593-621`, failing with
  `locationNotSet`). The live test caught "Hanoi, Ireland" being picked, and it was
  fixed (PR #6 description, `docs/proxies.md` "Checked"). *verifiedLive (proxied)*

## Where in our code it can happen again

- `src/marketplace/publish/helpers/validateListing.ts`: the pre-publish checks.
- `src/marketplace/agencyListing/`: the mapping from Twenty.
- `python/publishSession.py`: the price and review steps.
- Any tool that writes listing text into Twenty (copy generation, imports).

## Mitigation

1. **Screen the text.** Add a pure helper,
   `src/marketplace/publish/helpers/screenListingText.ts`, called from
   `validateListing`. It flags:
   - Vietnamese diacritics:
     `/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i`;
   - +84 numbers: `\+?84\d{9}`;
   - `₫|VND|đồng`;
   - any phone number not in the country's format.

   (R4 M8)
2. **Check the currency before opening a browser.** Add
   `expectedCurrency(homeCountry)` (IE → EUR, GB → GBP, US → USD, CA → CAD,
   AU → AUD), and compare it with `priceCurrency` in `checkPublishable`
   (`src/cli/publish/index.ts:78`).
3. **Check it on the form.** In `step_review` (`python/publishSession.py:626`), read the Price field's currency
   prefix or aria-label, and fail with a new code `currencyMismatch`.

## How to re-test

1. Unit tests: `validateListing` rejects a title with "Hà Nội", a description
   with `+84912345678`, and a price note with "VND".
2. Unit test: an IE account with `priceCurrency: 'GBP'` is refused before any
   browser opens.
3. Fixture run against `python/fixtures/createItem.html` with a "₫" prefix on
   the price field. **Pass:** `currencyMismatch`.

## Status

Leaking (latent) at `f033e63`. Nothing stops bad text or the wrong currency if
the data contains it.
