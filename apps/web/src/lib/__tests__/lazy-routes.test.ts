import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const src = fileURLToPath(new URL('../../', import.meta.url))
const app = readFileSync(join(src, 'App.tsx'), 'utf8')

// App.tsx loads dashboard pages with lazyNamed(() => import('./components/X'), 'X'). The name is a string, so the
// compiler cannot tell if it is wrong; a wrong name only fails once someone signs in and opens that page.
const pairs = [...app.matchAll(/lazyNamed\(\(\) => import\('(\.\/[^']+)'\), '(\w+)'\)/g)].map((m) => ({ module: m[1], name: m[2] }))

describe('lazy-loaded pages', () => {
  it('finds the lazy pages in App.tsx', () => {
    expect(pairs.length).toBeGreaterThan(15)
  })

  it.each(pairs)('$module really exports $name', ({ module, name }) => {
    const file = ['.tsx', '.ts'].map((ext) => join(src, module + ext)).find(existsSync)
    expect(file, `${module} exists`).toBeTruthy()
    const code = readFileSync(file as string, 'utf8')
    const exported = new RegExp(`export\\s+(?:async\\s+)?(?:function|const|class)\\s+${name}\\b|export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`).test(code)
    expect(exported, `${name} is a named export of ${module}`).toBe(true)
  })

  it('every lazy page is used inside a Suspense boundary', () => {
    expect(app).toMatch(/<Suspense[\s\S]*<Routes>[\s\S]*<\/Routes>[\s\S]*<\/Suspense>/)
  })
})
