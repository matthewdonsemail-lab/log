# Many accounts: Twenty

**What Twenty is.** [Twenty](https://twenty.com) is an open-source CRM. You use it hosted, or you run it yourself with Docker. It gives you a database you can see and edit in a normal app (tables, filters, boards), plus a REST and GraphQL API. log uses it as the one place every account and everything about it lives.

**Why it works.** In Twenty, every account is one row in `socialAccounts`:
- its platform and handle
- its cookies and proxy
- its status (ACTIVE, NEEDS_LOGIN, CHECKPOINT, BANNED…)
- its home city and country
- its browser profile

Listings (`agencyListings`), campaigns (`agencyCampaigns`) and conversations (`agencyConversations`, `agencyMessages`) are rows linked to the account they belong to. Before each run log reads the row, and after it writes back what happened: refreshed cookies, a new status, a listing's state. So the row is always the truth. Because it's one shared database, every machine, every agent and every person on your team sees the same accounts, and you can check or fix one by hand in Twenty's UI.

**When you'd use it.**
- **One person with a few accounts:** stay local (`LOG_ACCOUNTS=local`). It's simpler and needs nothing else.
- **Switch to Twenty when:**
  - you run many accounts across platforms
  - more than one machine or person works on them
  - you group listings into campaigns
  - you want every account's status in one place you can edit

**How to set it up.**

1. Get a Twenty workspace: [hosted](https://twenty.com), or [self-hosted](https://twenty.com/developers) with Docker.
2. Create an API key in the workspace's settings.
3. In `.env.local`, set `LOG_TWENTY_BASE_URL` (your workspace's address) and `LOG_TWENTY_API_KEY`, and remove `LOG_ACCOUNTS=local`.
4. Create everything log needs: the objects above, their fields and the links between them.

   ```bash
   node scripts/twenty/twentySetup.mjs           # lists what it will create, changes nothing
   node scripts/twenty/twentySetup.mjs --apply   # creates it
   ```

   It only ever adds. It never renames or deletes a field, so it's safe on a workspace you already use.
5. Add your accounts: as rows in Twenty, or with `cookies save`. `log localAccount pull` copies Twenty's accounts into the local file if you ever want to work offline.

Every command takes `--json` and never prompts, so scripts and agents can use it.

Every command, its flags, its MCP tool and the hooks that fire on it are listed in
[the reference](reference.md), generated from the code.

How accounts, statuses, replacement and campaigns work: `docs/accountsAndListings.md`.
How proxies load and are checked: `docs/proxies.md`. Where accounts are bought:
`docs/vendors/`. Every error code: `docs/errorCatalog.md`.

## Working on the Twenty code

- What Twenty is, why log uses it and how to set it up: [Many accounts: Twenty](#many-accounts-twenty).
- `scripts/twenty/twentySetup.mjs` creates the objects, fields and relations log needs on any
  workspace, a fresh one included (additive only; prints the plan, `--apply` creates them).
- `bun run twenty:client` regenerates `src/twenty/graphql/generated` from the live
  workspace (twenty-client-sdk), the same way blaster (`pnpm twenty:client`) and the
  dialer (`bun run api:client`) do. `bun run twenty:client:check` fails when it is stale.
- Tests never call Twenty: they inject `marketplaceFixture()`, an in-memory Twenty.
