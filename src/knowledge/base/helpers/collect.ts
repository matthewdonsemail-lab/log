import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative, sep } from 'node:path'
import { PAGE_STATES } from '../../../browser/flow/helpers/pageState'
import type { FacebookAccount } from '../../../marketplace/socialAccount/types'
import { scrubSecrets } from './scrub'
import type { KbArticle, KbKind, KbSources } from '../types'

const SKIPPED_DOCS = [/^docs\/vendors\//, /Enforcement/i]

function article(key: string, kind: KbKind, title: string, body: string, source: string, tags: string[] = []): KbArticle {
  return { key, kind, title: title.trim().slice(0, 200), body: scrubSecrets(body.trim()), source, tags, author: 'sync' }
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 8)
    .map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join('')
}

function firstSentence(text: string, max = 110): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  const end = flat.search(/[.:](\s|$)/)
  const sentence = end > 0 ? flat.slice(0, end) : flat
  return sentence.length > max ? `${sentence.slice(0, max - 1)}…` : sentence
}

function frontmatter(text: string): { fields: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return { fields: {}, body: text }
  const fields: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_]+):\s*(.*)$/.exec(line)
    if (kv) fields[kv[1]] = kv[2].replace(/^["']|["']$/g, '')
  }
  return { fields, body: text.slice(match[0].length) }
}

function walk(dir: string, keep: (path: string) => boolean): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return walk(path, keep)
    return keep(path) ? [path] : []
  })
}

const posix = (path: string) => path.split(sep).join('/')

export function collectRules(repo: string): KbArticle[] {
  const file = join(repo, 'AGENTS.md')
  if (!existsSync(file)) return []
  const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const out: KbArticle[] = []
  const hard = text.indexOf('\n## Hard rules')
  const rulesText = hard >= 0 ? text.slice(hard, text.indexOf('\n## ', hard + 5) > 0 ? text.indexOf('\n## ', hard + 5) : undefined) : ''
  for (const m of rulesText.matchAll(/^(\d+)\. (\d{4}-\d{2}-\d{2}) · ([\s\S]*?)(?=^\d+\. \d{4}-\d{2}-\d{2} · |(?![\s\S]))/gm)) {
    const body = m[3].replace(/\n\s+/g, '\n').trim()
    out.push(article(`rule:${m[1]}`, 'rule', `Rule ${m[1]}: ${firstSentence(body.replace(/^matt:\s*/i, '').replace(/^\(replaced[^)]*\)\s*/i, ''))}`, `Rule ${m[1]} (${m[2]})\n\n${body}`, `AGENTS.md#rule${m[1]}`, ['agentsRule', m[2]]))
  }
  for (const m of text.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)) {
    if (/^Hard rules/.test(m[1])) continue
    out.push(article(`agents:${slug(m[1])}`, 'section', m[1], m[2], `AGENTS.md#${slug(m[1])}`, ['agentsSection']))
  }
  return out
}

export function collectSkills(repo: string): KbArticle[] {
  const dir = join(repo, 'skills')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => existsSync(join(dir, name, 'SKILL.md')))
    .map((name) => {
      const { fields, body } = frontmatter(readFileSync(join(dir, name, 'SKILL.md'), 'utf8'))
      const title = fields.description ? `${name}: ${firstSentence(fields.description, 150)}` : name
      return article(`skill:${name}`, 'skill', title, body, `skills/${name}/SKILL.md`, ['skill'])
    })
}

export function collectDocs(repo: string): KbArticle[] {
  const root = join(repo, 'docs')
  return walk(root, (path) => path.endsWith('.md'))
    .map((path) => posix(relative(repo, path)))
    .filter((path) => !SKIPPED_DOCS.some((pattern) => pattern.test(path)))
    .map((path) => {
      const text = readFileSync(join(repo, path), 'utf8')
      const heading = /^#\s+(.+)$/m.exec(text)?.[1] ?? basename(path, '.md')
      const kind: KbKind = path.startsWith('docs/infra/') ? 'infra' : 'doc'
      const area = path.split('/').slice(1, -1)
      return article(`doc:${path}`, kind, heading, text, path, area.length ? area : ['docs'])
    })
}

