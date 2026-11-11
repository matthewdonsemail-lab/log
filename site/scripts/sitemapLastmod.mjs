import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const repo = resolve(root, '..')
const sitemap = join(root, 'apps/web/dist/sitemap.xml')
const SITE = 'https://log.listeningkit.com'
const landing = 'site/apps/web/src/landing'

export function sourcesOf(path) {
  if (path === '/') return [landing, 'site/apps/web/index.html']
  if (path.startsWith('/devlog')) return [`${landing}/devlog`]
  if (path === '/mcp') return [`${landing}/mcp`, 'docs/mcp.md']
  if (path.startsWith('/docs')) return ['docs']
  return [`${landing}/useCases`, `${landing}/AgencyIntro.tsx`, `${landing}/PlatformSuite.tsx`]
}

function lastChanged(paths) {
  const result = spawnSync('git', ['log', '-1', '--format=%cs', '--', ...paths], { cwd: repo, encoding: 'utf8' })
  const date = result.status === 0 ? result.stdout.trim() : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
}

const built = new Date().toISOString().slice(0, 10)
const xml = readFileSync(sitemap, 'utf8')
const dated = xml.replace(/<url><loc>([^<]+)<\/loc>(?:<lastmod>[^<]*<\/lastmod>)?<\/url>/g, (_, loc) => {
  const path = loc.startsWith(SITE) ? loc.slice(SITE.length) || '/' : '/'
  const lastmod = lastChanged(sourcesOf(path)) ?? built
  return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
})
writeFileSync(sitemap, dated)
console.log(`sitemap lastmod: ${(dated.match(/<lastmod>/g) ?? []).length} urls dated from their sources' last change`)
