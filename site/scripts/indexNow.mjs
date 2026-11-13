import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const SITE = 'https://log.listeningkit.com'
const HOST = new URL(SITE).host
const keyFile = readdirSync(join(root, 'apps/web/public')).find((name) => /^[0-9a-f]{32}\.txt$/.test(name))
if (!keyFile) throw new Error('no IndexNow key file in apps/web/public')
const key = keyFile.slice(0, -4)

const live = await fetch(`${SITE}/${keyFile}`).then((response) => response.text())
if (live.trim() !== key) throw new Error(`${SITE}/${keyFile} does not serve the key yet, so IndexNow would refuse the ping`)

const xml = await fetch(`${SITE}/sitemap.xml`).then((response) => response.text())
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).filter((url) => url.startsWith(SITE))
for (const page of ['twitter', 'discord', 'slack', 'instagram', 'reddit', 'cursor', 'claude', 'chatgpt', 'hermes', 'grok']) urls.push(`${SITE}/${page}.md`)
urls.push(`${SITE}/llms.txt`, `${SITE}/llms-full.txt`)

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls }),
})
console.log(`IndexNow: ${urls.length} urls sent, answered ${response.status} ${response.statusText}`)
if (response.status >= 400) {
  console.log(await response.text())
  process.exit(1)
}
