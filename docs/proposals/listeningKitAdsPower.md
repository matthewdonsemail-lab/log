> Implementation reading order: [handoff and acceptance criteria](listeningKitHandoff.md), then [schema v2](listeningKitSchema.md). Those define native V1 scope and supersede broader legacy inventories or earlier field names in this companion. Deferred listings/CRM and future AI-provider identity are outside V1.

# AdsPower access for hosted Log

Accepted design, 11 November 2026. Specification only; hosted pairing and browser brokering remain implementation work.

AdsPower remains the default browser. Support provided access through Matt's existing paid setup and users bringing their own AdsPower installation/key. This is independent of choosing own-cloud or Boat compute. Confirm available capacity and actual environment compatibility before assigning profiles.

## Credential flow

Use a short-lived, single-use Log pairing token bound to team/workspace. Redeem it atomically with expiry to establish a separate revocable runtime credential. These are Log credentials, not AdsPower launch keys.

Provided access keeps Matt's AdsPower management credential with the browser service beside that installation. Do not distribute it to customer runtimes, AI chats, generated UI or hosted control PostgreSQL. Bring-your-own access keeps the user's key in their private workspace/browser host. Existing configuration names are ADSPOWER_HOST and ADSPOWER_API_KEY.

Do not assume the AdsPower management key can be revoked after launch while status, reconnect and restart continue. The browser service retains whatever management authority it needs. Deleting a key file does not prove provider-side revocation.

## Provided browser access

The authenticated workspace requests a permitted operation against its opaque browser connection. The private service resolves its assigned profile and enforces that binding on every operation. Never accept arbitrary profile ids as permission. Keep Local API and raw CDP private; do not return browser-control credentials to the AI client. This broker is proposed implementation, not an existing capability of the local AdsPower client.

Revoking the Log binding blocks new operations and invalidates broker access. It does not rotate a shared AdsPower key or delete profiles. Existing browser lifecycle and proxy gates continue to apply.

## Browser location

A browser runs where the AdsPower application runs. If provided access uses Matt's existing machine, browser state is on that machine and onboarding must disclose it as a separate browser host. It does not satisfy strict workspace-only browser storage. To meet that arrangement, AdsPower must run inside the selected private environment. A key alone does not install it in ChatGPT, Claude or Boat.

Establish actual application/kernel compatibility, interactive access, persistent profile storage and private connectivity before reporting ready. Inspect synchronization settings before claiming every copy stays on one host. Chat ending must not erase records; runtime restart reuses the same installation/profile references. Disconnect marks browser operations unavailable instead of creating another profile elsewhere.

## Data model

Central control retains only opaque connection id, team/workspace binding, provided/own access mode, opaque browser-host route and availability/revocation metadata. No AdsPower key or profile payload column. Workspace storage owns account-to-profile references and user-owned key references. The private provided browser service owns its management credential and profile assignments. These are proposed responsibilities, not implemented tables.

## Sources and implementation

- [Current TypeScript configuration/client](../../src/browser/adsPower/client.ts).
- [Current Python browser integration](../../python/browser/adsPowerBrowser.py).
- [Existing account/profile binding](../../src/browser/adsPower/helpers/planSync.ts).
- [Workspace model](./listeningKitInstanceContracts.md).
- [Data boundary](./listeningKitNativeData.md).
- [Official AdsPower API guide](https://help.adspower.com/docs/api).

Implementation order: complete native account/profile persistence; implement Log pairing/revocation; wire user-owned configuration to the local client; implement provided profile brokering; add browser location and actual compatibility results to onboarding.

No deployment, purchase, browser launch, key reset or migration is performed by this documentation update.
