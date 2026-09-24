import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(fileURLToPath(new URL('../../../../../packages/ui/src/toast.tsx', import.meta.url)), 'utf8')

// DashboardApiLive puts `error` in an effect's dependencies and shows an error toast when its load fails. When `error`
// was a new function after every toast, that load ran again forever (dozens of "API keys failed to load" toasts).
// There is no DOM in these tests, so this checks the source: the toast functions are memoised on their own, apart from
// the toast list that changes each time a toast appears.
describe('toast context', () => {
  it('keeps success/error/info/warning/dismiss stable when the toast list changes', () => {
    const actions = source.match(/const actions = useMemo\(([\s\S]*?)\);\s*\n\s*const value/)
    expect(actions, 'an `actions` useMemo').toBeTruthy()
    expect(actions![1]).toMatch(/\[addToast, dismiss\]/)
    expect(actions![1]).not.toMatch(/toasts/)
    expect(source).toMatch(/const value = useMemo\(\(\) => \(\{ toasts, \.\.\.actions \}\), \[toasts, actions\]\)/)
    expect(source).toMatch(/<ToastContext\.Provider value=\{value\}>/)
  })
})
