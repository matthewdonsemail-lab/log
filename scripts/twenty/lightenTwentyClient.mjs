import { readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const LINK = 'const typeMap = linkTypeMap(types as any)'
const LAZY = 'let linked: ReturnType<typeof linkTypeMap> | undefined\nconst typeMap = () => (linked ??= linkTypeMap(types as any))'

export function lighten(files) {
  const out = []
  for (const [name, content] of files) {
    if (name === 'types.ts') {
      const body = content.slice(content.indexOf('export default') + 'export default'.length).trim().replace(/;\s*$/, '')
      out.push(['types.json', `${JSON.stringify(JSON.parse(body))}\n`])
      continue
    }
    if (name === 'index.ts' && content.includes(LINK)) {
      out.push([name, content.replace("import types from './types'", "import types from './types.json'").replace(LINK, LAZY).replace(/typeMap\.(Query|Mutation|Subscription)/g, 'typeMap().$1')])
      continue
    }
    out.push([name, content])
  }
  return out
}

if (process.argv[1] && process.argv[1].endsWith('lightenTwentyClient.mjs')) {
  const dir = process.argv[2]
  const files = []
  for (const name of ['index.ts', 'types.ts']) files.push([name, await readFile(join(dir, name), 'utf8')])
  for (const [name, content] of lighten(files)) await writeFile(join(dir, name), content)
  await rm(join(dir, 'types.ts'), { force: true })
  console.log(`lightened ${dir}: types.json, index.ts links the type map on first use`)
}
