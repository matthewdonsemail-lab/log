import { describe, expect, it } from 'vitest'
import { toDocsSrc } from '../../components/DashboardDocs'

describe('where the dashboard Docs tab points', () => {
  it('uses the docs server address in development', () => {
    expect(toDocsSrc('/dashboard/docs', '', '', false)).toBe('/docs')
    expect(toDocsSrc('/dashboard/docs/guide/helpers', '?q=1', '#top', false)).toBe('/docs/guide/helpers?q=1#top')
  })

  it('uses the static page files on the hosted site, which only serves exact file names', () => {
    expect(toDocsSrc('/dashboard/docs', '', '', true)).toBe('/docs.html')
    expect(toDocsSrc('/dashboard/docs/', '', '', true)).toBe('/docs.html')
    expect(toDocsSrc('/dashboard/docs/guide', '', '', true)).toBe('/docs/guide.html')
    expect(toDocsSrc('/dashboard/docs/guide/helpers/', '', '#proxy', true)).toBe('/docs/guide/helpers.html#proxy')
    expect(toDocsSrc('/dashboard/docs/getting-started', '?x=1', '', true)).toBe('/docs/getting-started.html?x=1')
  })
})