export function collectMemories(memoryRoot: string | null): KbArticle[] {
  if (!memoryRoot || !existsSync(memoryRoot)) return []
  return readdirSync(memoryRoot).flatMap((project) => {
    const dir = join(memoryRoot, project, 'memory')
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return []
    const label = project.replace(/^[A-Za-z]--users-[^-]+-?/i, '').replace(/^projects-/i, '') || 'home'
    return readdirSync(dir)
      .filter((name) => name.endsWith('.md') && name !== 'MEMORY.md')
      .map((name) => {
        const { fields, body } = frontmatter(readFileSync(join(dir, name), 'utf8'))
        const type = /type:\s*(\w+)/.exec(readFileSync(join(dir, name), 'utf8'))?.[1] ?? 'memory'
        const title = fields.description ? `${label}: ${fields.description}` : `${label}: ${fields.name ?? basename(name, '.md')}`
        return article(`memory:${label}/${basename(name, '.md')}`, 'memory', title, body, `claudeMemory/${label}/${name}`, ['claudeMemory', label, type])
      })
  })
}

export function collectPageStates(): KbArticle[] {
  return PAGE_STATES.map((s) =>
    article(
      `pageState:${s.id}`,
      'pageState',
      `Page state ${s.id}: ${firstSentence(s.what, 140)}`,
      [`State: ${s.id}`, `What it is: ${s.what}`, `How it is resolved: ${s.resolve}`, `Needs a person: ${s.person ? 'yes, only matt can clear it' : 'no, log-cli resolves it'}`, s.needsNothing ? 'Needs nothing: it is a normal page, nothing to resolve' : ''].filter(Boolean).join('\n'),
      'src/browser/flow/helpers/pageState.ts',
      ['pageState', s.person ? 'needsMatt' : 'resolvable'],
    ),
  )
}

export function collectAccounts(accounts: readonly FacebookAccount[]): KbArticle[] {
  return accounts.map((a) => {
    const lines = [
      `Account: ${a.accountName}${a.label && a.label !== a.accountName ? ` (${a.label})` : ''}`,
      `Platform: ${a.platform ?? 'FACEBOOK'}`,
      `Home: ${[a.homeCity, a.homeCountry].filter(Boolean).join(', ') || 'not set'}`,
      `Status: ${a.status ?? 'not set'}${a.statusReason ? `, reason ${a.statusReason}` : ''}`,
      a.statusDetail ? `Status detail: ${a.statusDetail}` : '',
      `Lifecycle state: ${a.lifecycleState ?? 'not set'}`,
      `Session state: ${a.sessionState ?? 'not checked'}${a.sessionCheckedAt ? ` (${a.sessionCheckedAt})` : ''}`,
      `Proxy: ${a.proxy ? 'attached' : 'none'}${a.proxyExitCountry ? `, exit country ${a.proxyExitCountry}` : ''}${a.proxyCheckedAt ? `, checked ${a.proxyCheckedAt}` : ''}`,
      `Active hours: ${a.activeHoursStart ?? 8}:00-${a.activeHoursEnd ?? 22}:00 local`,
      `Profile name: ${a.profileName ?? 'not set'}`,
      `Profile set: ${a.profileSetAt ?? 'no'}`,
      `Marketplace location set: ${a.marketplaceLocationAt ?? 'no'}`,
      `Daily listing cap: ${a.dailyListingCap}`,
      `Last posted: ${a.lastPostedAt ?? 'never'}`,
      `Vendor: ${a.vendor ?? 'unknown'}`,
      `Twenty row: socialAccounts ${a.id}`,
    ]
    return article(`account:${a.accountName}`, 'account', `Account ${a.label || a.accountName}: ${[a.homeCity, a.homeCountry].filter(Boolean).join(', ') || 'no home'}, ${a.status ?? 'no status'}`, lines.filter(Boolean).join('\n'), `twenty:socialAccounts/${a.id}`, ['account', a.homeCountry ?? 'noHome', a.status ?? 'noStatus'])
  })
}

export function collectAll(sources: KbSources, accounts: readonly FacebookAccount[] = []): KbArticle[] {
  const all = [...collectRules(sources.repo), ...collectSkills(sources.repo), ...collectDocs(sources.repo), ...collectMemories(sources.memoryRoot), ...collectPageStates(), ...collectAccounts(accounts)]
  const seen = new Set<string>()
  return all.filter((a) => a.body && !seen.has(a.key) && (seen.add(a.key), true))
}
