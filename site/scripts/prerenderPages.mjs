import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const web = join(root, 'apps/web')
const dist = join(web, 'dist')
const ssrOut = join(web, 'dist-devlog-ssr')
const SITE = 'https://log.listeningkit.com'

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function setMeta(html, attr, key, content) {
  const pattern = new RegExp(`<meta ${attr}="${key}" content="[^"]*" />`, 'g')
  return html.replace(pattern, `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`)
}

export function pageHtml(template, page) {
  const url = `${SITE}${page.path}`
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(page.title)}</title>`)
  for (const [attr, key, value] of [
    ['name', 'description', page.description],
    ['property', 'description', page.description],
    ['property', 'og:type', page.type],
    ['property', 'og:url', url],
    ['property', 'og:title', page.title],
    ['property', 'og:description', page.description],
    ['property', 'og:image', page.image],
    ['property', 'twitter:url', url],
    ['property', 'twitter:title', page.title],
    ['name', 'twitter:title', page.title],
    ['property', 'twitter:description', page.description],
    ['name', 'twitter:description', page.description],
    ['property', 'twitter:image', page.image],
    ['name', 'twitter:image', page.image],
  ]) {
    html = setMeta(html, attr, key, value)
  }
  const head = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    page.schema ? `<script type="application/ld+json" id="devlog-schema">${JSON.stringify(page.schema).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ')
  html = html.replace('</head>', `    ${head}\n  </head>`)
  return html.replace('<div id="root"></div>', `<div id="root">${page.body}</div>`)
}

const built = spawnSync('npx', ['vite', 'build', '--ssr', 'src/landing/devlog/prerender.tsx', '--outDir', 'dist-devlog-ssr', '--emptyOutDir'], {
  cwd: web,
  stdio: 'inherit',
  shell: true,
})
if (built.status !== 0) throw new Error('the devlog prerender build failed')
const entry = join(ssrOut, 'prerender.js')
if (!existsSync(entry)) throw new Error(`the devlog prerender build left no ${entry}`)
const { prerenderedPages } = await import(pathToFileURL(entry).href)
const vercel = JSON.parse(readFileSync(join(root, '..', 'vercel.json'), 'utf8'))
const sourceRegex = (source) => new RegExp(`^${source.replace(/:[a-zA-Z]+\(([^)]+)\)/g, '($1)').replace(/:[a-zA-Z]+\+?/g, '[^/]+')}$`)
const routed = (path) => vercel.rewrites.some((rule) => rule.destination.endsWith('.html') && rule.destination !== '/index.html' && sourceRegex(rule.source).test(path))
const template = readFileSync(join(dist, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('dist/index.html has no empty #root to fill')
for (const page of prerenderedPages()) {
  if (!routed(page.path)) throw new Error(`vercel.json has no rewrite sending ${page.path} to its prerendered file`)
  const out = join(dist, `${page.path.replace(/^\//, '')}.html`)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, pageHtml(template, page))
  console.log(`prerendered: ${page.path} -> ${out.replace(dist, 'dist')}`)
}
rmSync(ssrOut, { recursive: true, force: true })
