import { generateFiles } from 'fumadocs-openapi'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

/**
 * Generate the endpoint reference from the committed `openapi.json`
 * (see `pnpm --filter web openapi:export`) using the official
 * fumadocs-openapi generator. Pages render through the local `APIPage`
 * wrapper, which swaps the try-it console for Scalar's API client.
 * Generated files are committed; re-run after every export.
 *
 * After generation, inject markdown headings + descriptive prose before each
 * `<APIPage>` so the docs have visible `##`/`###` sections even when JS is
 * disabled — and so the prose is not the vague one-liner from the OpenAPI
 * description. The APIPage's own interactive playground remains below these
 * headings.
 *
 * Usage: `pnpm --filter docs gen:api`
 */
await generateFiles({
  input: ['./openapi.json'],
  output: './content/docs/api-reference/endpoints',
  per: 'tag'
})

// --- Post-process: inject markdown headings + prose -------------------
// Tag-level overviews — human explanations of what each tag is for, why it
// exists, and how its operations fit together. Keys are the OpenAPI tag names.
const TAG_INTROS = {
  'API keys': `## API keys — workspace secrets

Private keys authenticate your programs as your workspace. Each key is scoped (account + groups + send/receive bits) and only its prefix is stored — the full secret appears once at creation. The dashboard's **API** tab creates and revokes these; this section documents the exact mock these routes are exercised against.

Use \`GET /api-keys\` to list, \`POST /api-keys\` to create (validates unique name case-insensitively and well-formed scopes), and \`DELETE /api-keys/{id}\` to revoke immediately (unknown ids are a no-op 200). All three live in \`apps/web/src/lib/api/server.ts\` and are the only routes currently tested by \`api-coverage.test.ts\`.`,

  'Brand': `## Brand — the single workspace record

The brand is the onboarding record the reveal step builds: identity, location, voice, offerings, channels per platform, memory rules, intelligence (competitors + targetCommunities), sources (indexed pages), and sourceUrl. Every route here reads or mutates the same in-memory \`BrandEntity\` (persisted to \`brand-entity\` in localStorage, migrated on load). The dashboard Brand tab, onboarding, and AI reply drafts all read this one record.

Seven routes: read the brand, upsert it (the workhorse), append intelligence (deduped), list/index/delete sources, and clear the whole record. Code: \`apps/web/src/lib/brand/server.ts\` and \`apps/web/src/lib/brand/types.ts\` (isBrandEntity, migrateBrandEntity).`,

  'Accounts': `## Accounts — connected platform identities

Accounts are the \`ConnectionRecord[]\` the dashboard's Accounts table shows — each has \`id\`, \`platform\` (facebook/x/reddit), \`label\`, and \`connectedAt\`. They are the FKs every group join and listing creation scopes through. The mock seeds from \`MOCK_CONNECTIONS\` and persists mutations.

Four routes: list all, create by platform (validates allowlist), patch by id (id is immutable, other fields merge), and delete. Code: \`apps/web/src/lib/connections/server.ts\`.`,

  'Communities': `## Communities — joinable groups and subreddits

Communities are the catalog of Facebook groups, X lists, and subreddits you can listen in. The catalog is static; what mutates is the join relation (\`none → pending → accepted\`) plus the attached Facebook \`accountId\` and entry-question answers. All 7 routes serve the Groups page and every keyword scope picker.

Facebook groups gate on a connected Facebook account + answers to every \`entryQuestions\`; other platforms auto-accept. Pasted URLs are registered as new rows. Mock admin accept flips pending to accepted. Code: \`apps/web/src/lib/communities/server.ts\` and \`mock.ts\`.`,

  'Listings': `## Listings — Facebook Marketplace items

Listings are Marketplace rows the dashboard creates and polls for status. Each has \`listingId\` (17-digit marketplace shape), title/price/location, up-to-4 images (first is cover), \`accountId\` FK to a Facebook account, \`locationPoint\` (lat/lng + radius 1–200km), and \`status\` (\`under-review\` at creation). The store seeds from \`MOCK_LISTINGS\` and persists.

Six routes: list, create (validates title/price/location/photo/account), patch details, patch status (transitions via \`LISTING_STATUSES\`), get status, and hard-delete. Code: \`apps/web/src/lib/listings/server.ts\`.`,

  'Keywords': `## Keywords — tracked phrases scoped to groups

Keywords are the tracked phrases that drive listening. \`platform\` + \`groupId\` scoping is enforced: facebook/reddit keywords must be scoped to a joined community (checked via \`joinedGroupsFor\`), X keywords are word-based and must carry no group. Duplicates within the same scope (phrase case-insensitive) are rejected with 409.

Five routes: list (filters by \`?platform\`, \`?groupId\`, \`?noGroup\`), reset to seeds, create, patch (phrase/group/status), and delete. Code: \`apps/web/src/lib/keywords/server.ts\`.`,

  'Feed': `## Feed — unified signal stream

The feed is the mock of the platform clients' signal stream — each \`FeedItem\` has author, handle, community, title, body, sentiment. Two routes serve the Feed tab: a global list with optional \`?platform\` + \`?search\` (case-insensitive substring across author/handle/community/title/body), and a per-platform shortcut that also accepts \`?search\`. Both validate \`isPlatform\` and return 400 otherwise. Code: \`apps/web/src/lib/feed/server.ts\`.`,

  'Messaging': `## Messaging — threads and messages, per connected account

An inbox belongs to a connected account: every route requires \`?accountId=\` (FK to /accounts) and a thread only resolves under the account that owns it — another account gets 404, never a leak. Threads carry the platform-native ids the unofficial browser client sees (X: \`dm_conversation_id\` = the two participant user ids joined with a dash, messages are 19-digit \`dm_event\` ids; Facebook: the numeric conversation \`thread_key\` + \`mid\`; Reddit: threads grouped by \`first_message_name\` = the \`t4_\` id of the thread's first message, message ids are \`t4_\`). Timestamps are ISO 8601.

Five routes per platform: list the account's threads, start a conversation (normalizes each platform's compose — none allow an empty conversation, so composing always sends the first message; 409 when the participant already has a thread), fetch a thread with its full message list, send into an existing thread (echoes the created message plus the thread with preview/updatedAt in sync, so clients can reconcile an optimistic bubble), and mark read (clears unread, idempotent). Mounted at \`/messaging/facebook\`, \`/messaging/x\` (canonical) + legacy \`/messaging/twitter\` alias, and \`/messaging/reddit\`. Code: \`apps/web/src/lib/messaging/routes.ts\` (shared factory) and \`index.ts\` (client).`
}

