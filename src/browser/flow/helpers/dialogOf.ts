const indentOf = (line: string): number => line.length - line.trimStart().length

const sameName = (a: string, b: string): boolean => a.replace(/\s+/g, ' ').trim().toLowerCase() === b.replace(/\s+/g, ' ').trim().toLowerCase()

export function dialogAt(lines: string[], at: number): string | null {
  let indent = indentOf(lines[at])
  for (let i = at - 1; i >= 0; i--) {
    if (indentOf(lines[i]) >= indent) continue
    indent = indentOf(lines[i])
    const dialog = lines[i].trim().match(/^- (?:dialog|alertdialog) "([^"]*)"/)
    if (dialog) return dialog[1]
  }
  return null
}

export function dialogOf(snapshot: string, role: string, name: string): string | null {
  const lines = snapshot.split(/\r?\n/).filter((l) => l.trim())
  const dialogs = lines
    .map((line, i) => ({ found: line.trim().match(/^- ([a-z]+) "([^"]*)"/), i }))
    .filter(({ found }) => !!found && found[1] === role && sameName(found[2], name))
    .map(({ i }) => dialogAt(lines, i))
  return dialogs.find((d) => d !== null) ?? null
}
