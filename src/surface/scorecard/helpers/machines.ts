import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const CREATE_MACHINE = /\bcreateMachine\s*\(/;
const RELATIVE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)["'](\.{1,2}\/[^"']+)["']/gm;

const read = (path: string): string => (existsSync(path) && statSync(path).isFile() ? readFileSync(path, "utf8") : "");

export const callsMachine = (path: string): boolean => CREATE_MACHINE.test(read(path));

export function relativeImports(text: string): string[] {
  return [...new Set([...text.matchAll(RELATIVE_IMPORT)].map((m) => m[1]))];
}

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return filesUnder(path);
      return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [path] : [];
    });
}

export function declaringFile(root: string, module: string, exportName: string): string {
  const declares = new RegExp(`export\\s+(?:const|function|let)\\s+${exportName}\\b`);
  const modulePath = join(root, module);
  if (declares.test(read(modulePath))) return modulePath;
  return filesUnder(dirname(modulePath)).find((path) => declares.test(read(path))) ?? modulePath;
}

function machineAt(target: string): boolean {
  const asDir = existsSync(target) && statSync(target).isDirectory();
  const dir = asDir ? target : dirname(target);
  return (!asDir && callsMachine(target)) || callsMachine(join(dir, "machine.ts"));
}

export function hasMachine(root: string, module: string, exportName: string): boolean {
  const file = declaringFile(root, module, exportName);
  if (callsMachine(file)) return true;
  return relativeImports(read(file)).some((spec) => machineAt(resolve(dirname(file), spec)));
}
