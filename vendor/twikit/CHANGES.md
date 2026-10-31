# CHANGES (unclecode/twikit fork)

Changes added by this fork on top of upstream `d60/twikit` v2.3.3 (last
upstream release: 2025-02-07).

This file tracks every divergence from upstream so the fork stays
auditable and easy to re-sync if upstream ever revives.

---

## 2026-05-17

### fix(user): tolerate X's evolving user 'legacy' payload schema

**Why**: X has been dropping fields from the user `legacy` dict for some
payloads over 2026. Repeatedly hit during `home_timeline` / `search` /
`user_tweets` when one tweet's author has an incomplete legacy block,
killing the entire 20+ tweet fetch with `KeyError`.

Examples observed:
- `withheld_in_countries` missing
- `entities.description.urls` missing (when bio has no URL entities)
- `fast_followers_count` missing

**Patch**: rewrote `User.__init__` in `twikit/user.py` to use
`legacy.get(key, default)` across all fields. Names, types, and downstream
contract preserved (callers see the same attribute names; missing data is
sensible defaults: `0` for counts, `False` for bools, `''` for strings,
`[]` for lists, `None` for nullable refs).

No behavioral change for complete payloads.

**Commit**: `dabef92`

---

### fix(x_client_transaction): handle X's new webpack chunk format

**Why**: X switched the way they embed JS chunk metadata in `x.com`'s
HTML on 2026-03-18. The old layout had an inline `"ondemand.s":"<hash>"`,
the new layout splits it into two maps: a name map (`,N:"ondemand.s"`)
and a separate hash map (`,N:"<hash>"`). The single-step regex no longer
matches, so every call raised `Couldn't get KEY_BYTE indices` on init.

**Patch**: two-step lookup in `twikit/x_client_transaction/transaction.py`
mirroring upstream
[iSarabjitDhiman/XClientTransaction](https://github.com/iSarabjitDhiman/XClientTransaction)
v1.0.2. First find the numeric index for `ondemand.s` in the name map,
then build a second regex `,{index}:"([0-9a-f]+)"` to find the hash, and
fetch the `ondemand.s.<hash>a.js` asset as before.

Refs the four open upstream PRs against `d60/twikit`, none of which has
been merged since the March break:

- #410 `pothitos:patch-1` — first attempt at the new regex
- #411 `ryanstoic` — same fix, cleaner
- #416 `steverex169` — most thorough; handles split webpack chunk map with
  backward compat; CodeRabbit review noted regex tolerance gaps
- #407 `Amber-bisht` — incorrect approach (adds fallbacks instead of a
  real fix; would make calls succeed with wrong transaction-id and X
  rejects). **Not used here.**

Closes upstream issues `#408`, `#409`.

**Commit**: `bd1300c`

---

## Upstream reference

- Source: https://github.com/d60/twikit
- Base of fork: `c3b7220` (upstream `main`, 2026-03-10)
- Last upstream release: `v2.3.3` (2025-02-07, PyPI)
- Maintainer activity: no response to PRs / issues since Feb 2025

This fork exists because the upstream maintainer is unreachable. Patches
here will be cross-posted as PRs back to upstream; if upstream revives
and merges them, this fork can be retired.
