// Builds what gets uploaded to Convex hosting: the web app, plus the docs exported as plain static files under /docs.
// The docs are a separate Next.js app, so on the hosted site they ship as files instead of a server.
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dist = join(root, 'apps/web/dist')
const out = join(root, 'apps/docs/out')

function run(args, env = {}) {
  const result = spawnSync('pnpm', args, { cwd: root, stdio: 'inherit', shell: true, env: { ...process.env, ...env } })
  if (result.status !== 0) throw new Error(`pnpm ${args.join(' ')} failed`)
}

run(['--filter', 'web', 'build'])
rmSync(out, { recursive: true, force: true })
run(['--filter', 'docs', 'exec', 'next', 'build'], { DOCS_EXPORT: '1' })

// Copy the docs' files in, but never overwrite the web app's own files (its index.html and logo are not the docs').
const skip = new Set(['index.html', 'index.txt', '404.html', 'logo.svg'])
let copied = 0
const clashes = []
const tooBig = []
const MAX_PAGE_BYTES = 900_000
function merge(from, to) {
  for (const name of readdirSync(from)) {
    const source = join(from, name)
    const target = join(to, name)
    if (from === out && skip.has(name)) continue
    if (statSync(source).isDirectory()) {
      merge(source, target)
    } else if (/\.(html|txt)$/.test(name) && statSync(source).size > MAX_PAGE_BYTES) {
      tooBig.push(source.replace(out, ''))  // one huge generated reference page: uploads of files this large keep failing, and the page is not worth blocking the deploy
    } else if (existsSync(target)) {
      clashes.push(target.replace(dist, ''))
    } else {
      cpSync(source, target, { recursive: true })
      copied += 1
    }
  }
}
merge(out, dist)
if (clashes.length) console.log(`kept the web app's version of ${clashes.length} file(s) that share a name with the docs: ${clashes.slice(0, 5).join(', ')}`)
if (tooBig.length) console.log(`left out ${tooBig.length} oversized docs page file(s): ${tooBig.join(', ')}`)
if (!existsSync(join(dist, 'docs.html'))) throw new Error('the docs did not make it into the site build')
console.log(`docs added to the site: ${copied} files`)
