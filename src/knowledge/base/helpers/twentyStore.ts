import { KB_KINDS, KB_OBJECT, KB_OBJECT_PLURAL } from '../types'
import type { KbArticle, KbConfig, KbKind, KbStore, KbStoredArticle } from '../types'

type Fetch = typeof fetch

export function kindValue(kind: KbKind): string {
  return kind.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
}

export function kindOf(value: unknown): KbKind {
  const found = KB_KINDS.find((k) => kindValue(k) === value)
  return found ?? 'note'
}

const COLORS = ['blue', 'turquoise', 'sky', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray'] as const

const FIELDS = [
  { name: 'key', label: 'Key', type: 'TEXT', description: 'log-cli: the article id, e.g. rule:73, skill:inspect, doc:docs/adsPower.md, memory:log-cli/cloudflare-access, note:… (unique)' },
  {
    name: 'kind',
    label: 'Kind',
    type: 'SELECT',
    description: 'log-cli: what the article is',
    options: KB_KINDS.map((k, position) => ({ value: kindValue(k), label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()), color: COLORS[position % COLORS.length], position })),
  },
  { name: 'body', label: 'Body', type: 'TEXT', description: 'log-cli: the article in Markdown. Secrets are never written here' },
  { name: 'source', label: 'Source', type: 'TEXT', description: 'log-cli: where it came from (a repo path, a memory file, a Twenty row, or agent)' },
  { name: 'tags', label: 'Tags', type: 'TEXT', description: 'log-cli: comma-separated tags' },
  { name: 'author', label: 'Author', type: 'TEXT', description: 'log-cli: sync (from the repo), agent (log kb remember) or a person' },
  { name: 'contentHash', label: 'Content hash', type: 'TEXT', description: 'log-cli: hash of kind, title, body, source and tags; Redis is re-indexed when it changes' },
  { name: 'syncedAt', label: 'Synced', type: 'DATE_TIME', description: 'log-cli: when log kb last wrote it' },
] as const

interface Row {
  id: string
  name?: string | null
  key?: string | null
  kind?: string | null
  body?: string | null
  source?: string | null
  tags?: string | null
  author?: string | null
  contentHash?: string | null
}