const spec = JSON.parse(readFileSync('./openapi.json', 'utf8'))
const endpointsDir = './content/docs/api-reference/endpoints'

for (const file of readdirSync(endpointsDir).filter(f => f.endsWith('.mdx'))) {
  const full = path.join(endpointsDir, file)
  let content = readFileSync(full, 'utf8')
  const tagByFile = {
    'api-keys.mdx': 'API keys',
    'brand.mdx': 'Brand',
    'accounts.mdx': 'Accounts',
    'communities.mdx': 'Communities',
    'listings.mdx': 'Listings',
    'keywords.mdx': 'Keywords',
    'feed.mdx': 'Feed',
    'messaging.mdx': 'Messaging'
  }
  const tag = tagByFile[file]
  if (!tag) continue
  // Skip if already has per-operation headings (idempotent)
  if (content.includes('### `GET') || content.includes('### `POST') || content.includes('### `PUT')) continue
  const intro = TAG_INTROS[tag]
  if (!intro) continue
  // Build per-operation markdown headings from the spec so the right-hand
  // TOC (onThisPage) has real `###` titles to jump to. Each heading uses
  // the method + path + summary and the description becomes the paragraph.
  const ops = []
  for (const [p, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const opTags = op.tags ?? []
      if (!opTags.includes(tag)) continue
      const summary = op.summary ?? ''
      const desc = (op.description ?? '').replace(/\n/g, ' ').trim()
      ops.push(`### \`${method.toUpperCase()} ${p}\` — ${summary}\n\n${desc}\n`)
    }
  }
  const perOpBlock = ops.length ? `\n${ops.join('\n')}\n` : ''
  // Inject tag intro + per-operation headings before the interactive <APIPage>
  content = content.replace('<APIPage', `${intro}${perOpBlock}\n<APIPage`)
  writeFileSync(full, content)
  console.log(`Injected headings into ${file} (${tag}) — ${ops.length} ops`)
}
