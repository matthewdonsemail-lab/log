import { existsSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SRC_ROOT = fileURLToPath(new URL('../../../', import.meta.url))

export function platformMachines(platform: string, srcRoot: string = SRC_ROOT): string[] {
  const start = join(srcRoot, platform)
  if (!existsSync(start)) return []
  const found: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name))
      else if (entry.name === 'machine.ts') found.push(relative(srcRoot, dir).split(sep).join('/'))
    }
  }
  walk(start)
  return found.sort()
}
