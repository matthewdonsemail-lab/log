import { describe, expect, test } from 'bun:test'
import { readScreen } from './helpers/readScreen'

describe('readScreen', () => {
  test("an element whose name has a colon is read: YAML quotes that line (Bethlehem's listing, 2026-10-23)", () => {
    const snapshot = [
      '- main:',
      `  - 'button "More options for Junk Removal & Cleanouts: Houses, Garages, Basements" [ref=e356] [cursor=pointer]'`,
      `  - 'button "Mark as sold Junk Removal & Cleanouts: Houses, Garages, Basements" [ref=e339] [cursor=pointer]':`,
      '    - text: Mark as sold',
      `  - 'link "It''s here: now" [ref=e400]'`,
      '  - menuitem "Delete listing" [ref=e434] [cursor=pointer]:'
    ].join('\n')
    const elements = readScreen(snapshot).elements
    expect(elements.find((e) => e.ref === 'e356')).toMatchObject({ role: 'button', name: 'More options for Junk Removal & Cleanouts: Houses, Garages, Basements' })
    expect(elements.find((e) => e.ref === 'e339')?.name).toBe('Mark as sold Junk Removal & Cleanouts: Houses, Garages, Basements')
    expect(elements.find((e) => e.ref === 'e400')?.name).toBe("It's here: now")
    expect(elements.find((e) => e.ref === 'e434')).toMatchObject({ role: 'menuitem', name: 'Delete listing' })
  })
})