function toStored(row: Row): KbStoredArticle {
  return {
    id: row.id,
    key: row.key ?? row.id,
    kind: kindOf(row.kind),
    title: row.name ?? '',
    body: row.body ?? '',
    source: row.source ?? '',
    tags: (row.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    author: row.author ?? 'person',
    hash: row.contentHash ?? '',
  }
}

export interface TwentyKbOptions {
  fetchImpl?: Fetch
  sleep?: (ms: number) => Promise<void>
  onWait?: (line: string) => void
}

export function twentyKbStore(config: KbConfig, options: TwentyKbOptions = {}): KbStore {
  const fetchImpl = options.fetchImpl ?? fetch
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  const onWait = options.onWait ?? (() => {})
  const base = config.twentyUrl.replace(/\/$/, '')
  const headers = { Authorization: `Bearer ${config.twentyKey}`, 'Content-Type': 'application/json' }

  async function call(path: string, init: RequestInit = {}, attempt = 0): Promise<Record<string, unknown>> {
    const res = await fetchImpl(`${base}${path}`, { ...init, headers, signal: AbortSignal.timeout(60_000) })
    const text = await res.text()
    const json = text ? (JSON.parse(text) as Record<string, unknown>) : {}
    if (res.status === 429 && attempt < 6) {
      const seconds = Number(json.periodCount ?? 60)
      onWait(`Twenty rate limit (100 requests a minute): waiting ${Math.min(seconds, 60)} s`)
      await sleep(Math.min(seconds, 60) * 1000)
      return call(path, init, attempt + 1)
    }
    if (!res.ok) throw new Error(`Twenty ${init.method ?? 'GET'} ${path.split('?')[0]}: HTTP ${res.status} ${JSON.stringify(json).slice(0, 300)}`)
    return json
  }

  async function gql(query: string, variables: Record<string, unknown> = {}): Promise<Record<string, any>> {
    const json = await call('/metadata', { method: 'POST', body: JSON.stringify({ query, variables }) })
    const errors = json.errors as { message: string }[] | undefined
    if (errors?.length) throw new Error(`Twenty metadata: ${errors.map((e) => e.message).join('; ')}`)
    return json.data as Record<string, any>
  }

  const rowOf = (article: KbArticle, hash: string) => ({
    name: article.title,
    key: article.key,
    kind: kindValue(article.kind),
    body: article.body,
    source: article.source,
    tags: article.tags.join(', '),
    author: article.author,
    contentHash: hash,
    syncedAt: new Date().toISOString(),
  })

  return {
    async ensure() {
      const done: string[] = []
      const objects = async () => (await gql(`query { objects(paging: { first: 200 }) { edges { node { id nameSingular fields(paging: { first: 200 }) { edges { node { name } } } } } } }`)).objects.edges.map((e: any) => e.node)
      let object = (await objects()).find((o: any) => o.nameSingular === KB_OBJECT)
      if (!object) {
        await gql(`mutation ($input: CreateOneObjectInput!) { createOneObject(input: $input) { id } }`, {
          input: { object: { nameSingular: KB_OBJECT, namePlural: KB_OBJECT_PLURAL, labelSingular: 'Knowledge article', labelPlural: 'Knowledge base', description: 'log-cli: the knowledge base (rules, skills, docs, infra, agent memory, page states, accounts, notes), searched by agents through Redis', icon: 'IconBook', isLabelSyncedWithName: false } },
        })
        done.push(`created object ${KB_OBJECT}`)
        object = (await objects()).find((o: any) => o.nameSingular === KB_OBJECT)
      }
      const have = new Set<string>(object.fields.edges.map((e: any) => e.node.name))
      for (const field of FIELDS) {
        if (have.has(field.name)) continue
        await gql(`mutation ($input: CreateOneFieldMetadataInput!) { createOneField(input: $input) { id } }`, { input: { field: { objectMetadataId: object.id, isNullable: true, ...field } } })
        done.push(`created field ${KB_OBJECT}.${field.name}`)
      }
      return done
    },
    async list() {
      const out: KbStoredArticle[] = []
      let cursor: string | null = null
      for (;;) {
        const json = await call(`/rest/${KB_OBJECT_PLURAL}?limit=200${cursor ? `&starting_after=${encodeURIComponent(cursor)}` : ''}`)
        const data = json.data as Record<string, Row[]> | undefined
        out.push(...(data?.[KB_OBJECT_PLURAL] ?? []).map(toStored))
        const page = json.pageInfo as { hasNextPage?: boolean; endCursor?: string } | undefined
        if (!page?.hasNextPage || !page.endCursor) break
        cursor = page.endCursor
      }
      return out
    },
    async get(key) {
      const json = await call(`/rest/${KB_OBJECT_PLURAL}?limit=1&filter=${encodeURIComponent(`key[eq]:"${key.replace(/"/g, '\\"')}"`)}`)
      const rows = (json.data as Record<string, Row[]> | undefined)?.[KB_OBJECT_PLURAL] ?? []
      return rows[0] ? toStored(rows[0]) : null
    },
    async createMany(items) {
      const out: KbStoredArticle[] = []
      for (let i = 0; i < items.length; i += 60) {
        const slice = items.slice(i, i + 60)
        const json = await call(`/rest/batch/${KB_OBJECT_PLURAL}`, { method: 'POST', body: JSON.stringify(slice.map(({ article, hash }) => rowOf(article, hash))) })
        const data = json.data as Record<string, Row[]> | undefined
        const rows = data ? (Object.values(data)[0] ?? []) : []
        slice.forEach(({ article, hash }, n) => out.push({ ...article, hash, id: rows.find((r) => r.key === article.key)?.id ?? rows[n]?.id ?? '' }))
      }
      return out
    },
    async save(article, hash, id) {
      const body = JSON.stringify(rowOf(article, hash))
      const json = id ? await call(`/rest/${KB_OBJECT_PLURAL}/${id}`, { method: 'PATCH', body }) : await call(`/rest/${KB_OBJECT_PLURAL}`, { method: 'POST', body })
      const data = json.data as Record<string, Row> | undefined
      const row = data ? Object.values(data)[0] : undefined
      return { ...article, id: row?.id ?? id ?? '', hash }
    },
  }
}
