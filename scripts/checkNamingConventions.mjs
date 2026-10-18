// Gate: enforces the {library}/{domain}/ convention in docs/namingConventions.md.
//
// For src/ and bin/:
// 1. Every directory and every .ts file name is camelCase (never kebab-case).
// 2. Every domain (src/{library}/{domain}) has an index.ts entrypoint.
// 3. Every helpers/ directory has an index.ts barrel.
// 4. No helper imports its parent domain's barrel (../index).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAMEL = /^[a-z][a-zA-Z0-9]*$/;
// `.test` is a role suffix, not part of the name: `filterListings.test.ts`.
const TS_FILE = /^([a-z][a-zA-Z0-9]*)(\.test)?\.ts$/;
const violations = [];
const rel = (path) => relative(root, path).split(sep).join('/');

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!CAMEL.test(entry.name)) violations.push(`${rel(path)}: directory name must be camelCase.`);
      if (entry.name === 'helpers') checkHelpers(path);
      walk(path);
    } else if (entry.name.endsWith('.ts') && !TS_FILE.test(entry.name)) {
      violations.push(`${rel(path)}: file name must be camelCase.`);
    }
  }
}

function checkHelpers(helpersPath) {
  if (!existsSync(join(helpersPath, 'index.ts'))) {
    violations.push(`${rel(helpersPath)}: missing required barrel "helpers/index.ts".`);
  }
  for (const file of readdirSync(helpersPath).filter((f) => f.endsWith('.ts'))) {
    readFileSync(join(helpersPath, file), 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (/from ['"]\.\.\/index(\.ts)?['"]/.test(line) && !line.trim().startsWith('//')) {
          violations.push(`${rel(join(helpersPath, file))}:${index + 1}: helper imports its parent domain barrel.`);
        }
      });
  }
}

function checkDomains(src) {
  for (const library of readdirSync(src, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const libraryPath = join(src, library.name);
    const domains = readdirSync(libraryPath, { withFileTypes: true }).filter((e) => e.isDirectory());
    if (domains.length === 0) violations.push(`${rel(libraryPath)}: library must contain at least one domain.`);
    for (const domain of domains) {
      if (!existsSync(join(libraryPath, domain.name, 'index.ts'))) {
        violations.push(`${rel(join(libraryPath, domain.name))}: missing required entrypoint "index.ts".`);
      }
    }
  }
}

for (const dir of ['src', 'bin']) {
  const path = join(root, dir);
  if (existsSync(path) && statSync(path).isDirectory()) walk(path);
}
checkDomains(join(root, 'src'));

if (violations.length > 0) {
  console.error('check:naming FAIL');
  for (const violation of violations) console.error(`  - ${violation}`);
  console.error('\nSee docs/namingConventions.md.');
  process.exit(1);
}
console.log('check:naming OK — src/ follows {library}/{domain}/ with camelCase names.');
